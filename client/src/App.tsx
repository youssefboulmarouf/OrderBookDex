import { Container } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
        <Container fluid className="App">
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
            <Row>
                <Col sm={3}>
                    <div className="default-box-layout place-order">
                        <div className='title-box'>PLACE ORDER</div>
                    </div>
                </Col>
                <Col sm={9}>
                    <Row>
                        <Col sm={4}>
                            <div className="default-box-layout order-book">
                                    <div className='title-box'>ALL TRADES & ORDER BOOK</div>
                            </div>
                        </Col>
                        <Col sm={8}>
                            <div className="default-box-layout chart">
                                <div className='title-box'>CHART</div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="default-box-layout trades">
                                <div className='title-box'>MY TRADES</div>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
  );
}

export default App;
