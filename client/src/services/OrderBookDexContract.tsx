import { ethers, Contract, Signer } from 'ethers';
import OrderBookDex from '../artifacts/contracts/OrderBookDex.sol/OrderBookDex.json';
import { TokenProps, TokenDexBalance } from '../components/common/common-props';
import Utils from '../utils';

class OrderBookDexContract {
    private contract: Contract;

    constructor(signer: ethers.Signer, contractAddress: string) {
        this.contract = new ethers.Contract(contractAddress, OrderBookDex.abi, signer);
    }

    getContractAddress(): Promise<string> {
        return this.contract.getAddress();
    }

    async getQuoteTicker(): Promise<string> {
        const quoteTicker = await this.contract.quoteTicker();
        return quoteTicker;
    }

    async setQuoteTicker(token: TokenProps): Promise<void> {
        try {
            const tx =  await this.contract.setQuoteTicker(token.ticker);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e)
        }
    }

    async getAllTokens(): Promise<TokenProps[]> {
        return await this.contract.getTokens();
    }

    async addToken(token: TokenProps): Promise<void> {
        try {
            const tx =  await this.contract.addToken(
                ethers.encodeBytes32String(token.ticker),
                token.tokenAddress
            );
            await tx.wait();
        } catch (e) {
            Utils.handleError(e)
        }
    }

    async disableToken(token: TokenProps): Promise<void> {
        try {
            const tx =  await this.contract.disableTokenTrading(token.ticker);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e)
        }
    }

    async enableToken(token: TokenProps): Promise<void> {
        try {
            const tx =  await this.contract.enableTokenTrading(token.ticker);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e)
        }
    }

    async getBalance(token: TokenProps, signer: Signer): Promise<TokenDexBalance | undefined> {
        try {
            return await this.contract.balances(
                await signer.getAddress(), 
                token.ticker
            );
        } catch (e) {
            Utils.handleError(e)
        }
    }

    async deposit(token: TokenProps, amount: BigInt): Promise<void> {
        try {
            const tx = await this.contract.deposit(token.ticker, amount);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e)
        }
    }

    async withdraw(token: TokenProps, amount: BigInt): Promise<void> {
        try {
            const tx = await this.contract.withdraw(token.ticker, amount);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e)
        }
    }
}

export default OrderBookDexContract;