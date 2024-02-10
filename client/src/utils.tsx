import { ethers } from 'ethers';

const connectWallet = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return new ethers.BrowserProvider(window.ethereum);
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            throw error;
        }
    } else {
        console.error('MetaMask is not installed!');
        throw 'MetaMask is not installed!';
    }
};

export { connectWallet };