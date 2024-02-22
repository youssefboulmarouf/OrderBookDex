import { ethers } from 'ethers';

import { TokenProps } from '../common/common-props';

import { Table } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { CheckCircleFill, PlusSquareFill, XCircleFill, XSquareFill } from 'react-bootstrap-icons';


interface TokensListProps {
    tokens: TokenProps[];
    enableToken: (e: React.FormEvent, token: TokenProps) => void;
    disableToken: (e: React.FormEvent, token: TokenProps) => void;
}

const TokensList: React.FC<TokensListProps> = (props) => {
    return (
        <>
         <div>
            <h4>Tokens List</h4>
        </div>
        <Table>
            <thead>
                <tr>
                    <th>Ticker</th>
                    <th className='d-none d-lg-table-cell'>HEX Ticker</th>
                    <th className='d-none d-sm-table-cell'>Token Address</th>
                    <th>Status</th>
                    <th>Enable/Disable</th>
                </tr>
            </thead>
            <tbody>
                {props.tokens.map(token => (
                    <tr key={token.ticker}>
                        <td>{ethers.decodeBytes32String(token.ticker)}</td>
                        <td className='d-none d-lg-table-cell'>{token.ticker}</td>
                        <td className='d-none d-sm-table-cell'>{token.tokenAddress}</td>
                        <td>
                            {(token.isTradable)
                                ? <CheckCircleFill color='green' size={20}/>
                                : <XCircleFill color='red' size={20}/>
                            }
                        </td>
                        <td>
                            {(token.isTradable)
                                ? <Button 
                                    className='enable-disable-token-button' 
                                    variant='' 
                                    onClick={(e) => props.disableToken(e, token)}
                                >
                                    <XSquareFill color='red' size={20}/>
                                </Button>
                                : <Button 
                                    className='enable-disable-token-button' 
                                    variant='' 
                                    onClick={(e) => props.enableToken(e, token)}
                                >
                                    <PlusSquareFill color='green' size={20}/>
                                </Button>
                            }
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
        </>
    );
}

export default TokensList;