import { promises as fs, mkdirSync, existsSync } from 'fs';
import * as path from 'path';
import { AppEventBus } from '../core/event_bus';

export function initLogger(eventBus: AppEventBus) {
    const logsDir = path.join(process.cwd(), 'logs');

    // СИНХРОННОЕ создание папки логов при старте
    if (!existsSync(logsDir)) {
        try {
            mkdirSync(logsDir, { recursive: true });
        } catch (err) {
            console.error('[Logger] Failed to create logs directory:', err);
        }
    }

    // Слушаем сигналы
    eventBus.onSignal((payload) => {
        const now = new Date();
        // Получаем строку вида YYYY-MM-DD для имени файла
        const dateString = now.toISOString().split('T')[0];
        const logFilePath = path.join(logsDir, `signals_${dateString}.jsonl`);

        const line = JSON.stringify({
            timestamp: now.toISOString(),
            ...payload
        }) + '\n';

        // Асинхронно пишем в файл с именем сегодняшнего дня
        fs.appendFile(logFilePath, line).catch(err => {
            console.error(`[Logger] Error appending to ${logFilePath}:`, err);
        });
    });
}
