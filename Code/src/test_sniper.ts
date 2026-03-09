import CDP from 'chrome-remote-interface';
import { XTSniper } from './features/xt_sniper';
import { config } from '../config';

async function run() {
    let globalClient: CDP.Client | null = null;
    let tabClient: CDP.Client | null = null;

    try {
        console.log(`[CDP] Connecting to CDP at ${config.CDP_HOST}:${config.CDP_PORT}...`);

        globalClient = await CDP({
            host: config.CDP_HOST,
            port: config.CDP_PORT
        });

        console.log('[CDP] Creating new target tab for XT Spot (PUNCH/USDT)...');
        const target = await globalClient.Target.createTarget({ url: 'https://www.xt.com/en/trade/punch_usdt' });

        console.log('[CDP] Connecting to the created tab...');
        tabClient = await CDP({
            target: target.targetId,
            host: config.CDP_HOST,
            port: config.CDP_PORT
        });

        // Включаем домены Runtime (для XPath) и Page (для ожидания загрузки)
        await tabClient.Runtime.enable();
        await tabClient.Page.enable();

        console.log('⏳ Waiting for page to load (5 seconds)...');
        // Даем странице время отрендерить React-компоненты
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('🚀 Initializing XTSniper...');
        const sniper = new XTSniper(tabClient);

        console.log('🎯 Sending test buy command...');
        // Пробуем вбить данные в стакан
        await sniper.executeBuy("0.0025", "10");

        console.log('✅ Test completed successfully.');

    } catch (err) {
        console.error('❌ Error during sniper test:', err);
    } finally {
        if (tabClient) {
            await tabClient.close();
            console.log('Disconnected CDP tab client.');
        }
        if (globalClient) {
            await globalClient.close();
            process.exit(0);
        }
    }
}

run();