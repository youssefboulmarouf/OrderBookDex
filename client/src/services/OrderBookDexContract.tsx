import { ethers, Contract } from 'ethers';

class OrderBookDexContract {
    private contract: Contract;

    constructor(provider: ethers.providers.Provider, contractAddress: string) {
        this.contract = new ethers.Contract(contractAddress, "YourContractABI", provider);
    }

    async getContract(): Promise<string> {
        try {
            const value = await this.contract.getValue();
            return value.toString();
        } catch (error) {
            console.error('Error in getContractValue:', error);
            throw error;
        }
    }
}

export default OrderBookDexContract;