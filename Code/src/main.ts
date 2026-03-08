import { connectCDP } from './core/cdp_client';

async function main() {
    console.log('[Main] Starting XT Scanner Iteration 1...');

    const client = await connectCDP();
    const { Network } = client;

    try {
        await Network.enable();
        console.log('[Main] Network domain enabled. Listening for WebSocket frames...');

        Network.webSocketFrameReceived((params: any) => {
            console.log('[WebSocket Frame Received]:', JSON.stringify(params, null, 2));
        });

        // Keep process alive
        process.on('SIGINT', async () => {
            console.log('\n[Main] Closing CDP connection...');
            await client.close();
            process.exit(0);
        });
    } catch (err) {
        console.error('[Main] Error during CDP operations:', err);
        await client.close();
        process.exit(1);
    }
}

main();
