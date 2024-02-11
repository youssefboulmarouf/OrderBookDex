import { Table } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';
import { CheckCircleFill, PlusSquareFill, XCircleFill, XSquareFill } from 'react-bootstrap-icons';
import { TokenProps } from '../common/common-props';

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
                    <th>HEX Ticker</th>
                    <th>Token Address</th>
                    <th>Status</th>
                    <th>Enable/Disable</th>
                </tr>
            </thead>
            <tbody>
                {props.tokens.map(token => (
                    <tr key={token.ticker}>
                        <td>{ethers.decodeBytes32String(token.ticker)}</td>
                        <td>{token.ticker}</td>
                        <td>{token.tokenAddress}</td>
                        <td>
                            {(token.isTradable)
                                ? <CheckCircleFill color='green' size={20}/>
                                : <XCircleFill color='red' size={20}/>
                            }
                        </td>
                        <td>
                            {(token.isTradable)
                                ? <Button 
                                    className='action-button' 
                                    variant='' 
                                    onClick={(e) => props.disableToken(e, token)}
                                >
                                    <XSquareFill color='red' size={20}/>
                                </Button>
                                : <Button 
                                    className='action-button' 
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