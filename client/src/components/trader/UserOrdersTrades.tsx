import { Tab, Tabs } from "react-bootstrap";
import TraderOrders from "./TraderOrders";
import './user-orders-trades.css';
import TraderTrades from "./TraderTrades";
import { useAppContext } from '../../AppContext';
import { Order } from "../common/common-props";
import { useEffect, useState } from "react";
import { Console } from "console";

const UserOrdersTrades: React.FC = () => {
    
    return(
        <>
        <div className='custom-box'>
            <div className='user-orders-trades'>
                <Tabs defaultActiveKey="orders" className="mb-3">
                    <Tab eventKey="orders" title="Orders">
                        <TraderOrders/>
                    </Tab>
                    <Tab eventKey="trades" title="Trades">
                        <TraderTrades/>
                    </Tab>
                </Tabs>
            </div>
        </div>
        </>
    );
}

export default UserOrdersTrades;