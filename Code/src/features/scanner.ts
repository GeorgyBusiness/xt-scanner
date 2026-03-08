import { config } from '../../config';
import { ISignalPayload } from '../shared/types';

const spamCache = new Map<string, number>();

// Фоновая очистка кэша каждые 2 минуты для предотвращения утечки памяти
setInterval(() => {
    const now = Date.now();
    for (const [symbol, lastSeen] of spamCache.entries()) {
        if (now - lastSeen >= config.ANTI_SPAM_TTL_MS) {
            spamCache.delete(symbol);
        }
    }
}, 120000).unref(); // unref() позволяет Node.js завершить процесс, если нет других активных задач

export function parseWebSocketFrame(frame: string): ISignalPayload[] {
    // 1. Выводим сырые данные ДО парсинга, если включен дебаг
    if (config.DEBUG_RAW_SIGNALS) {
        // Простая эвристика, чтобы не печатать совсем уж мусор, 
        // а только то, что похоже на массив сигналов
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
            // Duck typing: фильтрация телеметрии
            if (item && item.small && item.big && typeof item.arb_percent === 'number') {
                const targetCexStr = config.TARGET_CEX.toLowerCase();
                const smallExchangeStr = String(item.small.exchange).toLowerCase();

                if (config.CEX_FILTER_ENABLED && smallExchangeStr !== targetCexStr) {
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
                    small: { exchange: item.small.exchange },
                    big: { exchange: item.big.exchange },
                    buy_url: item.buy_url,
                    sell_url: item.sell_url
                });
            }
        }

        return signals;
    } catch (e) {
        // Здесь оставляем только логирование реальных ошибок парсинга
        console.error('[Scanner] Ошибка JSON.parse. Raw data:', frame);
        return [];
    }
}
