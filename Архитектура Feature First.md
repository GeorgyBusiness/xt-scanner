# **Архитектура "Feature-First": Полное руководство по построению приложений**

## **Основные понятия**

## **Бизнес-логика (Фича)**

**Определение:** Отдельная функциональность приложения, которая решает конкретную бизнес-задачу.

**Принцип:** Фича знает **"что делать"**, но не знает **"как показать"**.

**Состоит из:**

* `backend/` \- API endpoints, сервисы, модели БД

* `frontend/` \- только API клиенты для взаимодействия с backend

## **Экран интерфейса (UI Screen)**

**Определение:** Визуальная страница приложения, которая показывает данные пользователю.

**Принцип:** Экран знает **"как показать"**, но не знает **"что делать"**.

**Состоит из:**

* Главный компонент страницы

* `components/` \- UI компоненты, специфичные для этого экрана

* `composables/` \- логика взаимодействия, специфичная только для этого экрана

## **Структура проекта**

text

`project/`

`├── features/                    # БИЗНЕС-ЛОГИКА`

`│   ├── [фича1]/`

`│   │   ├── backend/`

`│   │   │   ├── routes.py       # API endpoints`

`│   │   │   ├── services.py     # Бизнес-логика`

`│   │   │   └── models.py       # Модели БД`

`│   │   └── frontend/`

`│   │       └── [фича1]Api.js   # API клиент`

`│   │`

`│   └── [фича2]/`

`│       ├── backend/...`

`│       └── frontend/...`

`│`

`├── ui/                         # ЭКРАНЫ ИНТЕРФЕЙСА`

`│   ├── [экран1]/`

`│   │   ├── [Экран1]Page.vue    # Главный компонент`

`│   │   ├── components/         # Компоненты только для этого экрана`

`│   │   └── composables/        # Логика только для этого экрана`

`│   │`

`│   └── [экран2]/`

`│       ├── [Экран2]Page.vue`

`│       ├── components/...`

`│       └── composables/...`

`│`

`├── shared/                     # ОБЩИЙ ПЕРЕИСПОЛЬЗУЕМЫЙ КОД`

`├── store/                      # ГЛОБАЛЬНОЕ СОСТОЯНИЕ FRONTEND`

`├── core/                       # ОБЩИЕ ИНСТРУМЕНТЫ`

`├── config/                     # КОНФИГУРАЦИИ ОКРУЖЕНИЙ`

`├── tests/                      # ТЕСТИРОВАНИЕ`

`├── infrastructure/             # ИНФРАСТРУКТУРА И РАЗВЕРТЫВАНИЕ`

`├── requirements.txt            # ЗАВИСИМОСТИ ПРОЕКТА`

`└── main.py                     # Точка входа приложения`

## **Принципы взаимодействия**

1. **Экраны импортируют API фич:**

    javascript

*`// ui/dashboard/composables/dashboardLogic.js`*

`import digestApi from '@/features/digest/frontend/digestApi.js'`

`import analyticsApi from '@/features/analytics/frontend/analyticsApi.js'`

2.   
3. **Фичи не знают об экранах** \- полная изоляция

4. **Один экран может использовать много фич**

5. **Одна фича может использоваться многими экранами**

---

## **Компоненты приложения**

## **Понятие "Компонент"**

**Определение: Компонент \- это любая отдельная часть приложения, которая выполняет конкретную роль в общей архитектуре.**

**Типы компонентов в Feature-First архитектуре:**

* **Бизнес-логика (Фичи) \- решают конкретные бизнес-задачи**

* **Экраны интерфейса \- отображают данные пользователю**

* **Общие инструменты (Core) \- используются всеми остальными компонентами**

* **Конфигурации (Config) \- настройки для разных сред**

* **Тесты \- проверяют работу других компонентов**

* **Инфраструктура \- обеспечивают развертывание и мониторинг**

## **Полная структура проекта**

**text**

**`project/`**

**`├── features/                    # БИЗНЕС-ЛОГИКА (уже описано выше)`**

**`├── ui/                         # ЭКРАНЫ ИНТЕРФЕЙСА (уже описано выше)`**

**`├── shared/ 				# 🆕 ОБЩИЙ ПЕРЕИСПОЛЬЗУЕМЫЙ КОД`** 

**`├── store/ 				# 🆕 ГЛОБАЛЬНОЕ СОСТОЯНИЕ FRONTEND`**

**`├── core/                       # 🆕 ОБЩИЕ ИНСТРУМЕНТЫ`**

**`├── config/                     # 🆕 КОНФИГУРАЦИИ ОКРУЖЕНИЙ`**

**`├── tests/                      # 🆕 ТЕСТИРОВАНИЕ`**

**`├── infrastructure/             # 🆕 ИНФРАСТРУКТУРА И РАЗВЕРТЫВАНИЕ`**

**`├── requirements.txt            # 🆕 ЗАВИСИМОСТИ ПРОЕКТА (монолит)`**

**`└── main.py                     # Точка входа приложения`**

## **Core (Общие инструменты)**

**Определение: Код, который используют ВСЕ фичи, но сам не является фичей.**

**Принцип: Core знает "как работать" \- предоставляет общие инструменты, но не решает конкретные бизнес-задачи.**

**text**

**`core/`**

**`├── database/`**

**`│   ├── connection.py           # Подключение к БД`**

**`│   ├── migrations/             # Миграции схемы`**

**`│   └── base_repository.py      # Базовый класс для Repository`**

**`├── network/`**

**`│   ├── http_client.py          # Настроенный HTTP клиент`**

**`│   └── telegram_api.py         # Обертка над Telegram API`**

**`├── security/`**

**`│   ├── encryption.py           # Шифрование данных`**

**`│   └── jwt_handler.py          # Работа с JWT токенами`**

**`├── utils/`**

**`│   ├── date_helpers.py         # Работа с датами`**

**`│   └── text_processor.py       # Обработка текста`**

**`└── constants/`**

    **`├── error_codes.py          # Коды ошибок`**

    **`└── api_endpoints.py        # URL эндпоинтов`**

**Пример использования:**

**python**

***`# features/digest/backend/services.py`***

**`from core.network.telegram_api import TelegramAPI`**

**`from core.utils.text_processor import clean_text`**

**`class DigestService:`**

    **`def generate_digest(self, messages):`**

        **`cleaned_text = clean_text(messages)  # Используем Core`**

        **`# ... бизнес-логика дайджеста`**

## **Shared (Общий переиспользуемый код)**

**Определение:** Компоненты и модули, которые используются разными частями приложения (фичами, экранами), но сами не являются ни бизнес-логикой, ни конкретным экраном.

**Принцип:** Shared предоставляет **"готовые кирпичики"** \- переиспользуемые элементы и общие контракты данных для всего проекта.

text

`shared/`

`├── ui/                         # Общие UI-компоненты`

`│   ├── BaseButton.vue          # Стандартная кнопка`

`│   ├── InputField.vue          # Поле ввода`

`│   ├── ModalLayout.vue         # Модальное окно`

`│   └── LoadingSpinner.vue      # Индикатор загрузки`

`│`

`├── api/                        # Общие типы данных (DTOs)`

`│   ├── types.ts                # TypeScript интерфейсы`

`│   ├── schemas.py              # Pydantic схемы для Backend`

`│   └── contracts.ts            # API контракты`

`│`

`├── use-cases/                  # Переиспользуемые бизнес-сценарии UI`

`│   ├── loadDashboardData.js    # Загрузка данных для дашборда`

`│   ├── exportReport.js         # Экспорт отчетов`

`│   └── validateForm.js         # Валидация форм`

`│`

`└── utils/                      # Общие утилиты`

    `├── formatters.js           # Форматирование данных`

    `├── validators.js           # Валидация`

    `└── helpers.js              # Вспомогательные функции`

**Назначение подпапок:**

**`shared/ui/`** \- Переиспользуемые UI-компоненты без бизнес-логики. Решает проблему дублирования верстки.

**`shared/api/`** \- Общие типы данных для Frontend и Backend. Гарантирует согласованность структур данных.

**`shared/use-cases/`** \- Переиспользуемые сценарии получения данных для UI. Решает проблему дублирования логики между экранами.

**`shared/utils/`** \- Чистые функции-утилиты, не зависящие от других частей приложения.

**Пример использования:**

javascript

*`// shared/use-cases/loadDashboardData.js - ПЕРЕИСПОЛЬЗУЕМЫЙ СЦЕНАРИЙ`*

`import digestApi from '@/features/digest/frontend/digestApi.js'`

`import analyticsApi from '@/features/analytics/frontend/analyticsApi.js'`

`export function loadDashboardData() {`

  `const digest = digestApi.getSummary()`

  `const analytics = analyticsApi.getTodayStats()` 

  `return Promise.all([digest, analytics])`

`}`

*`// ui/dashboard/composables/dashboardLogic.js - ЛОГИКА ТОЛЬКО ДЛЯ DASHBOARD`*

`import { loadDashboardData } from '@/shared/use-cases/loadDashboardData.js'`

`export function useDashboardLogic() {`

  `const refreshInterval = 30000  // Специфично для Dashboard`


  `const autoRefresh = () => {`

    `setInterval(loadDashboardData, refreshInterval)`

  `}`


  `return { autoRefresh }`

`}`

**Ключевое правило:** Shared не может импортировать ничего из `features/`, `ui/` или `store/`. Это предотвращает циклические зависимости.

## **Управление папкой Shared: Предотвращение архитектурной эрозии**

**Проблема:** `shared/use-cases/` имеет тенденцию превращаться в скрытую папку `features/`, нарушая принципы изоляции.

**Решение: Обновленная структура Shared**

text

`shared/`

`├── infrastructure/         # Уровень 1: ТЕХНИЧЕСКАЯ ИНФРАСТРУКТУРА`

`│   ├── formatters.js      # Чистые функции без бизнес-логики`

`│   ├── validators.js      # Валидация форматов данных`

`│   └── http-client.js     # HTTP утилиты`

`│`

`├── contracts/             # Уровень 2: КОНТРАКТЫ ДАННЫХ`  

`│   ├── types.ts           # TypeScript интерфейсы`

`│   ├── schemas.py         # Pydantic схемы`

`│   └── api-contracts.ts   # API контракты`

`│`

`├── ui-kit/               # Уровень 3: UI КОМПОНЕНТЫ`

`│   ├── BaseButton.vue     # Презентационные компоненты`

`│   ├── InputField.vue     # Без бизнес-логики`

`│   └── ModalLayout.vue    # Чистый UI`

`│`

`└── orchestrators/        # Уровень 4: ОРКЕСТРАЦИЯ (СТРОГО КОНТРОЛИРУЕТСЯ)`

    `├── loadDashboard.js   # Простая оркестрация API вызовов`

    `└── exportData.js      # Координация без логики`

**Железные правила для `orchestrators/`:**

javascript

*`// ✅ РАЗРЕШЕНО - простая оркестрация`*

`export async function loadDashboard() {`

  `const digest = await digestApi.getSummary()      // Вызов API`

  `const analytics = await analyticsApi.getStats()  // Вызов API`

  `return { digest, analytics }                     // Простое объединение`

`}`

*`// ❌ ЗАПРЕЩЕНО - бизнес-логика`*

`export async function loadDashboard() {`

  `const digest = await digestApi.getSummary()`


  `// НЕДОПУСТИМО! Это бизнес-логика фичи`

  `if (digest.priority === 'high') {`

    `await notificationApi.sendAlert(digest.content)`

  `}`


  `return digest`

`}`

**Автоматический контроль качества:**

python

*`# tools/check-shared-rules.py`*

`import ast`

`def check_orchestrator_complexity(file_path):`

    `"""Проверяет сложность файлов в shared/orchestrators/"""`

    `with open(file_path, 'r') as f:`

        `tree = ast.parse(f.read())`

    

    `for node in ast.walk(tree):`

        `# Запрещены условные конструкции в orchestrators`

        `if isinstance(node, (ast.If, ast.For, ast.While)):`

            `return False, f"Бизнес-логика обнаружена в {file_path}"`

            

        `# Разрешены только простые вызовы функций и возврат данных`

        `if isinstance(node, ast.FunctionDef):`

            `if len(node.body) > 5:  # Максимум 5 строк в функции`

                `return False, f"Слишком сложная функция в {file_path}"`

    

    `return True, "OK"`

## **Store (Глобальное состояние Frontend)**

**Определение:** Централизованное хранилище данных для всего Frontend-приложения. Решает проблему передачи данных между компонентами, которые не связаны напрямую.

**Принцип:** Store знает **"текущее состояние всего приложения"**. Любой компонент может как читать эти данные, так и изменять их через предопределенные действия (actions).

**Структура:**

text

`store/`

`├── userStore.js        # Данные о текущем пользователе`

`├── contextStore.js     # Какой чат/канал сейчас выбран`

`├── settingsStore.js    # Глобальные настройки UI`

`└── notificationStore.js # Системные уведомления`

**Зачем нужно:** Избавляет от необходимости "прокидывать" данные через цепочку компонентов. Когда пользователь в Header переключает чат, contextStore обновляется. Любой виджет на Dashboard, который подписан на этот стор, автоматически и реактивно обновит свое содержимое для нового чата.

**Примеры использования:**

javascript

*`// store/contextStore.js - ОПРЕДЕЛЕНИЕ СТОРА`*

`import { defineStore } from 'pinia'`

`export const useContextStore = defineStore('context', {`

  `state: () => ({`

    `selectedChat: null,`

    `selectedChannel: null,`

    `activeUsers: []`

  `}),`


  `actions: {`

    `setSelectedChat(chatId) {`

      `this.selectedChat = chatId`

      `// Автоматически обновляем связанные данные`

      `this.loadActiveUsers(chatId)`

    `},`

    

    `setSelectedChannel(channelId) {`

      `this.selectedChannel = channelId`

    `},`

    

    `async loadActiveUsers(chatId) {`

      `// Загружаем активных пользователей для выбранного чата`

      ``const users = await fetch(`/api/chats/${chatId}/active-users`)``

      `this.activeUsers = await users.json()`

    `}`

  `}`

`})`

*`// store/userStore.js - СТОР ПОЛЬЗОВАТЕЛЯ`*

`import { defineStore } from 'pinia'`

`export const useUserStore = defineStore('user', {`

  `state: () => ({`

    `currentUser: null,`

    `permissions: [],`

    `preferences: {`

      `theme: 'light',`

      `language: 'ru'`

    `}`

  `}),`


  `actions: {`

    `setUser(userData) {`

      `this.currentUser = userData`

      `this.permissions = userData.permissions || []`

    `},`

    

    `updatePreferences(newPrefs) {`

      `this.preferences = { ...this.preferences, ...newPrefs }`

    `}`

  `}`

`})`

javascript

*`// ui/dashboard/DashboardPage.vue - ИСПОЛЬЗОВАНИЕ В КОМПОНЕНТЕ`*

`import { useContextStore } from '@/store/contextStore.js'`

`import { useUserStore } from '@/store/userStore.js'`

`export default {`

  `setup() {`

    `const contextStore = useContextStore()`

    `const userStore = useUserStore()`

    

    `// Читаем текущий чат`

    `const currentChat = contextStore.selectedChat`

    `const currentUser = userStore.currentUser`

    

    `// Изменяем выбранный чат`

    `const selectChat = (chatId) => {`

      `contextStore.setSelectedChat(chatId)`

      `// Все компоненты, подписанные на store, обновятся автоматически`

    `}`

    

    `return {` 

      `currentChat,` 

      `currentUser,`

      `selectChat,`

      `activeUsers: contextStore.activeUsers`

    `}`

  `}`

`}`

*`// ui/header/ChatSelector.vue - ДРУГОЙ КОМПОНЕНТ ТОЖЕ ИСПОЛЬЗУЕТ`*

`import { useContextStore } from '@/store/contextStore.js'`

`export default {`

  `setup() {`

    `const contextStore = useContextStore()`

    

    `const onChatChange = (newChatId) => {`

      `contextStore.setSelectedChat(newChatId)`

      `// DashboardPage автоматически получит это изменение!`

    `}`

    

    `return {` 

      `selectedChat: contextStore.selectedChat,`

      `onChatChange` 

    `}`

  `}`

`}`

*`// ui/analytics/AnalyticsPage.vue - ТРЕТИЙ КОМПОНЕНТ ИСПОЛЬЗУЕТ ТОТ ЖЕ СТОР`*

`import { useContextStore } from '@/store/contextStore.js'`

`export default {`

  `setup() {`

    `const contextStore = useContextStore()`

    

    `// Автоматически получаем выбранный чат`

    `const currentChatId = contextStore.selectedChat`

    

    `// Загружаем аналитику для текущего чата`

    `watch(() => contextStore.selectedChat, (newChatId) => {`

      `if (newChatId) {`

        `loadAnalyticsForChat(newChatId)`

      `}`

    `})`

    

    `return { currentChatId }`

  `}`

`}`

**Преимущества Store:**

* **Реактивность** \- изменения автоматически отражаются во всех подписанных компонентах

* **Централизация** \- одно место для глобального состояния

* **Отладка** \- легко отследить изменения состояния через DevTools

* **Типизация** \- полная поддержка TypeScript

**Альтернативы по технологиям:**

* **Vue.js** \- Pinia (рекомендуется) или Vuex

* **React** \- Redux, Zustand, или Context API

* **Angular** \- NgRx или обычные сервисы


## **Config (Конфигурации окружений)**

**Определение: Настройки приложения для разных сред: разработка, тестирование, продакшн.**

**Принцип: Config знает "где работать" \- содержит параметры для каждого окружения.**

**text**

**`config/`**

**`├── dev/`**

**`│   ├── database.yaml           # Настройки БД для разработки`**

**`│   ├── services.yaml           # URL сервисов для dev`**

**`│   └── logging.yaml            # Уровни логирования`**

**`├── staging/`**

**`│   └── ...                     # Настройки для тестирования`**

**`├── prod/`**

**`│   └── ...                     # Настройки для продакшна`**

**`├── .env.dev                    # Переменные для разработки`**

**`├── .env.staging                # Переменные для тестирования`**  

**`└── .env.prod                   # Продакшн переменные (секретные)`**

## **Tests (Тестирование)**

**Определение: Компоненты для проверки работы всех частей приложения.**

**Принцип: Tests знают "работает ли" \- проверяют корректность других компонентов.**

**text**

**`tests/`**

**`├── unit/                       # Тесты отдельных функций`**

**`│   ├── features/`**

**`│   │   ├── test_digest.py      # Тесты бизнес-логики digest`**

**`│   │   └── test_analytics.py   # Тесты бизнес-логики analytics`**

**`│   └── core/`**

**`│       └── test_utils.py       # Тесты общих инструментов`**

**`├── integration/                # Тесты взаимодействия компонентов`**  

**`│   ├── test_api_endpoints.py   # Тесты API между фичами`**

**`│   └── test_database.py        # Тесты работы с БД`**

**`└── e2e/                        # Сквозные тесты`**

    **`└── test_user_journey.py    # Полный путь пользователя`**

## **Infrastructure (Инфраструктура)**

**Определение: Компоненты для развертывания, мониторинга и поддержки приложения.**

**Принцип: Infrastructure знает "как запустить" \- обеспечивает работу в различных окружениях.**

**text**

**`infrastructure/`**

**`├── docker/`**

**`│   ├── Dockerfile              # Сборка образа приложения`**

**`│   ├── docker-compose.yml      # Запуск всех сервисов`**

**`│   └── nginx/`**

**`├── ci/`**

**`│   └── .github/workflows/      # Автоматические тесты и деплой`**

**`└── monitoring/`**

    **`├── prometheus/             # Сбор метрик`**

    **`└── grafana/               # Графики мониторинга`**

## **Управление зависимостями**

## **Package Dependencies (Зависимости пакетов)**

**Определение: Внешние библиотеки и их версии, которые использует проект.**

**Зачем нужно: Четко фиксировать версии всех библиотек, чтобы проект одинаково работал у всех разработчиков и на всех серверах.**

## **Для монолита:**

**text**

**`project/`**

**`├── requirements.txt            # ВСЕ зависимости в одном файле`**

**`├── features/`**

**`├── ui/`**

**`└── core/`**

**Пример requirements.txt:**

**text**

**`# requirements.txt`**

**`fastapi==0.104.1        # Web фреймворк`**

**`aiogram==3.2.0          # Telegram бот`**

**`sqlalchemy==2.0.23      # База данных`**

**`pandas==2.1.3           # Аналитика`**

**`redis==5.0.1            # Кеширование`**

**`pytest==7.4.3          # Тестирование`**

## **Для микросервисов:**

**text**

**`project/`**

**`├── services/`**

**`│   ├── core-api/`**

**`│   │   ├── requirements.txt    # Только для Core API`**

**`│   │   └── features/`**

**`│   ├── analytics-engine/`**

**`│   │   ├── requirements.txt    # Только для Analytics`**

**`│   │   └── features/`**

**`│   └── ai-content/`**

**`│       ├── requirements.txt    # Только для AI`**

**`│       └── features/`**

**`└── docker-compose.yml`**

## **Dependency Injection (Внедрение зависимостей)**

**Определение: Способ организации кода, при котором компоненты получают нужные им объекты извне, а не создают их самостоятельно.**

**Зачем появилось: По мере усложнения архитектуры у нас появилось множество компонентов (фичи, core инструменты, сервисы), которые зависят друг от друга. Без централизованного управления этими связями код становится сложно тестировать и поддерживать.**

**Проблема без Dependency Injection:**

**python**

***`# features/digest/backend/services.py - ПЛОХО`***

**`class DigestService:`**

    **`def __init__(self):`**

        **`self.db = DatabaseConnection()      # Жестко привязан к конкретной БД`**

        **`self.ai_client = OpenAIClient()     # Жестко привязан к OpenAI`**

        **`# Сложно тестировать, сложно менять`**

**Решение с Dependency Injection:**

**python**

***`# core/di_container.py - Центральное место для всех зависимостей`***

**`class ApplicationContainer:`**

    **`def __init__(self):`**

        **`# Создаем базовые сервисы`**

        **`self.database = DatabaseConnection(url=config.database_url)`**

        **`self.ai_client = OpenAIClient(api_key=config.openai_key)`**

        

        **`# Создаем бизнес-сервисы и "впрыскиваем" им зависимости`**

        **`self.digest_service = DigestService(`**

            **`db=self.database,           # Внедряем БД`**

            **`ai_client=self.ai_client    # Внедряем AI клиент`**

        **`)`**

***`# features/digest/backend/services.py - ХОРОШО`***  

**`class DigestService:`**

    **`def __init__(self, db, ai_client):  # Получаем зависимости извне`**

        **`self.db = db`**

        **`self.ai_client = ai_client`**

        **`# Легко тестировать с mock-объектами`**

**Почему не в Core: Core содержит общие инструменты, а DI Container управляет тем, как эти инструменты связаны с конкретными фичами. Это разные ответственности \- создание vs связывание.**

## **Правила работы компонентов**

## **Правила импортов: Полный свод**

Это исчерпывающий список правил, который должен соблюдаться неукоснительно для поддержания чистоты архитектуры.

## **`features/` (Бизнес-логика)**

**МОЖЕТ ✅:**

* Импортировать из `core/` (база данных, шина событий, утилиты)

* Импортировать из `shared/api/` (общие типы данных)

* Импортировать из `shared/utils/` (чистые функции)

* Импортировать из `config/` (конфигурации)

**НЕ МОЖЕТ ❌:**

* Импортировать из другой фичи напрямую \- для этого используется Событийная шина

* Импортировать из `ui/` или `store/`

* Импортировать из `shared/ui/` (UI-компоненты не нужны бэкенду)

* Импортировать из `shared/use-cases/` (это для UI)

## **`ui/` (Экраны интерфейса)**

**МОЖЕТ ✅:**

* Импортировать из `features/[фича]/frontend/` (API-клиенты фич)

* Импортировать из `shared/` (все подпапки: ui, api, use-cases, utils)

* Импортировать из `store/` (глобальное состояние)

* Импортировать из `core/constants/` (только константы)

* Импортировать из `config/` (конфигурации)

**НЕ МОЖЕТ ❌:**

* Импортировать из `features/[фича]/backend/` (бэкенд недоступен фронтенду)

* Импортировать из другого UI экрана (общая логика выносится в `shared/use-cases/`)

* Импортировать из `core/database/`, `core/security/` (это для бэкенда)

## **`shared/` (Общий переиспользуемый код)**

**МОЖЕТ ✅:**

* Импортировать из `core/constants/` (только базовые константы)

* Импортировать из `config/` (конфигурации)

**НЕ МОЖЕТ ❌:**

* Импортировать из `features/`, `ui/`, `store/` \- **КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО\!**

* `shared/` \- это фундамент, он не зависит от того, что на нем построено

* Это предотвращает циклические зависимости

## **`store/` (Глобальное состояние Frontend)**

**МОЖЕТ ✅:**

* Импортировать из `features/[фича]/frontend/` (API-клиенты для получения данных)

* Импортировать из `shared/api/` (типы данных для типизации)

* Импортировать из `shared/utils/` (утилиты для обработки данных)

* Импортировать из `config/` (конфигурации)

**НЕ МОЖЕТ ❌:**

* Импортировать из `ui/` (стор не должен знать об экранах)

* Импортировать из `shared/ui/` (UI-компоненты в сторе не нужны)

* Импортировать из другого стора (избегаем связанности сторов)

## **`core/` (Общие инструменты)**

**МОЖЕТ ✅:**

* Импортировать из `config/` (конфигурации)

**НЕ МОЖЕТ ❌:**

* Импортировать что-либо из других слоев (`features/`, `ui/`, `shared/`, `store/`)

* Core \- это самый низкий уровень, максимальная независимость

## **`config/` (Конфигурации)**

**НЕ МОЖЕТ ❌:**

* Импортировать что-либо из других слоев

* Конфигурации должны быть полностью автономными

## **`tests/` (Тестирование)**

**МОЖЕТ ✅:**

* Импортировать из любых слоев для тестирования

* Это единственный компонент с особыми правилами импорта

## **`infrastructure/` (Инфраструктура)**

**МОЖЕТ ✅:**

* Импортировать из `config/` (для настройки развертывания)

**НЕ МОЖЕТ ❌:**

* Импортировать из бизнес-слоев (`features/`, `ui/`, `shared/`, `store/`, `core/`)

---

### **Приложение 1: Внутренняя организация сложной фичи (Intra-Feature Design)**

#### **Проблема: Разрастание файла services.py**

По мере развития фичи, файл backend/services.py может стать "файлом-монстром". Например, представим, что наша фича digest должна научиться собирать сообщения не только из Telegram, но и из Slack, Discord и почты. Если всю эту логику поместить в один файл, он станет огромным и неподдерживаемым.

❌ **ПЛОХОЙ ПОДХОД (ОДИН ФАЙЛ-МОНСТР)**

Plaintext

features/

└── digest/

    └── backend/

        └── services.py \# \<-- Файл на 2000+ строк, где смешана логика для Telegram, Slack, Discord...

Python

\# features/digest/backend/services.py (Фрагмент "монстра")

class DigestService:

    def generate\_digest\_from\_telegram(self, channel\_id):

        \# ... 150 строк сложной логики для Telegram API ...

        pass

    def \_connect\_to\_telegram\_bot(self):

        \# ... детали подключения ...

        pass

    def generate\_digest\_from\_slack(self, channel\_name):

        \# ... еще 200 строк совершенно другой логики для Slack API ...

        pass

    def \_authenticate\_in\_slack(self):

        \# ... детали аутентификации в Slack ...

        pass

    def generate\_digest\_from\_discord(self, server\_id):

        \# ... еще 180 строк для Discord ...

        pass

    \# И так далее... Файл превращается в кашу.

---

#### **Решение: Паттерн "Фасад и Специалисты"**

Чтобы избежать этого, мы применяем паттерн "Фасад". Логика разделяется на два типа файлов:

1. **Фасад (services.py):** Единственная точка входа в фичу. Он не выполняет сложную работу сам, а определяет, какому "специалисту" её поручить.  
2. **Специалисты (providers/, parsers/ и т.д.):** Набор сфокусированных модулей, каждый из которых решает одну конкретную подзадачу (например, работа с одним API).

✅ **ХОРОШИЙ ПОДХОД (ФАСАД И СПЕЦИАЛИСТЫ)**

**Новая структура папок:**

Plaintext

features/

└── digest/

    └── backend/

        ├── providers/                  \# \<-- Папка для "специалистов" по сбору данных

        │   ├── \_\_init\_\_.py

        │   ├── base\_provider.py        \# \<- Общий интерфейс для всех

        │   ├── telegram\_provider.py    \# \<- Логика ТОЛЬКО для Telegram

        │   ├── slack\_provider.py       \# \<- Логика ТОЛЬКО для Slack

        │   └── discord\_provider.py     \# \<- Логика ТОЛЬКО для Discord

        │

        └── services.py                 \# \<-- Тонкий и чистый "фасад"

**Код "Фасада":**

Python

\# features/digest/backend/services.py

\# Фасад импортирует своих "специалистов"

from .providers.telegram\_provider import TelegramProvider

from .providers.slack\_provider import SlackProvider

from .providers.discord\_provider import DiscordProvider

class DigestService:

    """

    Этот сервис является "фасадом". Он предоставляет простой метод

    и скрывает сложную логику выбора нужного провайдера.

    """

    def \_\_init\_\_(self):

        self.\_providers \= {

            "telegram": TelegramProvider(),

            "slack": SlackProvider(),

            "discord": DiscordProvider(),

        }

    def generate\_digest(self, source\_type: str, source\_id: str) \-\> str:

        """

        Единственный публичный метод. Принимает тип источника и его ID.

        """

        if source\_type not in self.\_providers:

            raise ValueError(f"Источник '{source\_type}' не поддерживается.")

        

        \# 1\. Находим нужного специалиста

        provider \= self.\_providers\[source\_type\]

        

        \# 2\. Получаем от него сообщения (делегируем работу)

        messages \= provider.fetch\_messages(source\_id)

        

        \# 3\. Выполняем общую для всех логику (например, очистку текста)

        cleaned\_text \= self.\_clean\_messages(messages)

        

        \# ... остальная логика генерации дайджеста ...

        return "Ваш дайджест готов"

    def \_clean\_messages(self, messages: list) \-\> str:

        \# ... общая логика, которая не зависит от источника ...

        return " ".join(messages)

**Код "Специалиста":**

Python

\# features/digest/backend/providers/telegram\_provider.py

from .base\_provider import BaseProvider

class TelegramProvider(BaseProvider):

    """

    Этот класс \- "специалист". Он знает всё о том, как работать

    с Telegram, и ничего о других источниках.

    """

    def fetch\_messages(self, channel\_id: str) \-\> list\[str\]:

        self.\_connect()

        print(f"Собираю сообщения из Telegram-канала {channel\_id}...")

        \# ... 150 строк сложной логики ТОЛЬКО для Telegram API ...

        return \["Сообщение 1", "Сообщение 2"\]

    def \_connect(self):

        \# ... детали подключения к Telegram ...

        pass

---

### **Железные правила этого подхода:**

1. **Публичный Фасад:** Любой внешний код (например, shared/orchestrators/) может импортировать и вызывать **только** DigestService из services.py.  
2. **Приватные Специалисты:** Никто за пределами фичи digest **никогда** не должен импортировать классы напрямую из папки providers/. Это внутренняя кухня фичи.  
3. **Однонаправленный Поток:** Фасад (DigestService) вызывает специалистов (TelegramProvider). Специалисты **никогда** не должны вызывать или импортировать фасад.

## **Схема зависимостей**

text

`┌─────────────────────────────────────────────┐`

`│                   tests/                    │ ← Может импортировать всё`

`├─────────────────────────────────────────────┤`

`│     ui/          features/       store/     │`

`│      ↓               ↓             ↓        │`

`│           shared/  ←─────────────────       │`

`│              ↓                              │`

`│            core/                            │`

`│              ↓                              │`

`│           config/                           │`

`│              ↓                              │`

`│       infrastructure/                       │`

`└─────────────────────────────────────────────┘`

**Правило:** Компоненты могут импортировать только то, что находится **ниже** них в иерархии или на том же уровне (в случае `ui/`, `features/`, `store/`).

## **Обоснование правил**

* **Предотвращение циклических зависимостей** \- четкая иерархия исключает взаимное импортирование

* **Масштабируемость** \- легко понять, что от чего зависит

* **Тестируемость** \- можно тестировать слои изолированно

* **Переиспользование** \- нижние слои могут использоваться верхними без ограничений

## **Система управления исключениями архитектуры**

**Принцип:** Правила должны помогать, а не блокировать разработку. Предусматриваем контролируемые исключения с техническим долгом.

## **Процедура создания исключения**

text

`# architectural-exceptions.yaml - РЕЕСТР ИСКЛЮЧЕНИЙ`

`exceptions:`

  `- id: "EXC-001"`

    `date: "2025-09-07"`

    `author: "@john-doe"`  

    `type: "import_violation"`

    `description: "features/payments импортирует features/users/models напрямую"`

    `justification: "Критический hotfix для обработки платежей, рефакторинг через Event Bus займёт 3 дня"`

    `deadline: "2025-09-21"  # Обязательная дата устранения`

    `tracking_issue: "ISSUE-1234"`

    `approved_by: "@tech-lead"`

    

  `- id: "EXC-002"` 

    `date: "2025-09-08"`

    `type: "shared_complexity"`

    `description: "shared/orchestrators/complexPaymentFlow.js содержит бизнес-логику"`

    `justification: "Временное решение для интеграции с внешней платёжной системой"`

    `deadline: "2025-10-01"`

    `tracking_issue: "ISSUE-1245"`

    `approved_by: "@architecture-council"`

## **Автоматический контроль исключений**

python

*`# tools/architecture-guard.py`*

`import yaml`

`from datetime import datetime, date`

`def check_exceptions():`

    `"""Проверяет актуальность исключений"""`

    `with open('architectural-exceptions.yaml', 'r') as f:`

        `data = yaml.safe_load(f)`

    

    `expired = []`

    `for exc in data['exceptions']:`

        `deadline = datetime.strptime(exc['deadline'], '%Y-%m-%d').date()`

        `if date.today() > deadline:`

            `expired.append(exc['id'])`

    

    `if expired:`

        `raise Exception(f"ПРОСРОЧЕННЫЕ ИСКЛЮЧЕНИЯ: {expired}. Устраните технический долг!")`

        

    `return True`

*`# В CI/CD пайплайне`*

`if __name__ == "__main__":`

    `check_exceptions()`

    `print("✅ Архитектурные правила соблюдены")`

## **Шаблон временного нарушения**

python

*`# features/payments/backend/services.py`*

*`# ARCHITECTURAL_EXCEPTION: EXC-001`*

*`# DEADLINE: 2025-09-21`*  

*`# TODO: Заменить на Event Bus после реализации ISSUE-1234`*

`from features.users.backend.models import User  # ВРЕМЕННОЕ НАРУШЕНИЕ`

`class PaymentService:`

    `def process_emergency_payment(self, user_id: int):`

        `# Временная прямая связь для hotfix`

        `user = User.query.get(user_id)  # БУДЕТ УСТРАНЕНО`

        `# ... критическая логика платежей`

## **Управление процессом исключений**

**Architecture Council:**

text

`# governance-council.yaml`

`council:`

  `members:`

    `- role: "tech_lead"`

      `weight: 2`

      `required: true`

    `- role: "senior_dev_1"` 

      `weight: 1`

      `required: false`

    `- role: "senior_dev_2"`

      `weight: 1`  

      `required: false`

`approval_rules:`

  `minor_exceptions:    # Временные нарушения <2 недель`

    `required_votes: 2`

    `can_approve: ["tech_lead", "senior_dev_1", "senior_dev_2"]`

    

  `major_exceptions:    # Нарушения >2 недель или архитектурные изменения`

    `required_votes: 3`

    `required_members: ["tech_lead"]`

    

  `emergency_exceptions: # Hotfixes`

    `required_votes: 1`

    `can_approve: ["tech_lead"]`

    `auto_expire: 48h    # Автоматически истекает`

**Процесс принятия решений:**

1. **Автоматическая категоризация** исключения по сложности

2. **Параллельное голосование** \- не ждем всех, достаточно нужного кворума

3. **Временные рамки** \- если нет ответа за 24ч, автоматическое одобрение minor exceptions

**Транспарентность** \- все решения в общем Slack канале

## **Управление данными в монолите: Доменные модели и транзакции**

**Проблема:** Как фичи работают с общими моделями и обеспечивают транзакционную целостность в рамках единого монолита?

**Решение: Трёхслойная модель данных**

## **Слой 1: Общие доменные сущности (Core Domain)**

python

*`# core/domain/entities.py - ОБЩИЕ СУЩНОСТИ`*

`from dataclasses import dataclass`

`from typing import Optional`

`from datetime import datetime`

`@dataclass`

`class User:`

    `"""Общая сущность User для всего приложения"""`

    `id: int`

    `telegram_id: str`

    `username: Optional[str]`

    `created_at: datetime`

    `is_active: bool`

    

    `# Методы работы только с собственным состоянием`

    `def deactivate(self):`

        `self.is_active = False`

        

    `def update_username(self, new_username: str):`

        `self.username = new_username`

`@dataclass`  

`class Chat:`

    `"""Общая сущность Chat"""`

    `id: int`

    `telegram_chat_id: str`

    `title: str`

    `chat_type: str`

    `created_at: datetime`

## **Слой 2: Фича-специфичные модели (Feature Models)**

python

*`# features/subscription/backend/models.py - МОДЕЛИ ФИЧИ`*

`from dataclasses import dataclass`

`from datetime import datetime, timedelta`

`@dataclass`

`class UserSubscription:`

    `"""Модель подписки - принадлежит фиче subscription"""`

    `user_id: int          # Ссылка на core.User.id`

    `plan_type: str`

    `expires_at: datetime`

    `is_active: bool`

    

    `def extend_subscription(self, days: int):`

        `self.expires_at += timedelta(days=days)`

*`# features/analytics/backend/models.py - МОДЕЛИ АНАЛИТИКИ`*

`@dataclass`

`class UserActivity:`

    `"""Модель активности - принадлежит фиче analytics"""`

    `user_id: int          # Ссылка на core.User.id`  

    `action_type: str`

    `timestamp: datetime`

    `metadata: dict`

## **Слой 3: Управление транзакциями через Unit of Work**

python

*`# core/database/unit_of_work.py - УПРАВЛЕНИЕ ТРАНЗАКЦИЯМИ`*

`from contextlib import contextmanager`

`from sqlalchemy.orm import sessionmaker`

`from core.event_bus import event_bus`

`class UnitOfWork:`

    `def __init__(self):`

        `self.session = None`

        `self.events = []`

        

    `def __enter__(self):`

        `self.session = SessionLocal()`

        `return self`

        

    `def __exit__(self, exc_type, exc_val, exc_tb):`

        `if exc_type is None:`

            `self.commit()`

        `else:`

            `self.rollback()`

            

    `def commit(self):`

        `"""Атомарная операция: сохранение + события"""`

        `try:`

            `self.session.commit()`

            `# События отправляются ТОЛЬКО после успешного commit`

            `for event in self.events:`

                `event_bus.publish(event)`

        `except Exception:`

            `self.rollback()`

            `raise`

            

    `def rollback(self):`

        `self.session.rollback()`

        `self.events.clear()`

        

    `def add_event(self, event):`

        `"""Добавить событие для отправки после commit"""`

        `self.events.append(event)`

*`# Использование в фичах`*

`def create_user_with_subscription(user_data, plan_type):`

    `with UnitOfWork() as uow:`

        `# 1. Создаём пользователя (общая сущность)`

        `user = User(**user_data)`

        `uow.session.add(user)`

        `uow.session.flush()  # Получаем ID без commit`

        

        `# 2. Создаём подписку (фича-специфичная модель)`

        `subscription = UserSubscription(`

            `user_id=user.id,`

            `plan_type=plan_type,`

            `expires_at=datetime.now() + timedelta(days=30)`

        `)`

        `uow.session.add(subscription)`

        

        `# 3. Добавляем событие (будет отправлено после commit)`

        `uow.add_event(UserCreatedEvent(user_id=user.id, plan=plan_type))`

        

        `# 4. Атомарный commit всех изменений + события`

        `return user.id`

**Правила работы с данными:**

* **Общие сущности** живут в `core/domain/`

* **Фича-модели** ссылаются на общие по ID, но не импортируют их классы

* **Транзакции** всегда через Unit of Work

* **События** отправляются только после успешного commit

## **Взаимодействие фич через Event Bus**

**Принцип работы:**

1. **Фича-источник** публикует событие в общую "шину", не зная, кто его будет обрабатывать

2. **Фичи-слушатели** подписываются на интересующие события

3. **Event Bus** автоматически доставляет события всем подписчикам

**Структура событийной системы:**

text

`core/`

`├── event_bus.py               # Реализация шины событий`

`└── events/                    # Базовые классы событий`

    `└── base_event.py          # Базовый класс для всех событий`

`features/[фича]/backend/`

`├── events.py                  # События, которые публикует фича`

`└── handlers.py               # Обработчики событий других фич`

**Пример реализации:**

python

*`# core/event_bus.py - РЕАЛИЗАЦИЯ ШИНЫ`*

`class EventBus:`

    `def __init__(self):`

        `self.handlers = {}`

    

    `def subscribe(self, event_type, handler):`

        `if event_type not in self.handlers:`

            `self.handlers[event_type] = []`

        `self.handlers[event_type].append(handler)`

    

    `def publish(self, event):`

        `event_type = type(event)`

        `if event_type in self.handlers:`

            `for handler in self.handlers[event_type]:`

                `handler(event)`

*`# Глобальный экземпляр шины`*

`event_bus = EventBus()`

*`# features/payments/backend/events.py - ОПРЕДЕЛЕНИЕ СОБЫТИЯ`*

`from dataclasses import dataclass`

`from datetime import datetime`

`@dataclass`

`class PaymentCompletedEvent:`

    `user_id: int`

    `amount: float`

    `payment_id: str`

    `timestamp: datetime`

*`# features/payments/backend/services.py - ПУБЛИКАЦИЯ СОБЫТИЯ`*  

`from core.event_bus import event_bus`

`from .events import PaymentCompletedEvent`

`class PaymentService:`

    `def process_payment(self, amount, user_id):`

        `# ... логика обработки платежа ...`

        

        `# Публикуем событие - не знаем, кто его обработает`

        `event = PaymentCompletedEvent(`

            `user_id=user_id,` 

            `amount=amount,`

            `payment_id="pay_123",`

            `timestamp=datetime.now()`

        `)`

        `event_bus.publish(event)`

*`# features/subscriptions/backend/handlers.py - ОБРАБОТКА СОБЫТИЯ`*

`from features.payments.backend.events import PaymentCompletedEvent`

`def handle_payment_completed(event: PaymentCompletedEvent):`

    `print(f"Продлеваем подписку для пользователя {event.user_id}")`

    `# ... логика продления подписки ...`

*`# main.py - РЕГИСТРАЦИЯ ОБРАБОТЧИКОВ ПРИ СТАРТЕ`*

`from core.event_bus import event_bus`

`from features.subscriptions.backend.handlers import handle_payment_completed`

`from features.payments.backend.events import PaymentCompletedEvent`

`def setup_event_handlers():`

    `event_bus.subscribe(PaymentCompletedEvent, handle_payment_completed)`

`def main():`

    `setup_event_handlers()`

    `# ... остальная логика запуска ...`

**Преимущества Event Bus:**

* **Полная изоляция фич** \- `payments` ничего не знает о `subscriptions`

* **Легкое расширение** \- можно добавить любое количество новых фич, слушающих события

* **Тестируемость** \- легко мокать события в тестах

* **Масштабируемость** \- при переходе к микросервисам Event Bus заменяется на внешнюю очередь (RabbitMQ, Kafka)

## **Правила тестирования:**

* **Unit тесты \- проверяют отдельные компоненты изолированно**

* **Integration тесты \- проверяют взаимодействие компонентов**

* **E2E тесты \- проверяют полные пользовательские сценарии**

---

# **Монолит vs Микросервисы: Принципы принятия решений**

## **Основные понятия**

## **Микросервис в контексте Feature-First**

**Определение:** Отдельно развернутый сервис, содержащий одну или несколько связанных фич, работающий в изолированном Docker-контейнере.

## **Docker-контейнер**

**Определение:** Изолированное пространство выполнения с собственной памятью, процессорным временем и файловой системой.

**Важно:** Каждый микросервис \= отдельный контейнер \= изолированные ресурсы.

## **Когда выделять фичи в микросервисы**

## **Критерии нагрузки (основные показания)**

Фичу нужно выделить в отдельный микросервис, если она создает высокую нагрузку на:

## **🔥 Процессор (CPU)**

* **Обработка нейросетями** (анализ текста, генерация контента)

* **Сложные вычисления** (аналитика больших объемов данных)

* **Криптография** (шифрование, хеширование)

## **🧠 Оперативная память (RAM)**

* **Кеширование больших объемов** (пользовательские сессии, временные данные)

* **Обработка файлов** (изображения, видео, документы)

* **Агрегация данных** (построение отчетов по миллионам записей)

## **💾 Дисковая подсистема (I/O)**

* **Работа с файлами** (загрузка, обработка, архивирование)

* **Частые записи в БД** (логирование, аудит)

* **Резервное копирование**

## **🌐 Сеть (Network)**

* **Интеграции с внешними API** (платежные системы, соцсети)

* **Рассылки** (email, push-уведомления, массовые сообщения)

* **Стриминг данных** (real-time обновления)

## **Критерии изоляции (дополнительные показания)**

## **🔒 Безопасность**

* **Обработка платежей** \- изоляция PCI DSS требований

* **Персональные данные** \- соответствие GDPR

* **Авторизация/аутентификация** \- критически важная безопасность

## **👥 Командная разработка**

* **Разные команды** работают над фичами независимо

* **Разные циклы релизов** (одна фича обновляется чаще)

* **Разные технологии** (Python для ML, Go для высокой нагрузки)

## **Принципы группировки фич в микросервисы**

## **✅ Группируйте фичи вместе если:**

1. **Общие данные** \- работают с одними таблицами БД

2. **Частое взаимодействие** \- постоянно вызывают друг друга

3. **Одинаковая нагрузка** \- похожие требования к ресурсам

4. **Логическая связь** \- решают одну большую задачу

## **❌ Разделяйте фичи если:**

1. **Разная нагрузка** \- одна "тяжелая", другая "легкая"

2. **Независимость** \- могут работать без друг друга

3. **Разные требования** \- к безопасности, производительности

4. **Разные команды** \- разрабатывают независимо

## **Практический пример: Telegram-бот проект**

## **Наши фичи (\~36 штук):**

* `digest` \- генерация дайджестов

* `user_analytics` \- анализ активности

* `subscription_tracking` \- отслеживание подписок

* `chat_mode` \- режим работы чата

* `poll_creation` \- создание опросов

* `ab_testing` \- A/B тестирование

* `lead_magnets` \- лид-магниты

* `anti_spam` \- модерация контента

* `payment_processing` \- обработка платежей

* `file_processing` \- обработка файлов

* и другие...

## **Рекомендуемое разбиение:**

## **Микросервис 1: "Core API" (монолит для легких фич)**

text

`Фичи: chat_mode, poll_creation, subscription_tracking,` 

      `lead_magnets, user_profiles, settings`

      

`Почему вместе: Легкая нагрузка, частое взаимодействие,` 

               `общие пользовательские данные`

               

`Ресурсы: 512MB RAM, 0.5 CPU`

## **Микросервис 2: "Analytics Engine"**

text

`Фичи: user_analytics, ab_testing, cohort_analysis,` 

      `advanced_reporting`

      

`Почему отдельно: Высокая нагрузка на CPU и память при` 

                  `обработке больших данных`

                  

`Ресурсы: 2GB RAM, 2 CPU`

## **Микросервис 3: "AI & Content Processing"**

text

`Фичи: digest (с нейросетью), anti_spam, content_analysis,`

      `topic_detection`

      

`Почему отдельно: Нагрузка на CPU (нейросети), внешние API`

                  

`Ресурсы: 1GB RAM, 1.5 CPU`

`Масштабирование: 2-3 копии в пиковые часы`

## **Микросервис 4: "Payment & Security"**

text

`Фичи: payment_processing, subscription_management,` 

      `security_audit`

      

`Почему отдельно: Требования безопасности, интеграция с` 

                  `платежными системами`

                  

`Ресурсы: 512MB RAM, 0.5 CPU`

## **Микросервис 5: "File & Media Processing"**

text

`Фичи: file_upload, image_processing, backup_service,`

      `media_optimization`

      

`Почему отдельно: Высокая нагрузка на диск и память`

                  

`Ресурсы: 1GB RAM, 1 CPU, 10GB диск`

## **Управление ресурсами и масштабирование**

## **Docker Compose конфигурация**

text

`version: '3.8'`

`services:`

  `core-api:`

    `image: telegram-bot/core-api`

    `deploy:`

      `resources:`

        `limits:`

          `memory: 512M`

          `cpus: '0.5'`

        `reservations:`

          `memory: 256M`

          `cpus: '0.25'`

          

  `analytics-engine:`

    `image: telegram-bot/analytics`  

    `deploy:`

      `replicas: 1  # Можно увеличить до 3 при нагрузке`

      `resources:`

        `limits:`

          `memory: 2G`

          `cpus: '2'`

        `reservations:`

          `memory: 1G`  

          `cpus: '1'`

          

  `ai-content:`

    `image: telegram-bot/ai-content`

    `deploy:`

      `replicas: 2  # Сразу 2 копии для стабильности`

      `resources:`

        `limits:`

          `memory: 1G`

          `cpus: '1.5'`

## **Принципы ограничения ресурсов**

## **Зачем ограничивать?**

* **Предотвращение** перегрузки сервера одним микросервисом

* **Гарантии ресурсов** для критически важных сервисов

* **Предсказуемость** работы системы под нагрузкой

## **Как определять лимиты?**

1. **Мониторинг** реального потребления в тестовой среде

2. **Запас 20-30%** от пикового потребления

3. **Приоритизация** критических сервисов

## **Горизонтальное масштабирование**

## **Когда создавать копии микросервиса?**

* **CPU использование \>70%** длительное время

* **Память использование \>80%**

* **Время ответа API \>500ms**

* **Очереди задач** растут быстрее обработки

## **Пример автомасштабирования:**

text

`ai-content:`

  `deploy:`

    `replicas: 2`

    `update_config:`

      `parallelism: 1`

    `restart_policy:`

      `condition: on-failure`

  `# При нагрузке: docker service scale ai-content=4`

## **Алгоритм принятия решения**

## **Шаг 1: Оценка нагрузки фичи**

text

`Высокая нагрузка на CPU/RAM/Disk/Network?` 

`├─ ДА → Кандидат на отдельный микросервис`

`└─ НЕТ → Оставить в общем микросервисе`

## **Шаг 2: Оценка связанности**

text

`Фича часто взаимодействует с другими фичами?`

`├─ ДА → Группировать вместе (если похожая нагрузка)`

`└─ НЕТ → Выделить отдельно`

## **Шаг 3: Команда и безопасность**

text

`Особые требования (безопасность/команда/технологии)?`

`├─ ДА → Обязательно отдельный микросервис`  

`└─ НЕТ → Решение на основе нагрузки`

## **Шаг 4: Стоимость поддержки**

text

`Готовы поддерживать сложность микросервисной архитектуры?`

`├─ ДА → Можно разделять`

`└─ НЕТ → Начать с монолита, выделить только критичные фичи`

## **Конкретные метрики для перехода к микросервисам**

**Критические пороги Unit of Work:**

python

*`# tools/monolith-health-check.py`*

`class MonolithHealthCheck:`

    `def check_uow_complexity(self):`

        `metrics = {`

            `"avg_aggregates_per_transaction": 0,`

            `"max_aggregates_per_transaction": 0,` 

            `"cross_domain_transactions_percent": 0,`

            `"saga_pattern_usage": 0`

        `}`

        

        `# КРИТИЧЕСКИЕ ПОРОГИ:`

        `if metrics["max_aggregates_per_transaction"] > 5:`

            `return "RED: Слишком сложные транзакции"`

            

        `if metrics["cross_domain_transactions_percent"] > 30:`

            `return "RED: Много междоменных операций"`

            

        `if metrics["saga_pattern_usage"] > 10:`

            `return "YELLOW: Частое использование саг - пора думать о микросервисах"`

        

        `return "GREEN: Монолит справляется"`

**Количественные критерии перехода:**

| Метрика | Зеленая зона | Желтая зона | Красная зона |
| ----- | ----- | ----- | ----- |
| Агрегатов на транзакцию | \<3 | 3-5 | \>5 |
| Междоменных транзакций | \<20% | 20-40% | \>40% |
| Время сборки | \<5 мин | 5-15 мин | \>15 мин |
| Время тестов | \<10 мин | 10-30 мин | \>30 мин |
| Команд разработки | \<3 | 3-6 | \>6 |

**Практический пример детектора:**

python

*`# features/analytics/monitor.py`*

`@transaction_monitor`

`def generate_complex_report(user_id, time_range):`

    `with UnitOfWork() as uow:`

        `# Если здесь >5 доменов - красный флаг!`

        `user = uow.users.get(user_id)           # 1. Users domain`  

        `subscriptions = uow.subscriptions.get_by_user(user_id)  # 2. Billing domain`

        `analytics = uow.analytics.get_stats(user_id, time_range)  # 3. Analytics domain`

        `chats = uow.chats.get_by_user(user_id)  # 4. Chat domain`

        `payments = uow.payments.get_history(user_id)  # 5. Payment domain`

        `notifications = uow.notifications.get_settings(user_id)  # 6. Notification domain ⚠️`

        

        `# Слишком много! Время выделять микросервисы`

**Решение о переходе:**

* **3-4 красных метрики** \= начинаем планировать разделение

* **Выделяем первый микросервис** с наименьшими зависимостями

* **Strangler Fig Pattern** \- постепенно "душим" монолит

## **Рекомендации по развитию**

## **Начните с монолита**

* Все фичи в одном сервисе

* Изучите реальные паттерны нагрузки

* Выделяйте микросервисы постепенно

## **Первые кандидаты на выделение:**

1. **AI/ML обработка** \- всегда ресурсоемко

2. **Платежи** \- требования безопасности

3. **Файловые операции** \- нагрузка на диск

4. **Внешние интеграции** \- сетевая нагрузка

## **Мониторинг и метрики**

* Отслеживайте использование ресурсов каждой фичи

* Замеряйте время выполнения операций

* Анализируйте частоту вызовов между фичами

**Главное правило:** Микросервисы решают проблемы масштабирования и изоляции, но добавляют сложность. Выделяйте только когда польза очевидно превышает затраты на поддержку.

---

## **Где этот подход ОТЛИЧНО работает**

## **✅ Бизнес-приложения и SaaS**

* **CRM системы** \- фичи: клиенты, сделки, аналитика, отчеты

* **E-commerce** \- фичи: товары, заказы, платежи, доставка

* **Финтех** \- фичи: счета, транзакции, карты, аналитика

* **Образовательные платформы** \- фичи: курсы, студенты, прогресс, сертификаты

**Почему подходит:** Четкое разделение бизнес-процессов, каждая фича решает конкретную задачу.

## **✅ Контент-платформы**

* **Социальные сети** \- фичи: посты, комментарии, лайки, подписки, чат

* **Блог-платформы** \- фичи: статьи, авторы, категории, комментарии

* **Маркетплейсы** \- фичи: товары, продавцы, покупатели, отзывы, платежи

## **✅ Административные панели**

* **Дашборды** \- фичи: метрики, отчеты, пользователи, настройки

* **Системы управления** \- каждый модуль \= отдельная фича

## **Где подходит ЧАСТИЧНО**

## **⚠️ Простые игры с четкой механикой**

**Подходит для:**

* **Стратегии** \- фичи: юниты, здания, ресурсы, карта, дипломатия

* **RPG** \- фичи: персонаж, инвентарь, квесты, боевая система, магазин

* **Менеджмент-игры** \- фичи: финансы, персонал, производство, маркетинг

**Пример структуры стратегии:**

text

`features/`

`├── units/          # Создание/управление юнитами`

`├── buildings/      # Строительство`

`├── resources/      # Добыча ресурсов`

`├── combat/         # Боевая система`

`└── diplomacy/      # Дипломатия`

`ui/`

`├── game_map/       # Основная карта`

`├── city_view/      # Управление городом`

`└── diplomacy_screen/ # Дипломатический интерфейс`

## **⚠️ Мобильные приложения**

**Подходит для:** Приложения с множеством разных функций

* **Банкинг** \- платежи, карты, кредиты, аналитика

* **Фитнес** \- тренировки, питание, прогресс, социальные функции

**НЕ подходит для:** Простых утилитарных приложений

## **Где НЕ подходит категорически**

## **❌ Аркадные и экшн-игры**

* **Шутеры, платформеры, гонки** \- здесь нет "бизнес-логики", есть игровые механики реального времени

* **Физические симуляции** \- физика не делится на "фичи"

## **❌ Простые лендинги и сайты-визитки**

* **Статичные сайты** \- нет бизнес-логики, только контент

* **Простые формы** \- избыточность архитектуры

## **❌ Реального времени системы**

* **Видеочаты** \- основная логика в WebRTC, а не в бизнес-фичах

* **Онлайн-редакторы** (Google Docs) \- совместное редактирование не делится на фичи

* **Торговые терминалы** \- высокочастотные данные, минимальная задержка

## **❌ Простые CRUD приложения**

Если у вас есть только:

* Список записей

* Добавить запись

* Редактировать запись

* Удалить запись

**Это избыточно.** Достаточно простой MVC структуры

## **Практическое внедрение архитектуры в команду**

## **Автоматизированный контроль (import-linter)**

text

`# .importlinter - АВТОМАТИЧЕСКАЯ ПРОВЕРКА ИМПОРТОВ`

`[importlinter:contract:features-isolation]`

`name = Фичи не могут импортировать друг друга`

`type = independence`

`modules =` 

    `features.digest`

    `features.analytics`  

    `features.payments`

    `features.subscriptions`

`[importlinter:contract:shared-purity]`  

`name = Shared не импортирует из верхних слоёв`

`type = forbidden`

`source_modules = shared`

`forbidden_modules =` 

    `features`

    `ui`

    `store`

`[importlinter:contract:layers]`

`name = Слоистая архитектура`

`type = layers`

`layers =` 

    `ui`

    `store`  

    `features`

    `shared`

    `core`

    `config`

## **Интеграция в разработку**

text

`# .github/workflows/architecture.yml`

`name: Architecture Guard`

`on: [pull_request]`

`jobs:`

  `architecture:`

    `runs-on: ubuntu-latest`

    `steps:`

      `- uses: actions/checkout@v3`

      `- name: Check import rules`

        `run: |`

          `pip install import-linter`

          `lint-imports`

          

      `- name: Check architectural exceptions`  

        `run: python tools/architecture-guard.py`

        

      `- name: Validate shared complexity`

        `run: python tools/check-shared-rules.py`

## **Система мониторинга Developer Experience**

text

`# .github/workflows/dx-monitoring.yml`

`name: DX Health Check`

`on:`

  `schedule:`

    `- cron: "0 9 * * MON"  # Каждый понедельник`

`jobs:`

  `measure_dx:`

    `runs-on: ubuntu-latest`

    `steps:`

      `- name: Measure average PR size`

        `# Если PR >500 строк, архитектура мешает`

      `- name: Check violation frequency`  

        `# Если >20% PR имеют violations, правила слишком строгие`

      `- name: Survey team satisfaction`

        `# Автоматический опрос через Slack`

## **Обучение команды (README для новичков)**

text

`# 🏗️ Куда класть код? Быстрый гид для разработчика`

`## 🤔 У меня есть новая функция. Куда её поместить?`

`### 1️⃣ Это решает конкретную бизнес-задачу?`

`` ✅ → Создай новую папку `features/my-feature/` ``

`### 2️⃣ Это UI-компонент для одного экрана?`

`` ✅ → Помести в `ui/my-screen/components/` ``

`### 3️⃣ Это UI-компонент для нескольких экранов?`  

`` ✅ → Помести в `shared/ui-kit/` ``

`### 4️⃣ Это утилита без бизнес-логики?`

`` ✅ → Помести в `shared/infrastructure/` ``

`### 5️⃣ Это объединение нескольких API для экрана?`

``✅ → Создай в `shared/orchestrators/` (ОСТОРОЖНО!)``

`## 🚫 Красные флаги - НЕ ДЕЛАЙ ТАК:`

`` - Импорт `features/payment` из `features/users` ``  

`` - Бизнес-логика в `shared/orchestrators/` ``

`` - UI компоненты в `features/` `` 

`- Прямые импорты моделей между фичами`

`## 🆘 Не знаю куда поместить?` 

`` Спроси в Slack: #architecture или создай issue с меткой `architecture-question` ``

## **Заключение**

Feature-First архитектура \- это мощный инструмент для сложных бизнес-приложений с множественной функциональностью. Она обеспечивает масштабируемость, переиспользование кода и четкое разделение ответственности.

**Золотое правило:** Если вы можете четко выделить отдельные бизнес-процессы в вашем приложении \- этот подход для вас. Если ваше приложение решает одну простую задачу \- выберите более простую архитектуру.

# **ПРАВИЛО МИКРОСЕРВИСОВ**

## **Ключевой принцип**

**Микросервисы ВСЕГДА потребляют больше ресурсов в сумме, чем монолит.**

Когда вы разделяете одно приложение на несколько микросервисов, общее потребление CPU, памяти, диска и сети увеличивается на **50-200%** из\-за накладных расходов (overhead).

**Но иногда эта цена оправдана.**

---

## **Почему микросервисы "едят" больше ресурсов?**

## **🔥 Процессор (CPU) \- увеличивается на 20-50%**

**Было в монолите:**

python

*`# Прямой вызов функции в памяти`*

`result = analytics.get_user_stats(user_id)  # ~0.1мс`

**Стало в микросервисах:**

python

*`# HTTP запрос между сервисами`*  

`response = requests.get(f"http://analytics-service/users/{user_id}/stats")  # ~10мс`

`result = response.json()`

**Дополнительная нагрузка:**

* Упаковка данных в JSON при каждом запросе

* Парсинг HTTP заголовков и ответов

* Работа TCP/IP стека операционной системы

* Переключение контекста между процессами

## **🧠 Память (RAM) \- увеличивается на 50-200%**

**Монолит:**

text

`Одно приложение: 500MB RAM`

`├─ Python runtime: 50MB (один раз)`

`├─ Библиотеки (Django, pandas): 200MB (один раз)`

`└─ Бизнес-код: 250MB`

**Микросервисы:**

text

`Сервис 1: 300MB RAM`

`├─ Python runtime: 50MB` 

`├─ Библиотеки: 150MB`

`└─ Код: 100MB`

`Сервис 2: 250MB RAM`  

`├─ Python runtime: 50MB (ДУБЛИРОВАНИЕ!)`

`├─ Библиотеки: 100MB (ЧАСТИЧНОЕ ДУБЛИРОВАНИЕ!)`

`└─ Код: 100MB`

`Сервис 3: 200MB RAM`

`├─ Python runtime: 50MB (ДУБЛИРОВАНИЕ!)`

`├─ Библиотеки: 80MB` 

`└─ Код: 70MB`

`ИТОГО: 750MB вместо 500MB (+50%)`

**Проблема:** Каждый микросервис загружает свою копию runtime и библиотек.

## **🌐 Сетевой трафик \- увеличивается в разы**

**Монолит:** Вызовы между модулями \= 0 байт сетевого трафика

**Микросервисы:** При 1000 внутренних запросов в час

text

`HTTP запрос + ответ ≈ 2KB × 1000 = 2MB/час внутреннего трафика`

## **💾 Дисковое пространство \- увеличивается на 30-80%**

* Дублирование библиотек в Docker образах

* Отдельные лог-файлы для каждого сервиса

* Множественные конфигурационные файлы

---

## **Реальный пример с цифрами**

## **ДО: Telegram-бот (монолит)**

text

`telegram-bot:`

  `CPU: 2.0 cores`

  `RAM: 800MB`  

  `Disk: 2GB`

  `Network: 100MB/час (только внешние API)`

## **ПОСЛЕ: Разделение на 3 микросервиса**

text

`core-api:          # Легкие операции`

  `CPU: 0.8 cores`

  `RAM: 400MB`


`analytics-engine:  # Тяжелая аналитика`  

  `CPU: 1.2 cores`

  `RAM: 600MB`


`ai-content:        # Нейросети`

  `CPU: 1.5 cores`

  `RAM: 700MB`

`# ИТОГО РЕСУРСОВ:`

`CPU: 3.5 cores (+75%)`

`RAM: 1700MB (+112%)`

`Network: +150MB/час внутреннего трафика`

**Overhead \= 75% CPU и 112% памяти\!**

---

## **Когда этот overhead оправдан?**

## **✅ Микросервисы СТОИТ делать если:**

## **1\. Изоляция критических сбоев**

text

`ПРОБЛЕМА: AI-модуль съедает всю память → падает ВСЁ приложение`

`РЕШЕНИЕ: AI в отдельном контейнере → падает только AI, остальное работает`

## **2\. Независимое масштабирование**

text

`ПРОБЛЕМА: Analytics нагружен, а Core-API простаивает`

`МОНОЛИТ: Увеличиваем ресурсы ВСЕМУ приложению (×3) = ×3 стоимость`

`МИКРОСЕРВИСЫ: Увеличиваем только Analytics (×3) = +200% только к Analytics`

## **3\. Ограничение "жадных" процессов**

text

`ai-content:`

  `deploy:`

    `resources:`

      `limits:`

        `memory: 1GB    # НЕ ДАЕМ съесть всю память сервера`

        `cpus: '1.5'    # НЕ ДАЕМ заблокировать другие процессы`

## **4\. Разные технологии для разных задач**

text

`Analytics: Python + pandas (лучше для данных)`

`AI: Python + PyTorch (специализированные библиотеки)`  

`API: Go (быстрее для простых HTTP запросов)`

## **❌ Микросервисы НЕ СТОИТ делать если:**

* **Бюджет ограничен** \- не можете позволить \+50-200% к ресурсам

* **Стабильное приложение** \- ничего не падает, нагрузка равномерная

* **Маленькая команда** (\<3 разработчиков) \- сложность поддержки превышает пользу

* **Тесная связь модулей** \- постоянно обращаются друг к другу (медленные HTTP вызовы вместо быстрых функций)

---

## **Формула принятия решения**

text

`Стоимость микросервисов =` 

  `Текущие ресурсы × 1.5-2.5 (overhead)`


`Выгода микросервисов =`

  `+ Экономия от точечного масштабирования`

  `+ Стоимость простоев (которых можно избежать)`  

  `+ Ускорение разработки (параллельные команды)`

`ЕСЛИ Выгода > Стоимость → ДЕЛАТЬ микросервисы`

`ИНАЧЕ → Остаться на монолите`

---

## **Практические рекомендации**

## **Начните с "умного" монолита**

1. **Используйте Feature-First архитектуру** \- фичи уже изолированы

2. **Мониторьте нагрузку** каждой фичи отдельно

3. **Выделяйте микросервисы постепенно**, только при появлении проблем

## **Первые кандидаты на выделение:**

* **AI/ML обработка** \- всегда ресурсоемко, может "убить" приложение

* **Файловые операции** \- непредсказуемая нагрузка на диск и память

* **Внешние интеграции** \- могут "подвиснуть" и заблокировать приложение

* **Платежи** \- критичная безопасность, нужна изоляция

## **Метрики для принятия решения:**

* **CPU одной фичи \>70%** от общего потребления приложения

* **Память одной фичи \>60%** от общего потребления

* **Простои** из\-за одной проблемной фичи \>1 раза в месяц

* **Время разработки** тормозится конфликтами в коде

**Главное правило:** Микросервисы решают конкретные проблемы производительности, стабильности или разработки. Если проблем нет \- не создавайте сложность без необходимости.

**Начинайте с монолита, изучите реальную нагрузку, выделяйте микросервисы только когда польза очевидно превышает затраты на поддержку.**

