import React from 'react'
import './text-address.scss';
import { TbMapPin } from 'react-icons/tb';
import Button from '../../../UI_Primitives/buttons/Button';
import { redirectDirectionLocation, redirectViewLocation } from '../../../../utils/services/location_services';

const TextAddress = ({
    address = null,
    landmark = null,
    location = { place: null, post: null, placeId: null, lat: null, lng: null },
    viewMapButton = true,
    directionButton = false
}) => {

    const handleViewLocation = () => {
        redirectViewLocation(location.placeId, location.lat, location.lng, location.place, location.post)
    };

    const handleDirection = async () => {
        await redirectDirectionLocation(location.placeId, location.lat, location.lng)
    };

    return (
        
        <div className="tech-customer-text-address-comp">
            <div className="content">
                <TbMapPin />
                <p>{address}</p>
            </div>
            <div className="buttons-div" style={{ gridTemplateColumns: viewMapButton && directionButton ? '1fr 1fr' : '1fr' }}>
                {viewMapButton && <Button label={'View on Google Map'} size='small' style={{ width: '100%' }} rounded
                    onClick={handleViewLocation} disabled={!location?.placeId && (!location?.lat && !location?.lng)} />}
                {directionButton && <Button label={'Get Directions'} severity={'primary'} size='small' style={{ width: '100%' }} rounded
                    onClick={handleDirection} disabled={!location?.placeId && (!location?.lat && !location?.lng)} />}
            </div>
            <p className="landmark">{landmark}</p>
        </div>
    )
}

export default TextAddress