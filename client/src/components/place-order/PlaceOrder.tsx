import React, { useState, useEffect } from 'react';
import MarketDropDown from './MarketDropDown';
import { ORDER_SIDE, ORDER_TYPE, TokenProps } from '../common/common-props';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import './place-order.css';
import { ethers } from 'ethers';
import { useAppContext } from '../../AppContext';
import { Col, Row } from 'react-bootstrap';

interface PlaceOrderProps {
    setAssetToken: (assetToken: TokenProps) => void;
    setBuySellButton: (buySellButton: string) => void;
}

const PlaceOrder: React.FC<PlaceOrderProps> = (props) => {
    const { tokens, selectedAsset, orderBookDexContract, buySellButton, marketPrice, triggerRefresh } = useAppContext();

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

    const handleBuySellButtonChange = (buttonState: string) => {
        props.setBuySellButton(buttonState)
    }

    const handleLimitMarketButtonChange = (buttonState: string) => {
        setLimitMarketButton(buttonState)

        if (buttonState == 'market') {
            setPrice(+ethers.formatEther(marketPrice.toString()))
        } else {
            setPrice(0)
        }
    }

    const createOrder = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await orderBookDexContract.placedOrder(
            selectedAsset, 
            amount, 
            price,
            buySellButton === 'buy' ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
            limitMarketButton === 'limit' ? ORDER_TYPE.LIMIT : ORDER_TYPE.MARKET
        )
        triggerRefresh();
    }

    useEffect(() => {
        setTotal(+price * +amount);
    }, [amount, price]);

    useEffect(() => {
        if (limitMarketButton == 'market') {
            setPrice(+ethers.formatEther(marketPrice.toString()))
        }
    }, [marketPrice]);

    return (
        <div className='custom-box'>
            <div className='place-orders'>
                <MarketDropDown 
                    tokens={tokens}
                    assetToken={selectedAsset}
                    setAssetToken={props.setAssetToken}
                />

                <ButtonGroup className='button-group'>
                    <Button className='button'
                            variant={limitMarketButton === 'limit' ? 'info' : 'accent3'}
                            onClick={() => handleLimitMarketButtonChange('limit')}
                            >Limit</Button>
                    
                    <Button className='button'
                        variant={limitMarketButton === 'market' ? 'info' : 'accent3'}
                        onClick={() => handleLimitMarketButtonChange('market')}
                    >Market</Button>
                </ButtonGroup>

                <ButtonGroup className='button-group'>
                    <Button className='button'
                        variant={buySellButton === 'buy' ? 'success' : 'accent3'} 
                        onClick={() => handleBuySellButtonChange('buy')}
                    ><strong>BUY</strong></Button>
                    
                    <Button className='button'
                        variant={buySellButton === 'sell' ? 'danger' : 'accent3'} 
                        onClick={() => handleBuySellButtonChange('sell')}
                    ><strong>SELL</strong></Button>
                </ButtonGroup>                

                <Form onSubmit={createOrder}>
                    <Form.Group className="custom-input-group">
                        <div className="input-wrapper">
                            <span className="custom-placeholder">Price</span>
                            <Form.Control 
                                value={price}
                                type='number'
                                onChange={handlePriceChange}
                                disabled={limitMarketButton == 'market'}
                            />
                            <span className="input-addon">DAI</span>
                        </div>
                    </Form.Group>

                    <Form.Group className="custom-input-group">
                        <div className="input-wrapper">
                            <span className="custom-placeholder">Amount</span>
                            <Form.Control 
                                value={amount}
                                type='number'
                                onChange={handleAmountChange}
                            />
                            <span className="input-addon">{ethers.decodeBytes32String(selectedAsset.ticker)}</span>
                        </div>
                    </Form.Group>

                    <Form.Group className="custom-input-group">
                        <div className="input-wrapper">
                            <span className="custom-placeholder">Total</span>
                            <Form.Control disabled value={total}/>
                            <span className="input-addon">DAI</span>
                        </div>
                    </Form.Group>

                    <Button 
                        className='place-order-button button' 
                        variant='info' 
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