# ADR-004: Менеджер вкладок и трансформация целевых URL

**Дата создания:** 2026-03-08
**Статус:** `Approved`
**Связанные Epic/Task:** Этап 4 (ROADMAP.md)

---

## 1. Контекст и Бизнес-задача (Context)
* В рамках Этапа 4 необходимо автоматизировать открытие торговых терминалов (целевой CEX и DEX) при получении уникального арбитражного сигнала.
* **Проблема:** Ссылки на Jupiter, приходящие в сыром WebSocket-трафике (`buy_url` или `sell_url`), ведут на форму обмена (`/swap`). Для быстрого принятия решения пользователю требуется страница самого токена с графиком и стаканом (`/tokens`).
* **Задача:** Реализовать перехват сигнала, трансформацию Swap-ссылок Jupiter в Token-ссылки, и их автоматическое открытие в браузере (на переднем плане). Анти-спам кэш уже был реализован ранее в `scanner.ts`.

## 2. Предлагаемое решение (Proposed Solution)
* Применяется паттерн **Event-Driven Architecture** (Вариант Б из обсуждения) для сохранения слабой связанности (Feature-First).
* Создается новый модуль `src/features/browser_tabs.ts`. Он выступает как слушатель (Subscriber) и трансформатор:
  1. Подписывается на `SignalDetectedEvent`.
  2. Проверяет пришедшие ссылки. Если ссылка содержит `jup.ag/swap`, извлекает адрес контракта из query-параметра `sell` (с помощью `URLSearchParams` или Regex).
  3. Формирует новую ссылку вида `https://jup.ag/tokens/{ADDRESS}`.
  4. Публикует новое событие `OpenBrowserTabsRequest` с массивом готовых URL.
* Модуль `main.ts` (Оркестратор) подписывается на `OpenBrowserTabsRequest`. Получив событие, он использует актуальный объект CDP-клиента для вызова `client.Target.createTarget({ url })`.

## 3. Изменения в Данных и Состоянии (Data & State)
* **БД:** Отсутствует.
* **State:** Без состояния (Stateless). Логика трансформации выполняется "на лету".
* В `src/shared/types.ts` добавляется новый интерфейс DTO: `IOpenTabsPayload { urls: string[] }`.

## 4. Интеграции и AI (Integrations)
* Взаимодействие с браузером идет через CDP домен `Target`.
* Вкладки открываются активно (в фокусе), так как потеря фокуса текущей страницей сканера (`has_focus: false`) является штатным поведением и не вызывает подозрений у антифрод-систем. Флаг `background: true` не используется.

## 5. Затронутые файлы (Affected Files)
* `src/shared/types.ts` — Добавить интерфейс `IOpenTabsPayload`.
* `src/core/event_bus.ts` — Добавить методы `emitOpenTabs` и `onOpenTabs`.
* `src/features/browser_tabs.ts` — Создать файл. Реализовать логику `initTabManager(eventBus: AppEventBus)`.
* `src/main.ts` — Инициализировать `initTabManager` и добавить обработчик `eventBus.onOpenTabs(...)` внутри `runSession`.

## 6. Пошаговый план реализации (Execution Steps)
1. Открыть `src/shared/types.ts` и добавить `export interface IOpenTabsPayload { urls: string[]; }`.
2. Открыть `src/core/event_bus.ts` и добавить проброс события `OpenBrowserTabsRequest` (методы `emitOpenTabs` и `onOpenTabs`).
3. Создать `src/features/browser_tabs.ts`. Написать функцию `initTabManager(eventBus: AppEventBus)`. Внутри подписаться на `onSignal`. Извлечь `buy_url` и `sell_url`. Написать логику: если URL включает `jup.ag/swap`, вытащить значение `sell=` и собрать `https://jup.ag/tokens/${address}`. Опубликовать `emitOpenTabs({ urls: [url1, url2] })`.
4. Открыть `src/main.ts`. Импортировать `initTabManager`, вызвать его после `initLogger`. Внутри функции `runSession` добавить обработчик:
   ```typescript
   eventBus.onOpenTabs(async (payload) => {
       for (const targetUrl of payload.urls) {
           await client.Target.createTarget({ url: targetUrl });
       }
   });

##  7. План синхронизации документации (Sync Plan)
[ ] 01_BUSINESS_DOMAIN.md (Уточнить механику трансформации Swap -> Tokens для Jupiter)

[ ] 02_ARCHITECTURE.md (Зафиксировать main.ts как Оркестратора CDP-команд)

[ ] 05_FILE_STRUCTURE.md (Добавить browser_tabs.ts в дерево файлов)

[ ] ROADMAP.md (Отметить Этап 4 как Completed)

- [x] `01_BUSINESS_DOMAIN.md` - (Уточнить механику трансформации Swap -> Tokens для Jupiter)    
- [x] `02_ARCHITECTURE.md` -  (Зафиксировать main.ts как Оркестратора CDP-команд)
- [x] `03_DATA_AND_STATE.md`
- [x] `04_INTEGRATIONS.md` 
- [x] `05_FILE_STRUCTURE.md` (Добавить browser_tabs.ts в дерево файлов)
- [x] `ROADMAP.md` - (Отметить Этап 4 как Completed)