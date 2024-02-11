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
                variant={props.walletAction === 'Deposit' ? 'primary' : ''} 
                onClick={() => handletWalletAction('Deposit')}
            >Deposit</Button>
            
            <Button className='button'
                disabled={props.selectedToken === undefined}
                variant={props.walletAction === 'Withdraw' ? 'warning' : ''} 
                onClick={() => handletWalletAction('Withdraw')}
            >Withdraw</Button>
        </ButtonGroup>
        </>
    );
}

export default WalletAction;