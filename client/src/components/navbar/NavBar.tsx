import { useState } from 'react';

import AdminSection from '../admin-section/AdminSection';
import OrderBookDexContract from '../../services/OrderBookDexContract';

import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Container } from 'react-bootstrap';
import { GearFill } from 'react-bootstrap-icons';

import './navbar.css';

interface NavBarProps {
    connectWallet: () => void;
    isReady: () => boolean;
    isAdmin: boolean;
    orderBookDexContract: OrderBookDexContract | undefined;
}

const NavBar: React.FC<NavBarProps> = (props) => {
    const [showAdminSection, setshowAdminSection] = useState(false);

    return (
        <>
        <Navbar bg='accent1' expand='lg' fixed='top'>
            <Container fluid>
                <Navbar.Brand>OrderBookDEX</Navbar.Brand>
                <Navbar.Collapse id='basic-navbar-nav'>
                    <div className='ms-auto' hidden={props.isReady()}>
                        <Button variant='warning' onClick={props.connectWallet}>Connect Wallet</Button>
                    </div>
                    {(props.isAdmin)
                        ?   <div className='ms-auto'>
                                <Button className='admin-button' variant='outline-secondary' onClick={() => setshowAdminSection(true)}>
                                    <GearFill color='white' size={25}/>
                                </Button>
                            </div>
                        : ''
                    }
                </Navbar.Collapse>
            </Container>
        </Navbar>

        <AdminSection 
            showAdminSection={showAdminSection} 
            handleClose={() => setshowAdminSection(false)}
            orderBookDexContract={props.orderBookDexContract}
        />
        </>
    );
}

export default NavBar;