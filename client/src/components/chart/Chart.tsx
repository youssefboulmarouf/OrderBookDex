import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Brush, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../AppContext';
import { NewTradeEvent } from '../common/common-props';
import { ethers } from 'ethers';

const Chart: React.FC = () => {
    const { selectedAsset, tokenTrades } = useAppContext();
    const [filtredTokenTrades, setFiltredTokenTrades] = useState<NewTradeEvent[]>([]);

    type ChartDataType = { timestamp: string; price: number };
    const [chartData, setChartData] = useState<ChartDataType[]>([]);

    function formatTimestampToLocalTime(timestampStr: string): string {
        const timestamp = parseInt(timestampStr, 10);
        const date = new Date(timestamp * 1000);
        
        // Format date to local time without specifying a timezone
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    useEffect(() => {
        const newTokenTrades: NewTradeEvent[] = tokenTrades.filter(trade => trade.ticker === selectedAsset.ticker);
        setFiltredTokenTrades(newTokenTrades)
        
        const chartDataType: ChartDataType[] = [];
        newTokenTrades.map(ntt => chartDataType.push({
            timestamp: formatTimestampToLocalTime(ntt.date.toString()), 
            price: +ethers.formatEther(ntt.price.toString())
        }));

        setChartData(chartDataType);
        
        console.log('filtredTokenTrades: ', filtredTokenTrades);
    }, [tokenTrades, selectedAsset]);

    return (
        <div className=''>
            <div className='custom-box middle-box'>
                <div className='dex-chart'>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart width={1000} height={500} data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: -10 }}>
                            <Line type="bump" dataKey="price" strokeWidth={3} stroke="#efbf45" dot={true} isAnimationActive={false}/>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Brush />
                            <Tooltip />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default Chart;