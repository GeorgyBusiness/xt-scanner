export interface IExchangeData {
    exchange: string;
    avg_price?: number;
    min_price?: number;
    max_price?: number;
}

export interface ISignalPayload {
    symbol: string;
    arb_percent: number;
    arbitrage_amount_usdt: number;
    small: IExchangeData;
    big: IExchangeData;
    buy_url?: string;
    sell_url?: string;
}

export interface IOpenTabsPayload {
    urls: string[];
}

export interface IXTSnapshotResponse {
    lastUpdateId: number;
    bids: [string, string][];
    asks: [string, string][];
}

export interface IXTDeltaFrame {
    i: number;
    fi: number;
    a: [string, string][];
    b: [string, string][];
}
