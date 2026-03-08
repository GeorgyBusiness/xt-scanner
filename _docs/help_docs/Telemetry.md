# Шаблон Телеметрии (ui_telemetry_batch)

**Тип сообщения:** `ui_telemetry_batch`
**Описание:** Пример пакета телеметрии, который сканер шлет на сервер по WebSocket.

```json
{
    "type": "ui_telemetry_batch",
    "session_id": "90dc550a-3b58-4b7a-b6e2-05ae385cc854",
    "sent_at_ms": 1772886933387,
    "random_bucket": 390,
    "events": [
        {
            "ts_client_ms": 1772886226445,
            "path": "/solana/arb",
            "event_type": "ui_heartbeat",
            "visibility": "visible",
            "has_focus": false,
            "connection_status": "CONNECTED",
            "user_id": "702060416",
            "random_bucket": 911
        },
        {
            "ts_client_ms": 1772886256524,
            "path": "/solana/arb",
            "event_type": "ui_heartbeat",
            "visibility": "visible",
            "has_focus": false,
            "connection_status": "CONNECTED",
            "user_id": "702060416",
            "random_bucket": 889
        },
        {
            "ts_client_ms": 1772886326134,
            "path": "/solana/arb",
            "event_type": "ui_heartbeat",
            "visibility": "visible",
            "has_focus": false,
            "connection_status": "CONNECTED",
            "user_id": "702060416",
            "random_bucket": 649
        },
        {
            "ts_client_ms": 1772886388850,
            "path": "/solana/arb",
            "event_type": "ui_heartbeat",
            "visibility": "visible",
            "has_focus": false,
            "connection_status": "CONNECTED",
            "user_id": "702060416",
            "random_bucket": 900
        },
        {
            "ts_client_ms": 1772886431539,
            "path": "/solana/arb",
            "event_type": "ui_heartbeat",
            "visibility": "visible",
            "has_focus": false,
            "connection_status": "CONNECTED",
            "user_id": "702060416",
            "random_bucket": 971
        },
        {
            "ts_client_ms": 1772886480416,
            "path": "/solana/arb",
            "event_type": "ui_page_hide",
            "visibility": "visible",
            "has_focus": false,
            "connection_status": "CONNECTED",
            "user_id": "702060416",
            "random_bucket": 235
        },
        {
            "ts_client_ms": 1772886480417,
            "path": "/solana/arb",
            "event_type": "ui_visibility_change",
            "visibility": "hidden",
            "has_focus": false,
            "connection_status": "CONNECTED",
            "user_id": "702060416",
            "random_bucket": 921
        },
        {
            "ts_client_ms": 1772886481147,
            "path": "/solana/arb",
            "event_type": "ui_page_open",
            "visibility": "visible",
            "has_focus": false,
            "connection_status": "CONNECTING",
            "user_id": "702060416",
            "random_bucket": 642
        },
        {
            "ts_client_ms": 1772886481147,
            "path": "/solana/arb",
            "event_type": "ws_status_change",
            "visibility": "visible",
            "has_focus": false,
            "connection_status": "CONNECTING",
            "user_id": "702060416",
            "random_bucket": 636
        },
        {
            "ts_client_ms": 1772886481280,
            "path": "/solana/arb",
            "event_type": "ws_status_change",
            "visibility": "visible",
            "has_focus": false,
            "connection_status": "CONNECTED",
            "user_id": "702060416",
            "random_bucket": 906
        }
    ]
}```
