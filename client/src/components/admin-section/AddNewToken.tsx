import { Form, FormGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { TokenProps } from '../common/common-props';

interface AddNewTokenProps {
    token: TokenProps;
    addToken: (e: React.FormEvent) => void;
    handleTokenChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddNewToken: React.FC<AddNewTokenProps> = (props) => {
    return (
        <>
        <div>
            <h4>Add A New Token</h4>
        </div>
        <Form onSubmit={(e) => {props.addToken(e)}}>
            <FormGroup>
                <Form.Control 
                    size='sm'
                    type='text'
                    placeholder='Token Ticker'
                    name='ticker'
                    value={props.token.ticker}
                    onChange={props.handleTokenChange}
                />
            </FormGroup>
            <br />
            <FormGroup>
                <Form.Control 
                    size='sm'
                    type='text'
                    placeholder='Token Address'
                    name='tokenAddress'
                    value={props.token.tokenAddress}
                    onChange={props.handleTokenChange}
                />
            </FormGroup>
            <br />
            <Button type="submit">Add New Token</Button>
        </Form>
        </>
    );
}

export default AddNewToken;