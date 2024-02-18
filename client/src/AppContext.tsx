import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import OrderBookDexContract from './services/OrderBookDexContract';
import { Signer } from 'ethers';
import { TokenProps } from './components/common/common-props';

interface AppContextType {
    tokens: TokenProps[];
    selectedAsset: TokenProps;
    account: Signer;
    orderBookDexContract: OrderBookDexContract;
    refreshTrigger: number;
    triggerBalanceRefresh: () => void;
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
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const triggerBalanceRefresh = useCallback(() => {
        setRefreshTrigger(oldTrigger => oldTrigger + 1);
    }, []);

    return (
        <AppContext.Provider value={{ tokens, selectedAsset, account, orderBookDexContract, refreshTrigger, triggerBalanceRefresh }}>
            {children}
        </AppContext.Provider>
    );
};
