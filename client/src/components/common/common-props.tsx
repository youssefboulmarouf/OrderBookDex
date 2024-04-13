
interface TokenProps {
    ticker: string;
    tokenAddress: string;
    isTradable: boolean;
}

interface TokenDexBalance {
    free: bigint;
    locked: bigint;
}

enum ORDER_SIDE { BUY, SELL }
enum ORDER_TYPE { MARKET, LIMIT }


interface Order {
    id: number;
    traderAddress: string;
    orderSide: ORDER_SIDE;
    orderType: ORDER_TYPE;
    ticker: string;
    amount: bigint;
    fills: bigint[];
    price: bigint;
    date: bigint;
}

interface NewTradeEvent {
    tradeId: number;
    makerOrderId: number;
    takerOrderId: number;
    ticker: string;
    makerTrader: string;
    takerTrader: string;
    takerOderType: ORDER_TYPE;
    takerTradeSide: ORDER_SIDE,
    amount: bigint;
    price: bigint;
    date: bigint;
}

export type { TokenProps, TokenDexBalance, Order, NewTradeEvent };
export { ORDER_SIDE, ORDER_TYPE }