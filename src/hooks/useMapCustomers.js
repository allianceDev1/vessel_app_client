import { useQuery } from '@tanstack/react-query';
import mapApi from '../services/map.api';

/**
 * Hook to load customers within the current debounced map viewport bounds
 */
export const useMapCustomers = (debouncedBounds, enabled = true) => {
    const hasValidBounds = Boolean(
        debouncedBounds &&
        typeof debouncedBounds.north === 'number' &&
        typeof debouncedBounds.south === 'number' &&
        typeof debouncedBounds.east === 'number' &&
        typeof debouncedBounds.west === 'number'
    );

    const {
        data: customers = [],
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            'map-customers',
            debouncedBounds?.north?.toFixed(3),
            debouncedBounds?.south?.toFixed(3),
            debouncedBounds?.east?.toFixed(3),
            debouncedBounds?.west?.toFixed(3),
        ],
        queryFn: async () => {
            const res = await mapApi.getCustomersInViewport({
                north: debouncedBounds.north,
                south: debouncedBounds.south,
                east: debouncedBounds.east,
                west: debouncedBounds.west,
                limit: 500,
            });
            return Array.isArray(res) ? res : res?.data || [];
        },
        enabled: enabled && hasValidBounds,
        staleTime: 60 * 1000, // 1 minute cache
        placeholderData: (previousData) => previousData, // keep previous customers while fetching new viewport
    });

    return {
        customers: Array.isArray(customers) ? customers : [],
        isLoading: isLoading && !customers.length,
        isFetching,
        isError,
        error,
        refetch,
    };
};

export default useMapCustomers;

