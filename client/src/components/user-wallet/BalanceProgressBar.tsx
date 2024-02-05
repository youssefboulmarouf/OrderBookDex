import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

interface BalanceProgressBarProps {
    free: BigInt | undefined;
    locked: BigInt | undefined;
}

const BalanceProgressBar: React.FC<BalanceProgressBarProps> = (props) => {
    const [freePercentage, setFreePercentage] = useState<number>(0);
    const [lockPercentage, setLockPercentage] = useState<number>(0);

    const free = props.free ? +ethers.utils.formatEther(props.free.toString()) : 0;
    const lock = props.locked ? +ethers.utils.formatEther(props.locked.toString()) : 0;

    useEffect(() => {
        const total = free + lock;

        if (total > 0) {
            setFreePercentage((free / total) * 100);
            setLockPercentage((lock / total) * 100);
        } else {
            setFreePercentage(0);
            setLockPercentage(0);
        }
    }, [free, lock]);

    return (
        <div>
            <div className='progress-container'>
                <span className='progress-label'>Available: {free}</span>
                <span className='progress-label'>Locked: {lock}</span>
            </div>
            <ProgressBar className='progress'>
                <ProgressBar variant='success' now={freePercentage}/>
                <ProgressBar variant='danger' now={lockPercentage}/>
            </ProgressBar>
        </div>
    );
}

export default BalanceProgressBar;