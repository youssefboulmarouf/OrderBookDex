import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as testUtils from './TestUtils';

describe('Withdraw Balance', () => {
    async function withdrawFixture() {
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
        
        const amountDeposit = ethers.parseUnits('1', 'ether');

        // Mint token for trader
        await daiToken
            .contract
            .faucet(trader.address, amountDeposit);
        
        // Approve DEX to spend tokens for trader
        const orderBookDexAddress = await orderBookDex.contract.getAddress();
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
        
        return { orderBookDex, daiToken, owner, trader };
    }

    it('Should withdraw if enough Balance', async () => {
        const { orderBookDex, daiToken, owner, trader } = await loadFixture(withdrawFixture);
        
        const amountDeposit = ethers.parseUnits('1', 'ether');

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        let traderBalance = await orderBookDex
            .contract
            .balances(
                trader.address,
                ethers.encodeBytes32String(daiDetails.symbol)
            );
        
        // Assert trader balance in DEX
        expect(traderBalance.free).to.be.equal(amountDeposit);
        expect(traderBalance.locked).to.be.equal(0);

        const traderDaiBalanceBefore = await daiToken.contract.balanceOf(trader);
        expect(traderDaiBalanceBefore).to.be.equal(0);

        const amountWithdraw = ethers.parseUnits('0.5', 'ether');
        await orderBookDex
            .contract
            .connect(trader)
            .withdraw(
                ethers.encodeBytes32String(daiDetails.symbol),
                amountWithdraw
            );

        const traderDaiBalanceAfter = await daiToken.contract.balanceOf(trader);
        expect(traderDaiBalanceAfter).to.be.equal(amountWithdraw);

        traderBalance = await orderBookDex
            .contract
            .balances(
                trader.address,
                ethers.encodeBytes32String(daiDetails.symbol)
            );
        
        // Assert trader balance in DEX
        expect(traderBalance.free).to.be.equal(amountWithdraw);
        expect(traderBalance.locked).to.be.equal(0);
    });

    it('Should NOT withdraw if NOT enough Balance', async () => {
        const { orderBookDex, daiToken, owner, trader } = await loadFixture(withdrawFixture);
        
        const amountDeposit = ethers.parseUnits('1', 'ether');

        const daiDetails = await testUtils.getContractDetails(daiToken.contract);
        let traderBalance = await orderBookDex
            .contract
            .balances(
                trader.address,
                ethers.encodeBytes32String(daiDetails.symbol)
            );
        
        // Assert trader balance in DEX
        expect(traderBalance.free).to.be.equal(amountDeposit);
        expect(traderBalance.locked).to.be.equal(0);

        const traderDaiBalanceBefore = await daiToken.contract.balanceOf(trader);
        expect(traderDaiBalanceBefore).to.be.equal(0);

        const amountWithdraw = ethers.parseUnits('10', 'ether');
        
        await expect(
            orderBookDex
                .contract
                .connect(trader)
                .withdraw(
                    ethers.encodeBytes32String(daiDetails.symbol),
                    amountWithdraw
                )
        ).to.be.revertedWith('Low Balance!');
    });

    it('Should NOT withdraw if Token does NOT exist', async () => {
        const { orderBookDex, daiToken, owner, trader } = await loadFixture(withdrawFixture);
        const amountWithdraw = ethers.parseUnits('10', 'ether');
        
        await expect(
            orderBookDex
                .contract
                .connect(trader)
                .withdraw(
                    ethers.encodeBytes32String('NON EXISTING TOKEN'),
                    amountWithdraw
                )
        ).to.be.revertedWith('Ticker Does Not Exist!');
    });
});
