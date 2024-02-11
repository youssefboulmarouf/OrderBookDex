import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Container } from 'react-bootstrap';
import { GearFill } from 'react-bootstrap-icons';
import AdminSection from '../admin-section/AdminSection';
import { Signer } from 'ethers';
import OrderBookDexContract from '../../services/OrderBookDexContract';

interface NavBarProps {
    orderBookDexContract: OrderBookDexContract;
}

const NavBar: React.FC<NavBarProps> = (props) => {
    const [showAdminSection, setshowAdminSection] = useState(false);

    return (
        <>
        <Navbar bg='dark' variant='dark' expand='lg' sticky='top' className='navbar-style'>
            <Container fluid>                
                <Navbar.Brand href='#home'>OrderBookDEX</Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse id='basic-navbar-nav'>
                    <div className='ms-auto'>
                        <Button className='admin-button' variant='outline-secondary' onClick={() => setshowAdminSection(true)}>
                            <GearFill color='white' size={25}/>
                        </Button>
                    </div>
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