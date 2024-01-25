import { ethers } from "hardhat";
import { TestToken } from "../typechain-types";

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

export {deployOrderBookContract, deployTokenTest, getContractDetails};