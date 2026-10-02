import React, { useEffect, useState, useCallback } from 'react';
import './controller-map.scss';
import { useDispatch, useSelector } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import SkeletonPage from '../../../components/UI_Primitives/skeleton/SkeletonPage';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import {
    MapContainer,
    CustomerMarkers,
    TechnicianMarkers,
    TravelRoute,
    TravelPath,
    CustomerInfoWindow,
    TechnicianInfoWindow,
    MapControls,
    MapLegend,
    MapSidebar,
} from '../../../components/modules/controller/map';
import {
    useGoogleMapsLoader,
    useMapBounds,
    useMapCustomers,
    useTechnicianLocations,
    useActiveTravels,
    useMapSocket,
} from '../../../hooks';
import { TbMapOff } from 'react-icons/tb';

const ControllerMap = () => {
    const dispatch = useDispatch();
    const { isLoaded, loadError } = useGoogleMapsLoader();
    const [mapInstance, setMapInstance] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { selectedTravelId, visibility } = useSelector((state) => state.map);

    // 1. Set Page Header title in Controller Layout
    useEffect(() => {
        dispatch(
            page.config({
                title: 'Live Operational Map',
                note: 'Real-time monitoring of active technicians, customer locations, and travels.',
            })
        );
    }, [dispatch]);

    // 2. Viewport bounds with debouncing
    const { debouncedBounds } = useMapBounds(mapInstance, 350);

    // 3. Customers in current viewport
    const {
        customers,
        refetch: refetchCustomers,
        isFetching: isFetchingCustomers,
    } = useMapCustomers(debouncedBounds, visibility.customers);

    // 4. Active technicians & GPS telemetry
    const {
        technicians,
        updateTechnicianLocation,
        updateTechnicianStatus,
        refetch: refetchTechnicians,
    } = useTechnicianLocations();

    // 5. Active travels & selected travel details (actualPath)
    const {
        travels,
        selectedTravelDetails,
        addOrUpdateTravel,
        markTravelArrived,
        removeCompletedTravel,
        refetchTravels,
    } = useActiveTravels(selectedTravelId);

    // 6. Socket.IO Real-Time Gateway connection
    useMapSocket({
        onTechnicianLocation: updateTechnicianLocation,
        onTechnicianStatus: updateTechnicianStatus,
        onTravelStart: addOrUpdateTravel,
        onTravelArrived: markTravelArrived,
        onTravelCompleted: removeCompletedTravel,
    });

    // 7. Master data refresh handler
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await Promise.allSettled([
                refetchCustomers(),
                refetchTechnicians(),
                refetchTravels(),
            ]);
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchCustomers, refetchTechnicians, refetchTravels]);

    // Error State: Google Maps API loading failed or missing key
    if (loadError) {
        return (
            <div className="controller-map-page" style={{ padding: '40px' }}>
                <ErrorState
                    title="Google Maps Service Unavailable"
                    description={loadError}
                    icon={<TbMapOff style={{ fontSize: '48px', color: '#EF4444' }} />}
                    footer={
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
                            Ensure <code>REACT_APP_GOOGLE_MAPS_API_KEY</code> is set in <code>.env.local</code> and has Maps JavaScript API enabled.
                        </p>
                    }
                />
            </div>
        );
    }

    // Loading State: Waiting for Google Maps script to initialize
    if (!isLoaded) {
        return <SkeletonPage />;
    }

    return (
        <div className="controller-map-page">
            {/* Collapsible monitoring sidebar */}
            <MapSidebar technicians={technicians} travels={travels} />

            {/* Main Interactive Map Area */}
            <div className="map-display-area">
                {/* Controller Action Toolbar */}
                <MapControls
                    technicians={technicians}
                    travels={travels}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing || isFetchingCustomers}
                />

                {/* Google Map Canvas */}
                <MapContainer onMapReady={setMapInstance}>
                    {/* Clustered Customer Pins */}
                    <CustomerMarkers customers={customers} />

                    {/* Active Technician Markers with Directional Arrows */}
                    <TechnicianMarkers technicians={technicians} />

                    {/* Planned Travel Routes */}
                    {travels.map((travel) => (
                        <TravelRoute
                            key={travel.travelId || travel._id}
                            travel={travel}
                        />
                    ))}

                    {/* Actual Travelled GPS Path for Selected Travel */}
                    {selectedTravelDetails?.actualPath && (
                        <TravelPath actualPath={selectedTravelDetails.actualPath} />
                    )}

                    {/* Info Windows */}
                    <CustomerInfoWindow customers={customers} />
                    <TechnicianInfoWindow technicians={technicians} travels={travels} />
                </MapContainer>

                {/* Map Symbol Legend */}
                <MapLegend />
            </div>
        </div>
    );
};

export default ControllerMap;

