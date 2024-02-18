
interface TokenProps {
    ticker: string;
    tokenAddress: string;
    isTradable: boolean;
}

interface TokenDexBalance {
    free: BigInt;
    locked: BigInt;
}

enum ORDER_SIDE { BUY, SELL }
enum ORDER_TYPE { MARKET, LIMIT }


interface Order {
    id: number;
    traderAddress: string;
    orderSide: ORDER_SIDE;
    orderType: ORDER_TYPE;
    ticker: string;
    amount: BigInt;
    fills: number[];
    price: number;
    date: string;
}

export type { TokenProps, TokenDexBalance, Order };
export { ORDER_SIDE, ORDER_TYPE }