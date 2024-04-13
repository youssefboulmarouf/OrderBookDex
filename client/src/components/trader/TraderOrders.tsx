import Button from 'react-bootstrap/Button';
import { X } from 'react-bootstrap-icons';
import { Col, Row } from 'react-bootstrap';
import { Order } from '../common/common-props';
import { ethers } from 'ethers';
import { useAppContext } from '../../AppContext';
import { useEffect, useState } from 'react';

const TraderOrders: React.FC = () => {
    const { account, orderBookDexContract, buyOrders, sellOrders, triggerRefresh } = useAppContext();
    const [currentTokensOrders, setCurrentTokensOrders] = useState<Order[]>([]);

    const ectractMyOrder = (orders: Order[], address: string): Order[] => {
        const myOrders: Order[] = []
        orders.forEach(order => {
            if (order.traderAddress === address) {
                myOrders.push(order)
            }
        });
        return myOrders;
    }

    const amountFilledPerOrder = (order: Order) => {
        let totalAmountFilled: bigint = BigInt(0);
        order.fills.map(fill => totalAmountFilled = totalAmountFilled + fill);

        return ethers.formatEther(totalAmountFilled) + " (" + (totalAmountFilled * BigInt(100) / order.amount) + "%)";
    }

    const loadOrders = async () => {
        const address = await account.getAddress();
        let allOrders = ectractMyOrder(sellOrders.concat(buyOrders), address);
        allOrders = sortOrdersByDate(allOrders);
        setCurrentTokensOrders(allOrders)
    }

    const sortOrdersByDate = (orders: Order[]): Order[] => {
        return [...orders].sort((a, b) => Number(a.date - b.date));

    }

    useEffect(() => {
        loadOrders();
    }, [buyOrders, sellOrders]);

    const formatDate = (timestampStr: string): string => {
        const timestamp = parseInt(timestampStr, 10) * 1000;
        const date = new Date(timestamp);
    
        return `${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    }

    const cancelTrade = async (e: React.FormEvent, order: Order) => {
        console.log('Order To Cancel: ', order.id);
        await orderBookDexContract.cancelOrder(order);
        triggerRefresh();
    }


    return (
        <>
        <div className='tab-content-header'>
            <Row className='header-text'>
                <Col sm={1}>Side</Col>
                <Col sm={2} className='right-text-align'>Price(DAI)</Col>
                <Col sm={3} className='right-text-align'>Amount(ZRX)</Col>
                <Col sm={2} className='right-text-align'>Filled</Col>
                <Col sm={3} className='right-text-align'>Time</Col>
                <Col sm={1} className='right-text-align'>Cancel</Col>
            </Row>
        </div>
        <div className='tab-content-body'>
            {currentTokensOrders.map(order => (
                <Row key={order.id}>
                    <Col sm={1} className={(order.orderSide.toString() === '0')? 'buy-row' : 'sell-row'}>
                        {(order.orderSide.toString() === '0') ? 'BUY' : 'SELL'}
                    </Col>                    
                    <Col sm={2} className='right-text-align'>{ethers.formatEther(order.price.toString())}</Col>
                    <Col sm={3} className='right-text-align'>{ethers.formatEther(order.amount.toString())}</Col>
                    <Col sm={2} className='right-text-align'>{amountFilledPerOrder(order).toString()}</Col>
                    <Col sm={3} className='right-text-align'>{formatDate(order.date.toString())}</Col>
                    <Col sm={1} className='right-text-align'>
                        <Button 
                            className='cancel-order-button' 
                            variant='info' 
                            onClick={(e) => cancelTrade(e, order)}
                        >
                            <X size={20}/>
                        </Button>
                    </Col>
                </Row>    
            ))}
        </div>
        </>
    );
}

export default TraderOrders;