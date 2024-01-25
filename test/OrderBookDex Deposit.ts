import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as testUtils from './TestUtils';

describe('Deposit Balance', () => {
    async function depositFixture() {
        const orderBookDex = await testUtils.deployOrderBookContract();
        const daiToken = await testUtils.deployTokenTest("Dai Stable Coin", "DAI");

        const [owner, trader] = await ethers.getSigners();

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        
        await orderBookDex
            .contract
            .connect(owner)
            .addToken(
                ethers.encodeBytes32String(daiDetails.symbol), 
                daiDetails.address
            );
        
        return { orderBookDex, daiToken, owner, trader };
    }

    it('Should deposit if token exists',async () => {
        const { orderBookDex, daiToken, owner, trader } = await loadFixture(depositFixture);

        const orderBookDexAddress = await orderBookDex.contract.getAddress();
        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        
        const amountDeposit = ethers.parseUnits('1', 'ether');

        // Mint token for trader
        await daiToken
            .contract
            .faucet(trader.address, amountDeposit);
        
        // Assert minting amount of token for trader
        const traderDaiBalanceBefore = await daiToken.contract.balanceOf(trader);
        expect(traderDaiBalanceBefore).to.be.equals(amountDeposit);
        
        // Approve DEX to spend tokens for trader
        await daiToken
            .contract
            .connect(trader)
            .approve(orderBookDexAddress, amountDeposit);

        // Deposit balance of amount in trader balance
        await orderBookDex
            .contract
            .connect(trader)
            .deposit(
                ethers.encodeBytes32String(daiDetails.symbol),
                amountDeposit
            );

        // Assert minted amount aftre deposit
        const traderDaiBalanceAfter = await daiToken.contract.balanceOf(trader);
        expect(traderDaiBalanceAfter).to.be.equals(0);

        const traderBalance = await orderBookDex
            .contract
            .balances(
                trader.address,
                ethers.encodeBytes32String(daiDetails.symbol)
            );
        
        // Assert trader balance in DEX
        expect(traderBalance.free).to.be.equal(amountDeposit);
        expect(traderBalance.locked).to.be.equal(0);
    });

    it('Should NOT deposit if token does NOT exists',async () => {
        const { orderBookDex, daiToken, owner, trader } = await loadFixture(depositFixture);
        const amountDeposit = ethers.parseUnits('1', 'ether');

        await expect(
            orderBookDex
                .contract
                .connect(trader)
                .deposit(
                    ethers.encodeBytes32String('NON EXISTING TOKEN'),
                    amountDeposit
                )
        ).to.be.revertedWith('Ticker Does Not Exist!');
    });
});
