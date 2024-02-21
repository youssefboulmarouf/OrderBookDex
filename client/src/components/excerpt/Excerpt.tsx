import React from 'react';
import Button from 'react-bootstrap/Button';
import './excerpt.css';

const Excerpt: React.FC = () => {
    return(
        <>
        <div className="content">
            <div className="centered-text">
                <div className='excerpt-title'>
                    <h1>OrderBookDex</h1>
                </div>
                <div className='excerpt-body'>
                    <p>Is a mono-quote token Order Book trading platform concieved for learning and testing only.</p>
                </div>
                <Button variant='warning'>Connect Wallet</Button>
            </div>
        </div>
        </>
    );
}

export default Excerpt;