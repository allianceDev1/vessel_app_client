import React from 'react'
import './service-info.scss'
import VesselServiceCard from './VesselServiceCard';
import Carousel from '../../../UI_Primitives/carousel/Carousel';
import AddOnServiceCard from './AddOnServiceCard';
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState';
import { TbCarouselHorizontal } from 'react-icons/tb';


const ServiceInfo = ({ serviceProducts, totalVessels, totalAddOns, serviceType }) => {
    return (
        <div className="tech-customer-service-info-comp">
            <h2>Service Info</h2>

            {serviceProducts?.length
                ? <Carousel hideButtons={true}
                    elements={[
                        ...serviceProducts.filter(p => p.type === 'VESSEL_FILTER').map((product) => (<VesselServiceCard key={product?.product_id} product={product} serviceType={serviceType} />)),
                        ...serviceProducts.filter(p => p.type === 'ADD_ON').map((product) => (<AddOnServiceCard key={product?.product_id} product={product} serviceType={serviceType} />))
                    ]} />
                : <EmptyState
                    size='sm'
                    hight='200px'
                    icon={<TbCarouselHorizontal />}
                    title={'No upcoming service products'}
                    description={'Production information is shown here only for dates within the last 30 days.'}
                />}

            <div className="service-details">
                <div className="service-details__row">
                    <span className="service-details__label">Total Vessel Filter</span>
                    <span className="service-details__value">{serviceProducts?.filter((p) => p.type === 'VESSEL_FILTER')?.length || 0} / {totalVessels || 0}</span>
                </div>
                <div className="service-details__row">
                    <span className="service-details__label">Total Add-ons</span>
                    <span className="service-details__value">{serviceProducts?.filter((p) => p.type === 'ADD_ON')?.length || 0} / {totalAddOns || 0}</span>
                </div>
            </div>
        </div>
    )
}

export default ServiceInfo