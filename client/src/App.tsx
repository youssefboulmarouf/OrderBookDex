import React, { useState, useEffect } from 'react';
import { ethers, Signer } from 'ethers';

import { Container } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import NavBar from './components/navbar/NavBar';
import Markets from './components/markets/Markets';
import UserWallet from './components/user-wallet/UserWallet';
import OrderBook from './components/order-book/OrderBook';
import Chart from './components/chart/Chart';
import Trades from './components/trades/Trades';
import PlaceOrder from './components/place-order/PlaceOrder';
import OrderBookDexContract from './services/OrderBookDexContract';
import { TokenProps } from './components/common/common-props';

interface AppProps {
    provider: ethers.providers.Web3Provider;
    orderBookDexContract: OrderBookDexContract;
    account: Signer;
}

const App: React.FC<AppProps> = (props) => {
    const [tokens, setTokens] = useState<TokenProps[]>([]);

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

    return (
        <Container fluid className="App">
            <NavBar 
                account={props.account} 
                orderBookDexContract={props.orderBookDexContract}
            />
            <Row>
                <Col sm={3}>
                    <Markets />      
                    <PlaceOrder />
                </Col>
                <Col sm={3}>
                    <OrderBook />
                </Col>
                <Col sm={6}>
                    <Chart />
                </Col>
            </Row>
            <Row>
                <Col sm={3}>
                    <UserWallet />
                </Col>
                <Col sm={9}>
                    <Trades />
                </Col>
            </Row>
        </Container>
    );
}

export default App;
