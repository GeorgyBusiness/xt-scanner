import CDP from 'chrome-remote-interface';
import { XTOrderbookManager } from './features/xt_orderbook';
import { config } from '../config';

async function main() {
    let globalClient: CDP.Client | null = null;
    let tabClient: CDP.Client | null = null;
    try {
        console.log(`[CDP] Connecting to CDP at ${config.CDP_HOST}:${config.CDP_PORT}...`);

        globalClient = await CDP({
            host: config.CDP_HOST,
            port: config.CDP_PORT
        });

        console.log('[CDP] Creating new target tab for XT Spot...');
        // Сразу открываем PUNCH для теста
        const target = await globalClient.Target.createTarget({ url: 'https://www.xt.com/en/trade/punch_usdt' });

        console.log('[CDP] Connecting to the created tab...');
        tabClient = await CDP({
            target: target.targetId,
            host: config.CDP_HOST,
            port: config.CDP_PORT
        });

        await tabClient.Network.enable();

        const orderbookManager = new XTOrderbookManager(tabClient);

        let isFirstDraw = true;
        const UI_LINES = 29; // Количество строк в нашем дашборде

        setInterval(() => {
            if (!orderbookManager.getSnapshotStatus()) return;

            const asks = orderbookManager.getTopAsks(10);
            const bids = orderbookManager.getTopBids(10);

            // --- МАГИЯ ОЧИСТКИ ТЕРМИНАЛА ---
            // При первом запуске печатаем пустые строки, чтобы сдвинуть старую историю вверх
            if (isFirstDraw) {
                for (let i = 0; i < UI_LINES; i++) console.log('');
                isFirstDraw = false;
            }
            // Поднимаем невидимый курсор на UI_LINES строк вверх
            process.stdout.write(`\x1B[${UI_LINES}A`);

            // Функция печати, которая стирает остатки старых символов в конце строки (\x1B[K)
            const printLine = (msg: string) => console.log(msg + '\x1B[K');

            printLine('=== XT LIVE ORDERBOOK (PUNCH/USDT) ===');
            printLine('');
            printLine('Price        | Amount       | Total USDT');
            printLine('------------------------------------------');

            // --- КРАСНЫЙ СТАКАН (Asks) ---
            // Биржа суммирует от дешевых к дорогим (снизу вверх)
            const sortedAsks = [...asks].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
            let askCumUsdt = 0;
            const askRows: string[] = [];

            for (let i = 0; i < sortedAsks.length; i++) {
                const price = parseFloat(sortedAsks[i][0]);
                const vol = sortedAsks[i][1];
                askCumUsdt += price * vol;

                const priceStr = sortedAsks[i][0].padEnd(12);
                const volStr = vol.toFixed(2).padEnd(12);
                const totalStr = askCumUsdt.toFixed(2);

                askRows.push(`\x1b[31m${priceStr}\x1b[0m | ${volStr} | $${totalStr}`);
            }
            // Переворачиваем массив, чтобы самая дешевая цена (откуда начали считать) была в самом низу
            askRows.reverse().forEach(row => printLine(row));

            printLine('------------------------------------------');

            // --- ЗЕЛЕНЫЙ СТАКАН (Bids) ---
            // Биржа суммирует от дорогих к дешевым (сверху вниз)
            const sortedBids = [...bids].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
            let bidCumUsdt = 0;

            sortedBids.forEach(([priceStr, vol]) => {
                const price = parseFloat(priceStr);
                bidCumUsdt += price * vol;

                const pStr = priceStr.padEnd(12);
                const vStr = vol.toFixed(2).padEnd(12);
                const tStr = bidCumUsdt.toFixed(2);

                printLine(`\x1b[32m${pStr}\x1b[0m | ${vStr} | $${tStr}`);
            });

            printLine('==========================================');

            // Симуляция проскальзывания
            const targetUsdt = 1000;
            const execution = orderbookManager.calculateExecution(targetUsdt);
            printLine(`Симуляция: Покупка на $${targetUsdt} по Market`);
            if (execution.isVolumeSufficient) {
                printLine(`📈 Средняя цена входа: ${execution.averagePrice?.toFixed(6)}`);
                printLine(`🎯 Последняя выкупленная цена: ${execution.maxPriceHit}`);
            } else {
                printLine(`❌ В стакане недостаточно объема для покупки на $${targetUsdt}`);
                printLine('');
            }
        }, 150);

    } catch (err) {
        console.error('Error in test_orderbook:', err);
    }
}

main();