import { ethers, Contract, Signer } from 'ethers';
import OrderBookDex from '../artifacts/contracts/OrderBookDex.sol/OrderBookDex.json';
import { TokenProps, TokenDexBalance, ORDER_SIDE, Order, ORDER_TYPE } from '../components/common/common-props';
import Utils from '../utils';

class OrderBookDexContract {
    private contract: Contract;

    constructor(signer: ethers.Signer, contractAddress: string) {
        this.contract = new ethers.Contract(contractAddress, OrderBookDex.abi, signer);
    }

    async getContractAddress(): Promise<string> {
        return await this.contract.getAddress();
    }

    async isAdmin(): Promise<boolean> {
        return await this.contract.isAdmin();
    }

    async getQuoteTicker(): Promise<string> {
        let quoteTicker = '';
        try {
            quoteTicker = await this.contract.quoteTicker();
        } catch (e) {
            Utils.handleError(e);
        }
        return quoteTicker;
    }

    async setQuoteTicker(token: TokenProps) {
        try {
            const tx =  await this.contract.setQuoteTicker(token.ticker);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async getAllTokens(): Promise<TokenProps[]> {
        let tokens: TokenProps[] = [];
        try {
            tokens = await this.contract.getTokens();
        } catch (e) {
            Utils.handleError(e);
        }
        return tokens
    }

    async addToken(token: TokenProps) {
        try {
            const tx =  await this.contract.addToken(
                ethers.encodeBytes32String(token.ticker),
                token.tokenAddress
            );
            await tx.wait();
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async disableToken(token: TokenProps) {
        try {
            const tx =  await this.contract.disableTokenTrading(token.ticker);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async enableToken(token: TokenProps) {
        try {
            const tx =  await this.contract.enableTokenTrading(token.ticker);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async getBalance(token: TokenProps, signer: Signer): Promise<TokenDexBalance> {
        let balance: TokenDexBalance = {free: BigInt(0), locked: BigInt(0)};
        
        try {
            balance = await this.contract.balances(
                await signer.getAddress(), 
                token.ticker
            );
        } catch (e) {
            Utils.handleError(e);
        }
        return balance;
    }

    async deposit(token: TokenProps, amount: BigInt) {
        try {
            const tx = await this.contract.deposit(token.ticker, amount);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async withdraw(token: TokenProps, amount: BigInt) {
        try {
            const tx = await this.contract.withdraw(token.ticker, amount);
            await tx.wait();
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async getOrders(token: TokenProps, side: ORDER_SIDE): Promise<Order[]> {
        let orders: Order[] = [];
        try {
            orders = await this.contract.getOrders(token.ticker, side);
        } catch (e) {
            Utils.handleError(e);
        }
        return orders;
    }

    async placedOrder(
        token: TokenProps, 
        amount: number, 
        price: number, 
        side: ORDER_SIDE, 
        type: ORDER_TYPE
    ) {
        try {
            const tx = await this.contract.placeOrder({
                ticker: token.ticker,
                amount: ethers.parseEther(amount.toString()),
                price: price,
                orderSide: side,
                orderType: type
            });
            await tx.wait();
        } catch (e) {
            Utils.handleError(e);
        }
    }
}

export default OrderBookDexContract;