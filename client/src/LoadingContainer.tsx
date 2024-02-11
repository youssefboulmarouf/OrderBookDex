import React, { useState, useEffect } from 'react';
import { ethers, Signer } from 'ethers';
import Button from 'react-bootstrap/Button';
import OrderBookDexContract from './services/OrderBookDexContract';
import App from './App';
import Utils from './utils';
import ca from './contract-addresses.json';

const LoadingContainer: React.FC = () => {
    const [provider, setProvider] = useState<ethers.BrowserProvider>();
    const [orderBookDexContract, setOrderBookDexContract] = useState<OrderBookDexContract>();
    const [account, setAccount] = useState<Signer>();

    const connectWallet = async () => {
        const newProvider = await Utils.connectWallet();
        setProvider(newProvider);
        const signer = await newProvider.getSigner();
        setAccount(signer);
        setOrderBookDexContract(new OrderBookDexContract(signer, ca.adresses.OBDex));
    }

    return (
        <>
        {(provider !== undefined && orderBookDexContract !== undefined && account !== undefined)
            ? <App 
                provider={provider} 
                orderBookDexContract={orderBookDexContract} 
                account={account}
            /> 
            : <div>
                <Button variant='warning' onClick={connectWallet}>Connect Wallet</Button>
            </div>
        }
        </>
    );
}

export default LoadingContainer;