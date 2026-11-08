import React, { useState, useEffect } from 'react'
import './text-address.scss';
import { TbMapPin, TbRoute, TbClock, TbLoader2, TbLocationOff } from 'react-icons/tb';
import Button from '../../../UI_Primitives/buttons/Button';
import { getLocation, redirectDirectionLocation, redirectViewLocation } from '../../../../utils/services/location_services';
import { ssTv2Axios } from '../../../../api/axios/axiosConfig';
import { formatDistance, formatDuration } from '../../../../utils/map.utils';

const TextAddress = ({
    address = null,
    landmark = null,
    location = { place: null, post: null, placeId: null, lat: null, lng: null },
    viewMapButton = true,
    directionButton = false,
    route = null
}) => {
    const [fetchedRoute, setFetchedRoute] = useState(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [routeError, setRouteError] = useState(null);

    const hasPassedRoute = Boolean(
        route && (route.distance_meters != null || route.duration_seconds != null || route.distanceMeters != null || route.durationSeconds != null || route.polyline)
    );

    useEffect(() => {
        if (hasPassedRoute) {
            setIsLoadingRoute(false);
            setRouteError(null);
            return;
        }

        const destLat = location?.lat;
        const destLng = location?.lng;

        if (!destLat || !destLng) {
            setFetchedRoute(null);
            setIsLoadingRoute(false);
            setRouteError('Customer location unavailable');
            return;
        }

        let isMounted = true;

        const fetchRoute = async () => {
            setIsLoadingRoute(true);
            setRouteError(null);

            try {
                const locResult = await getLocation();

                if (!isMounted) return;

                if (!locResult?.success) {
                    setRouteError(locResult?.message || 'Location unavailable');
                    setIsLoadingRoute(false);
                    return;
                }

                const response = await ssTv2Axios.post('/map/location/routes', {
                    origin: {
                        latitude: locResult.latitude,
                        longitude: locResult.longitude
                    },
                    destination: {
                        latitude: Number(destLat),
                        longitude: Number(destLng)
                    }
                });

                if (!isMounted) return;

                const resData = response;
                const distanceMeters = resData?.distanceMeters ?? resData?.distance_meters ?? 0;
                const durationSeconds = resData?.durationSeconds ?? resData?.duration_seconds ?? 0;
                const polyline = resData?.polyline || null;

                if (distanceMeters === 0 && durationSeconds === 0) {
                    setRouteError('Route data unavailable');
                    setFetchedRoute(null);
                } else {
                    setFetchedRoute({
                        distance_meters: distanceMeters,
                        duration_seconds: durationSeconds,
                        polyline
                    });
                    setRouteError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setRouteError('Route data unavailable');
                    setFetchedRoute(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingRoute(false);
                }
            }
        };

        fetchRoute();

        return () => {
            isMounted = false;
        };
    }, [location?.lat, location?.lng, hasPassedRoute]);

    const activeRoute = hasPassedRoute ? route : fetchedRoute;

    const distance = formatDistance(activeRoute?.distance_meters ?? activeRoute?.distance ?? activeRoute?.distanceMeters);
    const duration = formatDuration(activeRoute?.duration_seconds ?? activeRoute?.duration ?? activeRoute?.durationSeconds);

    const hasLocation = Boolean(location?.placeId || (location?.lat && location?.lng));
    const hasRoute = Boolean(activeRoute?.polyline);

    const handleViewLocation = () => {
        redirectViewLocation(location.placeId, location.lat, location.lng, location.place, location.post);
    };

    const handleDirection = async () => {
        await redirectDirectionLocation(location.placeId, location.lat, location.lng, activeRoute);
    };

    return (
        <div className="tech-customer-text-address-comp">
            <div className="content">
                <TbMapPin />
                <p>{address}</p>
            </div>

            {isLoadingRoute && (
                <div className="route-info loading">
                    <TbLoader2 className="spin-icon" />
                    <span>Fetching route...</span>
                </div>
            )}

            {!isLoadingRoute && routeError && !distance && !duration && (
                <div className="route-info error">
                    <TbLocationOff />
                    <span>{routeError}</span>
                </div>
            )}

            {!isLoadingRoute && !routeError && (distance || duration) && (
                <div className="route-info">
                    {distance && (
                        <div className="route-item">
                            <TbRoute />
                            <span>{distance}</span>
                        </div>
                    )}
                    {duration && (
                        <div className="route-item">
                            <TbClock />
                            <span>{duration}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="buttons-div" style={{ gridTemplateColumns: viewMapButton && directionButton ? '1fr 1fr' : '1fr' }}>
                {viewMapButton && <Button label={'View on Google Map'} size='small' style={{ width: '100%' }} rounded severity={'secondary'}
                    onClick={handleViewLocation} disabled={!hasLocation} />}
                {directionButton && <Button label={'Get Directions'} severity={'primary'} size='small' style={{ width: '100%' }} rounded
                    onClick={handleDirection} disabled={!hasLocation && !hasRoute} />}
            </div>
            <p className="landmark">{landmark}</p>
        </div>
    )
}

export default TextAddress;