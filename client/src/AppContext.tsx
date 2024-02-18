import React, { createContext, useContext, ReactNode } from 'react';
import OrderBookDexContract from './services/OrderBookDexContract';
import { Signer } from 'ethers';
import { TokenProps } from './components/common/common-props';

interface AppContextType {
    tokens: TokenProps[];
    selectedAsset: TokenProps;
    account: Signer;
    orderBookDexContract: OrderBookDexContract;
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

export const AppProvider: React.FC<AppProviderProps> = ({ children, tokens, selectedAsset, account, orderBookDexContract }) => {
    return (
        <AppContext.Provider value={{ tokens, selectedAsset, account, orderBookDexContract }}>
            {children}
        </AppContext.Provider>
    );
};
