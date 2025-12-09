import React from 'react'
import './text-address.scss';
import { TbMapPin } from 'react-icons/tb';
import Button from '../../../UI_Primitives/buttons/Button';

const TextAddress = ({ address = null, landmark = null, location = { place: null, post: null, placeId: null, lat: null, lng: null } }) => {

    const handleViewLocation = () => {
        let mapsUrl;

        if (location?.placeId) {
            mapsUrl = `https://www.google.com/maps/place/?q=place_id:${location?.placeId}`;
        } else if (location?.lat && location?.lng) {
            const searchQuery = encodeURIComponent(`${location.place} ${location.post} ${location?.lat},${location?.lng}`);
            mapsUrl = `https://www.google.com/maps/search/${searchQuery}/@${location?.lat},${location?.lng},17z`;
        }

        window.open(mapsUrl, "_blank");
    };

    return (
        <div className="tech-customer-text-address-comp">
            <div className="content">
                <TbMapPin />
                <p>{address}</p>
            </div>
            <Button label={'View on Google Map'} size='small' style={{ width: '100%' }} rounded onClick={handleViewLocation}
                disabled={!location?.placeId && (!location?.lat && !location?.lng)} />
            <p className="landmark">{landmark}</p>
        </div>
    )
}

export default TextAddress