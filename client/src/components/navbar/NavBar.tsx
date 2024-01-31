import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Container } from 'react-bootstrap';
import { GearFill } from 'react-bootstrap-icons';
import AdminSection from '../admin-section/AdminSection';

interface NavBarProps {
    connectWallet: () => void;
}

const NavBar: React.FC<NavBarProps> = (props) => {
    const [showAdminSection, setshowAdminSection] = useState(false);

    const handleClose = () => setshowAdminSection(false);
    const handleShow = () => setshowAdminSection(true);

    return (
        <>
        <Navbar bg='dark' variant='dark' expand='lg' sticky='top' className='navbar-style'>
            <Container fluid>

                <Button className='admin-button' variant='outline-secondary' onClick={handleShow}>
                    <GearFill color='white' size={25}/>
                </Button>
                
                <Navbar.Brand href='#home'>OrderBookDEX</Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse id='basic-navbar-nav'>
                    <div className='ms-auto'>
                        <Button variant='warning' onClick={props.connectWallet}>Connect Wallet</Button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>

        <AdminSection showAdminSection={showAdminSection} handleClose={handleClose}/>
        </>
    );
}

export default NavBar;