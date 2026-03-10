export const config = {
    CDP_PORT: 48192,
    CDP_HOST: '127.0.0.1',
    /** The URL fragment that must be present in the WebSocket URL to start scanning */
    SCANNER_URL_MATCH: 'solana/arb',
    /** Whether to open new tabs in the background */
    OPEN_TABS_IN_BACKGROUND: false,
    /** Whether to enable centralized exchange filtering */
    CEX_FILTER_ENABLED: true,
    /** Target CEX to filter by when enabled */
    TARGET_CEX: 'xt',
    /** Enable raw signal logging for debugging parser heuristics */
    DEBUG_RAW_SIGNALS: false,
    /** Anti-spam cache TTL in milliseconds */
    ANTI_SPAM_TTL_MS: 60000,
    /** Fixed buy budget in USDT for sniper execution */
    FIXED_BUY_USDT: 300,
    /** Percentage buffer from DEX price for calculating safe sweep price */
    SAFE_SPREAD_BUFFER_PERCENT: 0.10,
    /** Минимально допустимый процент профита в сигнале (всё, что ниже, игнорируется) */
    MIN_ARB_PERCENT: 0.6,
    /** If true, the final buy button click will be skipped */
    DRY_RUN: false,
};
