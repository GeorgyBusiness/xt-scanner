import CDP from 'chrome-remote-interface';
import { config } from '../../config';

export async function connectCDP() {
    try {
        const targets = await CDP.List({
            host: config.CDP_HOST,
            port: config.CDP_PORT
        });

        const target = targets.find((t) => t.url.includes(config.SCANNER_URL_MATCH));

        if (!target) {
            console.error(`[CDP Client] No tab found matching URL part: "${config.SCANNER_URL_MATCH}"`);
            console.error('[CDP Client] Available tabs:', targets.map(t => t.url));
            process.exit(1);
        }

        console.log(`[CDP Client] Found target tab: ${target.url}`);

        const client = await CDP({
            host: config.CDP_HOST,
            port: config.CDP_PORT,
            target: target.webSocketDebuggerUrl
        });

        console.log(`[CDP Client] Connected to Target at ${config.CDP_HOST}:${config.CDP_PORT}`);

        client.on('disconnect', () => {
            console.error('[CDP Client] Disconnected from Chrome. Exiting...');
            process.exit(1);
        });

        return client;
    } catch (err) {
        console.error(`[CDP Client] Failed to connect to Chrome at ${config.CDP_HOST}:${config.CDP_PORT}.`, err);
        process.exit(1);
        throw err;
    }
}
