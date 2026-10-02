import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGoogleMap } from './MapContext';
import { geoPointToLatLng } from '../../../../utils/map.utils';

export const TravelPath = ({ actualPath = [] }) => {
    const { map } = useGoogleMap();
    const { visibility } = useSelector((state) => state.map);
    const polylineRef = useRef(null);

    useEffect(() => {
        if (!map || !window.google) return;

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }

        if (!visibility.travels || !visibility.actualPath || !actualPath || actualPath.length < 2) {
            return;
        }

        const pathCoords = actualPath
            .map((pt) => geoPointToLatLng(pt?.location || pt))
            .filter(Boolean);

        if (pathCoords.length < 2) return;

        polylineRef.current = new window.google.maps.Polyline({
            path: pathCoords,
            geodesic: true,
            strokeColor: '#10B981', // Emerald green
            strokeOpacity: 0.95,
            strokeWeight: 3.5,
            zIndex: 60, // Above planned route
            map,
        });

        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };
    }, [map, actualPath, visibility.travels, visibility.actualPath]);

    return null;
};

export default TravelPath;

