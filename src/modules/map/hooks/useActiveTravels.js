import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapApi from '../services/map.api';

/**
 * Hook to manage active technician travels, routes, and actual paths
 */
export const useActiveTravels = (selectedTravelId = null) => {
    const [travelsMap, setTravelsMap] = useState({});

    // Fetch initial active travels
    const {
        data: initialTravels = [],
        isLoading: isLoadingTravels,
        isError,
        error,
        refetch: refetchTravels,
    } = useQuery({
        queryKey: ['map-active-travels'],
        queryFn: async () => {
            const res = await mapApi.getActiveTravels();
            return Array.isArray(res) ? res : res?.data || [];
        },
        staleTime: 2 * 60 * 1000,
    });

    // Populate travelsMap
    useEffect(() => {
        if (initialTravels && Array.isArray(initialTravels)) {
            setTravelsMap((prev) => {
                const next = { ...prev };
                initialTravels.forEach((tr) => {
                    const id = tr.travelId || tr._id;
                    if (id) {
                        next[id] = { ...(next[id] || {}), ...tr };
                    }
                });
                return next;
            });
        }
    }, [initialTravels]);

    // Fetch details for the selected travel (includes actualPath and full route)
    const {
        data: selectedTravelDetails = null,
        isLoading: isLoadingDetails,
        refetch: refetchDetails,
    } = useQuery({
        queryKey: ['map-travel-details', selectedTravelId],
        queryFn: async () => {
            if (!selectedTravelId) return null;
            const res = await mapApi.getTravelDetails(selectedTravelId);
            return res?.data || res || null;
        },
        enabled: Boolean(selectedTravelId),
        staleTime: 30 * 1000,
    });

    /**
     * Add or update active travel on 'technician:travel:start'
     */
    const addOrUpdateTravel = useCallback((travelPayload) => {
        if (!travelPayload) return;
        const id = travelPayload.travelId || travelPayload._id || travelPayload.serviceVisitId;
        if (!id) return;

        setTravelsMap((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                ...travelPayload,
                status: 'IN_PROGRESS',
            },
        }));
    }, []);

    /**
     * Mark travel arrived on 'technician:travel:arrived'
     */
    const markTravelArrived = useCallback((payload) => {
        if (!payload) return;
        const id = payload.travelId || payload._id || payload.serviceVisitId;

        setTravelsMap((prev) => {
            const targetId = id || Object.keys(prev).find(
                (k) => prev[k].technicianId === payload.technicianId || prev[k].serviceVisitId === payload.serviceVisitId
            );

            if (!targetId || !prev[targetId]) return prev;

            return {
                ...prev,
                [targetId]: {
                    ...prev[targetId],
                    status: 'ARRIVED',
                    arrivedAt: payload.arrivedAt || new Date().toISOString(),
                },
            };
        });
    }, []);

    /**
     * Remove or mark travel completed on 'technician:travel:completed'
     */
    const removeCompletedTravel = useCallback((payload) => {
        if (!payload) return;
        const id = payload.travelId || payload._id || payload.serviceVisitId;

        setTravelsMap((prev) => {
            const targetId = id || Object.keys(prev).find(
                (k) => prev[k].registrationId === payload.registrationId || prev[k].serviceVisitId === payload.serviceVisitId
            );

            if (!targetId) return prev;

            const next = { ...prev };
            delete next[targetId];
            return next;
        });
    }, []);

    const travels = useMemo(() => Object.values(travelsMap), [travelsMap]);

    return {
        travels,
        travelsMap,
        selectedTravelDetails,
        isLoadingTravels,
        isLoadingDetails,
        isError,
        error,
        addOrUpdateTravel,
        markTravelArrived,
        removeCompletedTravel,
        refetchTravels,
        refetchDetails,
    };
};

export default useActiveTravels;

