import React, { useState, useEffect } from 'react';

import './admin-section.css';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Offcanvas from 'react-bootstrap/Offcanvas';
import { TokenProps } from '../common/common-props';
import OrderBookDexContract from '../../services/OrderBookDexContract';
import AddNewToken from './AddNewToken';
import AddQuoteToken from './AddQuoteToken';
import TokensList from './TokensList';

interface AdminSectionProps {
    showAdminSection: boolean; 
    handleClose: () => void;
    orderBookDexContract: OrderBookDexContract | undefined;
}

const AdminSection: React.FC<AdminSectionProps> = (props) => {
    const [token, setToken] = useState<TokenProps>({ ticker: '', tokenAddress: '', isTradable: true });
    const [tokens, setTokens] = useState<TokenProps[]>([]);
    
    const loadTokens = async () => {
        const allTokens = (props.orderBookDexContract) ? await props.orderBookDexContract.getAllTokens() : [];
        console.log('allTokens: ', allTokens);
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
        await props.orderBookDexContract?.addToken(token);
        await loadTokens();
        setToken({ ticker: '', tokenAddress: '', isTradable: true });
    }

    const enableToken = async (e: React.FormEvent, token: TokenProps) => {
        e.preventDefault();
        await props.orderBookDexContract?.enableToken(token);
        await loadTokens();
    }

    const disableToken = async (e: React.FormEvent, token: TokenProps) => {
        e.preventDefault();
        await props.orderBookDexContract?.disableToken(token);
        await loadTokens();
    }

    useEffect(() => {
        const loadData = async () => {
            await loadTokens();
        };
        loadData();
    }, [props.orderBookDexContract]);

    return (
        <Offcanvas show={props.showAdminSection} onHide={props.handleClose} placement='bottom'>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Admin Section</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div className='inner-box'>
                    <Row>
                        <Col sm={6}>
                            <AddNewToken 
                                token={token} 
                                addToken={addToken} 
                                handleTokenChange={handleTokenChange}
                            />
                        </Col>
                        <Col sm={6}>
                            <AddQuoteToken 
                                tokens={tokens} 
                                orderBookDexContract={props.orderBookDexContract}
                            />
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <TokensList 
                            tokens={tokens}
                            enableToken={enableToken}
                            disableToken={disableToken}
                        />
                    </Row>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default AdminSection;