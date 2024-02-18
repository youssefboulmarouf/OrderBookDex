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
    selectedAsset: TokenProps;
    account: Signer;
    provider: ethers.BrowserProvider;
    orderBookDexContract: OrderBookDexContract;
}

const UserWallet: React.FC<UserWalletProps> = (props) =>{
    const [walletAction, setWalletAction] = useState('Deposit');
    
    const [assetDexBalance, setAssetDexBalance] = useState<TokenDexBalance>();
    const [daiDexBalance, setDaiDexBalance] = useState<TokenDexBalance>();
    
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

        if (walletAction == 'Deposit') {
            await props.orderBookDexContract.deposit(
                props.selectedAsset,
                ethers.parseEther(amount)
            );
        } else {
            await props.orderBookDexContract.withdraw(
                props.selectedAsset,
                ethers.parseEther(amount)
            );
        }
        refreshDexBalance(props.selectedAsset);
        setTokenBalance(await tokenContract?.getBalance(props.account));
    };

    const refreshDexBalance = async (token: TokenProps) => {
        const balance = await props.orderBookDexContract.getBalance(token, props.account)
        setAssetDexBalance(balance);


        const dai: TokenProps[] = props.tokens.filter(token => 
            ethers.decodeBytes32String(token.ticker) == 'DAI'
        );
        const daiBalance = await props.orderBookDexContract.getBalance(dai[0], props.account)
        setDaiDexBalance(daiBalance);
    }

    useEffect(() => {
        const getAssetDexBalance = async () => {
            refreshDexBalance(props.selectedAsset);
            setTokenContract(new TokenContract(props.provider, props.selectedAsset.tokenAddress));
            setTokenBalance(await tokenContract?.getBalance(props.account));
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
            <div className='title-box'>OBDex Wallet</div>
            <div className='inner-box'>
                <BalanceProgressBar 
                    token='DAI'
                    free={daiDexBalance?.free}
                    locked={daiDexBalance?.locked}
                />
                {(ethers.decodeBytes32String(props.selectedAsset.ticker) != 'DAI')
                    ? <>
                        <BalanceProgressBar 
                            token={ethers.decodeBytes32String(props.selectedAsset.ticker)}
                            free={assetDexBalance?.free} 
                            locked={assetDexBalance?.locked}
                        />
                    </>
                    : ''
                }

                <div className='balance-title-box'>Transfer {ethers.decodeBytes32String(props.selectedAsset.ticker)}</div>

                <WalletAction 
                    selectedToken={props.selectedAsset}
                    walletAction={walletAction}
                    setWalletAction={setWalletAction}
                />

                <Form onSubmit={handleSubmit}>
                    <Form.Group className='mb-3 custom-input-group'>
                        <div className='input-wrapper'>
                            <span className='custom-placeholder'>Amount</span>
                            <Form.Control 
                                value={amount} 
                                onChange={handleAmountChange}
                            />
                            <span className="input-addon">{ethers.decodeBytes32String(props.selectedAsset.ticker)}</span>
                        </div>
                    </Form.Group>

                    <Button 
                        className='place-order-button button' 
                        type='submit'
                        variant={(walletAction === 'Deposit') ? 'primary' : 'warning'}
                    >
                        Transfer Tokens
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default UserWallet;