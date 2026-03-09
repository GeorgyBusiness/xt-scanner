import { connectCDP } from './core/cdp_client';
import { parseWebSocketFrame } from './features/scanner';
import { AppEventBus } from './core/event_bus';
import { initLogger } from './features/logger';
import { initTabManager } from './features/browser_tabs';
import { IOpenTabsPayload } from './shared/types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runSession(eventBus: AppEventBus) {
    console.log('[Main] Starting new session...');
    const client = await connectCDP();
    const { Network } = client;

    try {
        await Network.enable();
        console.log('[Main] Network domain enabled. Listening for WebSocket frames...');

        Network.webSocketFrameReceived((params: any) => {
            const payloadData = params.response?.payloadData;
            if (payloadData && typeof payloadData === 'string') {
                const signals = parseWebSocketFrame(payloadData);
                for (const signal of signals) {
                    console.log(`[🔥 СИГНАЛ] ${signal.symbol} | ${signal.small.exchange} (${signal.small.avg_price || 'N/A'}) -> ${signal.big.exchange} (${signal.big.avg_price || 'N/A'}) | Профит: ${signal.arb_percent}% ($${signal.arbitrage_amount_usdt})`);
                    eventBus.emitSignal(signal);
                }
            }
        });

        // ОЧИЩАЕМ СТАРЫХ СЛУШАТЕЛЕЙ ПЕРЕД ДОБАВЛЕНИЕМ НОВОГО
        eventBus.clearOpenTabsListeners();

        eventBus.onOpenTabs(async (payload: IOpenTabsPayload) => {
            for (const targetUrl of payload.urls) {
                await client.Target.createTarget({ url: targetUrl });
            }
        });

        return new Promise<void>((_, reject) => {
            client.on('error', (err) => {
                client.close().catch(() => { });
                reject(err);
            });
        });
    } catch (err) {
        await client.close().catch(() => { });
        throw err;
    }
}

async function main() {
    console.log('[Main] Starting XT Scanner Iteration 2 (Auto-Reconnect)...');

    const eventBus = new AppEventBus();
    initLogger(eventBus);
    initTabManager(eventBus);

    // Keep process alive strictly (SIGINT handled below)
    process.on('SIGINT', () => {
        console.log('\n[Main] Exiting gracefully...');
        process.exit(0);
    });

    while (true) {
        try {
            await runSession(eventBus);
        } catch (err: any) {
            console.error('[Main] Session error:', err.message);
            console.log('[Main] Waiting 3 seconds before reconnecting...');
            await sleep(3000);
        }
    }
}

main();
