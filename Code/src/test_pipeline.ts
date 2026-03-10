import CDP from 'chrome-remote-interface';
import * as fs from 'fs';
import * as path from 'path';
import { executeTrade } from './features/trade_executor';
import { ISignalPayload } from './shared/types';
import { config } from '../config';

async function runTest() {
    console.log('[TestPipeline] Starting E2E test...');

    // Read signal
    const logPath = path.join(__dirname, '..', 'logs', 'test_signal.jsonl');
    let signal: ISignalPayload;
    try {
        const content = fs.readFileSync(logPath, 'utf8');
        const lines = content.trim().split('\n').filter(l => l.length > 0);
        if (lines.length === 0) {
            console.error('test_signal.jsonl is empty.');
            return;
        }
        signal = JSON.parse(lines[0]);
    } catch (err) {
        console.error('Error reading test_signal.jsonl:', err);
        return;
    }

    if (!signal.buy_url) {
        console.error('Signal has no buy_url');
        return;
    }

    console.log(`[TestPipeline] Found test signal for ${signal.symbol}. Linking to ${signal.buy_url}`);

    let browserClient: CDP.Client | null = null;
    try {
        browserClient = await CDP({ port: config.CDP_PORT, host: config.CDP_HOST });
        const target = await browserClient.Target.createTarget({ url: signal.buy_url });

        console.log(`[TestPipeline] Target created: ${target.targetId}`);
        await executeTrade(signal, target.targetId);
    } catch (err) {
        console.error('[TestPipeline] Error:', err);
    } finally {
        if (browserClient) {
            await browserClient.close().catch(() => { });
        }
        console.log('[TestPipeline] Done. Provide Ctrl+C to exit if it hangs.');
        process.exit(0);
    }
}

runTest();
