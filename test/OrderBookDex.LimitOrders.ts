import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as testUtils from './TestUtils';

describe('Limit ORders', () => {

    const ORDER_SIDE = {BUY: 0, SELL: 1};
    const ORDER_TYPE = {MARKET: 0, LIMIT: 1};

    async function LimitOrdersFixture() {
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
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(LimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await orderBookDex
            .contract
            .connect(trader1)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: 1,
                price: 1,
                orderSide: ORDER_SIDE.BUY,
                orderType: ORDER_TYPE.LIMIT
            });
            
        let buyOrders = await orderBookDex.contract.getOrders(
            ethers.encodeBytes32String(zrxDetails.symbol),
            ORDER_SIDE.BUY
        );
        expect(buyOrders.length).to.be.equals(1);
        expect(buyOrders[0].traderAddress).to.be.equals(trader1.address);
        expect(buyOrders[0].orderSide).to.be.equals(ORDER_SIDE.BUY);
        expect(buyOrders[0].orderType).to.be.equals(ORDER_TYPE.LIMIT);
        expect(buyOrders[0].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        expect(buyOrders[0].amount).to.be.equals(1);
        expect(buyOrders[0].fills.length).to.be.equals(0);
        expect(buyOrders[0].price).to.be.equals(1);

        let sellOrders = await orderBookDex.contract.getOrders(
            ethers.encodeBytes32String(zrxDetails.symbol),
            ORDER_SIDE.SELL
        );
        expect(sellOrders.length).to.be.equals(0);

        await orderBookDex
            .contract
            .connect(trader1)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: 2,
                price: 2,
                orderSide: ORDER_SIDE.SELL,
                orderType: ORDER_TYPE.LIMIT
            });
        
        sellOrders = await orderBookDex.contract.getOrders(
            ethers.encodeBytes32String(zrxDetails.symbol),
            ORDER_SIDE.SELL
        );

        expect(sellOrders.length).to.be.equals(1);
        expect(sellOrders[0].traderAddress).to.be.equals(trader1.address);
        expect(sellOrders[0].orderSide).to.be.equals(ORDER_SIDE.SELL);
        expect(sellOrders[0].orderType).to.be.equals(ORDER_TYPE.LIMIT);
        expect(sellOrders[0].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        expect(sellOrders[0].amount).to.be.equals(2);
        expect(sellOrders[0].fills.length).to.be.equals(0);
        expect(sellOrders[0].price).to.be.equals(2);

        buyOrders = await orderBookDex.contract.getOrders(
            ethers.encodeBytes32String(zrxDetails.symbol),
            ORDER_SIDE.BUY
        );
        expect(buyOrders.length).to.be.equals(1);

    });

    it('Should Create SELL Limit Orders And Sort Then',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(LimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await orderBookDex
            .contract
            .connect(trader3)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: 3,
                price: 3,
                orderSide: ORDER_SIDE.SELL,
                orderType: ORDER_TYPE.LIMIT
            });
        
        await orderBookDex
            .contract
            .connect(trader1)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: 1,
                price: 1,
                orderSide: ORDER_SIDE.SELL,
                orderType: ORDER_TYPE.LIMIT
            });

        await orderBookDex
            .contract
            .connect(trader2)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: 2,
                price: 2,
                orderSide: ORDER_SIDE.SELL,
                orderType: ORDER_TYPE.LIMIT
            });
            
        const sellOrders = await orderBookDex.contract.getOrders(
            ethers.encodeBytes32String(zrxDetails.symbol),
            ORDER_SIDE.SELL
        );

        expect(sellOrders.length).to.be.equals(3);
        
        expect(sellOrders[0].traderAddress).to.be.equals(trader1.address);
        expect(sellOrders[0].orderSide).to.be.equals(ORDER_SIDE.SELL);
        expect(sellOrders[0].orderType).to.be.equals(ORDER_TYPE.LIMIT);
        expect(sellOrders[0].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        expect(sellOrders[0].amount).to.be.equals(1);
        expect(sellOrders[0].fills.length).to.be.equals(0);
        expect(sellOrders[0].price).to.be.equals(1);
        
        expect(sellOrders[1].traderAddress).to.be.equals(trader2.address);
        expect(sellOrders[1].orderSide).to.be.equals(ORDER_SIDE.SELL);
        expect(sellOrders[1].orderType).to.be.equals(ORDER_TYPE.LIMIT);
        expect(sellOrders[1].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        expect(sellOrders[1].amount).to.be.equals(2);
        expect(sellOrders[1].fills.length).to.be.equals(0);
        expect(sellOrders[1].price).to.be.equals(2);

        expect(sellOrders[2].traderAddress).to.be.equals(trader3.address);
        expect(sellOrders[2].orderSide).to.be.equals(ORDER_SIDE.SELL);
        expect(sellOrders[2].orderType).to.be.equals(ORDER_TYPE.LIMIT);
        expect(sellOrders[2].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        expect(sellOrders[2].amount).to.be.equals(3);
        expect(sellOrders[2].fills.length).to.be.equals(0);
        expect(sellOrders[2].price).to.be.equals(3);
    });

    it('Should Create BUY Limit Orders And Sort Then',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(LimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await orderBookDex
            .contract
            .connect(trader3)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: 3,
                price: 3,
                orderSide: ORDER_SIDE.BUY,
                orderType: ORDER_TYPE.LIMIT
            });
        
        await orderBookDex
            .contract
            .connect(trader1)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: 1,
                price: 1,
                orderSide: ORDER_SIDE.BUY,
                orderType: ORDER_TYPE.LIMIT
            });
            
        await orderBookDex
            .contract
            .connect(trader2)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: 2,
                price: 2,
                orderSide: ORDER_SIDE.BUY,
                orderType: ORDER_TYPE.LIMIT
            });
            
        const buyOrders = await orderBookDex.contract.getOrders(
            ethers.encodeBytes32String(zrxDetails.symbol),
            ORDER_SIDE.BUY
        );
        
        expect(buyOrders.length).to.be.equals(3);
        
        expect(buyOrders[0].traderAddress).to.be.equals(trader3.address);
        expect(buyOrders[0].orderSide).to.be.equals(ORDER_SIDE.BUY);
        expect(buyOrders[0].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        expect(buyOrders[0].amount).to.be.equals(3);
        expect(buyOrders[0].fills.length).to.be.equals(0);
        expect(buyOrders[0].price).to.be.equals(3);
        
        expect(buyOrders[1].traderAddress).to.be.equals(trader2.address);
        expect(buyOrders[1].orderSide).to.be.equals(ORDER_SIDE.BUY);
        expect(buyOrders[1].orderType).to.be.equals(ORDER_TYPE.LIMIT);
        expect(buyOrders[1].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        expect(buyOrders[1].amount).to.be.equals(2);
        expect(buyOrders[1].fills.length).to.be.equals(0);
        expect(buyOrders[1].price).to.be.equals(2);

        expect(buyOrders[2].traderAddress).to.be.equals(trader1.address);
        expect(buyOrders[2].orderSide).to.be.equals(ORDER_SIDE.BUY);
        expect(buyOrders[2].orderType).to.be.equals(ORDER_TYPE.LIMIT);
        expect(buyOrders[2].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
        expect(buyOrders[2].amount).to.be.equals(1);
        expect(buyOrders[2].fills.length).to.be.equals(0);
        expect(buyOrders[2].price).to.be.equals(1);
    });

    it('Should Create Limit Orders And Lock Correct Amount',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(LimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        const depositAmount = ethers.parseUnits('100', 'ether');

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        let amount = 2;
        let price = 3;

        await orderBookDex
            .contract
            .connect(trader1)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: amount,
                price: price,
                orderSide: ORDER_SIDE.BUY,
                orderType: ORDER_TYPE.LIMIT
            });

        let traderBalance = await orderBookDex
            .contract
            .balances(
                trader1.address,
                ethers.encodeBytes32String(daiDetails.symbol)
            );
        
        expect(traderBalance.free).to.be.equal(depositAmount - BigInt(amount * price));
        expect(traderBalance.locked).to.be.equal(amount * price);

        await orderBookDex
            .contract
            .connect(trader1)
            .placeOrder({
                ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                amount: amount,
                price: price,
                orderSide: ORDER_SIDE.SELL,
                orderType: ORDER_TYPE.LIMIT
            });

        traderBalance = await orderBookDex
            .contract
            .balances(
                trader1.address,
                ethers.encodeBytes32String(zrxDetails.symbol)
            );
        
        expect(traderBalance.free).to.be.equal(depositAmount - BigInt(amount));
        expect(traderBalance.locked).to.be.equal(amount);
    });

    it('Should NOT Create Limit Orders When Ticker Does Not Exist',async () => {
        const { orderBookDex } = await loadFixture(LimitOrdersFixture);

        const [owner, trader1] = await ethers.getSigners();

        await expect(
            orderBookDex
                .contract
                .connect(trader1)
                .placeOrder({
                    ticker: ethers.encodeBytes32String('Ticker'),
                    amount: 1,
                    price: 1,
                    orderSide: ORDER_SIDE.BUY,
                    orderType: ORDER_TYPE.LIMIT
                })
            ).to.revertedWith('Ticker Does Not Exist!');
    });

    it('Should NOT Create Limit Orders When Token Disabled',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(LimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .disableTokenTrading(ethers.encodeBytes32String(zrxDetails.symbol));

        await expect(
            orderBookDex
                .contract
                .connect(trader1)
                .placeOrder({
                    ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                    amount: 1,
                    price: 1,
                    orderSide: ORDER_SIDE.BUY,
                    orderType: ORDER_TYPE.LIMIT
                })
            ).to.revertedWith('Token Disabled!');
    });

    it('Should NOT Create Limit Orders When Quote Ticker Undefined',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(LimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        await expect(
            orderBookDex
                .contract
                .connect(trader1)
                .placeOrder({
                    ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                    amount: 1,
                    price: 1,
                    orderSide: ORDER_SIDE.BUY,
                    orderType: ORDER_TYPE.LIMIT
                })
            ).to.revertedWith('Quote Ticker Undefined!');
    });

    it('Should NOT Create Limit Orders When Trading Quote Ticker',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(LimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await expect(
            orderBookDex
                .contract
                .connect(trader1)
                .placeOrder({
                    ticker: ethers.encodeBytes32String(daiDetails.symbol),
                    amount: 1,
                    price: 1,
                    orderSide: ORDER_SIDE.BUY,
                    orderType: ORDER_TYPE.LIMIT
                })
            ).to.revertedWith('Quote Ticker!');
    });

    it('Should NOT Create SELL Limit Orders When Low Token Balance',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(LimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await expect(
            orderBookDex
                .contract
                .connect(trader1)
                .placeOrder({
                    ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                    amount: ethers.parseUnits('1000', 'ether'),
                    price: 1,
                    orderSide: ORDER_SIDE.SELL,
                    orderType: ORDER_TYPE.LIMIT
                })
            ).to.revertedWith('Low Token Balance!');
    });

    it('Should NOT Create BUT Limit Orders When Low Quote Ticker Balance',async () => {
        const { orderBookDex, daiToken, zrxToken } = await loadFixture(LimitOrdersFixture);
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1] = await ethers.getSigners();

        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(ethers.encodeBytes32String(daiDetails.symbol));

        await expect(
            orderBookDex
                .contract
                .connect(trader1)
                .placeOrder({
                    ticker: ethers.encodeBytes32String(zrxDetails.symbol),
                    amount: ethers.parseUnits('1000', 'ether'),
                    price: ethers.parseUnits('1000', 'ether'),
                    orderSide: ORDER_SIDE.BUY,
                    orderType: ORDER_TYPE.LIMIT
                })
            ).to.revertedWith('Low Quote Balance!');
    });

});
