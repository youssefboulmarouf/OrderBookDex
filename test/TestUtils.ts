import { ethers } from "hardhat";
import { OrderBookDex, TestToken } from "../typechain-types";

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

export {
    deployOrderBookContract, 
    deployTokenTest, 
    getContractDetails, 
    seedTradersWallets,
    addToken
};