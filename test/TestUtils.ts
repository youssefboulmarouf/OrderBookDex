import { ethers } from "hardhat";
import { OrderBookDex, TestToken } from "../typechain-types";
import { expect } from "chai";

const ORDER_SIDE = {BUY: 0, SELL: 1};
const ORDER_TYPE = {MARKET: 0, LIMIT: 1};

async function deployOrderBookContract() {
    const contractFactory = await ethers.getContractFactory("OrderBookDex");
    const contract = await contractFactory.deploy();
    return { contractFactory, contract };
}

async function deployTokenTest(name: string, symbol: string) {
    const contractFactory = await ethers.getContractFactory("TestToken");
    const contract = await contractFactory.deploy(name, symbol);
    return { contractFactory, contract };
}

async function getContractDetails(testToken: TestToken) {
    const symbol = await testToken.symbol();
    const address = await testToken.getAddress();
    return { symbol, address };
}

async function addToken(orderBookDex:OrderBookDex, tokenContract: TestToken) {
    const [owner] = await ethers.getSigners();
    const tokenDetails = await getContractDetails(tokenContract);
    await orderBookDex
        .connect(owner)
        .addToken(
            ethers.encodeBytes32String(tokenDetails.symbol), 
            tokenDetails.address
        );
}

async function seedTradersWallets(orderBookDex:OrderBookDex, tokenContract: TestToken, amount: bigint) {
    const [owner, trader1, trader2, trader3, trader4, otherTrader] = await ethers.getSigners();
    const tokenDetails = await getContractDetails(tokenContract);
    const orderBookDexAddress = await orderBookDex.getAddress();
    //const amount = ethers.parseUnits('100', 'ether');

    await Promise.all(
        [trader1, trader2, trader3, trader4].map(async trader => {
            // Mint
            await tokenContract.faucet(trader.address, amount);
            // Approve
            await tokenContract
                .connect(trader)
                .approve(orderBookDexAddress, amount);
            // Deposit
            await orderBookDex
                .connect(trader)
                .deposit(
                    ethers.encodeBytes32String(tokenDetails.symbol),
                    amount
                );

        })
    );
}

async function placeOrder(
    orderBookDex: OrderBookDex, 
    traderIndex: number, 
    symbol: string, 
    amount: string, 
    price: string, 
    orderSide: number, 
    orderType: number
) {
    const traders = await ethers.getSigners();
    await orderBookDex
        .connect(traders.at(traderIndex))
        .placeOrder({
            ticker: ethers.encodeBytes32String(symbol),
            amount: ethers.parseUnits(amount, 'ether'),
            price: ethers.parseUnits(price, 'ether'),
            orderSide: orderSide,
            orderType: orderType
        });
}

async function setQuoteTicker(orderBookDex: OrderBookDex, symbol: string) {
    const [owner] = await ethers.getSigners();
    await orderBookDex.connect(owner).setQuoteTicker(ethers.encodeBytes32String(symbol));
}

async function getOrders(orderBookDex: OrderBookDex, symbol: string, orderSide: number): Promise<OrderBookDex.OrderStructOutput[]> {
    return await orderBookDex.getOrders(ethers.encodeBytes32String(symbol), orderSide);
}

async function assertOrder(
    actual: OrderBookDex.OrderStructOutput, 
    traderIndex: number, 
    symbol: string, 
    amount: string, 
    price: string, 
    orderSide: number, 
    orderType: number
) {
    const traders = await ethers.getSigners();

    expect(actual.traderAddress).to.be.equals(traders.at(traderIndex)?.address);
    expect(actual.orderSide).to.be.equals(orderSide);
    expect(actual.orderType).to.be.equals(orderType);
    expect(actual.ticker).to.be.equals(ethers.encodeBytes32String(symbol));
    expect(actual.amount).to.be.equals(ethers.parseUnits(amount, 'ether'));
    expect(actual.price).to.be.equals(ethers.parseUnits(price, 'ether'));
}

async function getBalance(orderBookDex: OrderBookDex, address: string, symbol: string): Promise<{free: bigint; locked: bigint;}> {
    return await orderBookDex.balances(address, ethers.encodeBytes32String(symbol));
}

export {
    deployOrderBookContract, 
    deployTokenTest, 
    getContractDetails, 
    seedTradersWallets,
    addToken,
    placeOrder,
    setQuoteTicker,
    getOrders,
    assertOrder,
    getBalance
};