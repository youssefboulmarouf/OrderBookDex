import React, { useEffect, useState } from 'react';
import { ethers, Signer } from 'ethers';

import OrderBookDexContract from './services/OrderBookDexContract';
import OrderBookDex from './components/obdex/OrderBookDex'
import Utils from './utils';
import ca from './contract-addresses.json';

import NavBar from './components/navbar/NavBar';
import Excerpt from './components/excerpt/Excerpt';

import './custom.scss';
import './App.css';

const App: React.FC = () => {
    const [provider, setProvider] = useState<ethers.BrowserProvider>();
    const [orderBookDexContract, setOrderBookDexContract] = useState<OrderBookDexContract>();
    const [account, setAccount] = useState<Signer>();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const isReady = () => {
        return (provider !== undefined && orderBookDexContract !== undefined && account !== undefined);
    }

    const connectWallet = async () => {
        const newProvider = await Utils.connectWallet();
        setProvider(newProvider);
        const signer = await newProvider.getSigner();
        setAccount(signer);
        setOrderBookDexContract(new OrderBookDexContract(signer, ca.adresses.OBDex));
    }

    useEffect(() => {
        const checkAdmin = async () => {
            const admin = (orderBookDexContract) ? await orderBookDexContract.isAdmin() : false;
            setIsAdmin(admin)
        }
        checkAdmin();
    }, [orderBookDexContract]);

    return (
        <div className="App">
            <NavBar 
                connectWallet={connectWallet} 
                isReady={isReady} 
                isAdmin={isAdmin} 
                orderBookDexContract={orderBookDexContract}
                signer={account}
            />
            
            {((provider !== undefined && orderBookDexContract !== undefined && account !== undefined))
                ? <OrderBookDex 
                    account={account} 
                    orderBookDexContract={orderBookDexContract}
                    provider={provider}
                />
                : <Excerpt connectWallet={connectWallet}/>
            }
        </div>
    );
}

export default App;
