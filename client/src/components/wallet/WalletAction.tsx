import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { TokenProps } from '../common/common-props';

interface WalletActionProps {
    selectedToken: TokenProps;
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
                variant={props.walletAction === 'Deposit' ? 'info' : 'accent3'}
                onClick={() => handletWalletAction('Deposit')}
            >Deposit</Button>
            
            <Button className='button'
                variant={props.walletAction === 'Withdraw' ? 'info' : 'accent3'}
                onClick={() => handletWalletAction('Withdraw')}
            >Withdraw</Button>
        </ButtonGroup>
        </>
    );
}

export default WalletAction;