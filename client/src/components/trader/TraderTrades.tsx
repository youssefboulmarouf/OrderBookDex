import { Col, Row } from "react-bootstrap";
import { useAppContext } from '../../AppContext';
import { NewTradeEvent } from "../common/common-props";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const TraderTrades: React.FC = () => {
    const { account, selectedAsset, tokenTrades } = useAppContext();
    const [filtredTokenTrades, setFiltredTokenTrades] = useState<NewTradeEvent[]>([]);
    const [address, setAddress] = useState<string>('');

    const getTraderTrades = async () => {
        const address = await account.getAddress();
        setAddress(address);
        setFiltredTokenTrades(tokenTrades.filter(trade => 
            trade.ticker === selectedAsset.ticker && (trade.takerTrader == address || trade.makerTrader == address)
        ))
    }

    // To be moved to utils, since it duplicated with traders orders
    const formatDate = (timestampStr: string): string => {
        const timestamp = parseInt(timestampStr, 10) * 1000;
        const date = new Date(timestamp);
    
        return `${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    }

    const deduceTraderMakerTaker = (trade: NewTradeEvent) => {
        if (address == trade.takerTrader) {
            return 'Taker';
        } else {
            return 'Maker';
        }
    }

    const deduceTraderTradeSide = (trade: NewTradeEvent) => {
        if (address == trade.takerTrader) {
            return (trade.takerTradeSide.toString() == '0') ? 'BUY' : 'SELL';
        } else {
            return (trade.takerTradeSide.toString() == '0') ? 'SELL' : 'BUY';
        }
    }

    const deduceTraderTradeType = (trade: NewTradeEvent) => {
        if (address == trade.takerTrader) {
            return ((trade.takerOderType.toString() == '0') ? 'Market' : 'Limit');
        } else {
            return 'Limit';
        }
    }

    useEffect(() => {
        getTraderTrades()
    }, [tokenTrades, selectedAsset]);
    
    return (
        <>
        <div className='tab-content-header'>
            <Row className='header-text'>
                <Col sm={1}>Price(DAI)</Col>
                <Col sm={2} className='right-text-align'>Qty(ZRX)</Col>
                <Col sm={3} className='right-text-align'>Amount</Col>
                <Col sm={2} className='right-text-align'>Type</Col>
                <Col sm={1} className='right-text-align'>Side</Col>
                <Col sm={3} className='right-text-align'>Time</Col>
            </Row>
        </div>
        <div className='tab-content-body'>
            {filtredTokenTrades.map(trade => (
                <Row key={trade.tradeId}>
                    <Col sm={1}>{ethers.formatEther(trade.price.toString())}</Col>
                    <Col sm={2} className='right-text-align'>{ethers.formatEther(trade.amount.toString())}</Col>
                    <Col sm={3} className='right-text-align'>{ethers.formatEther((trade.amount * trade.price) / BigInt(1e18))}</Col>
                    <Col sm={2} className={(deduceTraderTradeSide(trade) === 'BUY')? 'right-text-align buy-row' : 'right-text-align sell-row'}>
                        {deduceTraderTradeType(trade) + '/' + deduceTraderMakerTaker(trade)}
                    </Col>
                    <Col sm={1} className={(deduceTraderTradeSide(trade) === 'BUY')? 'right-text-align buy-row' : 'right-text-align sell-row'}>
                        {deduceTraderTradeSide(trade)}
                    </Col>
                    <Col sm={3} className='right-text-align'>{formatDate(trade.date.toString())}</Col>
                </Row>    
            ))}
        </div>
        </>
    );
}

export default TraderTrades;