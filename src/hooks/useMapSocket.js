import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import env from '../config/env';
import { setSocketStatus } from '../redux/features/mapSlice';

/**
 * Custom hook to connect to the Map Real-Time Gateway via Socket.IO
 * and wire real-time events to state handlers.
 */
export const useMapSocket = ({
    onTechnicianLocation,
    onTechnicianStatus,
    onTravelStart,
    onTravelArrived,
    onTravelCompleted,
}) => {
    const dispatch = useDispatch();
    const socketRef = useRef(null);

    // Keep handlers in refs to avoid socket reconnects when handlers change
    const handlersRef = useRef({
        onTechnicianLocation,
        onTechnicianStatus,
        onTravelStart,
        onTravelArrived,
        onTravelCompleted,
    });

    useEffect(() => {
        handlersRef.current = {
            onTechnicianLocation,
            onTechnicianStatus,
            onTravelStart,
            onTravelArrived,
            onTravelCompleted,
        };
    }, [
        onTechnicianLocation,
        onTechnicianStatus,
        onTravelStart,
        onTravelArrived,
        onTravelCompleted,
    ]);

    useEffect(() => {
        const token = Cookies.get('_acc_tkn');
        if (!token) {
            dispatch(setSocketStatus('disconnected'));
            return;
        }

        const serverUrl = env.API.VESSEL || 'http://localhost:8009';

        dispatch(setSocketStatus('connecting'));

        const socket = io(serverUrl, {
            auth: {
                token: `Bearer ${token}`,
            },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            dispatch(setSocketStatus('connected'));
        });

        socket.on('disconnect', (reason) => {
            dispatch(setSocketStatus('disconnected'));
        });

        socket.on('connect_error', (err) => {
            console.warn('Socket connect error:', err?.message);
            dispatch(setSocketStatus('disconnected'));
        });

        // 1. Technician location updates
        socket.on('technician:location', (data) => {
            if (handlersRef.current.onTechnicianLocation) {
                handlersRef.current.onTechnicianLocation(data);
            }
        });

        // 2. Technician status changes
        socket.on('technician:status', (data) => {
            if (handlersRef.current.onTechnicianStatus) {
                handlersRef.current.onTechnicianStatus(data);
            }
        });

        // 3. Travel started
        socket.on('technician:travel:start', (data) => {
            if (handlersRef.current.onTravelStart) {
                handlersRef.current.onTravelStart(data);
            }
        });

        // 4. Travel arrived
        socket.on('technician:travel:arrived', (data) => {
            if (handlersRef.current.onTravelArrived) {
                handlersRef.current.onTravelArrived(data);
            }
        });

        // 5. Travel completed
        socket.on('technician:travel:completed', (data) => {
            if (handlersRef.current.onTravelCompleted) {
                handlersRef.current.onTravelCompleted(data);
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
            dispatch(setSocketStatus('disconnected'));
        };
    }, [dispatch]);

    return socketRef;
};

export default useMapSocket;

