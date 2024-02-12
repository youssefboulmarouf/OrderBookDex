import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as testUtils from './TestUtils';

describe('Market Orders', () => {
    async function marketOrderFixture() {
        const orderBookDex = await testUtils.deployOrderBookContract();
        const daiToken = await testUtils.deployTokenTest("Dai Stable Coin", "DAI");
        const zrxToken = await testUtils.deployTokenTest("Xero Token", "ZRX");

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        const zrxDetails = await testUtils.getContractDetails(zrxToken.contract);

        const [owner, trader1, trader2, trader3, otherAccount] = await ethers.getSigners();
        
        // Add DAI Token
        await orderBookDex
            .contract
            .connect(owner)
            .addToken(ethers.encodeBytes32String(daiDetails.symbol), daiDetails.address);

        // Add ZRX Token
        await orderBookDex
            .contract
            .connect(owner)
            .addToken(ethers.encodeBytes32String(zrxDetails.symbol), zrxDetails.address);

        // Set Quote Token - DAI
        await orderBookDex
            .contract
            .connect(owner)
            .setQuoteTicker(
                ethers.encodeBytes32String(daiDetails.symbol)
            );
        
        
        const amountDeposit = ethers.parseUnits('100', 'ether');

        [trader1, trader2, trader3].forEach(async trader => {
            const orderBookDexAddress = await orderBookDex.contract.getAddress();

            // Mint DAI token for trader
            await daiToken
                .contract
                .faucet(trader.address, amountDeposit);
            
            // Approve DEX to spend DAI tokens for trader
            await daiToken
                .contract
                .connect(trader)
                .approve(orderBookDexAddress, amountDeposit);

            // Deposit DAI balance of amount in trader balance
            await orderBookDex
                .contract
                .connect(trader)
                .deposit(
                    ethers.encodeBytes32String(daiDetails.symbol),
                    amountDeposit
                );

            // Mint ZRX token for trader
            await zrxToken
                .contract
                .faucet(trader.address, amountDeposit);
            
            // Approve DEX to spend DAI tokens for trader
            await zrxToken
                .contract
                .connect(trader)
                .approve(orderBookDexAddress, amountDeposit);

            // Deposit DAI balance of amount in trader balance
            await orderBookDex
                .contract
                .connect(trader)
                .deposit(
                    ethers.encodeBytes32String(zrxDetails.symbol),
                    amountDeposit
                );
        });
    }

    it('', async () => {
        
    });
});
