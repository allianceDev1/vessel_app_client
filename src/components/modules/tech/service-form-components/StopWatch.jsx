import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../../../UI_Primitives/buttons/Button'
import './stopwatch.scss'

const StopWatch = () => {
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const handleStart = useCallback(() => {
        setIsRunning(true);
        setIsPaused(false);
    }, []);

    const handlePause = useCallback(() => {
        setIsPaused(true);
    }, []);

    const handleReset = useCallback(() => {
        setStopwatchTime(0);
        setIsRunning(false);
        setIsPaused(false);
    }, []);


    const formattedStopwatch = useMemo(() => {
        if (!stopwatchTime) {
            return '00:00:00'
        }

        const totalSeconds = Math.floor(stopwatchTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((stopwatchTime % 1000) / 10);

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
    }, [stopwatchTime]);

    useEffect(() => {
        let interval;
        if (isRunning && !isPaused) {
            interval = setInterval(() => {
                setStopwatchTime(prev => prev + 10);
            }, 10);
        }
        return () => clearInterval(interval);
    }, [isRunning, isPaused]);

    return (
        <div className="tech-stop-watch-container">
            <p>{formattedStopwatch}</p>
            <div className="buttons">
                <Button rounded size="large" label={'Reset'} onClick={handleReset} />
                {isRunning && !isPaused && <Button rounded size="large" label={'Stop'} severity={'danger'} onClick={handlePause} />}
                {isRunning && isPaused && <Button rounded size="large" label={'Resume'} severity={'info'} onClick={handleStart} />}
                {!isRunning && !isPaused && <Button rounded size="large" label={'Start'} severity={'success'} onClick={handleStart} />}
            </div>
        </div>
    )
}

export default StopWatch