import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { TokenProps } from '../common/common-props';
import { ethers } from 'ethers';
import OrderBookDexContract from '../../services/OrderBookDexContract';

interface AdQuoteTokenProps {
    tokens: TokenProps[];
    orderBookDexContract: OrderBookDexContract;
}

const AdQuoteToken: React.FC<AdQuoteTokenProps> = (props) => {
    const [quoteTicker, setQuoteTicker] = useState<string>('');
    const [quoteTickerToDisable, setQuoteTickerToDisable] = useState<string>('');

    const setQuoteToken = async () => {
        const quoteToken = props.tokens.find(tok => ethers.decodeBytes32String(tok.ticker) === quoteTicker)
        if (quoteToken != undefined) {
            await props.orderBookDexContract.setQuoteTicker(quoteToken)
            await loadQuoteTicker();
        }
    }

    const loadQuoteTicker = async () => {
        const ticker: string = ethers.decodeBytes32String(await props.orderBookDexContract.getQuoteTicker());
        setQuoteTicker(ticker);

        if (ticker) {
            setQuoteTickerToDisable(ticker)
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await loadQuoteTicker();
        };
        loadData();
    }, []);

    return (
        <>
        <div>
            <h4>Quote Token</h4>
        </div>
        <Dropdown className='admin-dropdown' onSelect={(item) => setQuoteTicker((item !== null) ? item : '')}>
            <Dropdown.Toggle disabled={!!quoteTickerToDisable}>
                <span className='admin-dropdown-toggle-left-side'>{quoteTicker ? `${quoteTicker} ` : 'Select Quote Token'}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {props.tokens.map((token) => (
                    <Dropdown.Item key={token.ticker} eventKey={ethers.decodeBytes32String(token.ticker)}>
                        {ethers.decodeBytes32String(token.ticker)}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>

        <br/>
        <Button disabled={quoteTickerToDisable != ''} onClick={setQuoteToken}>Set Quote Token</Button>
        </>
    );
}

export default AdQuoteToken;