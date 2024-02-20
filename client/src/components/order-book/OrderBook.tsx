import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Table } from 'react-bootstrap';
import { Order, ORDER_SIDE } from '../common/common-props';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../AppContext';
import './order-book.css';

interface AggregatedOrder {
    price: number;
    totalAmount: BigInt;
    orders: Order[];
}

const OrderBook: React.FC = () => {
    const { buyOrders, sellOrders } = useAppContext();

    const [aggregatedBuyOrders, setAggregatedBuyOrders] = useState<AggregatedOrder[]>([]);
    const [aggregatedSellOrders, setAggregatedSellOrders] = useState<AggregatedOrder[]>([]);

    const loadOrders = async () => {
        setAggregatedBuyOrders(aggregateOrdersByPrice(buyOrders))
        setAggregatedSellOrders(aggregateOrdersByPrice(sellOrders))
    }

    function aggregateOrdersByPrice(orders: Order[]): AggregatedOrder[] {
        orders = [...orders].reverse();
    
        const aggregationMap = new Map<number, AggregatedOrder>();
    
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
    }, [buyOrders, sellOrders]);

    return (
        <div className="default-box-layout order-book">
            <div className='title-box'>ORDER BOOK</div>
            <div className='inner-box'>
                <Tabs defaultActiveKey="orderBook" fill>
                    <Tab eventKey="orderBook" title="Order Book">
                        <Table>
                            <thead>
                                <tr>
                                    <th>Price</th>
                                    <th>AMount</th>
                                </tr>
                            </thead>
                            <tbody>
                            {aggregatedSellOrders.map(order => (
                                <tr key={order.price} className='sell-rows'>
                                    <td>{order.price.toString()}</td>
                                    <td>{ethers.formatEther(order.totalAmount.toString())}</td>
                                </tr>
                            ))}

                            <tr><td></td><td></td></tr>

                            {aggregatedBuyOrders.map(order => (
                                <tr key={order.price} className='buy-rows'>
                                    <td>{order.price.toString()}</td>
                                    <td>{ethers.formatEther(order.totalAmount.toString())}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Tab>
                    <Tab eventKey="allTrades" title="All Trades">
                        Tab content for Profile
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}

export default OrderBook;