import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Signer, ethers } from 'ethers';
import OrderBookDexContract from '../../services/OrderBookDexContract';
import TokenContract from '../../services/TokenContract';
import { TokenProps, TokenDexBalance } from '../common/common-props';
import BalanceProgressBar from './BalanceProgressBar';
import WalletAction from './WalletAction';
import './user-wallet.css';

interface UserWalletProps {
    tokens: TokenProps[];
    selectedAsset: string;
    account: Signer;
    provider: ethers.BrowserProvider;
    orderBookDexContract: OrderBookDexContract;
}

const UserWallet: React.FC<UserWalletProps> = (props) =>{
    const [walletAction, setWalletAction] = useState('Deposit');
    const [selectedToken, setSelectedToken] = useState<TokenProps>();
    const [assetDexBalance, setAssetDexBalance] = useState<TokenDexBalance>();
    const [tokenContract, setTokenContract] = useState<TokenContract>();
    const [tokenBalance, setTokenBalance] = useState<BigInt>();
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
            if (walletAction == 'Deposit') {
                await props.orderBookDexContract.deposit(
                    selectedToken,
                    ethers.parseEther(amount)
                );
            } else {
                await props.orderBookDexContract.withdraw(
                    selectedToken,
                    ethers.parseEther(amount)
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
                ethers.decodeBytes32String(token.ticker) == props.selectedAsset
            );
            
            if (token.length > 0) {
                setSelectedToken(token[0]);
                refreshDexBalance(token[0]);
                setTokenContract(new TokenContract(props.provider, token[0].tokenAddress));
                setTokenBalance(await tokenContract?.getBalance(props.account));
            }
        }
        getAssetDexBalance();
    }, [props.selectedAsset]);

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
                <WalletAction 
                    selectedToken={selectedToken}
                    walletAction={walletAction}
                    setWalletAction={setWalletAction}
                />

                <BalanceProgressBar 
                    free={assetDexBalance?.free} 
                    locked={assetDexBalance?.locked}
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
                        variant={(walletAction === 'Deposit') ? 'primary' : 'warning'}
                        disabled={selectedToken === undefined}
                    >
                        {walletAction + ' Tokens'}
                    </Button>
                </Form>

                <div>
                    {(props.selectedAsset)
                        ? `TOKEN WALLET: ` + (+ethers.formatEther((tokenBalance) ? tokenBalance.toString() : '0')) + ' ' + props.selectedAsset
                        : ''
                    }
                </div>
            </div>
        </div>
    );
}

export default UserWallet;