import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { TokenProps } from '../common/common-props';
import { ethers } from 'ethers';

interface MarketDropdownProps {
    tokens: TokenProps[];
    assetToken: TokenProps;
    setAssetToken: (assetToken: TokenProps) => void;
}

const MarketDropDown: React.FC<MarketDropdownProps> = (props) => {
    const [selectedAsset, setSelectedAsset] = useState<string>('');

    useEffect(() => {
        const init = () => {
            if(props.assetToken != undefined) {
                setSelectedAsset(ethers.decodeBytes32String(props.assetToken.ticker))
            }
        }

        init();
    }, [props.assetToken])

    useEffect(() => {
        const filterToken = () => {
            const token: TokenProps[] = props.tokens.filter(token => 
                ethers.decodeBytes32String(token.ticker) == selectedAsset
            );

            if (token.length > 0) {
                props.setAssetToken(token[0]);
            }
        }

        filterToken();
    }, [selectedAsset])
    
    return (
        <Dropdown className="transparent-dropdown" onSelect={(item) => setSelectedAsset((item !== null) ? item : '')}>
            <Dropdown.Toggle>
                <span className='dropdown-toggle-left-side'>
                    {selectedAsset ? `${selectedAsset} ` : ''}
                </span>
                <span className='dropdown-toggle-right-side'>Asset</span>
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