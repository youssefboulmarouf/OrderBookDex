import { BigNumber } from "ethers";

interface TokenProps {
    ticker: string;
    tokenAddress: string;
    isTradable: boolean;
}

interface TokenDexBalance {
    free: BigNumber;
    locked: BigNumber;
}

export type { TokenProps, TokenDexBalance };