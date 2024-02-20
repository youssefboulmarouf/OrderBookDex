import React, { useState, useEffect } from 'react';
import { ethers, Signer } from 'ethers';

import { Container } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import NavBar from './components/navbar/NavBar';
import UserWallet from './components/user-wallet/UserWallet';
import OrderBook from './components/order-book/OrderBook';
import Chart from './components/chart/Chart';
import Trades from './components/trades/Trades';
import PlaceOrder from './components/place-order/PlaceOrder';
import OrderBookDexContract from './services/OrderBookDexContract';
import { TokenProps } from './components/common/common-props';
import { AppProvider } from './AppContext';

interface AppProps {
    provider: ethers.BrowserProvider;
    orderBookDexContract: OrderBookDexContract;
    account: Signer;
}

const App: React.FC<AppProps> = (props) => {
    const [tokens, setTokens] = useState<TokenProps[]>([]);
    const [assetToken, setAssetToken] = useState<TokenProps>();

    const loadTokens = async () => {
        const allTokens: TokenProps[] = await props.orderBookDexContract.getAllTokens();
        setTokens(allTokens);
    };

    useEffect(() => {
        const initToken = async () => {
            await loadTokens();
        };
        initToken();
    }, []);

    useEffect(() => {
        const initDefaultToken = async () => {
            const defaultToken: TokenProps[] = tokens.filter(token => 
                ethers.decodeBytes32String(token.ticker) == 'DAI'
            );
            setAssetToken(defaultToken[0]);
        };
        initDefaultToken();
    }, [tokens]);

    if (assetToken === undefined) {
        return (<></>);
    }

    return (
        <Container fluid className="App">
            <NavBar orderBookDexContract={props.orderBookDexContract}/>
            <AppProvider 
                tokens={tokens} 
                selectedAsset={assetToken} 
                account={props.account}
                orderBookDexContract={props.orderBookDexContract}
            >
                <Row>
                    <Col sm={3}>
                        <PlaceOrder setAssetToken={setAssetToken}/>
                    </Col>
                    <Col sm={3}>
                        <OrderBook/>
                    </Col>
                    <Col sm={6}>
                        <Chart />
                    </Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <UserWallet/>
                    </Col>
                    <Col sm={9}>
                        <Trades/>
                    </Col>
                </Row>
            </AppProvider>
        </Container>
    );
}

export default App;
