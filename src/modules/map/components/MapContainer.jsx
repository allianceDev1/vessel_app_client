import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContext } from './MapContext';
import { clearSelection, clearFitBoundsRequest } from '../store/mapSlice';

// Clean, modern enterprise map styles
const MAP_STYLES = [
    {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ lightness: 20 }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#c9e2f5' }],
    },
];

export const MapContainer = ({
    children,
    onMapReady,
    initialCenter = { lat: 10.0241, lng: 76.3210 }, // Default Edappally/Kochi operations center
    initialZoom = 12,
}) => {
    const mapRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const dispatch = useDispatch();
    const { fitBoundsRequest } = useSelector((state) => state.map);

    // Initialize Google Map instance once
    useEffect(() => {
        if (!mapRef.current || !window.google || mapInstance) return;

        const map = new window.google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: initialZoom,
            disableDefaultUI: true,
            gestureHandling: 'greedy',
            styles: MAP_STYLES,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        });

        // Clear selections when clicking anywhere on empty map
        map.addListener('click', (e) => {
            // Only clear if clicked on map canvas, not a marker/overlay
            dispatch(clearSelection());
        });

        setMapInstance(map);

        if (onMapReady) {
            onMapReady(map);
        }
    }, [initialCenter, initialZoom, mapInstance, onMapReady, dispatch]);

    // Handle fit bounds requests from Redux actions
    useEffect(() => {
        if (!mapInstance || !fitBoundsRequest || !window.google) return;

        const { type, payload } = fitBoundsRequest;

        try {
            if (type === 'ALL_TECH') {
                const technicians = payload || [];
                const validPoints = technicians
                    .map((t) => {
                        const coords = t?.location?.coordinates;
                        if (coords && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
                            return { lat: Number(coords[1]), lng: Number(coords[0]) };
                        }
                        if (t?.latitude && t?.longitude) {
                            return { lat: Number(t.latitude), lng: Number(t.longitude) };
                        }
                        return null;
                    })
                    .filter(Boolean);

                if (validPoints.length === 1) {
                    mapInstance.panTo(validPoints[0]);
                    mapInstance.setZoom(15);
                } else if (validPoints.length > 1) {
                    const bounds = new window.google.maps.LatLngBounds();
                    validPoints.forEach((pt) => bounds.extend(pt));
                    mapInstance.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
                }
            } else if (type === 'PAN_TO' && payload) {
                mapInstance.panTo({ lat: Number(payload.lat), lng: Number(payload.lng) });
                if (payload.zoom) {
                    mapInstance.setZoom(payload.zoom);
                }
            } else if (type === 'FIT_COORDINATES' && Array.isArray(payload) && payload.length > 0) {
                if (payload.length === 1) {
                    mapInstance.panTo(payload[0]);
                    mapInstance.setZoom(15);
                } else {
                    const bounds = new window.google.maps.LatLngBounds();
                    payload.forEach((pt) => bounds.extend(pt));
                    mapInstance.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
                }
            }
        } catch (e) {
            console.warn('Error executing fitBounds:', e);
        } finally {
            dispatch(clearFitBoundsRequest());
        }
    }, [mapInstance, fitBoundsRequest, dispatch]);

    return (
        <MapContext.Provider value={{ map: mapInstance }}>
            <div className="map-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
                <div
                    ref={mapRef}
                    className="google-map-canvas"
                    style={{ width: '100%', height: '100%' }}
                />
                {mapInstance && children}
            </div>
        </MapContext.Provider>
    );
};

export default MapContainer;

