import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Table } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { XSquareFill } from 'react-bootstrap-icons';

import './trades.css';
import { Order } from '../common/common-props';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../AppContext';

const Trades: React.FC = () => {
    const { account, buyOrders, sellOrders } = useAppContext();
    const [currentTokensOrders, setCurrentTokensOrders] = useState<Order[]>([]);

    const cancelTrade = (e: React.FormEvent, order: Order) => {
        console.log('Order To Cancel: ', order);
    }

    function formatDate(timestampStr: string): string {
        const timestamp = parseInt(timestampStr, 10) * 1000;
        const date = new Date(timestamp);
    
        return `${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    }

    const ectractMyOrder = (orders: Order[], address: string): Order[] => {
        const myOrders: Order[] = []
        orders.forEach(order => {
            if (order.traderAddress === address) {
                myOrders.push(order)
            }
        });
        return myOrders;
    }

    const loadOrders = async () => {
        const address = await account.getAddress();
        setCurrentTokensOrders(ectractMyOrder(buyOrders, address).concat(ectractMyOrder(sellOrders, address)))
    }

    useEffect(() => {
        loadOrders();
    }, [buyOrders, sellOrders]);

    return (
        <div className="default-box-layout trades">
            <div className='title-box'>Orders & Trades</div>
            <div className='inner-box'>
                <Tabs defaultActiveKey="orders">
                    <Tab eventKey="orders" title="My Orders">
                        <div className="table-container">
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Side</th>
                                        <th>Amount</th>
                                        <th>Price</th>
                                        <th>Cancel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTokensOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>{formatDate(order.date.toString())}</td>
                                            <td>{(order.orderSide.toString() === '0') ? 'BUY' : 'SELL'}</td>
                                            <td>{ethers.formatEther(order.amount.toString())}</td>
                                            <td>{order.price.toString()}</td>
                                            <td>
                                            <Button 
                                                className='action-button' 
                                                variant='' 
                                                onClick={(e) => cancelTrade(e, order)}
                                            >
                                                <XSquareFill color='red' size={20}/>
                                            </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
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