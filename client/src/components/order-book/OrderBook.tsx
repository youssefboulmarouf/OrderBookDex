import { Col, Row } from 'react-bootstrap';
import './order-book.css';
import { Order } from '../common/common-props';
import { useAppContext } from '../../AppContext';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface AggregatedOrder {
    price: bigint;
    totalAmount: bigint;
    orders: Order[];
}

const OrderBook: React.FC = () => {
    const { buyOrders, sellOrders, buySellButton, marketPrice, setMarketPrice } = useAppContext();

    const [aggregatedBuyOrders, setAggregatedBuyOrders] = useState<AggregatedOrder[]>([]);
    const [aggregatedSellOrders, setAggregatedSellOrders] = useState<AggregatedOrder[]>([]);

    const loadOrders = async () => {
        setAggregatedBuyOrders(aggregateOrdersByPrice(buyOrders))
        setAggregatedSellOrders(aggregateOrdersByPrice(sellOrders))
    }

    const refreshMarketPrice = () => {
        if (buySellButton == 'buy') {
            setMarketPrice(aggregatedSellOrders.at(0)?.price || BigInt(0));
        } else {
            setMarketPrice(aggregatedBuyOrders.at(0)?.price || BigInt(0));
        }
    }

    function aggregateOrdersByPrice(orders: Order[]): AggregatedOrder[] {
        const aggregationMap = new Map<bigint, AggregatedOrder>();
    
        orders.forEach(order => {
            const filledAmount = order.fills.reduce((acc, fill) => BigInt(acc.toString()) + BigInt(fill), BigInt(0));
            const remainingAmount = BigInt(order.amount.toString()) - filledAmount;
    
            if (!aggregationMap.has(order.price)) {
                aggregationMap.set(order.price, {
                    price: order.price,
                    totalAmount: BigInt(0),
                    orders: []
                });
            }
            
            const aggregatedOrder = aggregationMap.get(order.price);
            if (aggregatedOrder) {
                aggregatedOrder.totalAmount = BigInt(aggregatedOrder.totalAmount.toString()) + remainingAmount;
                aggregatedOrder.orders.push(order);
            }
        });
    
        return Array.from(aggregationMap.values());
    }

    useEffect(() => {
        loadOrders();
        refreshMarketPrice();
    }, [buyOrders, sellOrders]);

    useEffect(() => {
        refreshMarketPrice();
    }, [buySellButton]);

    return (
        <div className='custom-box'>
            <div className='order-book'>
                <div className='order-book-header'>
                    <div className='row body-10 header-text'>
                        <div className='col-4'>Price</div>
                        <div className='col-4 center-text-align'>Amount</div>
                        <div className='col-4 right-text-align'>Total</div>
                    </div>
                </div>
                <div className='sellers-container body-40 end'>
                    {aggregatedSellOrders.map(order => (
                        <Row key={order.price}>
                            <Col><div className='sell-row'>{ethers.formatEther(order.price.toString())}</div></Col>
                            <Col><div className='center-text-align'>{ethers.formatEther(order.totalAmount.toString())}</div></Col>
                            <Col><div className='right-text-align'>{ethers.formatEther((order.totalAmount * order.price) / BigInt(1e18))}</div></Col>
                        </Row>
                    ))}
                </div>
                
                <div className='row body-10'>
                    <div className={(buySellButton == 'buy') ? 'market-price-box buy-row': 'market-price-box sell-row'}>
                        {ethers.formatEther(marketPrice.toString())}
                    </div>
                </div>

                <div className='buyers-container body-40'>
                    {aggregatedBuyOrders.map(order => (
                        <Row key={order.price}>
                            <Col><div className='buy-row'>{ethers.formatEther(order.price.toString())}</div></Col>
                            <Col><div className='center-text-align'>{ethers.formatEther(order.totalAmount.toString())}</div></Col>
                            <Col><div className='right-text-align'>{ethers.formatEther((order.totalAmount * order.price) / BigInt(1e18))}</div></Col>
                        </Row>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OrderBook;