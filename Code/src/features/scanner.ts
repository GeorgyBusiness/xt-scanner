import { config } from '../../config';
import { ISignalPayload } from '../shared/types';
import * as fs from 'fs';
import * as path from 'path';

// --- УМНЫЙ BLACKLIST ---
let blacklist: string[] = [];
const blacklistPath = path.join(process.cwd(), 'blacklist.txt');

function loadBlacklist() {
    try {
        if (fs.existsSync(blacklistPath)) {
            const content = fs.readFileSync(blacklistPath, 'utf-8');
            blacklist = content.split('\n')
                .map(c => c.trim().toUpperCase()) // Убираем пробелы и делаем заглавными
                .filter(c => c.length > 0);
            console.log(`[Scanner] Загружен Blacklist: ${blacklist.length} монет(ы).`);
        }
    } catch (e) {
        console.error('[Scanner] Ошибка чтения blacklist.txt:', e);
    }
}

// Загружаем при старте
loadBlacklist();

// Следим за изменениями файла (чтобы не перезагружать бота)
if (fs.existsSync(blacklistPath)) {
    fs.watchFile(blacklistPath, { interval: 2000 }, () => {
        console.log('[Scanner] Файл blacklist.txt изменен. Обновляем в памяти...');
        loadBlacklist();
    });
}
// -----------------------

const spamCache = new Map<string, number>();

setInterval(() => {
    const now = Date.now();
    for (const [symbol, lastSeen] of spamCache.entries()) {
        if (now - lastSeen >= config.ANTI_SPAM_TTL_MS) {
            spamCache.delete(symbol);
        }
    }
}, 120000).unref();

export function parseWebSocketFrame(frame: string): ISignalPayload[] {
    // 🛡️ ФИКС: Игнорируем пинги-понги, чтобы не спамить в консоль
    if (frame === 'pong' || frame === 'ping') {
        return [];
    }

    if (config.DEBUG_RAW_SIGNALS) {
        if (frame.startsWith('[')) {
            console.log('[Scanner DEBUG Raw Frame]:', frame);
        }
    }

    try {
        const parsed = JSON.parse(frame);

        if (!Array.isArray(parsed)) {
            return [];
        }

        const signals: ISignalPayload[] = [];

        for (const item of parsed) {
            if (item && item.small && item.big && typeof item.arb_percent === 'number') {
                const targetCexStr = config.TARGET_CEX.toLowerCase();
                const smallExchangeStr = String(item.small.exchange).toLowerCase();

                if (config.CEX_FILTER_ENABLED && smallExchangeStr !== targetCexStr) {
                    continue;
                }

                // 🛡️ ПРОВЕРКА BLACKLIST (Мгновенно из оперативной памяти)
                const symbolUpper = String(item.symbol).toUpperCase();
                if (blacklist.includes(symbolUpper)) {
                    console.log(`[Scanner] ⛔ Игнорируем монету из blacklist.txt: ${symbolUpper}`);
                    continue;
                }

                // 🛡️ НОВЫЙ ФИЛЬТР: Проверка минимального спреда
                if (item.arb_percent < config.MIN_ARB_PERCENT) {
                    continue;
                }

                const now = Date.now();
                const lastSeen = spamCache.get(item.symbol) || 0;

                if (now - lastSeen < config.ANTI_SPAM_TTL_MS) {
                    continue;
                }

                spamCache.set(item.symbol, now);

                signals.push({
                    symbol: item.symbol,
                    arb_percent: item.arb_percent,
                    arbitrage_amount_usdt: item.arbitrage_amount_usdt,
                    small: {
                        exchange: item.small.exchange,
                        avg_price: item.prices_data?.small_avg_price,
                        min_price: item.prices_data?.min_price_buy,
                        max_price: item.prices_data?.max_price_buy
                    },
                    big: {
                        exchange: item.big.exchange,
                        avg_price: item.prices_data?.big_avg_price,
                        min_price: item.prices_data?.min_price_sell,
                        max_price: item.prices_data?.max_price_sell
                    },
                    buy_url: item.buy_url,
                    sell_url: item.sell_url
                });
            }
        }

        return signals;
    } catch (e) {
        console.error('[Scanner] Ошибка JSON.parse. Raw data:', frame);
        return [];
    }
}
