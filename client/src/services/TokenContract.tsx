import { ethers, Contract, Signer, BigNumber } from 'ethers';
import TestToken from '../artifacts/contracts/TestToken.sol/TestToken.json';

class TokenContract {
    private contract: Contract;

    constructor(provider: ethers.providers.Provider, contractAddress: string) {
        this.contract = new ethers.Contract(contractAddress, TestToken.abi, provider);
    }

    getContractAddress(): string {
        return this.contract.address;
    }

    async getBalance(signer: Signer): Promise<BigNumber | undefined> {
        try {
            return await this.contract.balanceOf(await signer.getAddress());
        } catch (e) {
            console.error(e)
        }
    }
}

export default TokenContract;