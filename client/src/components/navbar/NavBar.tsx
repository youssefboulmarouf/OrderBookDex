import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Container } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';


function NavBar() {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="navbar-style">
            <Container fluid>
                <Navbar.Brand href="#home">OrderBookDEX</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="">Home</Nav.Link>
                        <Nav.Link href="">Admin</Nav.Link>
                    </Nav>
                    <div className="ms-auto">
                        <Button variant="warning">Connect Wallet</Button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;