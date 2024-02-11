import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { TokenProps } from '../common/common-props';
import { ethers } from 'ethers';

interface MarketDropdownProps {
    tokens: TokenProps[];
    selectedItem: string;
    marketType: string;
    onSelectedItem: (selectedTicker: string) => void;
}

const MarketDropDown: React.FC<MarketDropdownProps> = (props) => {
    return (
        <Dropdown className="transparent-dropdown" onSelect={(item) => props.onSelectedItem((item !== null) ? item : '')}>
            <Dropdown.Toggle>
                <span className='dropdown-toggle-left-side'>
                    {props.selectedItem ? `${props.selectedItem} ` : ''}
                </span>
                <span className='dropdown-toggle-right-side'>{props.marketType}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {props.tokens.map((token) => (
                    <Dropdown.Item key={token.ticker} eventKey={ethers.decodeBytes32String(token.ticker)}>
                        {ethers.decodeBytes32String(token.ticker)}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default MarketDropDown;