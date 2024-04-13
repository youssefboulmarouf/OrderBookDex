import React, { useState, useEffect } from 'react';
import { ethers, Signer } from 'ethers';

import OrderBookDexContract from '../../services/OrderBookDexContract';
import { TokenProps } from '../common/common-props';
import { AppProvider } from '../../AppContext';
import DexTrades from '../dex-trades/DexTrades';

import { Col, Container, Row } from 'react-bootstrap';

import './obdex.css';
import TraderTrades from '../trader/TraderTrades';
import TraderOrders from '../trader/TraderOrders';
import OrderBook from '../order-book/OrderBook';
import Market from '../market/Market';
import UserOrdersTrades from '../trader/UserOrdersTrades';
import PlaceOrder from '../place-order/PlaceOrder';
import UserWallet from '../wallet/UserWallet';

interface OrderBookDexProps {
    provider: ethers.BrowserProvider;
    orderBookDexContract: OrderBookDexContract;
    account: Signer;
}

const OrderBookDex: React.FC<OrderBookDexProps> = (props) => {
    const [tokens, setTokens] = useState<TokenProps[]>([]);
    const [assetToken, setAssetToken] = useState<TokenProps>();
    const [quoteToken, setQuoteToken] = useState<TokenProps>();
    const [buySellButton, setBuySellButton] = useState('buy');

    const loadTokens = async () => {
        const allTokens: TokenProps[] = await props.orderBookDexContract.getAllTokens();
        const quotTicker = await props.orderBookDexContract.getQuoteTicker();
        const nonQuoteToken = allTokens.filter(token => token.ticker !== quotTicker);
        const quote = allTokens.filter(token => token.ticker === quotTicker);
        setQuoteToken(quote.at(0));
        setAssetToken(nonQuoteToken.at(0));
        setTokens(nonQuoteToken);
    };

    useEffect(() => {
        const initToken = async () => {
            await loadTokens();
        };
        initToken();
    }, []);

    if (assetToken === undefined || quoteToken === undefined ) {
        return (<></>);
    }
    
    return (
        <>
        <div className='obdex'>
            <AppProvider 
                tokens={tokens} 
                quoteToken={quoteToken}
                selectedAsset={assetToken} 
                account={props.account}
                buySellButton={buySellButton}
                orderBookDexContract={props.orderBookDexContract}
            >
                <Row>
                    <Col sm={12} md={3} lg={3}>
                        <Row>
                            <PlaceOrder setAssetToken={setAssetToken} setBuySellButton={setBuySellButton}/>
                        </Row>
                        <Row>
                            <DexTrades/>
                        </Row>
                    </Col>
                    <Col sm={12} md={6} lg={6}>
                        <Row>
                            <div className=''>
                                <div className='custom-box middle-box'><div className='dex-chart'>CHART</div></div>
                            </div>
                        </Row>
                    </Col>
                    <Col sm={12} md={3} lg={3}>
                        <Row>
                            <OrderBook/>
                        </Row>
                        <Row>
                            <UserWallet/>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <Row>
                            <UserOrdersTrades/>
                        </Row>
                    </Col>
                </Row>
            </AppProvider>
        </div>
        </>
    );
}

export default OrderBookDex;