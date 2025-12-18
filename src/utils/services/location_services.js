export const redirectViewLocation = (placeId = null, customerLat, customerLng, place, post) => {

    if (!placeId && !customerLat && !customerLng && (!place && !post)) {
        return;
    }

    let mapsUrl;

    if (placeId) {
        mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    } else if (customerLat && customerLng) {

        const searchQuery = encodeURIComponent(`${place} ${post} ${customerLat},${customerLng}`);
        mapsUrl = `https://www.google.com/maps/search/${searchQuery}/@${customerLat},${customerLng},17z`;
    }

    window.open(mapsUrl, "_blank");
}

export const redirectDirectionLocation = async (placeId, customerLat, customerLng) => {
    if (!placeId && !customerLat && !customerLng) {
        return;
    }

    const currentLocation = await getLocation();

    let destination;
    let mapsUrl;

    // current location is available
    if (currentLocation.success) {

        const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
        if (placeId) {
            destination = `place_id:${placeId}`;
        } else if (customerLat && customerLng) {
            destination = `${customerLat},${customerLng}`;
        } else {
            return;
        }

        mapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;

    } else {
        if (placeId) {
            mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=place_id:${placeId}`;
        } else if (customerLat && customerLng) {
            mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}`;
        } else {
            return;
        }
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
                const { latitude, longitude } = pos.coords;

                resolve({
                    success: true,
                    latitude,
                    longitude
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
