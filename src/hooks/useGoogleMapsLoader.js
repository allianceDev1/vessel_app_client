import { useState, useEffect } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import env from '../config/env';

let loadPromise = null;

export const useGoogleMapsLoader = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const apiKey = env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            setLoadError('Google Maps API key is not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in .env.local.');
            return;
        }

        // If google.maps is already available on window
        if (window.google && window.google.maps && window.google.maps.Map) {
            setIsLoaded(true);
            return;
        }

        if (!loadPromise) {
            try {
                setOptions({
                    key: apiKey,
                    v: 'weekly',
                });

                loadPromise = Promise.all([
                    importLibrary('maps'),
                    importLibrary('geometry'),
                    importLibrary('marker'),
                ]);
            } catch (err) {
                setLoadError(err?.message || 'Failed to initialize Google Maps loader options');
                return;
            }
        }

        loadPromise
            .then(() => {
                setIsLoaded(true);
            })
            .catch((err) => {
                console.error('Failed to load Google Maps JS API:', err);
                setLoadError(err?.message || 'Failed to load Google Maps SDK');
                loadPromise = null; // reset so retry is possible
            });
    }, []);

    return { isLoaded, loadError };
};

export default useGoogleMapsLoader;
