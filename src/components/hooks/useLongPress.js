// hooks/useLongPress.js
import { useRef } from 'react';

export const useLongPress = ({
    onLongPress,
    onClick,
    delay = 600,
}) => {
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    const start = (event) => {
        event.preventDefault();
        isLongPress.current = false;

        timerRef.current = setTimeout(() => {
            onLongPress?.(event);
            isLongPress.current = true;
        }, delay);
    };

    const clear = (event) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (!isLongPress.current) {
            onClick?.(event);
        }
    };

    return {
        onMouseDown: start,
        onTouchStart: start,
        onMouseUp: clear,
        onMouseLeave: clear,
        onTouchEnd: clear,
    };
};
