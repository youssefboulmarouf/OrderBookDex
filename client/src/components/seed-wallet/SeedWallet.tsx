import { useState } from 'react';
import OrderBookDexContract from '../../services/OrderBookDexContract';
import { Button, Form, FormGroup, Modal } from 'react-bootstrap';
import { TokenProps } from '../common/common-props';
import { Signer, ethers } from 'ethers';
import TokenContract from '../../services/TokenContract';

interface SeedWalletProps {
    showSeedWallet: boolean; 
    handleClose: () => void;
    orderBookDexContract: OrderBookDexContract | undefined;
    signer: Signer | undefined;
}

const SeedWallet: React.FC<SeedWalletProps> = (props) => {
    const [walletAddress, setWalletAddress] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setWalletAddress(value);
    }

    const seedWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (props.orderBookDexContract != undefined) {
            const tokens: TokenProps[] = await props.orderBookDexContract.getAllTokens();
            const dexAddress = await props.orderBookDexContract.getContractAddress();
            
            tokens.forEach(async token => {
                if (token.isTradable) {
                    if (props.signer != undefined) {
                        const tokenContract = new TokenContract(props.signer, token.tokenAddress)
                        await tokenContract.seedWallet(walletAddress, 1000);
                        await tokenContract.approve(dexAddress, 1000);
                    }
                }
            });
        }

        props.handleClose();
    }

    return (
        <Modal show={props.showSeedWallet} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Seed Wallet With Test Tokens</Modal.Title>
            </Modal.Header>
            <Form onSubmit={(e) => {seedWallet(e)}}>
                <Modal.Body>
                    <p>The wallet with the address below will receive '1000' of each token test for testing purpose.</p>
                    <p>The token received have no value.</p>
                    <FormGroup>
                        <Form.Control 
                            size='sm'
                            type='text'
                            placeholder='Wallet Address'
                            name='walletAddress'
                            value={walletAddress}
                            onChange={handleChange}
                        />
                    </FormGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.handleClose}>
                        Close
                    </Button>
                    <Button variant="info" type="submit">
                        Seed Wallet
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default SeedWallet;