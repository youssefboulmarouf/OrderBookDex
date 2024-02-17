import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import './trades.css';

function Trades() {
    return (
        <div className="default-box-layout trades">
            <div className='title-box'>Orders & Trades</div>
            <div className='inner-box'>
                <Tabs defaultActiveKey="orders" className="mb-3">
                    <Tab eventKey="orders" title="My Orders">
                        Tab content for Home
                    </Tab>
                    <Tab eventKey="trades" title="My Trades">
                        Tab content for Profile
                    </Tab>
                </Tabs>
            </div>
            
        </div>
    );
}

export default Trades;