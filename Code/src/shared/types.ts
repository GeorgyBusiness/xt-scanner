export interface IExchangeData {
    exchange: string;
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
