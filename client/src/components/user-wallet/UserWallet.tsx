import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { BigNumber, Signer, ethers } from 'ethers';
import OrderBookDexContract from '../../services/OrderBookDexContract';
import TokenContract from '../../services/TokenContract';
import { TokenProps, TokenDexBalance } from '../common/common-props';
import BalanceProgressBar from './BalanceProgressBar';
import WalletAction from './WalletAction';
import './user-wallet.css';

interface UserWalletProps {
    tokens: TokenProps[];
    account: Signer;
    provider: ethers.providers.Web3Provider;
    orderBookDexContract: OrderBookDexContract;
}

const UserWallet: React.FC<UserWalletProps> = (props) =>{
    const [walletAction, setWalletAction] = useState('deposit');
    const [selectedAsset, setSelectedAsset] = useState<string>('');
    const [selectedToken, setSelectedToken] = useState<TokenProps>();
    const [assetDexBalance, setAssetDexBalance] = useState<TokenDexBalance>();
    const [tokenContract, setTokenContract] = useState<TokenContract>();
    const [tokenBalance, setTokenBalance] = useState<BigNumber>();
    const [amount, setAmount] = useState('');

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (selectedToken !== undefined) {
            if (walletAction == 'deposit') {
                await props.orderBookDexContract.deposit(
                    props.account, 
                    selectedToken,
                    ethers.utils.parseEther(amount)
                );
            } else {
                await props.orderBookDexContract.withdraw(
                    props.account, 
                    selectedToken,
                    ethers.utils.parseEther(amount)
                );
            }
            refreshDexBalance(selectedToken);
            setTokenBalance(await tokenContract?.getBalance(props.account));
        }
    };

    const refreshDexBalance = async (token: TokenProps) => {
        const balance = await props.orderBookDexContract.getBalance(token, props.account)
        setAssetDexBalance(balance);
    }

    useEffect(() => {
        const getAssetDexBalance = async () => {
            const token: TokenProps[] = props.tokens.filter(token => 
                ethers.utils.parseBytes32String(token.ticker) == selectedAsset
            );
            
            if (token.length > 0) {
                setSelectedToken(token[0]);
                refreshDexBalance(token[0]);
                setTokenContract(new TokenContract(props.provider, token[0].tokenAddress));
                setTokenBalance(await tokenContract?.getBalance(props.account));
            }
        }
        getAssetDexBalance();
    }, [selectedAsset]);

    useEffect(() => {
        const getWalletBalance = async () => {
            setTokenBalance(await tokenContract?.getBalance(props.account));
        }
        getWalletBalance();
    }, [tokenContract]);

    return (
        <div className='default-box-layout user-wallet'>
            <div className='title-box'>DEX WALLET</div>
            <div className='inner-box'>
                <Dropdown className='transparent-dropdown' onSelect={(item) => setSelectedAsset((item !== null) ? item : '')}>
                    <Dropdown.Toggle>
                        <span className='dropdown-toggle-left-side'>
                            {selectedAsset ? `${selectedAsset} ` : ''}
                        </span>
                        <span className='dropdown-toggle-right-side'>Asset</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {props.tokens.map((token) => (
                            <Dropdown.Item key={token.ticker} eventKey={ethers.utils.parseBytes32String(token.ticker)}>
                                {ethers.utils.parseBytes32String(token.ticker)}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <WalletAction 
                    selectedToken={selectedToken}
                    walletAction={walletAction}
                    setWalletAction={setWalletAction}
                />

                <BalanceProgressBar 
                    free={assetDexBalance?.free.toBigInt()} 
                    locked={assetDexBalance?.locked.toBigInt()}
                />

                <Form onSubmit={handleSubmit}>
                    <Form.Group className='mb-3 custom-input-group'>
                        <div className='input-wrapper'>
                            <span className='custom-placeholder'>Amount</span>
                            <Form.Control 
                                value={amount} 
                                onChange={handleAmountChange}
                                disabled={selectedToken === undefined}
                            />
                        </div>
                    </Form.Group>

                    <Button 
                        className='place-order-button button' 
                        type="submit" 
                        variant='primary'
                        disabled={selectedToken === undefined}
                    >
                        Place Order
                    </Button>
                </Form>

                <div>
                    {(selectedAsset)
                        ? `TOKEN WALLET: ` + (+ethers.utils.formatEther((tokenBalance) ? tokenBalance.toString() : '0')) + ' ' + selectedAsset
                        : ''
                    }
                </div>
            </div>
        </div>
    );
}

export default UserWallet;