import Button from 'react-bootstrap/Button';
import { WalletFill } from 'react-bootstrap-icons';

interface ExcerptProps {
    connectWallet: () => void;
}

const Excerpt: React.FC<ExcerptProps> = (props) => {
    return(
        <>
        <div className="content">
            <div className="centered-text">
                <div className='excerpt-title'>
                    <h1>OrderBookDex</h1>
                </div>
                <div className='excerpt-body'>
                    <p>Single Quote Token Order Book Trading Platform.</p>
                </div>
                <Button variant='info' onClick={props.connectWallet}><WalletFill size={25}/><i> Connect Wallet</i></Button>
            </div>
        </div>
        </>
    );
}

export default Excerpt;