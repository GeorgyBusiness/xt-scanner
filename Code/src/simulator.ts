import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { AppEventBus } from './core/event_bus';
import { initTabManager } from './features/browser_tabs';
import { connectCDP } from './core/cdp_client';
import { IOpenTabsPayload } from './shared/types';

async function runSimulator() {
    console.log('[Simulator] Starting simulator...');

    // 1. Создаем экземпляр EventBus и инициализируем TabManager
    const eventBus = new AppEventBus();
    initTabManager(eventBus);

    try {
        // 2. Подключаемся к браузеру и настраиваем обработку открытия вкладок
        const client = await connectCDP();
        const { Network } = client;
        await Network.enable();

        eventBus.onOpenTabs(async (payload: IOpenTabsPayload) => {
            for (const targetUrl of payload.urls) {
                console.log(`[Simulator] Открываем вкладку: ${targetUrl}`);
                try {
                    await client.Target.createTarget({ url: targetUrl });
                } catch (e) {
                    console.error('[Simulator] Не удалось открыть вкладку:', e);
                }
            }
        });

        // 3. Читаем файл с логами
        const logsDir = path.join(__dirname, '..', 'logs');
        if (!fs.existsSync(logsDir)) {
            console.error(`[Simulator] Папка логов не найдена: ${logsDir}`);
            process.exit(1);
        }

        // Ищем все файлы jsonl, сортируем по имени (дата) и берем последний
        const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.jsonl')).sort();
        if (files.length === 0) {
            console.error('[Simulator] В папке логов нет файлов .jsonl');
            process.exit(1);
        }

        const latestLogFile = files[files.length - 1];
        const logFilePath = path.join(__dirname, '..', 'logs', 'test_signal.jsonl'); // Твое имя файла
        console.log(`[Simulator] Используем файл логов: ${latestLogFile}`);

        const fileContent = fs.readFileSync(logFilePath, 'utf-8');
        const lines = fileContent.split('\n').filter(l => l.trim().length > 0);

        if (lines.length === 0) {
            console.error('[Simulator] Файл логов пуст.');
            process.exit(1);
        }

        console.log(`[Simulator] Загружено ${lines.length} сигналов из лога.`);

        // 4. Настраиваем чтение из консоли
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        let currentIndex = 0;

        console.log('\n[Simulator] Нажмите Enter, чтобы отправить следующий сигнал (или введите "exit" для выхода).');

        rl.on('line', (input) => {
            if (input.trim().toLowerCase() === 'exit') {
                console.log('[Simulator] Завершение работы...');
                rl.close();
                client.close().catch(() => { });
                process.exit(0);
            }

            if (currentIndex >= lines.length) {
                console.log('[Simulator] Достигнут конец лог-файла. Сигналы закончились. Для выхода введите "exit".');
                return;
            }

            const currentLine = lines[currentIndex];
            currentIndex++;

            try {
                const parsedSignal = JSON.parse(currentLine);
                console.log(`\n[Simulator] Отправка сигнала ${currentIndex}/${lines.length}...`);
                console.log(`[Simulator] Сигнал: ${parsedSignal.symbol} | Профит: ${parsedSignal.arb_percent}%`);
                eventBus.emitSignal(parsedSignal);
            } catch (err) {
                console.error(`[Simulator] Ошибка парсинга строки ${currentIndex}:`, err);
            }
        });

    } catch (err) {
        console.error('[Simulator] Критическая ошибка:', err);
        process.exit(1);
    }
}

runSimulator();
