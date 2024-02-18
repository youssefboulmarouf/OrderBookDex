import React, { useState, useEffect } from 'react';
import MarketDropDown from './MarketDropDown';
import { TokenProps } from '../common/common-props';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import './place-order.css';
import { ethers } from 'ethers';
import { useAppContext } from '../../AppContext';

interface PlaceOrderProps {
    setAssetToken: (assetToken: TokenProps) => void;
}

const PlaceOrder: React.FC<PlaceOrderProps> = (props) => {
    const { tokens, selectedAsset, triggerBalanceRefresh } = useAppContext();

    const [buySellButton, setBuySellButton] = useState('buy');
    const [limitMarketButton, setLimitMarketButton] = useState('limit');
    const [price, setPrice] = useState<number>(0);
    const [amount, setAmount] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPrice(+value);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(+value);
        }
    };

    const conputeTotal = () => {
        setTotal(+price * +amount)
    }

    const createOrder = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('createOrder')
        triggerBalanceRefresh();
    }

    useEffect(() => {
        conputeTotal();
    }, [amount, price]);

    return (
        <div className="default-box-layout place-order">
            <div className='title-box'>MARKET</div>
            <div className='inner-box'>
                <MarketDropDown 
                    tokens={tokens}
                    assetToken={selectedAsset}
                    setAssetToken={props.setAssetToken}
                />

                <ButtonGroup className='button-group'>
                    <Button className='button'
                        variant={buySellButton === 'buy' ? 'success' : ''} 
                        onClick={() => setBuySellButton('buy')}
                    >BUY</Button>
                    
                    <Button className='button'
                        variant={buySellButton === 'sell' ? 'danger' : ''} 
                        onClick={() => setBuySellButton('sell')}
                    >SELL</Button>
                </ButtonGroup>

                <ButtonGroup className='button-group'>
                    <Button className='button'
                        variant={limitMarketButton === 'limit' ? 'dark' : ''}
                        onClick={() => setLimitMarketButton('limit')}
                    >Limit</Button>
                    <Button className='button'
                        variant={limitMarketButton === 'market' ? 'dark' : ''}
                        onClick={() => setLimitMarketButton('market')}
                    >Market</Button>
                </ButtonGroup>

                <Form onSubmit={createOrder}>
                    <Form.Group className="mb-3 custom-input-group">
                        <div className="input-wrapper">
                            <span className="custom-placeholder">Price</span>
                            <Form.Control 
                                value={price}
                                onChange={handlePriceChange}
                            />
                            <span className="input-addon">DAI</span>
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3 custom-input-group">
                        <div className="input-wrapper">
                            <span className="custom-placeholder">Amount</span>
                            <Form.Control 
                                value={amount}
                                onChange={handleAmountChange}
                            />
                            <span className="input-addon">{ethers.decodeBytes32String(selectedAsset.ticker)}</span>
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3 custom-input-group">
                        <div className="input-wrapper">
                            <span className="custom-placeholder">Total</span>
                            <Form.Control disabled value={total}/>
                            <span className="input-addon">DAI</span>
                        </div>
                    </Form.Group>

                    <Button 
                        className='place-order-button button' 
                        variant='primary' 
                        type='submit'
                    >
                        Place Order
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default PlaceOrder;