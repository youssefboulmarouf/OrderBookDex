import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as testUtils from './TestUtils';

describe('Token Tests', () => {
    async function tokenFixture() {
        const orderBookDex = await testUtils.deployOrderBookContract();
        const daiToken = await testUtils.deployTokenTest("Dai Stable Coin", "DAI");
        const zrxToken = await testUtils.deployTokenTest("Xero Token", "ZRX");

        const [owner, otherAccount] = await ethers.getSigners();

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        
        // Add DAI tokken to OBDEX
        await orderBookDex
            .contract
            .connect(owner)
            .addToken(ethers.encodeBytes32String(daiDetails.symbol), daiDetails.address);

        return { orderBookDex, daiToken, zrxToken, owner, otherAccount };
    }
    
    it('Should Have Correct Tokens', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
        const tokens = await orderBookDex.contract.getTokens();

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);

        expect(tokens.length).to.be.equals(1);
        // assert DAI Token that was add in the fixture
        expect(tokens[0].ticker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
        expect(tokens[0].tokenAddress).to.be.equals(daiDetails.address);
        expect(tokens[0].isTradable).to.be.equals(true);
    });
    
    it('Should Add Token If Admin', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
        
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);
        
        await orderBookDex
            .contract
            .connect(owner)
            .addToken(
                ethers.encodeBytes32String(zrxDetails.symbol), 
                zrxDetails.address
            );

        const tokens = await orderBookDex.contract.getTokens();

        expect(tokens.length).to.be.equals(2);
        // assert DAI Token that was add in the fixture
        expect(tokens[0].ticker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
        expect(tokens[0].tokenAddress).to.be.equals(daiDetails.address);
        expect(tokens[0].isTradable).to.be.equals(true);
        // assert ZRX Token that was add in the the test
        expect(tokens[1].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        expect(tokens[1].tokenAddress).to.be.equals(zrxDetails.address);
        expect(tokens[1].isTradable).to.be.equals(true);
    });

    it('Should Add Quote Token If Admin', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
        
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        
        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(
                ethers.encodeBytes32String(daiDetails.symbol)
            );

        const quoteTicker = await orderBookDex.contract.quoteTicker();

        expect(quoteTicker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
    });

    it('Should Disable & Enable Token If Admin', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);

        await orderBookDex
            .contract
            .connect(owner)
            .disableTokenTrading(ethers.encodeBytes32String(daiDetails.symbol));

        let tokens = await orderBookDex.contract.getTokens();

        expect(tokens.length).to.be.equals(1);
        // assert DAI Token that was add in the fixture
        expect(tokens[0].ticker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
        expect(tokens[0].tokenAddress).to.be.equals(daiDetails.address);
        expect(tokens[0].isTradable).to.be.equals(false);

        await orderBookDex
            .contract
            .connect(owner)
            .enableTokenTrading(ethers.encodeBytes32String(daiDetails.symbol));

        tokens = await orderBookDex.contract.getTokens();

        expect(tokens.length).to.be.equals(1);
        // assert DAI Token that was add in the fixture
        expect(tokens[0].ticker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
        expect(tokens[0].tokenAddress).to.be.equals(daiDetails.address);
        expect(tokens[0].isTradable).to.be.equals(true);
    });

    it('Should Have Correct Tickers', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
        
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);
        
        await orderBookDex
            .contract
            .connect(owner)
            .addToken(ethers.encodeBytes32String(zrxDetails.symbol), zrxDetails.address);

        const tickerList = await orderBookDex.contract.getTickerList();

        expect(tickerList.length).to.be.equals(2);
        expect(tickerList[0]).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
        expect(tickerList[1]).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
    });

    it('Should NOT Add Quote Token If NOT Admin', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
        
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        
        await expect(
            orderBookDex
                .contract
                .connect(otherAccount)
                .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol))
            ).to.be.revertedWith('Unauthorized!');
    });

    it('Should NOT Add Quote Token If Defined', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
        
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        
        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(
                ethers.encodeBytes32String(daiDetails.symbol)
            );

        const quoteTicker = await orderBookDex.contract.quoteTicker();

        expect(quoteTicker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));

        await expect(
            orderBookDex
                .contract
                .connect(owner)
                .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol))
            ).to.be.revertedWith('Quote Ticker Defined!');
    });

    it('Should NOT Disable Token If Already Disabled', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);

        await orderBookDex
            .contract
            .connect(owner)
            .disableTokenTrading(ethers.encodeBytes32String(daiDetails.symbol));

        let tokens = await orderBookDex.contract.getTokens();

        expect(tokens.length).to.be.equals(1);
        // assert DAI Token that was add in the fixture
        expect(tokens[0].ticker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
        expect(tokens[0].tokenAddress).to.be.equals(daiDetails.address);
        expect(tokens[0].isTradable).to.be.equals(false);

        await expect(
            orderBookDex
                .contract
                .connect(owner)
                .disableTokenTrading(ethers.encodeBytes32String(daiDetails.symbol))
        ).to.be.revertedWith('Token Disabled!');
    });

    it('Should NOT Disable Token If Quote Token', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(
                ethers.encodeBytes32String(daiDetails.symbol)
            );

        await expect(
            orderBookDex
                .contract
                .connect(owner)
                .disableTokenTrading(ethers.encodeBytes32String(daiDetails.symbol))
        ).to.be.revertedWith('Quote Ticker!');
    });

    it('Should NOT Enable Token If Already Enabled', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);

        await expect(
            orderBookDex
                .contract
                .connect(owner)
                .enableTokenTrading(ethers.encodeBytes32String(daiDetails.symbol))
        ).to.be.revertedWith('Token Enabled!');
    });

    it('Should NOT Enable Or Disable Token If NOT Admin', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);

        await expect(
            orderBookDex
                .contract
                .connect(otherAccount)
                .enableTokenTrading(ethers.encodeBytes32String(daiDetails.symbol))
        ).to.be.revertedWith('Unauthorized!');

        await expect(
            orderBookDex
                .contract
                .connect(otherAccount)
                .disableTokenTrading(ethers.encodeBytes32String(daiDetails.symbol))
        ).to.be.revertedWith('Unauthorized!');
    });

    it('Should NOT Add Token If NOT Admin', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
        
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);
        
        await expect(
            orderBookDex
                .contract
                .connect(otherAccount)
                .addToken(ethers.encodeBytes32String(zrxDetails.symbol), zrxDetails.address)
        ).to.be.revertedWith('Unauthorized!');
    });

    it('Should NOT Add Same Token Twice', async () => {
        const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
        
        const 
        daiDetails = await testUtils.getContractDetails(daiToken.contract);
        
        await expect(
            orderBookDex
                .contract
                .connect(owner)
                .addToken(ethers.encodeBytes32String(daiDetails.symbol), daiDetails.address)
        ).to.be.revertedWith('Ticker Exists!');
    });
}); 
