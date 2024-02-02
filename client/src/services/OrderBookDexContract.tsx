import { ethers, Contract, Signer } from 'ethers';
import OrderBookDex from '../artifacts/contracts/OrderBookDex.sol/OrderBookDex.json';
import { TokenProps } from '../components/common/common-props';

class OrderBookDexContract {
    private contract: Contract;

    constructor(provider: ethers.providers.Provider, contractAddress: string) {
        this.contract = new ethers.Contract(contractAddress, OrderBookDex.abi, provider);
    }

    getContractAddress(): string {
        return this.contract.address;
    }

    async getAllTokens(): Promise<TokenProps[]> {
        return await this.contract.getTokens();
    }

    async addToken(token: TokenProps, signer: Signer): Promise<void> {
        try {
            const tx =  await this.contract
                .connect(signer)
                .addToken(
                    ethers.utils.formatBytes32String(token.ticker),
                    token.tokenAddress
                );
            await tx.wait();
        } catch (e) {
            console.error(e)
        }
    }

    async disableToken(token: TokenProps, signer: Signer): Promise<void> {
        try {
            const tx =  await this.contract
                .connect(signer)
                .disableTokenTrading(token.ticker);
            await tx.wait();
        } catch (e) {
            console.error(e)
        }
    }

    async enableToken(token: TokenProps, signer: Signer): Promise<void> {
        try {
            const tx =  await this.contract
                .connect(signer)
                .enableTokenTrading(token.ticker);
            await tx.wait();
        } catch (e) {
            console.error(e)
        }
    }
}

export default OrderBookDexContract;