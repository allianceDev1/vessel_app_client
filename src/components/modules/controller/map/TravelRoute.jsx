import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGoogleMap } from './MapContext';
import { decodePolyline, geoPointToLatLng, createOriginIcon, createDestinationIcon } from '../../../../utils/map.utils';

export const TravelRoute = ({ travel }) => {
    const { map } = useGoogleMap();
    const { visibility, selectedTravelId } = useSelector((state) => state.map);

    const polylineRef = useRef(null);
    const originMarkerRef = useRef(null);
    const destMarkerRef = useRef(null);

    const isSelected = selectedTravelId && (travel?.travelId === selectedTravelId || travel?._id === selectedTravelId);

    useEffect(() => {
        if (!map || !window.google || !travel) return;

        // Cleanup existing instances
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }
        if (originMarkerRef.current) {
            originMarkerRef.current.setMap(null);
            originMarkerRef.current = null;
        }
        if (destMarkerRef.current) {
            destMarkerRef.current.setMap(null);
            destMarkerRef.current = null;
        }

        if (!visibility.travels) return;

        // 1. Decode planned route polyline
        const encoded = travel?.route?.polyline;
        if (encoded) {
            const path = decodePolyline(encoded);
            if (path && path.length > 0) {
                polylineRef.current = new window.google.maps.Polyline({
                    path,
                    geodesic: true,
                    strokeColor: isSelected ? '#1D4ED8' : '#3B82F6', // Darker blue if selected
                    strokeOpacity: isSelected ? 0.95 : 0.75,
                    strokeWeight: isSelected ? 5 : 4,
                    zIndex: isSelected ? 50 : 20,
                    map,
                });
            }
        }

        // 2. Origin marker (technician travel start)
        const originPos = geoPointToLatLng(travel?.origin?.location);
        if (originPos) {
            originMarkerRef.current = new window.google.maps.Marker({
                position: originPos,
                map,
                icon: createOriginIcon(),
                title: `Start: ${travel?.origin?.address || 'Origin'}`,
                zIndex: 40,
            });
        }

        // 3. Destination marker (target customer location)
        const destPos = geoPointToLatLng(travel?.destination?.location);
        if (destPos) {
            destMarkerRef.current = new window.google.maps.Marker({
                position: destPos,
                map,
                icon: createDestinationIcon(),
                title: `Destination: ${travel?.destination?.address || 'Customer'}`,
                zIndex: 40,
            });
        }

        return () => {
            if (polylineRef.current) polylineRef.current.setMap(null);
            if (originMarkerRef.current) originMarkerRef.current.setMap(null);
            if (destMarkerRef.current) destMarkerRef.current.setMap(null);
        };
    }, [map, travel, visibility.travels, isSelected]);

    return null;
};

export default TravelRoute;

