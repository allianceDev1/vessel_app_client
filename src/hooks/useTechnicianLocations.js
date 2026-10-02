import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapApi from '../services/map.api';

/**
 * Hook to manage active technician locations and real-time GPS coordinates
 */
export const useTechnicianLocations = () => {
    // Map of technicianId -> technician object
    const [techMap, setTechMap] = useState({});

    const {
        data: initialTechs = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['map-active-technicians'],
        queryFn: async () => {
            const res = await mapApi.getActiveTechnicians();
            return Array.isArray(res) ? res : res?.data || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    // Populate techMap when initial fetch resolves
    useEffect(() => {
        if (initialTechs && Array.isArray(initialTechs)) {
            setTechMap((prev) => {
                const next = { ...prev };
                initialTechs.forEach((t) => {
                    const id = t.technicianId || t.sid || t._id;
                    if (id) {
                        next[id] = {
                            ...(next[id] || {}),
                            ...t,
                            // Ensure standard coordinates
                            location: t.location || {
                                type: 'Point',
                                coordinates: [t.longitude || 0, t.latitude || 0],
                            },
                        };
                    }
                });
                return next;
            });
        }
    }, [initialTechs]);

    /**
     * Updates an individual technician's position from real-time socket payload
     * Payload: { technicianId, latitude, longitude, accuracy, speed, heading, recordedAt, status, serviceVisitId, customerId }
     */
    const updateTechnicianLocation = useCallback((payload) => {
        if (!payload || !payload.technicianId) return;

        setTechMap((prev) => {
            const id = payload.technicianId;
            const existing = prev[id] || {};

            const lat = Number(payload.latitude);
            const lng = Number(payload.longitude);

            return {
                ...prev,
                [id]: {
                    ...existing,
                    ...payload,
                    location: {
                        type: 'Point',
                        coordinates: [lng, lat],
                    },
                    latitude: lat,
                    longitude: lng,
                    accuracy: payload.accuracy ?? existing.accuracy,
                    speed: payload.speed ?? existing.speed,
                    heading: payload.heading ?? existing.heading,
                    recordedAt: payload.recordedAt || new Date().toISOString(),
                    status: payload.status || existing.status || 'TRAVEL',
                },
            };
        });
    }, []);

    /**
     * Updates an individual technician's operational status
     * Payload: { technicianId, status, serviceVisitId, registrationId, customerId }
     */
    const updateTechnicianStatus = useCallback((payload) => {
        if (!payload || !payload.technicianId) return;

        setTechMap((prev) => {
            const id = payload.technicianId;
            const existing = prev[id];
            if (!existing) return prev;

            return {
                ...prev,
                [id]: {
                    ...existing,
                    status: payload.status || existing.status,
                    serviceVisitId: payload.serviceVisitId || existing.serviceVisitId,
                    registrationId: payload.registrationId || existing.registrationId,
                    customerId: payload.customerId || existing.customerId,
                },
            };
        });
    }, []);

    const technicians = useMemo(() => Object.values(techMap), [techMap]);

    return {
        technicians,
        techMap,
        isLoading,
        isError,
        error,
        updateTechnicianLocation,
        updateTechnicianStatus,
        refetch,
    };
};

export default useTechnicianLocations;

