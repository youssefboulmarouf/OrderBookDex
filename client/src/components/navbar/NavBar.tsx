import { useState } from 'react';

import AdminSection from '../admin-section/AdminSection';
import OrderBookDexContract from '../../services/OrderBookDexContract';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import { Container } from 'react-bootstrap';
import { CashCoin, GearFill, WalletFill } from 'react-bootstrap-icons';

import './navbar.css';
import SeedWallet from '../seed-wallet/SeedWallet';
import { Signer, ethers } from 'ethers';

interface NavBarProps {
    connectWallet: () => void;
    isReady: () => boolean;
    isAdmin: boolean;
    orderBookDexContract: OrderBookDexContract | undefined;
    signer: Signer | undefined;
}

const NavBar: React.FC<NavBarProps> = (props) => {
    const [showAdminSection, setShowAdminSection] = useState(false);
    const [showSeedWallet, setShowSeedWallet] = useState(false);

    return (
        <>
        <Navbar expand='lg' fixed='top'>
            <Container fluid>
                <Navbar.Brand>OrderBookDEX</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="ms-auto">
                        {(props.isReady())
                            ? <>
                                <div className='centered-buttons'>
                                    <Button variant='info' onClick={() => setShowSeedWallet(true)}>
                                        <CashCoin size={25}/><i> Seed Wallet</i>
                                    </Button>
                                    {(props.isAdmin)
                                        ?   <Button className='admin-button' variant='info' onClick={() => setShowAdminSection(true)}>
                                                <GearFill size={25}/><i> Admin Section</i>
                                            </Button>
                                        : ''
                                    }
                                </div>
                            </>
                            : <>
                                <div className='centered-buttons'>
                                    <Button variant='info' onClick={props.connectWallet}><WalletFill size={25}/><i> Connect Wallet</i></Button>
                                </div>
                            </>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

        <AdminSection 
            showAdminSection={showAdminSection} 
            handleClose={() => setShowAdminSection(false)}
            orderBookDexContract={props.orderBookDexContract}
        />
        <SeedWallet 
            showSeedWallet={showSeedWallet} 
            handleClose={() => setShowSeedWallet(false)} 
            orderBookDexContract={props.orderBookDexContract} 
            signer={props.signer}
        />
        </>
    );
}

export default NavBar;