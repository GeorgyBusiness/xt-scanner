import { AppEventBus } from '../core/event_bus';

export function initTabManager(eventBus: AppEventBus) {
    eventBus.onSignal((payload) => {
        const urlsToOpen: string[] = [];

        const transformUrl = (url?: string) => {
            if (!url) return null;
            if (url.includes('jup.ag/swap')) {
                // Try to extract from simple URL parameters ?buy=...&sell=...
                const match = url.match(/[?&]sell=([^&]+)/);
                if (match && match[1]) {
                    return `https://jup.ag/tokens/${match[1]}`;
                }
            }
            return url;
        };

        const transformedBuy = transformUrl(payload.buy_url);
        if (transformedBuy) urlsToOpen.push(transformedBuy);

        const transformedSell = transformUrl(payload.sell_url);
        if (transformedSell && transformedSell !== transformedBuy) {
            urlsToOpen.push(transformedSell);
        }

        if (urlsToOpen.length > 0) {
            eventBus.emitOpenTabs({ urls: urlsToOpen, signal: payload });
        }
    });
}
