import { ethers, Contract, Signer } from 'ethers';
import OrderBookDex from '../artifacts/contracts/OrderBookDex.sol/OrderBookDex.json';
import { TokenProps, TokenDexBalance } from '../components/common/common-props';

class OrderBookDexContract {
    private contract: Contract;

    constructor(signer: ethers.Signer, contractAddress: string) {
        this.contract = new ethers.Contract(contractAddress, OrderBookDex.abi, signer);
    }

    getContractAddress(): Promise<string> {
        return this.contract.getAddress();
    }

    async getAllTokens(): Promise<TokenProps[]> {
        const tokens = await this.contract.getTokens();
        console.log('tokens: ', tokens);
        return tokens;
    }

    async addToken(token: TokenProps): Promise<void> {
        try {
            const tx =  await this.contract
                .addToken(
                    ethers.encodeBytes32String(token.ticker),
                    token.tokenAddress
                );
            await tx.wait();
        } catch (e) {
            console.error(e)
        }
    }

    async disableToken(token: TokenProps): Promise<void> {
        try {
            const tx =  await this.contract
                .disableTokenTrading(token.ticker);
            await tx.wait();
        } catch (e) {
            console.error(e)
        }
    }

    async enableToken(token: TokenProps): Promise<void> {
        try {
            const tx =  await this.contract
                .enableTokenTrading(token.ticker);
            await tx.wait();
        } catch (e) {
            console.error(e)
        }
    }

    async getBalance(token: TokenProps, signer: Signer): Promise<TokenDexBalance | undefined> {
        try {
            return await this.contract
                .balances(await signer.getAddress(), token.ticker);
        } catch (e) {
            console.error(e)
        }
    }

    async deposit(token: TokenProps, amount: BigInt): Promise<void> {
        try {
            const tx = await this.contract
                .deposit(token.ticker, amount);
            await tx.wait();
        } catch (e) {
            console.error(e)
        }
    }

    async withdraw(token: TokenProps, amount: BigInt): Promise<void> {
        try {
            const tx = await this.contract
                .withdraw(token.ticker, amount);
            await tx.wait();
        } catch (e) {
            console.error(e)
        }
    }
}

export default OrderBookDexContract;