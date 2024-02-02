import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Table } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { TokenProps } from '../common/common-props';
import { CheckCircleFill, PlusSquareFill, XCircleFill, XSquareFill } from 'react-bootstrap-icons';
import { ethers, Signer } from 'ethers';
import OrderBookDexContract from '../../services/OrderBookDexContract';

interface AdminSectionProps {
    showAdminSection: boolean; 
    handleClose: () => void;
    orderBookDexContract: OrderBookDexContract;
    account: Signer;
}

const AdminSection: React.FC<AdminSectionProps> = (props) => {
    const [token, setToken] = useState<TokenProps>({ ticker: '', tokenAddress: '', isTradable: true });
    const [tokens, setTokens] = useState<TokenProps[]>([]);
    
    const loadTokens = async () => {
        const allTokens: TokenProps[] = await props.orderBookDexContract.getAllTokens();
        setTokens(allTokens);
    };

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setToken(prevToken => ({
            ...prevToken,
            [name]: value
        }));
    };
    
    const addToken = async (e: React.FormEvent) => {
        e.preventDefault();
        await props.orderBookDexContract.addToken(token, props.account);
        await loadTokens();
    }

    const enableToken = async (e: React.FormEvent, token: TokenProps) => {
        e.preventDefault();
        console.log('ENABLE: ', token, e.target);
        await props.orderBookDexContract.enableToken(token, props.account);
        await loadTokens();
    }

    const disableToken = async (e: React.FormEvent, token: TokenProps) => {
        e.preventDefault();
        console.log('DISABLE: ', token, e.target);
        await props.orderBookDexContract.disableToken(token, props.account);
        await loadTokens();
    }

    useEffect(() => {
        const initToken = async () => {
            await loadTokens();
        };
        initToken();
    }, []);

    return (
        <Offcanvas show={props.showAdminSection} onHide={props.handleClose} placement='bottom'>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Admin Section</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div>
                    <h4>Add A New Token</h4>
                </div>
                <Form onSubmit={(e) => {addToken(e)}}>
                    <FormGroup>
                        <Form.Control 
                            size='sm'
                            type='text'
                            placeholder='Token Ticker'
                            name='ticker'
                            value={token?.ticker}
                            onChange={handleTokenChange}
                        />
                    </FormGroup>
                    <br />
                    <FormGroup>
                        <Form.Control 
                            size='sm'
                            type='text'
                            placeholder='Token Address'
                            name='tokenAddress'
                            value={token?.tokenAddress}
                            onChange={handleTokenChange}
                        />
                    </FormGroup>
                    <br />
                    <Button type="submit">Add Token</Button>
                </Form>

                <br />
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
                        {tokens.map(token => (
                            <tr key={token.ticker}>
                                <td>{ethers.utils.parseBytes32String(token.ticker)}</td>
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
                                            onClick={(e) => disableToken(e, token)}
                                        >
                                            <XSquareFill color='red' size={20}/>
                                        </Button>
                                        : <Button 
                                            className='action-button' 
                                            variant='' 
                                            onClick={(e) => enableToken(e, token)}
                                         >
                                            <PlusSquareFill color='green' size={20}/>
                                        </Button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default AdminSection;