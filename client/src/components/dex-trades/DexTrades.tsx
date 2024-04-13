import { Col, Row } from 'react-bootstrap';
import './dex-trades.css';
import { useAppContext } from '../../AppContext';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { NewTradeEvent } from '../common/common-props';


const DexTrades: React.FC = () => {
    const { selectedAsset, tokenTrades } = useAppContext();
    const [filtredTokenTrades, setFiltredTokenTrades] = useState<NewTradeEvent[]>([]);
    
    function formatTimestampToLocalTime(timestampStr: string): string {
        const timestamp = parseInt(timestampStr, 10);
        const date = new Date(timestamp * 1000);
        
        // Format date to local time without specifying a timezone
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    useEffect(() => {
        setFiltredTokenTrades(tokenTrades.filter(trade => trade.ticker === selectedAsset.ticker))
    }, [tokenTrades, selectedAsset]);

    return(
        <>
        <div className='custom-box'>
            <div className='dex-trades'>
                <div className='all-trades-header'>
                    <Row className='header-text'>
                        <Col sm={4}>Price</Col>
                        <Col sm={4} className='center-text-align'>Amount</Col>
                        <Col sm={4} className='right-text-align'>Time</Col>
                    </Row>
                </div>
                <div className='all-trades-body body-95'>
                    {filtredTokenTrades.map(trade => (
                        <Row key={trade.tradeId}>
                            <Col className={(trade.takerTradeSide.toString() === '0')? 'buy-row' : 'sell-row'}>{ethers.formatEther(trade.price.toString())}</Col>
                            <Col className='center-text-align'>{ethers.formatEther(trade.amount.toString())}</Col>
                            <Col className='right-text-align'>{formatTimestampToLocalTime(trade.date.toString())}</Col>
                        </Row>
                    ))}
                </div>
            </div>
        </div>
        </>
    );
}

export default DexTrades;