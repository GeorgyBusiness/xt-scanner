# ADR-007: Оркестратор сделки (Trade Pipeline), расчет Свипа и Тестовый прогон

**Дата создания:** 2026-03-10
**Статус:** `Approved`
**Связанные Epic/Task:** ROADMAP v2.0 (Фаза 1: Шаг 4 — Связывание модулей)

---

## 1. Контекст и Бизнес-задача (Context)
* Изолированные модули для чтения стакана (`xt_orderbook.ts`) и кликера (`xt_sniper.ts`) успешно реализованы.
* **Бизнес-задача:** Необходимо связать получение сигнала, открытие вкладки, сбор стакана, расчет допустимого объема выкупа (Sweep) и инъекцию кликов в единый автоматизированный пайплайн (Оркестратор сделки).
* **Математика Свипа:** Бот не должен выставлять множество мелких ордеров. Он должен вычислить максимальную безопасную цену (с учетом защитного спреда до цены DEX) и доступный объем USDT в стакане, после чего выставить **один лимитный ордер** (вписать цену и сумму), позволив движку биржи мгновенно выкупить все встречные заявки по лучшим ценам.
* **Безопасность (Anti-Rekt):** Тестирование на реальных средствах недопустимо. Требуется внедрение режима "Холостого хода" (`DRY_RUN`) и создание отдельного скрипта для эмуляции полного цикла (`test_pipeline.ts`).

## 2. Предлагаемое решение (Proposed Solution)
* **Конфигурация:** Внедряем `SAFE_SPREAD_BUFFER_PERCENT` (процент запаса от цены DEX) и `DRY_RUN` (флаг отмены финального клика) в глобальный конфиг.
* **Слой Исполнения (Trade Executor):** Создаем новый модуль `src/features/trade_executor.ts`. Он инкапсулирует логику конкретной сделки: подключается к переданной вкладке XT по CDP, инициализирует `XTOrderbookManager`, ждет загрузки стакана (фиксированная пауза ~3-5 сек для Итерации 1), производит расчеты Свипа и передает данные в `XTSniper`.
* **Оркестратор (`main.ts`):** При открытии вкладок (перехват события из `browser_tabs.ts`) `main.ts` сохраняет `targetId` открытой вкладки XT и передает его в `TradeExecutor` для запуска пайплайна.
* **Изолированный Тест (`test_pipeline.ts`):** Скрипт, который берет хардкодный сигнал из `logs/test_signal.jsonl`, открывает вкладку, ждет стакан и вбивает цифры без реального клика (благодаря `DRY_RUN=true`).

## 3. Изменения в Данных и Состоянии (Data & State)
* **БД:** Нет изменений.
* **State:** Изменений в In-memory кэше нет. Состояние пайплайна (ожидание стакана) локализовано внутри асинхронной функции `executeTrade`.
* **Конфиг:** Добавляются новые параметры, влияющие на расчет:
  * `SAFE_SPREAD_BUFFER_PERCENT`: `1.5` (Оставляем 1.5% спреда на комиссии и проскальзывание Юпитера).
  * `DRY_RUN`: `true` (По умолчанию включен для безопасности).

## 4. Интеграции и AI (Integrations)
* **Управление вкладками ОС:** Вкладки после отработки Снайпера остаются открытыми. Закрытие вкладок происходит пользователем вручную.
* **Требование к среде (Документация):** В Chrome должна быть отключена функция "Экономия памяти" (Memory Saver) для URL платного сканера, чтобы фоновое WebSocket-соединение не обрывалось ОС.

## 5. Затронутые файлы (Affected Files)
* `config.ts` — Добавить `SAFE_SPREAD_BUFFER_PERCENT` и `DRY_RUN`.
* `src/features/trade_executor.ts` — Создать новый модуль управления жизненным циклом одной сделки.
* `src/features/xt_sniper.ts` — Изменить: обернуть финальный клик по кнопке Buy в проверку `if (!config.DRY_RUN) { ... } else { console.log('DRY_RUN...'); }`.
* `src/main.ts` — Изменить: добавить перехват `targetId` при открытии XT и вызов `trade_executor.ts`.
* `src/test_pipeline.ts` — Создать CLI-скрипт для E2E-тестирования пайплайна.
* `package.json` — Добавить `"test:pipeline": "ts-node src/test_pipeline.ts"`.

## 6. Пошаговый план реализации (Execution Steps)
1. **Обновление Config и Sniper:**
   * Добавить в `config.ts` поля `SAFE_SPREAD_BUFFER_PERCENT` (number) и `DRY_RUN` (boolean).
   * Открыть `xt_sniper.ts`, найти место клика по `buttonData` и добавить условие проверки `config.DRY_RUN`. Если `true` — просто логировать готовность к клику.
2. **Создание Trade Executor (`src/features/trade_executor.ts`):**
   * Создать асинхронную функцию `executeTrade(signal: ISignalPayload, targetId: string)`.
   * Внутри: создать новое CDP-соединение `tabClient = await CDP({ target: targetId, ... })`.
   * Инициализировать `XTOrderbookManager(tabClient)` и `XTSniper(tabClient)`.
   * Сделать `await delay(4000)` (дать стакану собраться).
   * Расчет математики: 
     `maxPriceLimit = signal.big.avg_price * (1 - config.SAFE_SPREAD_BUFFER_PERCENT / 100)`.
     `const { safePrice, safeAmountUsdt } = orderbook.calculateSweep(maxPriceLimit, config.FIXED_BUY_USDT)`.
   * Проверка: `if (safeAmountUsdt < 5) { abort }` (защита от пустых стаканов).
   * Вызов: `await sniper.executeBuy(safePrice.toString(), safeAmountUsdt.toString())`.
3. **Обновление `main.ts`:**
   * В месте открытия вкладок (`Target.createTarget`), если URL содержит `xt.com`, забираем `target.targetId`.
   * Вызываем `executeTrade(signal, targetId)`. *(Важно: нужно пробросить сам `signal` в событие `OpenBrowserTabsRequest` или связать их по логике).*
4. **Создание `src/test_pipeline.ts`:**
   * Скрипт читает первую строку из `test_signal.jsonl`.
   * Делает `JSON.parse`.
   * Подключается к браузеру, открывает `signal.buy_url` (XT).
   * Вызывает `executeTrade` для эмуляции поведения `main.ts`.
5. **Обновление `package.json`:**
   * Добавить команду для запуска нового теста.

## 7. План синхронизации документации (Sync Plan)
- [ ] `01_BUSINESS_DOMAIN.md` (Описать математику Свипа "Один лимитный ордер" и правило Memory Saver)
- [ ] `02_ARCHITECTURE.md` (Зафиксировать появление `trade_executor.ts` и `test_pipeline.ts`)
- [ ] `03_DATA_AND_STATE.md` (Уточнить влияние `SAFE_SPREAD_BUFFER_PERCENT`)
- [ ] `04_INTEGRATIONS.md` (Указать требование к отключению Memory Saver в Chrome)
- [ ] `05_FILE_STRUCTURE.md` (Обновить дерево файлов)