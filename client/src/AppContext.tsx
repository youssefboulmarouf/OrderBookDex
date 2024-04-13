import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import OrderBookDexContract from './services/OrderBookDexContract';
import { Signer } from 'ethers';
import { NewTradeEvent, ORDER_SIDE, Order, TokenProps } from './components/common/common-props';

interface AppContextType {
    tokens: TokenProps[];
    selectedAsset: TokenProps;
    quoteToken: TokenProps;
    account: Signer;
    buySellButton: string;
    orderBookDexContract: OrderBookDexContract;
    buyOrders: Order[],
    sellOrders: Order[],
    marketPrice: bigint,
    tokenTrades: NewTradeEvent[],
    setMarketPrice: (price: bigint) => void,
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
    quoteToken: TokenProps;
    selectedAsset: TokenProps;
    buySellButton: string;
    account: Signer;
    orderBookDexContract: OrderBookDexContract;
}

export const AppProvider: React.FC<AppProviderProps> = (
    { children, tokens, selectedAsset, quoteToken, buySellButton, account, orderBookDexContract }
) => {
    const [marketPrice, setMarketPrice] = useState<bigint>(BigInt(0));
    const [buyOrders, setBuyOrders] = useState<Order[]>([]);
    const [sellOrders, setSellOrders] = useState<Order[]>([]);
    const [tokenTrades, setTokenTrades] = useState<NewTradeEvent[]>([])

    const triggerRefresh = useCallback(async () => {
        await loadOrdersAndTrades();
    }, []);

    const loadOrdersAndTrades = async () => {
        setBuyOrders(await orderBookDexContract.getOrders(selectedAsset, ORDER_SIDE.BUY));
        setSellOrders(await orderBookDexContract.getOrders(selectedAsset, ORDER_SIDE.SELL));
        setTokenTrades(await orderBookDexContract.getNewTradeEvents());
    };

    useEffect(() => {
        loadOrdersAndTrades();
    }, [selectedAsset]);

    return (
        <AppContext.Provider value={{ 
            tokens, 
            selectedAsset, 
            quoteToken,
            account, 
            orderBookDexContract, 
            buySellButton,
            buyOrders, 
            sellOrders, 
            marketPrice,
            tokenTrades,
            setMarketPrice,
            triggerRefresh 
        }}>
            {children}
        </AppContext.Provider>
    );
};
