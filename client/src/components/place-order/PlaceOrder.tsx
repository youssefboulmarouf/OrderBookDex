import React, { useState, useEffect } from 'react';
import MarketDropDown from './MarketDropDown';
import { TokenProps } from '../common/common-props';
import './place-order.css';

interface PlaceOrderProps {
    tokens: TokenProps[];
    assetToken: TokenProps;
    setAssetToken: (assetToken: TokenProps) => void;
}

const PlaceOrder: React.FC<PlaceOrderProps> = (props) => {
    return (
        <div className="default-box-layout place-order">
            <div className='title-box'>MARKETS</div>
            <div className='inner-box'>
                <MarketDropDown 
                    tokens={props.tokens}
                    assetToken={props.assetToken}
                    setAssetToken={props.setAssetToken}
                />
            </div>
        </div>
    );
}

export default PlaceOrder;