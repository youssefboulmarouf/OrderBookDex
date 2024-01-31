import { ethers } from 'ethers';

const connectWallet = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return new ethers.providers.Web3Provider(window.ethereum);
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            console.log('Fallback to local network');
            return connectToLocalNetwork();
        }
    } else {
        console.error('MetaMask is not installed!');
        console.log('Fallback to local network');
        return connectToLocalNetwork();
    }
};

const connectToLocalNetwork = () => {
    return new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
}

export { connectWallet, connectToLocalNetwork };