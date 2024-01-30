import React, { useState } from 'react';
import { Form, FormGroup, Table } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { TokenProps } from '../common/common-props';
import { PlusSquareFill, XSquareFill } from 'react-bootstrap-icons';

interface AdminSectionProps {
    showAdminSection: boolean; 
    handleClose: () => void;
}

const AdminSection: React.FC<AdminSectionProps> = (props) => {
    const [token, setToken] = useState<TokenProps>({ ticker: '', address: '', isTradable: true });
    
    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setToken(prevToken => ({
            ...prevToken,
            [name]: value
        }));
    };
    
    const handleAddToken = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Token:", token);
    }

    return (
        <Offcanvas show={props.showAdminSection} onHide={props.handleClose}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Admin Section</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div>
                    <h4>Add A New Token</h4>
                </div>
                <Form onSubmit={(e) => {handleAddToken(e)}}>
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
                            name='address'
                            value={token?.address}
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
                            <th>Address</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Mark</td>
                            <td>Otto</td>
                            <td>
                                <Button className='action-button' variant=''>
                                    <XSquareFill color='red' size={20}/>
                                </Button>
                            </td>
                        </tr>
                        <tr>
                            <td>Mark</td>
                            <td>Otto</td>
                            <td>
                                <Button className='action-button' variant=''>
                                    <PlusSquareFill color='green' size={20}/>
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </Table>

            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default AdminSection;