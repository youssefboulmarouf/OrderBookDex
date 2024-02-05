import React from 'react';
import MarketDropDown from './MarketDropDown';
import { TokenProps } from '../common/common-props';
import './markets.css';

interface MarketProps {
    tokens: TokenProps[];
    selectedAsset: string;
    selectedQuote: string;
    setAsset: (asset: string) => void;
    setQuote: (quote: string) => void;
}

const Markets: React.FC<MarketProps> = (props) => {
    return (
        <div className="default-box-layout markets">
            <div className='title-box'>MARKETS</div>
            <div className='inner-box'>
                <MarketDropDown 
                    marketType='Asset'
                    tokens={props.tokens}
                    selectedItem={props.selectedAsset}
                    onSelectedItem={props.setAsset}
                />
                <MarketDropDown 
                    marketType='Quote'
                    tokens={props.tokens}
                    selectedItem={props.selectedQuote}
                    onSelectedItem={props.setQuote}
                />
            </div>
        </div>
    );
}

export default Markets;