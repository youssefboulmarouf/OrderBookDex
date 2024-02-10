
interface TokenProps {
    ticker: string;
    tokenAddress: string;
    isTradable: boolean;
}

interface TokenDexBalance {
    free: BigInt;
    locked: BigInt;
}

export type { TokenProps, TokenDexBalance };