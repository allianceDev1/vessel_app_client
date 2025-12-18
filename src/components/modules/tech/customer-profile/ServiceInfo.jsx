import React from 'react'
import './service-info.scss'
import VesselServiceCard from './VesselServiceCard';
import Carousel from '../../../UI_Primitives/carousel/Carousel';
import AddOnServiceCard from './AddOnServiceCard';


const ServiceInfo = ({ serviceProducts, totalVessels, totalAddOns, serviceType }) => {
    return (
        <div className="tech-customer-service-info-comp">
            <h2>Service Info</h2>

            <Carousel hideButtons={true}
                elements={[
                    ...serviceProducts.filter(p => p.type === 'Vessel').map((product) => (<VesselServiceCard key={product?.product_id} product={product} serviceType={serviceType} />)),
                    ...serviceProducts.filter(p => p.type === 'Add-On').map((product) => (<AddOnServiceCard key={product?.product_id} product={product} serviceType={serviceType} />))
                ]} />

            <div className="service-details">
                <div className="service-details__row">
                    <span className="service-details__label">Total Vessel Filter</span>
                    <span className="service-details__value">{serviceProducts?.filter((p) => p.type === 'Vessel')?.length || 0} / {totalVessels || 0}</span>
                </div>
                <div className="service-details__row">
                    <span className="service-details__label">Total Add-ons</span>
                    <span className="service-details__value">{serviceProducts?.filter((p) => p.type === 'Add-On')?.length || 0} / {totalAddOns || 0}</span>
                </div>
            </div>
        </div>
    )
}

export default ServiceInfo