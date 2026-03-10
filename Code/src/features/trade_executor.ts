import CDP from 'chrome-remote-interface';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { config } from '../../config';
import { ISignalPayload } from '../shared/types';
import { XTOrderbookManager } from './xt_orderbook';
import { XTSniper } from './xt_sniper';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- ФУНКЦИЯ ВОСПРОИЗВЕДЕНИЯ ЗВУКА ---
function playSuccessSound() {
    try {
        const soundsDir = path.join(process.cwd(), 'Sounds');
        if (!fs.existsSync(soundsDir)) return;

        const files = fs.readdirSync(soundsDir).filter(f => f.endsWith('.mp3'));
        if (files.length === 0) return;

        const randomFile = files[Math.floor(Math.random() * files.length)];
        const soundPath = path.join(soundsDir, randomFile);

        // afplay - встроенная утилита macOS для проигрывания аудио
        exec(`afplay "${soundPath}"`, (err) => {
            if (err) console.error('[Audio] Error playing sound:', err);
        });
    } catch (e) {
        console.error('[Audio] Exception:', e);
    }
}

export async function executeTrade(signal: ISignalPayload, targetId: string) {
    console.log(`[TradeExecutor] Starting pipeline for targetId: ${targetId}`);

    let tabClient: CDP.Client | null = null;

    // --- ПОДГОТОВКА ЧЕРНОГО ЯЩИКА ---
    const executionLog: any = {
        timestamp: new Date().toISOString(),
        symbol: signal.symbol,
        status: 'STARTED',
        signal_data: signal,
        math: {},
        orderbook: {},
        error: null
    };

    try {
        tabClient = await CDP({ target: targetId, port: config.CDP_PORT, host: config.CDP_HOST });
        await tabClient.Network.enable();
        await tabClient.Page.enable();
        await tabClient.Runtime.enable();

        // 🛡️ ПРОБЛЕМА 2: Принудительно вытаскиваем вкладку XT на экран, чтобы кнопка Buy отрендерилась!
        await tabClient.Page.bringToFront();

        const orderbook = new XTOrderbookManager(tabClient);
        const sniper = new XTSniper(tabClient);

        // --- УМНОЕ ОЖИДАНИЕ СТАКАНА ---
        console.log(`[TradeExecutor] Waiting for orderbook to populate (max 5000ms)...`);
        let waitedMs = 0;
        const pollInterval = 100;
        const maxWaitMs = 5000;

        while (!orderbook.getSnapshotStatus() && waitedMs < maxWaitMs) {
            await delay(pollInterval);
            waitedMs += pollInterval;
        }

        if (!orderbook.getSnapshotStatus()) {
            executionLog.status = 'ABORTED_EMPTY_ORDERBOOK';
            console.error(`[TradeExecutor] Orderbook snapshot not loaded after ${maxWaitMs}ms. Aborting.`);
            return;
        }

        console.log(`[TradeExecutor] Orderbook loaded in ${waitedMs}ms!`);

        // Сохраняем слепок стакана в лог
        executionLog.orderbook = {
            asks: orderbook.getTopAsks(15),
            bids: orderbook.getTopBids(5)
        };

        if (!signal.big.avg_price) {
            executionLog.status = 'ABORTED_NO_DEX_PRICE';
            console.error(`[TradeExecutor] Target big exchange avg_price is missing. Aborting.`);
            return;
        }

        // --- МАТЕМАТИКА СВИПА ---
        const maxPriceLimit = signal.big.avg_price * (1 - config.SAFE_SPREAD_BUFFER_PERCENT / 100);
        const { safePrice, safeAmountUsdt } = orderbook.calculateSweep(maxPriceLimit, config.FIXED_BUY_USDT);

        executionLog.math = {
            dex_price: signal.big.avg_price,
            maxPriceLimit: maxPriceLimit,
            calculated_safePrice: safePrice,
            calculated_safeAmountUsdt: safeAmountUsdt,
            limit_usdt: config.FIXED_BUY_USDT
        };

        if (safeAmountUsdt < 5) {
            executionLog.status = 'ABORTED_INSUFFICIENT_VOLUME';
            console.warn(`[TradeExecutor] Volume < $5 ($${safeAmountUsdt.toFixed(2)}). Aborting. Bad price or empty orderbook.`);
            return;
        }

        // --- ВЫСТРЕЛ ---
        const priceStr = parseFloat(safePrice.toFixed(10)).toString();
        const amountStr = safeAmountUsdt.toFixed(2);

        executionLog.math.final_price_str = priceStr;
        executionLog.math.final_amount_str = amountStr;

        console.log(`[TradeExecutor] Instructing Sniper: Buy ${amountStr} USDT at price ${priceStr}`);
        await sniper.executeBuy(priceStr, amountStr);

        executionLog.status = config.DRY_RUN ? 'SUCCESS_DRY_RUN' : 'SUCCESS_EXECUTED';
        console.log(`[TradeExecutor] Pipeline executed successfully.`);

        // ЕСЛИ УСПЕХ И НЕ DRY_RUN - ИГРАЕМ ЗВУК!
        if (!config.DRY_RUN) {
            playSuccessSound();
        }

    } catch (err: any) {
        executionLog.status = 'ERROR';
        executionLog.error = err.message;
        console.error(`[TradeExecutor] Error executing trade:`, err.message);
    } finally {
        // --- СОХРАНЕНИЕ ЧЕРНОГО ЯЩИКА НА ДИСК ---
        try {
            const logsDir = path.join(process.cwd(), 'logs', 'signals');
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            // Имя файла: 2026-03-10T12-30-00_PUNCH.json (заменяем двоеточия, чтобы Windows/Mac не ругались)
            const safeTime = executionLog.timestamp.replace(/:/g, '-');
            const logFileName = `${safeTime}_${signal.symbol}.json`;
            const logFilePath = path.join(logsDir, logFileName);

            fs.writeFileSync(logFilePath, JSON.stringify(executionLog, null, 2));
            console.log(`[TradeExecutor] Execution report saved to ${logFilePath}`);
        } catch (e) {
            console.error('[TradeExecutor] Failed to save execution log', e);
        }

        if (tabClient) {
            await tabClient.close().catch(() => { });
        }
    }
}