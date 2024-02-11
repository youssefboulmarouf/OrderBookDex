import React from 'react';
import MarketDropDown from './MarketDropDown';
import { TokenProps } from '../common/common-props';
import './markets.css';

interface MarketProps {
    tokens: TokenProps[];
    selectedAsset: string;
    setAsset: (asset: string) => void;
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
            </div>
        </div>
    );
}

export default Markets;