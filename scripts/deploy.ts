import { ethers } from "hardhat";
import fs from 'fs';
import { OrderBookDex, TestToken } from "../typechain-types";
import { Signer } from "ethers";

const deployToken = async (name: string, symbol: string): Promise<TestToken> => {
    console.log('Deploying Token: ', name);
    const token = await ethers.deployContract("TestToken", [name, symbol])
    await token.waitForDeployment();
    return token;
}

const seedAccount = async (orderBookDex: OrderBookDex, tokens: TestToken[], trader: Signer) => {
    await Promise.all(
        tokens.map(async token => {
            const tokenName = await token.symbol();
            const ticker = ethers.encodeBytes32String(tokenName);
            const amountToMint =  ethers.parseUnits('1000', 'ether');
    
            await token.faucet(trader, amountToMint);
            const orderBookDexAddress = await orderBookDex.getAddress();
            await token.connect(trader).approve(orderBookDexAddress, amountToMint);
    
            const amountToDeposit =  ethers.parseUnits('250', 'ether');
            await orderBookDex.connect(trader).deposit(ticker, amountToDeposit);

            console.log('Seeding Trader Account: ', tokenName, await trader.getAddress());
            console.log('Amount: ', amountToMint, amountToDeposit);
        })
    );
}

async function main() {
    const ORDER_SIDE = {BUY: 0, SELL: 1};
    const ORDER_TYPE = {MARKET: 0, LIMIT: 1};

    // Deploy DAI Token
    const daiToken: TestToken = await deployToken('Dai Stable Coin', 'DAI');
    const daiAddress: string = await daiToken.getAddress();
    const daiSymbol: string = await daiToken.symbol();

    // Deploy ZRX Token
    const zrxToken: TestToken = await deployToken('Xero Token', 'ZRX');
    const zrxAddress: string = await zrxToken.getAddress();
    const zrxSymbol: string = await zrxToken.symbol();

    // Deploy Order Book Dex
    const orderBookDex = await ethers.deployContract("OrderBookDex");
    await orderBookDex.waitForDeployment();
    const orderBookDexAddress = await orderBookDex.getAddress();

    // Add DAI and ZRX tokens
    await orderBookDex.addToken(ethers.encodeBytes32String(daiSymbol), daiAddress);
    await orderBookDex.addToken(ethers.encodeBytes32String(zrxSymbol), zrxAddress);

    const [owner, trader1, trader2, trader3, others] = await ethers.getSigners();

    // Set Up Quote Ticker
    await orderBookDex.connect(owner).setQuoteTicker(ethers.encodeBytes32String(daiSymbol));

    // Seed Traders Account
    await Promise.all(
        [owner, trader1, trader2, trader3].map(async trader => {
            await seedAccount(orderBookDex, [daiToken, zrxToken], trader)
        })
    );

    // Place Orders
    await orderBookDex.connect(trader1).placeOrder({
        ticker: ethers.encodeBytes32String(zrxSymbol),
        amount: ethers.parseUnits('1', 'ether'),
        price: 10,
        orderSide: ORDER_SIDE.BUY,
        orderType: ORDER_TYPE.LIMIT
    });

    await orderBookDex.connect(trader1).placeOrder({
        ticker: ethers.encodeBytes32String(zrxSymbol),
        amount: ethers.parseUnits('2', 'ether'),
        price: 20,
        orderSide: ORDER_SIDE.BUY,
        orderType: ORDER_TYPE.LIMIT
    });

    await orderBookDex.connect(trader2).placeOrder({
        ticker: ethers.encodeBytes32String(zrxSymbol),
        amount: ethers.parseUnits('3', 'ether'),
        price: 30,
        orderSide: ORDER_SIDE.SELL,
        orderType: ORDER_TYPE.LIMIT
    });

    await orderBookDex.connect(trader3).placeOrder({
        ticker: ethers.encodeBytes32String(zrxSymbol),
        amount: ethers.parseUnits('4', 'ether'),
        price: 40,
        orderSide: ORDER_SIDE.SELL,
        orderType: ORDER_TYPE.LIMIT
    });

    const adresses = {
        OBDex: orderBookDexAddress,
    }

    fs.writeFileSync(
        'client/src/contract-addresses.json', 
        JSON.stringify({ adresses }), 
        { flag: 'w' }
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
