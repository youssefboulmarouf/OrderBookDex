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
        
        it('Should Have Correct Tokens', async () => {
            const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
            const tokens = await orderBookDex.contract.getTokens();

            const daiDetails = await getContractDetails(daiToken.contract);

            expect(tokens.length).to.be.equals(1);
            // assert DAI Token that was add in the fixture
            expect(tokens[0].ticker).to.be.equals(ethers.encodeBytes32String(daiDetails.symbol));
            expect(tokens[0].tokenAddress).to.be.equals(daiDetails.address);
        });
        
        it('Should Add Token If Admin', async () => {
            const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
            
            const daiDetails = await getContractDetails(daiToken.contract);
            const zrxDetails = await getContractDetails(zrxToken.contract);
            
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
            // assert ZRX Token that was add in the the test
            expect(tokens[1].ticker).to.be.equals(ethers.encodeBytes32String(zrxDetails.symbol));
            expect(tokens[1].tokenAddress).to.be.equals(zrxDetails.address);
        });

        it('Should Have Correct Tickers', async () => {
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

        it('Should NOT Add Token If NOT Admin', async () => {
            const { orderBookDex, daiToken, zrxToken, owner, otherAccount } = await loadFixture(tokenFixture);
            
            const zrxDetails = await getContractDetails(zrxToken.contract);
            
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
            daiDetails = await getContractDetails(daiToken.contract);
            
            await expect(
                orderBookDex
                    .contract
                    .connect(owner)
                    .addToken(ethers.encodeBytes32String(daiDetails.symbol), daiDetails.address)
            ).to.be.revertedWith('Ticker Exists!');
        });
    }); 

    describe('Deposit Balance', () => {
        async function depositFixture() {
            const orderBookDex = await deployOrderBookContract();
            const daiToken = await deployTokenTest("Dai Stable Coin", "DAI");

            const [owner, trader] = await ethers.getSigners();

            const daiDetails = await getContractDetails(daiToken.contract);
            
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
            const daiDetails = await getContractDetails(daiToken.contract);
            
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

    describe('Withdraw Balance', () => {
        async function withdrawFixture() {
            const orderBookDex = await deployOrderBookContract();
            const daiToken = await deployTokenTest("Dai Stable Coin", "DAI");

            const [owner, trader] = await ethers.getSigners();

            const daiDetails = await getContractDetails(daiToken.contract);
            
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

            const daiDetails = await getContractDetails(daiToken.contract);
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

            const daiDetails = await getContractDetails(daiToken.contract);
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
});