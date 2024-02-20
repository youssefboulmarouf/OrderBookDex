import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import OrderBookDexContract from './services/OrderBookDexContract';
import { Signer } from 'ethers';
import { ORDER_SIDE, Order, TokenProps } from './components/common/common-props';

interface AppContextType {
    tokens: TokenProps[];
    selectedAsset: TokenProps;
    account: Signer;
    orderBookDexContract: OrderBookDexContract;
    buyOrders: Order[],
    sellOrders: Order[],
    triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
    tokens: TokenProps[];
    selectedAsset: TokenProps;
    account: Signer;
    orderBookDexContract: OrderBookDexContract;
}

export const AppProvider: React.FC<AppProviderProps> = (
    { children, tokens, selectedAsset, account, orderBookDexContract }
) => {
    const [buyOrders, setBuyOrders] = useState<Order[]>([]);
    const [sellOrders, setSellOrders] = useState<Order[]>([]);

    const triggerRefresh = useCallback(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const buys = await orderBookDexContract.getOrders(selectedAsset, ORDER_SIDE.BUY)
        setBuyOrders(buys);
        const sells = await orderBookDexContract.getOrders(selectedAsset, ORDER_SIDE.SELL)
        setSellOrders(sells);
    };

    useEffect(() => {
        loadOrders();
    }, [selectedAsset]);

    return (
        <AppContext.Provider value={{ 
            tokens, 
            selectedAsset, 
            account, 
            orderBookDexContract, 
            buyOrders, 
            sellOrders, 
            triggerRefresh 
        }}>
            {children}
        </AppContext.Provider>
    );
};
