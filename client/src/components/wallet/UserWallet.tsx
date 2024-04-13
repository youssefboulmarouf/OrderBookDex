import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';
import { TokenProps, TokenDexBalance } from '../common/common-props';
import BalanceProgressBar from './BalanceProgressBar';
import WalletAction from './WalletAction';
import './user-wallet.css';
import { useAppContext } from '../../AppContext';
import { Tab, Tabs } from 'react-bootstrap';

const UserWallet: React.FC = () =>{
    const { selectedAsset, quoteToken, account, orderBookDexContract, buyOrders, sellOrders } = useAppContext();

    const [walletAction, setWalletAction] = useState('Deposit');
    
    const [assetDexBalance, setAssetDexBalance] = useState<TokenDexBalance>({free: BigInt(0), locked: BigInt(0)});
    const [daiDexBalance, setDaiDexBalance] = useState<TokenDexBalance>({free: BigInt(0), locked: BigInt(0)});
        
    const [tokenToTransfer, setTokenToTransfer] = useState<TokenProps>(quoteToken);
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
                tokenToTransfer,
                ethers.parseUnits(amount, 'ether')
            );
        } else {
            await orderBookDexContract.withdraw(
                tokenToTransfer,
                ethers.parseUnits(amount, 'ether')
            );
        }
        refreshDexBalance(selectedAsset);
    };

    const refreshDexBalance = async (token: TokenProps) => {
        const balance = await orderBookDexContract.getBalance(token, account)
        setAssetDexBalance(balance);

        const daiBalance = await orderBookDexContract.getBalance(quoteToken, account)
        setDaiDexBalance(daiBalance);
    }

    useEffect(() => {
        const getAssetDexBalance = async () => {
            refreshDexBalance(selectedAsset);
        }
        getAssetDexBalance();
    }, [buyOrders, sellOrders]);

    return (
        <div className='custom-box'>
            <div className='user-wallet'>

                <Tabs fill defaultActiveKey="quote" className="mb-3" onSelect={(eventKey) => (eventKey === "quote") ? setTokenToTransfer(quoteToken) : setTokenToTransfer(selectedAsset)}>
                    <Tab eventKey="quote" title={ethers.decodeBytes32String(quoteToken.ticker)}>
                        <BalanceProgressBar 
                            token='DAI'
                            free={daiDexBalance.free}
                            locked={daiDexBalance.locked}
                        />
                    </Tab>
                    <Tab eventKey="asset" title={ethers.decodeBytes32String(selectedAsset.ticker)}>
                        <BalanceProgressBar 
                            token={ethers.decodeBytes32String(selectedAsset.ticker)}
                            free={assetDexBalance.free}
                            locked={assetDexBalance.locked}
                        />
                    </Tab>
                </Tabs>

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
                        variant='info'
                    >
                        Transfer Tokens
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default UserWallet;