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

const handleError = (e: unknown) => {
    if (e instanceof Error) {
        const err: Error = e;
        const match = err.message.substring(err.message.indexOf('('), err.message.lastIndexOf(')') + 1).match(/reason="(.*?)"/);
        console.error('match: ', match?.at(1)?.toString());

        if (match == undefined) {
            console.error('Unhandled error:', e);
        }
    } else {
        console.error('Unhandled error:', e);
    }
}

export default { connectWallet, handleError };