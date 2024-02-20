import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';
import { TokenProps, TokenDexBalance } from '../common/common-props';
import BalanceProgressBar from './BalanceProgressBar';
import WalletAction from './WalletAction';
import './user-wallet.css';
import { useAppContext } from '../../AppContext';

const UserWallet: React.FC = () =>{
    const { tokens, selectedAsset, account, orderBookDexContract, buyOrders, sellOrders } = useAppContext();

    const [walletAction, setWalletAction] = useState('Deposit');
    
    const [assetDexBalance, setAssetDexBalance] = useState<TokenDexBalance>({free: BigInt(0), locked: BigInt(0)});
    const [daiDexBalance, setDaiDexBalance] = useState<TokenDexBalance>({free: BigInt(0), locked: BigInt(0)});
        
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
        }
        getAssetDexBalance();
    }, [buyOrders, sellOrders]);

    return (
        <div className='default-box-layout user-wallet'>
            <div className='title-box'>OBDex Wallet</div>
            <div className='inner-box'>
                <BalanceProgressBar 
                    token='DAI'
                    free={daiDexBalance.free}
                    locked={daiDexBalance.locked}
                />
                {(ethers.decodeBytes32String(selectedAsset.ticker) != 'DAI')
                    ? <>
                        <BalanceProgressBar 
                            token={ethers.decodeBytes32String(selectedAsset.ticker)}
                            free={assetDexBalance.free} 
                            locked={assetDexBalance.locked}
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