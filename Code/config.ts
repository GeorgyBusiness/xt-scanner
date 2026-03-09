/**
 * Application Configuration
 */
export const config = {
    /** The port on which to connect to Chrome CDP */
    CDP_PORT: 48192,
    /** The host for CDP connection */
    CDP_HOST: '127.0.0.1',
    /** The URL fragment that must be present in the WebSocket URL to start scanning */
    SCANNER_URL_MATCH: 'solana/arb',
    /** Whether to open new tabs in the background */
    OPEN_TABS_IN_BACKGROUND: false,
    /** Whether to enable centralized exchange filtering */
    CEX_FILTER_ENABLED: false,
    /** Target CEX to filter by when enabled */
    TARGET_CEX: 'xt',
    /** Enable raw signal logging for debugging parser heuristics */
    DEBUG_RAW_SIGNALS: false,
    /** Anti-spam cache TTL in milliseconds */
    ANTI_SPAM_TTL_MS: 60000,
    /** Fixed buy budget in USDT for sniper execution */
    FIXED_BUY_USDT: 50,
};
