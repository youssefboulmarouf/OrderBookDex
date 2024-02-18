import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';
import TokenContract from '../../services/TokenContract';
import { TokenProps, TokenDexBalance } from '../common/common-props';
import BalanceProgressBar from './BalanceProgressBar';
import WalletAction from './WalletAction';
import './user-wallet.css';
import { useAppContext } from '../../AppContext';

interface UserWalletProps {
    provider: ethers.BrowserProvider;
}

const UserWallet: React.FC<UserWalletProps> = (props) =>{
    const { tokens, selectedAsset, account, orderBookDexContract } = useAppContext();

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
            await orderBookDexContract.deposit(
                selectedAsset,
                ethers.parseEther(amount)
            );
        } else {
            await orderBookDexContract.withdraw(
                selectedAsset,
                ethers.parseEther(amount)
            );
        }
        refreshDexBalance(selectedAsset);
        setTokenBalance(await tokenContract?.getBalance(account));
    };

    const refreshDexBalance = async (token: TokenProps) => {
        const balance = await orderBookDexContract.getBalance(token, account)
        setAssetDexBalance(balance);


        const dai: TokenProps[] = tokens.filter(token => 
            ethers.decodeBytes32String(token.ticker) == 'DAI'
        );
        const daiBalance = await orderBookDexContract.getBalance(dai[0], account)
        setDaiDexBalance(daiBalance);
    }

    useEffect(() => {
        const getAssetDexBalance = async () => {
            refreshDexBalance(selectedAsset);
            setTokenContract(new TokenContract(props.provider, selectedAsset.tokenAddress));
            setTokenBalance(await tokenContract?.getBalance(account));
        }
        getAssetDexBalance();
    }, [selectedAsset]);

    useEffect(() => {
        const getWalletBalance = async () => {
            setTokenBalance(await tokenContract?.getBalance(account));
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
                {(ethers.decodeBytes32String(selectedAsset.ticker) != 'DAI')
                    ? <>
                        <BalanceProgressBar 
                            token={ethers.decodeBytes32String(selectedAsset.ticker)}
                            free={assetDexBalance?.free} 
                            locked={assetDexBalance?.locked}
                        />
                    </>
                    : ''
                }

                <div className='balance-title-box'>Transfer {ethers.decodeBytes32String(selectedAsset.ticker)}</div>

                <WalletAction 
                    selectedToken={selectedAsset}
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
                            <span className="input-addon">{ethers.decodeBytes32String(selectedAsset.ticker)}</span>
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