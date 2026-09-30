/**
 * Controller Map Utility Functions
 */

/**
 * Converts GeoJSON Point or coordinate array to Google Maps LatLngLiteral
 * MongoDB GeoJSON: [longitude, latitude]
 * Google Maps: { lat: latitude, lng: longitude }
 */
export const geoPointToLatLng = (geoPoint) => {
    if (!geoPoint) return null;

    if (Array.isArray(geoPoint)) {
        return { lat: Number(geoPoint[1]), lng: Number(geoPoint[0]) };
    }

    if (geoPoint.coordinates && Array.isArray(geoPoint.coordinates)) {
        return {
            lat: Number(geoPoint.coordinates[1]),
            lng: Number(geoPoint.coordinates[0]),
        };
    }

    if (geoPoint.latitude !== undefined && geoPoint.longitude !== undefined) {
        return { lat: Number(geoPoint.latitude), lng: Number(geoPoint.longitude) };
    }

    if (geoPoint.lat !== undefined && geoPoint.lng !== undefined) {
        return { lat: Number(geoPoint.lat), lng: Number(geoPoint.lng) };
    }

    return null;
};

/**
 * Converts Lat/Lng to GeoJSON Point
 */
export const latLngToGeoPoint = (lat, lng) => ({
    type: 'Point',
    coordinates: [Number(lng), Number(lat)],
});

/**
 * Status meta dictionary
 */
export const TECHNICIAN_STATUS_META = {
    TRAVEL: {
        label: 'Travelling',
        color: '#2563EB', // Blue
        bgColor: '#EFF6FF',
        borderColor: '#93C5FD',
        badgeTheme: 'info',
    },
    IN_SERVICE: {
        label: 'In Service',
        color: '#10B981', // Green
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        badgeTheme: 'success',
    },
    IDLE: {
        label: 'Idle',
        color: '#64748B', // Slate
        bgColor: '#F1F5F9',
        borderColor: '#CBD5E1',
        badgeTheme: 'neutral',
    },
};

export const getTechnicianStatusMeta = (status) => {
    const key = (status || '').toUpperCase();
    return TECHNICIAN_STATUS_META[key] || TECHNICIAN_STATUS_META.IDLE;
};

/**
 * Pure JavaScript polyline decoding fallback
 * Decodes Google Encoded Polyline algorithm into LatLng literals
 */
export const decodePolyline = (encoded) => {
    if (!encoded) return [];

    if (window.google?.maps?.geometry?.encoding?.decodePath) {
        try {
            const path = window.google.maps.geometry.encoding.decodePath(encoded);
            return path.map((point) => ({ lat: point.lat(), lng: point.lng() }));
        } catch (e) {
            console.warn('Google Maps geometry decoder failed, using fallback decoder', e);
        }
    }

    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
        let b;
        let shift = 0;
        let result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }

    return points;
};

/**
 * Check if a location timestamp is stale (default > 15 minutes)
 */
export const isLocationStale = (recordedAt, thresholdMinutes = 15) => {
    if (!recordedAt) return true;
    const diffMs = Date.now() - new Date(recordedAt).getTime();
    return diffMs > thresholdMinutes * 60 * 1000;
};

/**
 * Format relative time
 */
export const formatRelativeTime = (isoDate) => {
    if (!isoDate) return 'Unknown';
    const diffSec = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);

    if (diffSec < 0) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    return `${diffDays}d ago`;
};

/**
 * Format distance in meters to friendly display
 */
export const formatDistance = (meters) => {
    if (meters === null || meters === undefined || isNaN(meters)) return '-';
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration in seconds to friendly display
 */
export const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '-';
    const mins = Math.round(seconds / 60);
    if (mins < 60) {
        return `${mins} min${mins === 1 ? '' : 's'}`;
    }
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs} hr${hrs === 1 ? '' : 's'} ${remMins} min`;
};

/**
 * Format speed in km/h
 */
export const formatSpeed = (speed) => {
    if (speed === null || speed === undefined || isNaN(speed)) return '0 km/h';
    return `${Number(speed).toFixed(1)} km/h`;
};

/**
 * Create SVG Data URI for technician pin with optional heading arrow
 */
export const createTechnicianIcon = (technician) => {
    const meta = getTechnicianStatusMeta(technician?.status);
    const color = meta.color;
    const heading = technician?.heading;
    const isTravelling = technician?.status === 'TRAVEL';

    if (isTravelling && heading !== undefined && heading !== null && !isNaN(heading)) {
        // Rotated arrow icon for moving technician
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
            <g transform="rotate(${heading}, 18, 18)">
                <circle cx="18" cy="18" r="16" fill="${color}" fill-opacity="0.25" />
                <circle cx="18" cy="18" r="12" fill="${color}" stroke="#FFFFFF" stroke-width="2.5" />
                <path d="M18 9 L24 23 L18 19 L12 23 Z" fill="#FFFFFF" />
            </g>
        </svg>`.trim();

        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            scaledSize: new window.google.maps.Size(36, 36),
            anchor: new window.google.maps.Point(18, 18),
        };
    }

    // Standard circular technician badge with initial
    const initial = (technician?.name || 'T').charAt(0).toUpperCase();
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
        <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
            </filter>
        </defs>
        <path d="M17 0 C7.6 0 0 7.6 0 17 C0 27.5 17 42 17 42 C17 42 34 27.5 34 17 C34 7.6 26.4 0 17 0 Z" 
              fill="${color}" stroke="#FFFFFF" stroke-width="2" filter="url(#shadow)"/>
        <circle cx="17" cy="15" r="9" fill="#FFFFFF" />
        <text x="17" y="19" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" 
              font-size="11" font-weight="700" fill="${color}" text-anchor="middle">${initial}</text>
    </svg>`.trim();

    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        scaledSize: new window.google.maps.Size(34, 42),
        anchor: new window.google.maps.Point(17, 42),
    };
};

/**
 * Create SVG Data URI for Customer pin
 */
export const createCustomerIcon = () => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
        <defs>
            <filter id="custShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.25"/>
            </filter>
        </defs>
        <path d="M14 0 C6.3 0 0 6.3 0 14 C0 23 14 36 14 36 C14 36 28 23 28 14 C28 6.3 21.7 0 14 0 Z" 
              fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.8" filter="url(#custShadow)"/>
        <circle cx="14" cy="13" r="6" fill="#FFFFFF"/>
        <circle cx="14" cy="13" r="3" fill="#D97706"/>
    </svg>`.trim();

    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        scaledSize: new window.google.maps.Size(28, 36),
        anchor: new window.google.maps.Point(14, 36),
    };
};

/**
 * Create Origin (Travel Start) marker icon
 */
export const createOriginIcon = () => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
        <path d="M15 0 C6.7 0 0 6.7 0 15 C0 24 15 38 15 38 C15 38 30 24 30 15 C30 6.7 23.3 0 15 0 Z" 
              fill="#0D9488" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="15" cy="14" r="5" fill="#FFFFFF"/>
    </svg>`.trim();

    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        scaledSize: new window.google.maps.Size(30, 38),
        anchor: new window.google.maps.Point(15, 38),
    };
};

/**
 * Create Destination (Target Customer) marker icon
 */
export const createDestinationIcon = () => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
        <path d="M15 0 C6.7 0 0 6.7 0 15 C0 24 15 38 15 38 C15 38 30 24 30 15 C30 6.7 23.3 0 15 0 Z" 
              fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="15" cy="14" r="5" fill="#FFFFFF"/>
    </svg>`.trim();

    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        scaledSize: new window.google.maps.Size(30, 38),
        anchor: new window.google.maps.Point(15, 38),
    };
};

