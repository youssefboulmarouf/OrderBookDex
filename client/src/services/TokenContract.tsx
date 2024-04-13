import { ethers, Contract, Signer } from 'ethers';
import TestToken from '../artifacts/contracts/TestToken.sol/TestToken.json';
import Utils from '../utils';

class TokenContract {
    private contract: Contract;

    constructor(signer: ethers.Signer, contractAddress: string) {
        this.contract = new ethers.Contract(contractAddress, TestToken.abi, signer);
    }

    getContractAddress(): Promise<string> {
        return this.contract.getAddress();
    }

    async getBalance(signer: Signer): Promise<BigInt | undefined> {
        try {
            return await this.contract.balanceOf(await signer.getAddress());
        } catch (e) {
            Utils.handleError(e)
        }
    }

    async seedWallet(walletAddress: string, amount: number) {
        try {
            const tx = await this.contract.faucet(
                walletAddress, 
                ethers.parseUnits(amount.toString(), 'ether')
            );
            await tx.wait();
        } catch (e) {
            Utils.handleError(e)
        }
    }

    async approve(dexAddress: string, amount: number) {
        try {
            const tx = await this.contract.approve(
                dexAddress, 
                ethers.parseUnits(amount.toString(), 'ether')
            );
            await tx.wait();
        } catch (e) {
            Utils.handleError(e)
        }
    }
}

export default TokenContract;