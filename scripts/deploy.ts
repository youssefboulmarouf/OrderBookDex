import { ethers } from "hardhat";
import fs from 'fs';
import { OrderBookDex, TestToken } from "../typechain-types";
import { Signer } from "ethers";

const deployToken = async (name: string, symbol: string): Promise<TestToken> => {
    const token = await ethers.deployContract("TestToken", [name, symbol])
    await token.waitForDeployment();
    return token;
}

const seedAccount = async (orderBookDex: OrderBookDex, tokens: TestToken[], trader: Signer) => {
    tokens.map(async token => {
        const amountToMint =  ethers.parseUnits('1000', 'ether');

        await token.faucet(trader, amountToMint);
        const orderBookDexAddress = await orderBookDex.getAddress();
        await token.connect(trader).approve(orderBookDexAddress, amountToMint);

        const tokenName = await token.symbol();
        const ticker = ethers.encodeBytes32String(tokenName);

        const amountToDeposit =  ethers.parseUnits('250', 'ether');
        await orderBookDex.connect(trader).deposit(ticker, amountToDeposit);
    });
}

async function main() {
    // Deploy DAI Token
    const daiToken: TestToken = await deployToken('Dai Stable Coin', 'DAI');
    const daiAddress = await daiToken.getAddress();

    // Deploy ZRX Token
    const zrxToken: TestToken = await deployToken('Xero Token', 'ZRX');
    const zrxAddress = await zrxToken.getAddress();

    // Deploy Order Book Dex
    const orderBookDex = await ethers.deployContract("OrderBookDex");
    await orderBookDex.waitForDeployment();
    const orderBookDexAddress = await orderBookDex.getAddress();

    // Add DAI and ZRX tokens
    await orderBookDex.addToken(ethers.encodeBytes32String('DAI'), daiAddress);
    await orderBookDex.addToken(ethers.encodeBytes32String('ZRX'), zrxAddress);

    const [owner, trader, others] = await ethers.getSigners();

    await seedAccount(orderBookDex, [daiToken, zrxToken], owner);
    await seedAccount(orderBookDex, [daiToken, zrxToken], trader);

    const adresses = {
        OBDex: orderBookDexAddress,
        dai: daiAddress,
        zrx: zrxAddress
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
