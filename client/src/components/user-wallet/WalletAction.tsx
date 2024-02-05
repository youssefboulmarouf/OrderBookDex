import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { TokenProps } from '../common/common-props';

interface WalletActionProps {
    selectedToken: TokenProps | undefined;
    walletAction: string;
    setWalletAction: (action: string) => void;
}

const WalletAction: React.FC<WalletActionProps> = (props) => {

    const handletWalletAction = (action: string) => {
        props.setWalletAction(action)
    }

    return (
        <>
        <ButtonGroup className='button-group'>
            <Button className='button'
                disabled={props.selectedToken === undefined}
                variant={props.walletAction === 'deposit' ? 'primary' : ''} 
                onClick={() => handletWalletAction('deposit')}
            >Deposit</Button>
            
            <Button className='button'
                disabled={props.selectedToken === undefined}
                variant={props.walletAction === 'withdraw' ? 'warning' : ''} 
                onClick={() => handletWalletAction('withdraw')}
            >Withdraw</Button>
        </ButtonGroup>
        </>
    );
}

export default WalletAction;