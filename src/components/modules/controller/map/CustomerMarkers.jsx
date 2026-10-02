import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useGoogleMap } from './MapContext';
import { createCustomerIcon, geoPointToLatLng } from '../../../../utils/map.utils';
import { setSelectedCustomer } from '../../../../redux/features/mapSlice';

export const CustomerMarkers = ({ customers = [] }) => {
    const { map } = useGoogleMap();
    const dispatch = useDispatch();
    const { visibility, selectedCustomerId } = useSelector((state) => state.map);

    const clustererRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !window.google) return;

        // Initialize MarkerClusterer if not created yet
        if (!clustererRef.current) {
            clustererRef.current = new MarkerClusterer({
                map: visibility.customers ? map : null,
                markers: [],
            });
        }
    }, [map, visibility.customers]);

    useEffect(() => {
        if (!map || !clustererRef.current || !window.google) return;

        // Clear existing markers from clusterer
        clustererRef.current.clearMarkers();
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // If visibility is disabled or no customers, stop here
        if (!visibility.customers || !customers.length) {
            return;
        }

        const icon = createCustomerIcon();
        const newMarkers = [];

        customers.forEach((customer) => {
            const position = geoPointToLatLng(customer.location);
            if (!position) return;

            const cid = customer.cid || customer._id;

            const marker = new window.google.maps.Marker({
                position,
                icon,
                title: customer.name ? `${customer.name} (${cid})` : cid,
            });

            marker.addListener('click', () => {
                dispatch(setSelectedCustomer(cid));
            });

            newMarkers.push(marker);
        });

        markersRef.current = newMarkers;
        clustererRef.current.addMarkers(newMarkers);

        return () => {
            if (clustererRef.current) {
                clustererRef.current.clearMarkers();
            }
            newMarkers.forEach((m) => m.setMap(null));
        };
    }, [map, customers, visibility.customers, dispatch]);

    // Handle clusterer visibility toggle
    useEffect(() => {
        if (clustererRef.current && map) {
            clustererRef.current.setMap(visibility.customers ? map : null);
        }
    }, [visibility.customers, map]);

    return null;
};

export default CustomerMarkers;

