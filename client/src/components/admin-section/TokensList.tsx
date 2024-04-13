import { ethers } from 'ethers';

import { TokenProps } from '../common/common-props';

import { Table } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { Check, CheckCircleFill, Plus, PlusSquareFill, X, XCircleFill, XSquareFill } from 'react-bootstrap-icons';


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
            <thead className='header-text'>
                <tr>
                    <th>Ticker</th>
                    <th className='d-none d-sm-table-cell'>Token Address</th>
                    <th>Status</th>
                    <th className='center-text-align'>Enable/Disable</th>
                </tr>
            </thead>
            <tbody>
                {props.tokens.map(token => (
                    <tr key={token.ticker}>
                        <td>{ethers.decodeBytes32String(token.ticker)}</td>
                        <td className='d-none d-sm-table-cell'>{token.tokenAddress}</td>
                        <td>
                            {(token.isTradable)
                                ? <Check color='#efbf45' size={25}/>
                                : <X color='#efbf45' size={25}/>
                            }
                        </td>
                        <td className='center-text-align'>
                            {(token.isTradable)
                                ? <Button 
                                    className='enable-disable-token-button' 
                                    variant='danger' 
                                    onClick={(e) => props.disableToken(e, token)}
                                >
                                    <X size={20}/>
                                </Button>
                                : <Button 
                                    className='enable-disable-token-button' 
                                    variant='success' 
                                    onClick={(e) => props.enableToken(e, token)}
                                >
                                    <Plus size={20}/>
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