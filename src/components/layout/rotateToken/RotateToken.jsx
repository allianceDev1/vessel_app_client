import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { rotateAccessToken } from '../../../api/axios/tokenHandler';

const ROTATE_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours (for 5hr token expiry)
const EXPIRY_BUFFER_MS = 60 * 60 * 1000; // 1 hour buffer before 5hr expiry

const shouldRotateToken = (lastRotatedAt) => {
    const token = Cookies.get('_acc_tkn');
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.exp) {
            return payload.exp * 1000 - Date.now() <= EXPIRY_BUFFER_MS;
        }
    } catch {
        // If token is not a decodable JWT, fall back to elapsed time check
    }

    return Date.now() - lastRotatedAt >= ROTATE_INTERVAL_MS;
};

const RotateToken = () => {
    const lastRotatedAtRef = useRef(Date.now());

    useEffect(() => {
        const rotate = () => {
            rotateAccessToken()
                .then(() => {
                    lastRotatedAtRef.current = Date.now();
                })
                .catch(() => {});
        };

        const checkAndRotate = () => {
            if (document.visibilityState === 'visible' && shouldRotateToken(lastRotatedAtRef.current)) {
                rotate();
            }
        };

        // Check on initial mount in case existing token is already close to its 5hr expiry
        checkAndRotate();

        const interval = setInterval(rotate, ROTATE_INTERVAL_MS);

        document.addEventListener('visibilitychange', checkAndRotate);
        window.addEventListener('focus', checkAndRotate);
        window.addEventListener('online', checkAndRotate);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', checkAndRotate);
            window.removeEventListener('focus', checkAndRotate);
            window.removeEventListener('online', checkAndRotate);
        };
    }, []);

    return null;
}

export default RotateToken