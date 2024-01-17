import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { TestToken } from "../typechain-types";

describe('OBDex', () => {
    
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

    describe('Token Tests', () => {

        async function tokenFixture() {
            const orderBookDex = await deployOrderBookContract();
            const daiToken = await deployTokenTest("Dai Stable Coin", "DAI");
            const zrxToken = await deployTokenTest("Xero Token", "ZRX");

            const [owner, otherAccount] = await ethers.getSigners();

            const daiDetails = await getContractDetails(daiToken.contract);
            
            await orderBookDex
                .contract
                .connect(owner)
                .addToken(ethers.encodeBytes32String(daiDetails.symbol), daiDetails.address);

            return { orderBookDex, daiToken, zrxToken, owner, otherAccount };
        }
        
        it("Should Have Correct Tokens", async () => {
            const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
            const tokens = await orderBookDex.contract.getTokens();

            const daiDetails = await getContractDetails(daiToken.contract);

            expect(tokens.length).to.be.equals(1);
            // assert DAI Token that was add in the fixture
            expect(tokens[0].ticker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
            expect(tokens[0].tokenAddress).to.be.equals(daiDetails.address);
        });
        
        it("Should Add Token If Admin", async () => {
            const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
            
            const daiDetails = await getContractDetails(daiToken.contract);
            const zrxDetails = await getContractDetails(zrxToken.contract);
            
            await orderBookDex
                .contract
                .connect(owner)
                .addToken(ethers.encodeBytes32String(zrxDetails.symbol), zrxDetails.address);

            const tokens = await orderBookDex.contract.getTokens();

            expect(tokens.length).to.be.equals(2);
            // assert DAI Token that was add in the fixture
            expect(tokens[0].ticker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
            expect(tokens[0].tokenAddress).to.be.equals(daiDetails.address);
            // assert ZRX Token that was add in the the test
            expect(tokens[1].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
            expect(tokens[1].tokenAddress).to.be.equals(zrxDetails.address);
        });

        it("Should Have Correct Tickers", async () => {
            const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
            
            const daiDetails = await getContractDetails(daiToken.contract);
            const zrxDetails = await getContractDetails(zrxToken.contract);
            
            await orderBookDex
                .contract
                .connect(owner)
                .addToken(ethers.encodeBytes32String(zrxDetails.symbol), zrxDetails.address);

            const tickerList = await orderBookDex.contract.getTickerList();

            expect(tickerList.length).to.be.equals(2);
            expect(tickerList[0]).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
            expect(tickerList[1]).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        });

        it("Should NOT Add Token If NOT Admin", async () => {
            const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
            
            const zrxDetails = await getContractDetails(zrxToken.contract);
            
            await expect(
                orderBookDex
                    .contract
                    .connect(otherAccount)
                    .addToken(ethers.encodeBytes32String(zrxDetails.symbol), zrxDetails.address)
            ).to.be.revertedWith('Unauthorized!');
        });

        it("Should NOT Add Same Token Twice", async () => {
            const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
            
            const daiDetails = await getContractDetails(daiToken.contract);
            
            await expect(
                orderBookDex
                    .contract
                    .connect(owner)
                    .addToken(ethers.encodeBytes32String(daiDetails.symbol), daiDetails.address)
            ).to.be.revertedWith('Ticker Exists!');
        });
    }); 
});