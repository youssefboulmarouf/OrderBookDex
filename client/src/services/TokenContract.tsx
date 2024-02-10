import { ethers, Contract, Signer } from 'ethers';
import TestToken from '../artifacts/contracts/TestToken.sol/TestToken.json';

class TokenContract {
    private contract: Contract;

    constructor(provider: ethers.Provider, contractAddress: string) {
        this.contract = new ethers.Contract(contractAddress, TestToken.abi, provider);
    }

    getContractAddress(): Promise<string> {
        return this.contract.getAddress();
    }

    async getBalance(signer: Signer): Promise<BigInt | undefined> {
        try {
            return await this.contract.balanceOf(await signer.getAddress());
        } catch (e) {
            console.error(e)
        }
    }
}

export default TokenContract;