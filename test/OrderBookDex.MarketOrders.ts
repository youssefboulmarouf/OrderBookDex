import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as testUtils from './TestUtils';

const ORDER_SIDE = {BUY: 0, SELL: 1};
const ORDER_TYPE = {MARKET: 0, LIMIT: 1};

describe('Market Orders', () => {
    async function marketOrdersFixture() {
        const orderBookDex = await testUtils.deployOrderBookContract();
        const daiToken = await testUtils.deployTokenTest("Dai Stable Coin", "DAI");
        const zrxToken = await testUtils.deployTokenTest("Xero Coin", "ZRX");

        await testUtils.addToken(orderBookDex.contract, daiToken.contract);
        await testUtils.addToken(orderBookDex.contract, zrxToken.contract);
        
        await testUtils.seedTradersWallets(
            orderBookDex.contract, 
            daiToken.contract,
            ethers.parseUnits('100', 'ether')
        );
        
        await testUtils.seedTradersWallets(
            orderBookDex.contract, 
            zrxToken.contract,
            ethers.parseUnits('100', 'ether')
        );
        
        return { orderBookDex, daiToken, zrxToken };
    }

    it('Should NOT Create Market Orders When Ticker Does Not Exist',async () => {
        const { orderBookDex } = await loadFixture(marketOrdersFixture);

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, 'Ticker', '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.MARKET)
        ).to.revertedWith('Ticker Does Not Exist!');
    });

    it('Should NOT Create Market Orders When Token Disabled',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(marketOrdersFixture);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .disableTokenTrading(ethers.encodeBytes32String(zrxDetails.symbol));

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.MARKET)
        ).to.revertedWith('Token Disabled!');
    });

    it('Should NOT Create Market Orders When Quote Ticker Undefined',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(marketOrdersFixture);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.MARKET)
        ).to.revertedWith('Quote Ticker Undefined!');
    });

    it('Should NOT Create Market Orders When Trading Quote Ticker',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(marketOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);

        const [owner] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, daiDetails.symbol, '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.MARKET)
        ).to.revertedWith('Quote Ticker!');
    });

    it('Should NOT Create Market Orders When Empty Order Book',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(marketOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1', '1', ORDER_SIDE.SELL, ORDER_TYPE.MARKET)
        ).to.revertedWith('Empty Order Book!');
    });
});

describe('Match Market Orders', () => {
    async function matchMarketOrdersFixture() {
        const orderBookDex = await testUtils.deployOrderBookContract();
        
        const daiToken = await testUtils.deployTokenTest("Dai Stable Coin", "DAI");
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        
        const zrxToken = await testUtils.deployTokenTest("Xero Coin", "ZRX");
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        await testUtils.addToken(orderBookDex.contract, daiToken.contract);
        await testUtils.addToken(orderBookDex.contract, zrxToken.contract);
        
        await testUtils.seedTradersWallets(
            orderBookDex.contract, 
            daiToken.contract,
            ethers.parseUnits('100', 'ether')
        );
        
        await testUtils.seedTradersWallets(
            orderBookDex.contract, 
            zrxToken.contract,
            ethers.parseUnits('100', 'ether')
        );

        await testUtils.setQuoteTicker(orderBookDex.contract, daiDetails.symbol);

        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '5', '1', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '5', '2', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '5', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);

        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '2', '10', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '2', '9', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '2', '8', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        
        return { orderBookDex, daiToken, zrxToken };
    }

    it('Should Create SELL Market Orders And Match With Best Price',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(matchMarketOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3] = await ethers.getSigners();

        await testUtils.placeOrder(orderBookDex.contract, 3, zrxDetails.symbol, '1', '0', ORDER_SIDE.SELL, ORDER_TYPE.MARKET);

        const sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders.length).to.be.equals(3);

        const buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(3);
        
        await testUtils.assertOrder(buyOrders[0], 1, zrxDetails.symbol, '5', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[0].fills.length).to.be.equals(1);
        expect(buyOrders[0].fills[0]).to.be.equals(ethers.parseUnits('1', 'ether'));

        await testUtils.assertOrder(buyOrders[1], 1, zrxDetails.symbol, '5', '2', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[1].fills.length).to.be.equals(0);

        await testUtils.assertOrder(buyOrders[2], 1, zrxDetails.symbol, '5', '1', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[2].fills.length).to.be.equals(0);
        
        const trader3DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, daiDetails.symbol);
        expect(trader3DaiBalance.free).to.be.equal(ethers.parseUnits('103', 'ether'));
        expect(trader3DaiBalance.locked).to.be.equal('0');

        const trader3ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, zrxDetails.symbol);
        expect(trader3ZrxBalance.free).to.be.equal(ethers.parseUnits('99', 'ether'));
        expect(trader3ZrxBalance.locked).to.be.equal('0');

        const trader1DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, daiDetails.symbol);
        expect(trader1DaiBalance.free).to.be.equal(ethers.parseUnits('70', 'ether')); // The remaining free amount after creating the 3 buy orders
        expect(trader1DaiBalance.locked).to.be.equal(ethers.parseUnits('27', 'ether')); // The remaining locked amount after matching with one order

        const trader1ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, zrxDetails.symbol);
        expect(trader1ZrxBalance.free).to.be.equal(ethers.parseUnits('101', 'ether'));
        expect(trader1ZrxBalance.locked).to.be.equal('0');
    });

    it('Should Create SELL Market Orders With Greater Weight And Match With Best Price',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(matchMarketOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3] = await ethers.getSigners();

        await testUtils.placeOrder(orderBookDex.contract, 3, zrxDetails.symbol, '20', '0', ORDER_SIDE.SELL, ORDER_TYPE.MARKET);
        
        const buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(0);
        
        const sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders.length).to.be.equals(3);
        
        const trader3DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, daiDetails.symbol);
        expect(trader3DaiBalance.free).to.be.equal(ethers.parseUnits('130', 'ether'));
        expect(trader3DaiBalance.locked).to.be.equal('0');

        const trader3ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, zrxDetails.symbol);
        expect(trader3ZrxBalance.free).to.be.equal(ethers.parseUnits('85', 'ether'));
        expect(trader3ZrxBalance.locked).to.be.equal('0');

        const trader1DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, daiDetails.symbol);
        expect(trader1DaiBalance.free).to.be.equal(ethers.parseUnits('70', 'ether'));
        expect(trader1DaiBalance.locked).to.be.equal('0');

        const trader1ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, zrxDetails.symbol);
        expect(trader1ZrxBalance.free).to.be.equal(ethers.parseUnits('115', 'ether'));
        expect(trader1ZrxBalance.locked).to.be.equal('0');
    });

    it('Should Create BUY Market Orders And Match With Best Price',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(matchMarketOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3] = await ethers.getSigners();

        await testUtils.placeOrder(orderBookDex.contract, 3, zrxDetails.symbol, '1', '0', ORDER_SIDE.BUY, ORDER_TYPE.MARKET);

        const sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders.length).to.be.equals(3);

        const buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(3);
        
        await testUtils.assertOrder(sellOrders[0], 2, zrxDetails.symbol, '2', '8', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        expect(sellOrders[0].fills.length).to.be.equals(1);
        expect(sellOrders[0].fills[0]).to.be.equals(ethers.parseUnits('1', 'ether'));

        await testUtils.assertOrder(sellOrders[1], 2, zrxDetails.symbol, '2', '9', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        expect(sellOrders[1].fills.length).to.be.equals(0);

        await testUtils.assertOrder(sellOrders[2], 2, zrxDetails.symbol, '2', '10', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        expect(sellOrders[2].fills.length).to.be.equals(0);
        
        const trader3DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, daiDetails.symbol);
        expect(trader3DaiBalance.free).to.be.equal(ethers.parseUnits('92', 'ether'));
        expect(trader3DaiBalance.locked).to.be.equal('0');

        const trader3ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, zrxDetails.symbol);
        expect(trader3ZrxBalance.free).to.be.equal(ethers.parseUnits('101', 'ether'));
        expect(trader3ZrxBalance.locked).to.be.equal('0');

        const trader2DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, daiDetails.symbol);
        expect(trader2DaiBalance.free).to.be.equal(ethers.parseUnits('108', 'ether'));
        expect(trader2DaiBalance.locked).to.be.equal('0');

        const trader2ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, zrxDetails.symbol);
        expect(trader2ZrxBalance.free).to.be.equal(ethers.parseUnits('94', 'ether'));
        expect(trader2ZrxBalance.locked).to.be.equal(ethers.parseUnits('5', 'ether'));
    });

    it('Should Create BUY Market Orders With Greater Weight And Match With Best Price',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(matchMarketOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3] = await ethers.getSigners();

        await testUtils.placeOrder(orderBookDex.contract, 3, zrxDetails.symbol, '20', '0', ORDER_SIDE.BUY, ORDER_TYPE.MARKET);
        
        const buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(3);
        
        const sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders.length).to.be.equals(0);
        
        const trader3DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, daiDetails.symbol);
        expect(trader3DaiBalance.free).to.be.equal(ethers.parseUnits('46', 'ether'));
        expect(trader3DaiBalance.locked).to.be.equal('0');

        const trader3ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, zrxDetails.symbol);
        expect(trader3ZrxBalance.free).to.be.equal(ethers.parseUnits('106', 'ether'));
        expect(trader3ZrxBalance.locked).to.be.equal('0');

        const trader2DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, daiDetails.symbol);
        expect(trader2DaiBalance.free).to.be.equal(ethers.parseUnits('154', 'ether'));
        expect(trader2DaiBalance.locked).to.be.equal('0');

        const trader2ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, zrxDetails.symbol);
        expect(trader2ZrxBalance.free).to.be.equal(ethers.parseUnits('94', 'ether'));
        expect(trader2ZrxBalance.locked).to.be.equal('0');
    });
    
});