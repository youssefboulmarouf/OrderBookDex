import React from 'react';
import MarketDropDown from './MarketDropDown';
import { TokenProps } from '../common/common-props';
import './place-order.css';

interface PlaceOrderProps {
    tokens: TokenProps[];
    selectedAsset: string;
    setAsset: (asset: string) => void;
}

const PlaceOrder: React.FC<PlaceOrderProps> = (props) => {
    return (
        <div className="default-box-layout place-order">
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

export default PlaceOrder;