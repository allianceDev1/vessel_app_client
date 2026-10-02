import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to track Google Map viewport bounds and debounce changes
 * to prevent excessive API requests while panning/zooming.
 */
export const useMapBounds = (map, debounceMs = 350) => {
    const [bounds, setBounds] = useState(null);
    const [debouncedBounds, setDebouncedBounds] = useState(null);
    const [zoom, setZoom] = useState(12);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        const updateBounds = () => {
            const rawBounds = map.getBounds();
            const currentZoom = map.getZoom();

            if (!rawBounds) return;

            const ne = rawBounds.getNorthEast();
            const sw = rawBounds.getSouthWest();

            const current = {
                north: ne.lat(),
                south: sw.lat(),
                east: ne.lng(),
                west: sw.lng(),
            };

            setBounds(current);
            setZoom(currentZoom);

            // Debounce updating debouncedBounds
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                setDebouncedBounds(current);
            }, debounceMs);
        };

        const idleListener = map.addListener('idle', updateBounds);

        // Run once initially if bounds already available
        if (map.getBounds()) {
            updateBounds();
        }

        return () => {
            if (idleListener && window.google?.maps?.event) {
                window.google.maps.event.removeListener(idleListener);
            }
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [map, debounceMs]);

    return { bounds, debouncedBounds, zoom };
};

export default useMapBounds;

