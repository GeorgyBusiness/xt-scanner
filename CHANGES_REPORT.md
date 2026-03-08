# Отчет об изменениях кода
## Список измененных файлов
- `Code/config.ts`
- `Code/src/core/cdp_client.ts`
- `Code/src/features/scanner.ts`
- `Code/src/main.ts`
- `Code/src/shared/types.ts`
- `generate_diff_report.py`

## Файл: `Code/config.ts`
```diffdiff --git a/Code/config.ts b/Code/config.ts
index bd46245..5fdc5d1 100644
--- a/Code/config.ts
+++ b/Code/config.ts
@@ -3,4 +3,7 @@ export const config = {
     CDP_HOST: '127.0.0.1',
     SCANNER_URL_MATCH: 'solana/arb',
     OPEN_TABS_IN_BACKGROUND: false,
+    CEX_FILTER_ENABLED: false,
+    TARGET_CEX: 'xt',
+    DEBUG_RAW_SIGNALS: false,
 };```
**Статистика:** +4 строк / -1 строк
---
## Файл: `Code/src/core/cdp_client.ts`
```diffdiff --git a/Code/src/core/cdp_client.ts b/Code/src/core/cdp_client.ts
index 4061b25..4b11ee1 100644
--- a/Code/src/core/cdp_client.ts
+++ b/Code/src/core/cdp_client.ts
@@ -13,7 +13,7 @@ export async function connectCDP() {
         if (!target) {
             console.error(`[CDP Client] No tab found matching URL part: "${config.SCANNER_URL_MATCH}"`);
             console.error('[CDP Client] Available tabs:', targets.map(t => t.url));
-            process.exit(1);
+            throw new Error(`[CDP Client] No tab found matching URL part: "${config.SCANNER_URL_MATCH}"`);
         }
 
         console.log(`[CDP Client] Found target tab: ${target.url}`);
@@ -27,14 +27,13 @@ export async function connectCDP() {
         console.log(`[CDP Client] Connected to Target at ${config.CDP_HOST}:${config.CDP_PORT}`);
 
         client.on('disconnect', () => {
-            console.error('[CDP Client] Disconnected from Chrome. Exiting...');
-            process.exit(1);
+            console.error('[CDP Client] Disconnected from Chrome. Throwing error...');
+            (client as any).emit('error', new Error('Disconnected from Chrome'));
         });
 
         return client;
     } catch (err) {
         console.error(`[CDP Client] Failed to connect to Chrome at ${config.CDP_HOST}:${config.CDP_PORT}.`, err);
-        process.exit(1);
         throw err;
     }
 }```
**Статистика:** +4 строк / -5 строк
---
## Файл: `Code/src/features/scanner.ts`
```diffNew file: Code/src/features/scanner.ts
@@ -0,0 +1,51 @@
+import { config } from '../../config';
+import { ISignalPayload } from '../shared/types';
+
+export function parseWebSocketFrame(frame: string): ISignalPayload[] {
+    // 1. Выводим сырые данные ДО парсинга, если включен дебаг
+    if (config.DEBUG_RAW_SIGNALS) {
+        // Простая эвристика, чтобы не печатать совсем уж мусор, 
+        // а только то, что похоже на массив сигналов
+        if (frame.startsWith('[')) {
+            console.log('[Scanner DEBUG Raw Frame]:', frame);
+        }
+    }
+
+    try {
+        const parsed = JSON.parse(frame);
+
+        if (!Array.isArray(parsed)) {
+            return [];
+        }
+
+        const signals: ISignalPayload[] = [];
+
+        for (const item of parsed) {
+            // Duck typing: фильтрация телеметрии
+            if (item && item.small && item.big && typeof item.arb_percent === 'number') {
+                const targetCexStr = config.TARGET_CEX.toLowerCase();
+                const smallExchangeStr = String(item.small.exchange).toLowerCase();
+
+                if (config.CEX_FILTER_ENABLED && smallExchangeStr !== targetCexStr) {
+                    continue;
+                }
+
+                signals.push({
+                    symbol: item.symbol,
+                    arb_percent: item.arb_percent,
+                    arbitrage_amount_usdt: item.arbitrage_amount_usdt,
+                    small: { exchange: item.small.exchange },
+                    big: { exchange: item.big.exchange },
+                    buy_url: item.buy_url,
+                    sell_url: item.sell_url
+                });
+            }
+        }
+
+        return signals;
+    } catch (e) {
+        // Здесь оставляем только логирование реальных ошибок парсинга
+        console.error('[Scanner] Ошибка JSON.parse. Raw data:', frame);
+        return [];
+    }
+}
+```
**Статистика:** +52 строк / -0 строк
---
## Файл: `Code/src/main.ts`
```diffdiff --git a/Code/src/main.ts b/Code/src/main.ts
index fd354da..4157299 100644
--- a/Code/src/main.ts
+++ b/Code/src/main.ts
@@ -1,8 +1,10 @@
 import { connectCDP } from './core/cdp_client';
+import { parseWebSocketFrame } from './features/scanner';
 
-async function main() {
-    console.log('[Main] Starting XT Scanner Iteration 1...');
+const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
 
+async function runSession() {
+    console.log('[Main] Starting new session...');
     const client = await connectCDP();
     const { Network } = client;
 
@@ -11,19 +13,44 @@ async function main() {
         console.log('[Main] Network domain enabled. Listening for WebSocket frames...');
 
         Network.webSocketFrameReceived((params: any) => {
-            console.log('[WebSocket Frame Received]:', JSON.stringify(params, null, 2));
+            const payloadData = params.response?.payloadData;
+            if (payloadData && typeof payloadData === 'string') {
+                const signals = parseWebSocketFrame(payloadData);
+                for (const signal of signals) {
+                    console.log(`[🔥 СИГНАЛ] ${signal.symbol} | ${signal.small.exchange} -> ${signal.big.exchange} | Профит: ${signal.arb_percent}% ($${signal.arbitrage_amount_usdt})`);
+                }
+            }
         });
 
-        // Keep process alive
-        process.on('SIGINT', async () => {
-            console.log('\n[Main] Closing CDP connection...');
-            await client.close();
-            process.exit(0);
+        return new Promise<void>((_, reject) => {
+            client.on('error', (err) => {
+                client.close().catch(() => { });
+                reject(err);
+            });
         });
     } catch (err) {
-        console.error('[Main] Error during CDP operations:', err);
-        await client.close();
-        process.exit(1);
+        await client.close().catch(() => { });
+        throw err;
+    }
+}
+
+async function main() {
+    console.log('[Main] Starting XT Scanner Iteration 2 (Auto-Reconnect)...');
+
+    // Keep process alive strictly (SIGINT handled below)
+    process.on('SIGINT', () => {
+        console.log('\n[Main] Exiting gracefully...');
+        process.exit(0);
+    });
+
+    while (true) {
+        try {
+            await runSession();
+        } catch (err: any) {
+            console.error('[Main] Session error:', err.message);
+            console.log('[Main] Waiting 3 seconds before reconnecting...');
+            await sleep(3000);
+        }
     }
 }```
**Статистика:** +39 строк / -12 строк
---
## Файл: `Code/src/shared/types.ts`
```diffNew file: Code/src/shared/types.ts
@@ -0,0 +1,13 @@
+export interface IExchangeData {
+    exchange: string;
+}
+
+export interface ISignalPayload {
+    symbol: string;
+    arb_percent: number;
+    arbitrage_amount_usdt: number;
+    small: IExchangeData;
+    big: IExchangeData;
+    buy_url?: string;
+    sell_url?: string;
+}
+```
**Статистика:** +14 строк / -0 строк
---
## Файл: `generate_diff_report.py`
```diffdiff --git a/generate_diff_report.py b/generate_diff_report.py
index 7ccbae6..8f080da 100644
--- a/generate_diff_report.py
+++ b/generate_diff_report.py
@@ -29,8 +29,8 @@ IGNORED_FILES = [
 # Этот скрипт также использует стандартный .gitignore вашего проекта.
 # Если вы хотите скрыть папку (например, venv/), добавьте её в файл .gitignore в корне проекта.
 
-# Директория git-репозитория проекта
-REPO_DIR = "/Users/georgijbusiness/AndrewRealEstate/pulse_team_bot_real_estate"
+# Директория git-репозитория проекта (определяется автоматически)
+REPO_DIR = os.path.dirname(os.path.abspath(__file__))
 
 def generate_markdown_diff():
     # Get the root of the git repo
@@ -38,7 +38,7 @@ def generate_markdown_diff():
         repo_root = subprocess.check_output(
             ['git', 'rev-parse', '--show-toplevel'],
             cwd=REPO_DIR
-        ).decode('utf-8').strip()
+        ).decode('utf-8').rstrip('\n')
     except subprocess.CalledProcessError:
         print("Error: Not a git repository")
         return```
**Статистика:** +4 строк / -4 строк
---
