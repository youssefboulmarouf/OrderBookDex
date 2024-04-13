import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as testUtils from './TestUtils';
import { OrderBookDex } from "../typechain-types";

const ORDER_SIDE = {BUY: 0, SELL: 1};
const ORDER_TYPE = {MARKET: 0, LIMIT: 1};

describe('Limit Orders', () => {
    async function limitOrdersFixture() {
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

    it('Should Create BUY/SELL Limit Orders',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(limitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        await testUtils.setQuoteTicker(orderBookDex.contract, daiDetails.symbol);
        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '0.5', '0.5', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        let buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);

        expect(buyOrders.length).to.be.equals(1);

        await testUtils.assertOrder(buyOrders[0], 1, zrxDetails.symbol, '0.5', '0.5', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[0].fills.length).to.be.equals(0);

        let sellOrders = await orderBookDex.contract.getOrders(
            ethers.encodeBytes32String(zrxDetails.symbol),
            ORDER_SIDE.SELL
        );
        expect(sellOrders.length).to.be.equals(0);

        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '2', '2', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);

        expect(sellOrders.length).to.be.equals(1);

        await testUtils.assertOrder(sellOrders[0], 1, zrxDetails.symbol, '2', '2', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        expect(sellOrders[0].fills.length).to.be.equals(0);

        buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(1);

    });

    it('Should Sort Limit Orders By Price',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(limitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await testUtils.placeOrder(orderBookDex.contract, 3, zrxDetails.symbol, '0.5', '0.5', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '0.1', '0.1', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '0.2', '0.2', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
            
        const sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);

        expect(sellOrders.length).to.be.equals(3);
        
        await testUtils.assertOrder(sellOrders[0], 1, zrxDetails.symbol, '0.1', '0.1', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        expect(sellOrders[0].fills.length).to.be.equals(0);
        
        await testUtils.assertOrder(sellOrders[1], 2, zrxDetails.symbol, '0.2', '0.2', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        expect(sellOrders[1].fills.length).to.be.equals(0);

        await testUtils.assertOrder(sellOrders[2], 3, zrxDetails.symbol, '0.5', '0.5', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        expect(sellOrders[2].fills.length).to.be.equals(0);
    });

    it('Should Sort Limit Orders By Date When Same Price',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(limitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));
        
        await testUtils.placeOrder(orderBookDex.contract, 3, zrxDetails.symbol, '3', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '2', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
            
        const buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        
        expect(buyOrders.length).to.be.equals(4);
        
        await testUtils.assertOrder(buyOrders[0], 2, zrxDetails.symbol, '2', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[0].fills.length).to.be.equals(0);

        await testUtils.assertOrder(buyOrders[1], 1, zrxDetails.symbol, '1', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[1].fills.length).to.be.equals(0);

        await testUtils.assertOrder(buyOrders[2], 3, zrxDetails.symbol, '3', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[2].fills.length).to.be.equals(0);

        await testUtils.assertOrder(buyOrders[3], 1, zrxDetails.symbol, '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[3].fills.length).to.be.equals(0);
    });

    it('Should Create Limit Orders And Lock Correct Amount',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(limitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        const depositAmount = ethers.parseUnits('100', 'ether');

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        let amount = '2';
        let price = '3';

        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, amount, price, ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        let traderBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, daiDetails.symbol);

        const expectedLockedAmount = BigInt(ethers.parseUnits(amount, 'ether') * ethers.parseUnits(price, 'ether') / ethers.parseUnits('1', 'ether'))
        expect(traderBalance.free).to.be.equal(depositAmount - expectedLockedAmount);
        expect(traderBalance.locked).to.be.equal(expectedLockedAmount);

        amount = '3';
        price = '7';

        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, amount, price, ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        traderBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, zrxDetails.symbol);

        expect(traderBalance.free).to.be.equal(depositAmount - BigInt(ethers.parseUnits(amount, 'ether')));
        expect(traderBalance.locked).to.be.equal(ethers.parseUnits(amount, 'ether'));
    });

    it('Should NOT Create Limit Orders When Ticker Does Not Exist',async () => {
        const { orderBookDex } = await loadFixture(limitOrdersFixture);

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, 'Ticker', '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT)
        ).to.revertedWith('Ticker Does Not Exist!');
    });

    it('Should NOT Create Limit Orders When Token Disabled',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(limitOrdersFixture);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .disableTokenTrading(ethers.encodeBytes32String(zrxDetails.symbol));

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT)
        ).to.revertedWith('Token Disabled!');
    });

    it('Should NOT Create Limit Orders When Quote Ticker Undefined',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(limitOrdersFixture);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT)
        ).to.revertedWith('Quote Ticker Undefined!');
    });

    it('Should NOT Create Limit Orders When Trading Quote Ticker',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(limitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);

        const [owner] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, daiDetails.symbol, '1', '1', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT)
        ).to.revertedWith('Quote Ticker!');
    });

    it('Should NOT Create SELL Limit Orders When Low Token Balance',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(limitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1000', '1', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT)
        ).to.revertedWith('Low Token Balance!');
    });

    it('Should NOT Create BUY Limit Orders When Low Quote Ticker Balance',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(limitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await expect(
            testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1000', '1000', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT)
        ).to.revertedWith('Low Quote Balance!');
    });
});

describe('Match Limit Orders', () => {
    async function matchLimitOrdersFixture() {
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

        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '2', '10', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT)
        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '2', '9', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT)
        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '2', '8', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT)
        
        return { orderBookDex, daiToken, zrxToken };
    }

    it('Should Create BUY Limit Orders And Match With Best Price',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(matchLimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3] = await ethers.getSigners();

        // Even if the buy order here is limit order with price of '9 DAI', 
        // the DEX should guarentee the best price for the order,
        // which is the sell limit with price of '8 DAI'.
        await testUtils.placeOrder(orderBookDex.contract, 3, zrxDetails.symbol, '3', '9', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        
        // At a first glance, the order to buy '3 ZRX' with '9 DAI' each, with total `27 DAI`
        // but since, the DEX guarentees the best price, it will match with the sell order with `8 DAI` then `9 DAI`
        // which will cost only '25 DAI'
        const trader3DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, daiDetails.symbol);
        expect(trader3DaiBalance.free).to.be.equal(ethers.parseUnits('75', 'ether'));
        expect(trader3DaiBalance.locked).to.be.equal('0');

        const trader3ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, zrxDetails.symbol);
        expect(trader3ZrxBalance.free).to.be.equal(ethers.parseUnits('103', 'ether'));
        expect(trader3ZrxBalance.locked).to.be.equal('0');

        // Trader2 will have `3 ZRX` less  for the price of `25 DAI` paied by Trader3
        const trader2DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, daiDetails.symbol);
        expect(trader2DaiBalance.free).to.be.equal(ethers.parseUnits('125', 'ether'));
        expect(trader2DaiBalance.locked).to.be.equal('0');

        const trader2ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, zrxDetails.symbol);
        expect(trader2ZrxBalance.free).to.be.equal(ethers.parseUnits('94', 'ether'));
        expect(trader2ZrxBalance.locked).to.be.equal(ethers.parseUnits('3', 'ether'));

        const sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders.length).to.be.equals(2);

        await testUtils.assertOrder(sellOrders[0], 2, zrxDetails.symbol, '2', '9', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        expect(sellOrders[0].fills.length).to.be.equals(1);
        expect(sellOrders[0].fills[0]).to.be.equals(ethers.parseUnits('1', 'ether'));

        await testUtils.assertOrder(sellOrders[1], 2, zrxDetails.symbol, '2', '10', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        expect(sellOrders[1].fills.length).to.be.equals(0);
    });

    it('Should Create SELL Limit Orders And Match With Best Price',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(matchLimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3] = await ethers.getSigners();

        // Even if the sell order here is limit order with price of '2 DAI', 
        // the DEX should guarentee the best price for the order,
        // which is the buy limit with price of '3 DAI'.
        await testUtils.placeOrder(orderBookDex.contract, 3, zrxDetails.symbol, '8', '2', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        
        // At a first glance, the order to sell '8 ZRX' with '2 DAI' each, with total `16 DAI`
        // but since, the DEX guarentees the best price, it will match with the buy order with `5 DAI` then `2 DAI`
        // which will cost '21 DAI'
        const trader3DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, daiDetails.symbol);
        expect(trader3DaiBalance.free).to.be.equal(ethers.parseUnits('121', 'ether'));
        expect(trader3DaiBalance.locked).to.be.equal('0');

        const trader3ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader3.address, zrxDetails.symbol);
        expect(trader3ZrxBalance.free).to.be.equal(ethers.parseUnits('92', 'ether'));
        expect(trader3ZrxBalance.locked).to.be.equal('0');

        // Trader1 will have `21 DAI` less for the price of `8 ZRX` bought
        const trader1DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, daiDetails.symbol);
        expect(trader1DaiBalance.free).to.be.equal(ethers.parseUnits('70', 'ether'));
        expect(trader1DaiBalance.locked).to.be.equal(ethers.parseUnits('9', 'ether'));

        const trader1ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, zrxDetails.symbol);
        expect(trader1ZrxBalance.free).to.be.equal(ethers.parseUnits('108', 'ether'));
        expect(trader1ZrxBalance.locked).to.be.equal('0', 'ether');

        const buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        
        await testUtils.assertOrder(buyOrders[0], 1, zrxDetails.symbol, '5', '2', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[0].fills.length).to.be.equals(1);
        expect(buyOrders[0].fills[0]).to.be.equals(ethers.parseUnits('3', 'ether'));

        await testUtils.assertOrder(buyOrders[1], 1, zrxDetails.symbol, '5', '1', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        expect(buyOrders[1].fills.length).to.be.equals(0);
    });
});

describe('Cancel Limit Orders', () => {
    async function cancelLimitOrdersFixture() {
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

        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '5', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);
        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '2', '8', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        
        return { orderBookDex, daiToken, zrxToken };
    }

    it('Should Cancel BUY Limit Order',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(cancelLimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        let buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(1);
        await testUtils.assertOrder(buyOrders[0], 1, zrxDetails.symbol, '5', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);

        let trader1DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, daiDetails.symbol);
        expect(trader1DaiBalance.free).to.be.equal(ethers.parseUnits('85', 'ether'));
        expect(trader1DaiBalance.locked).to.be.equal(ethers.parseUnits('15', 'ether'));

        await orderBookDex
            .contract
            .connect(trader1)
            .cancelOrder(buyOrders[0].ticker, buyOrders[0].id, ORDER_SIDE.BUY);
        
        buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(0);

        trader1DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, daiDetails.symbol);
        expect(trader1DaiBalance.free).to.be.equal(ethers.parseUnits('100', 'ether'));
        expect(trader1DaiBalance.locked).to.be.equal('0');

    });

    it('Should Cancel SELL Limit Order',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(cancelLimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2] = await ethers.getSigners();

        let sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders.length).to.be.equals(1);
        await testUtils.assertOrder(sellOrders[0], 2, zrxDetails.symbol, '2', '8', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);

        let trader2ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, zrxDetails.symbol);
        expect(trader2ZrxBalance.free).to.be.equal(ethers.parseUnits('98', 'ether'));
        expect(trader2ZrxBalance.locked).to.be.equal(ethers.parseUnits('2', 'ether'));

        await orderBookDex
            .contract
            .connect(trader2)
            .cancelOrder(sellOrders[0].ticker, sellOrders[0].id, ORDER_SIDE.SELL);
        
        sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders.length).to.be.equals(0);

        trader2ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, zrxDetails.symbol);
        expect(trader2ZrxBalance.free).to.be.equal(ethers.parseUnits('100', 'ether'));
        expect(trader2ZrxBalance.locked).to.be.equal('0');

    });

    it('Should Cancel BUY Limit Order When Partially Matched',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(cancelLimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2] = await ethers.getSigners();

        let buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(1);
        await testUtils.assertOrder(buyOrders[0], 1, zrxDetails.symbol, '5', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);

        let trader1DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, daiDetails.symbol);
        expect(trader1DaiBalance.free).to.be.equal(ethers.parseUnits('85', 'ether'));
        expect(trader1DaiBalance.locked).to.be.equal(ethers.parseUnits('15', 'ether'));

        await testUtils.placeOrder(orderBookDex.contract, 2, zrxDetails.symbol, '2', '3', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);
        
        buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders[0].fills.length).to.be.equals(1);
        expect(buyOrders[0].fills[0]).to.be.equals(ethers.parseUnits('2', 'ether'));

        trader1DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, daiDetails.symbol);
        expect(trader1DaiBalance.free).to.be.equal(ethers.parseUnits('85', 'ether'));
        expect(trader1DaiBalance.locked).to.be.equal(ethers.parseUnits('9', 'ether'));

        const trader1ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, zrxDetails.symbol);
        expect(trader1ZrxBalance.free).to.be.equal(ethers.parseUnits('102', 'ether'));
        expect(trader1ZrxBalance.locked).to.be.equal('0');

        await orderBookDex
            .contract
            .connect(trader1)
            .cancelOrder(buyOrders[0].ticker, buyOrders[0].id, ORDER_SIDE.BUY);
        
        buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(0);

        trader1DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader1.address, daiDetails.symbol);
        expect(trader1DaiBalance.free).to.be.equal(ethers.parseUnits('94', 'ether'));
        expect(trader1DaiBalance.locked).to.be.equal('0');

    });

    it('Should Cancel SELL Limit Order When Partially Matched',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(cancelLimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2] = await ethers.getSigners();

        let sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders.length).to.be.equals(1);
        await testUtils.assertOrder(sellOrders[0], 2, zrxDetails.symbol, '2', '8', ORDER_SIDE.SELL, ORDER_TYPE.LIMIT);

        let trader2ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, zrxDetails.symbol);
        expect(trader2ZrxBalance.free).to.be.equal(ethers.parseUnits('98', 'ether'));
        expect(trader2ZrxBalance.locked).to.be.equal(ethers.parseUnits('2', 'ether'));

        await testUtils.placeOrder(orderBookDex.contract, 1, zrxDetails.symbol, '1', '10', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);

        sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders[0].fills.length).to.be.equals(1);
        expect(sellOrders[0].fills[0]).to.be.equals(ethers.parseUnits('1', 'ether'));

        const trader2DaiBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, daiDetails.symbol);
        expect(trader2DaiBalance.free).to.be.equal(ethers.parseUnits('108', 'ether'));
        expect(trader2DaiBalance.locked).to.be.equal('0');

        await orderBookDex
            .contract
            .connect(trader2)
            .cancelOrder(sellOrders[0].ticker, sellOrders[0].id, ORDER_SIDE.SELL);
        
        sellOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.SELL);
        expect(sellOrders.length).to.be.equals(0);

        trader2ZrxBalance = await testUtils.getBalance(orderBookDex.contract, trader2.address, zrxDetails.symbol);
        expect(trader2ZrxBalance.free).to.be.equal(ethers.parseUnits('99', 'ether'));
        expect(trader2ZrxBalance.locked).to.be.equal('0');

    });

    it('Should NOT Cancel Limit Order If NOT Order Owner',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(cancelLimitOrdersFixture);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner] = await ethers.getSigners();

        const buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);
        expect(buyOrders.length).to.be.equals(1);
        await testUtils.assertOrder(buyOrders[0], 1, zrxDetails.symbol, '5', '3', ORDER_SIDE.BUY, ORDER_TYPE.LIMIT);

        await expect(
            orderBookDex
                .contract
                .connect(owner)
                .cancelOrder(buyOrders[0].ticker, buyOrders[0].id, ORDER_SIDE.BUY)
        ).to.be.revertedWith('Unauthorized!');
    });

    it('Should NOT Cancel Limit Order If Order NOT Found',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(cancelLimitOrdersFixture);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner] = await ethers.getSigners();
        const buyOrders = await testUtils.getOrders(orderBookDex.contract, zrxDetails.symbol, ORDER_SIDE.BUY);

        await expect(
            orderBookDex
                .contract
                .connect(owner)
                .cancelOrder(buyOrders[0].ticker, 500, ORDER_SIDE.BUY)
        ).to.be.revertedWith('Order Not Found!');
    });

    it('Should NOT Cancel Limit Order If Token does NOT Exist',async () => {
        const { orderBookDex } = await loadFixture(cancelLimitOrdersFixture);
        const [owner] = await ethers.getSigners();

        await expect(
            orderBookDex
                .contract
                .connect(owner)
                .cancelOrder(ethers.encodeBytes32String('Token Does Not Exist'), 1, ORDER_SIDE.BUY)
        ).to.be.revertedWith('Ticker Does Not Exist!');
    });
    
});