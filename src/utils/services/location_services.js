import { decodePolyline } from '../map.utils';

export const redirectViewLocation = (placeId = null, customerLat, customerLng, place, post) => {

    if (!placeId && !customerLat && !customerLng && (!place && !post)) {
        return;
    }

    let mapsUrl;

    if (placeId) {
        mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    } else if (customerLat && customerLng) {

        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${customerLat},${customerLng}&z=12&t=m`;
    }

    window.open(mapsUrl, "_blank");
}

export const redirectDirectionLocation = async (placeId, customerLat, customerLng, route = null) => {
    const polyline = typeof route === 'string' ? route : route?.polyline;

    if (!placeId && !customerLat && !customerLng && !polyline) {
        return;
    }

    const currentLocation = await getLocation();

    let points = [];
    if (polyline) {
        if (Array.isArray(polyline)) {
            points = polyline;
        } else if (typeof polyline === 'string') {
            try {
                points = decodePolyline(polyline);
            } catch (e) {
                console.error("Failed to decode polyline", e);
            }
        }
    }

    let origin;
    let destination;

    if (currentLocation.success) {
        origin = `${currentLocation.latitude},${currentLocation.longitude}`;
    } else if (points.length > 0) {
        origin = `${points[0].lat},${points[0].lng}`;
    }

    if (placeId) {
        destination = `place_id:${placeId}`;
    } else if (customerLat && customerLng) {
        destination = `${customerLat},${customerLng}`;
    } else if (points.length > 0) {
        const lastPoint = points[points.length - 1];
        destination = `${lastPoint.lat},${lastPoint.lng}`;
    }

    if (!destination) {
        return;
    }

    let mapsUrl;

    if (points.length > 2) {
        const maxWaypoints = 8;
        const step = (points.length - 1) / (Math.min(points.length - 2, maxWaypoints) + 1);
        const waypoints = [];
        for (let i = 1; i <= Math.min(points.length - 2, maxWaypoints); i++) {
            const pt = points[Math.round(i * step)];
            if (pt) {
                waypoints.push(`${pt.lat},${pt.lng}`);
            }
        }

        const waypointsStr = waypoints.length > 0 ? `&waypoints=${encodeURIComponent(waypoints.join('|'))}` : '';

        if (origin) {
            mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsStr}`;
        } else {
            mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}${waypointsStr}`;
        }
    } else if (origin) {
        mapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
    } else {
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    }

    window.open(mapsUrl, "_blank");

}


export const getLocation = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({
                success: false,
                message: "Geolocation is not supported"
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, speed, accuracy } = pos.coords;

                resolve({
                    success: true,
                    latitude,
                    longitude,
                    speed,
                    accuracy,
                    timestamp: pos?.timestamp || Date.now()
                });
            },
            (err) => {
                let message = "Unable to retrieve location";

                if (err.code === err.PERMISSION_DENIED) {
                    message = "Location permission denied";
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    message = "Location unavailable (check device location settings)";
                } else if (err.code === err.TIMEOUT) {
                    message = "Location request timed out";
                }

                resolve({
                    success: false,
                    message,
                    code: err.code
                });
            },
            {
                enableHighAccuracy: false,
                timeout: 20000,
                maximumAge: 60000
            }
        );
    });
};
