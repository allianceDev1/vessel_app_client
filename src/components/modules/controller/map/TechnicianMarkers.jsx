import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleMap } from './MapContext';
import { createTechnicianIcon, geoPointToLatLng } from '../../../../utils/map.utils';
import { setSelectedTechnician } from '../../../../redux/features/mapSlice';

export const TechnicianMarkers = ({ technicians = [] }) => {
    const { map } = useGoogleMap();
    const dispatch = useDispatch();
    const { visibility, technicianFilter } = useSelector((state) => state.map);

    // Dictionary of technicianId -> google.maps.Marker instance
    const markersMapRef = useRef({});

    useEffect(() => {
        if (!map || !window.google) return;

        const currentMarkers = markersMapRef.current;
        const activeIds = new Set();

        technicians.forEach((tech) => {
            const id = tech.technicianId || tech.sid || tech._id;
            if (!id) return;

            activeIds.add(id);

            const position = geoPointToLatLng(tech.location) || (tech.latitude && tech.longitude ? { lat: tech.latitude, lng: tech.longitude } : null);
            if (!position) return;

            // Check filter match
            const matchesFilter =
                technicianFilter === 'ALL' ||
                tech.status === technicianFilter;

            const shouldShow = visibility.technicians && matchesFilter;

            let marker = currentMarkers[id];

            if (!marker) {
                // Create marker for the first time
                marker = new window.google.maps.Marker({
                    position,
                    map: shouldShow ? map : null,
                    icon: createTechnicianIcon(tech),
                    title: `${tech.name || 'Technician'} (${tech.status || 'IDLE'})`,
                    zIndex: 100, // Technicians above customer pins
                });

                marker.addListener('click', () => {
                    dispatch(setSelectedTechnician(id));
                });

                currentMarkers[id] = marker;
            } else {
                // Smoothly update existing marker position and icon without recreating
                const curPos = marker.getPosition();
                if (!curPos || curPos.lat() !== position.lat || curPos.lng() !== position.lng) {
                    marker.setPosition(position);
                }

                // Update icon in case heading or status changed
                marker.setIcon(createTechnicianIcon(tech));
                marker.setTitle(`${tech.name || 'Technician'} (${tech.status || 'IDLE'})`);
                marker.setMap(shouldShow ? map : null);
            }
        });

        // Remove markers for technicians who are no longer in the list
        Object.keys(currentMarkers).forEach((id) => {
            if (!activeIds.has(id)) {
                currentMarkers[id].setMap(null);
                delete currentMarkers[id];
            }
        });

        return () => {
            // Cleanup on full unmount
        };
    }, [map, technicians, visibility.technicians, technicianFilter, dispatch]);

    // Handle complete unmount cleanup
    useEffect(() => {
        const currentMarkers = markersMapRef.current;
        return () => {
            Object.values(currentMarkers).forEach((marker) => marker.setMap(null));
            markersMapRef.current = {};
        };
    }, []);

    return null;
};

export default TechnicianMarkers;

