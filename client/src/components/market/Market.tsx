import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { TokenProps } from '../common/common-props';
import { ethers } from 'ethers';
import MarketDropDown from './MarketDropDown';

import './market.css';

const Market: React.FC = () => {
    return (
        <div  className='market-container'>
            <div  className='title-box'>Market</div>
            <MarketDropDown 
                tokens={[]} 
                assetToken={undefined} 
                //setAssetToken={undefined} 
            />
        </div>
    );
}

export default Market;