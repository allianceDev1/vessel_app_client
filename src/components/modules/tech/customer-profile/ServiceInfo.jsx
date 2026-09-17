import React from 'react'
import './service-info.scss'
import Carousel from '../../../UI_Primitives/carousel/Carousel';
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState';
import { TbCarouselHorizontal } from 'react-icons/tb';
import UpServiceCard from './UpServiceCard';


const ServiceInfo = ({ serviceProducts, totalPurifiers, totalVessels, totalAddOns, serviceType }) => {
    
    return (
        <div className="tech-customer-service-info-comp">
            <h2>Service Info</h2>

            {serviceProducts?.length
                ? <Carousel hideButtons={true}
                    elements={serviceProducts.map((product) => (<UpServiceCard key={product?.product_id} product={product} serviceType={serviceType} />))} />
                : <EmptyState
                    size='sm'
                    hight='200px'
                    icon={<TbCarouselHorizontal />}
                    title={'No upcoming service products'}
                    description={'Production information is shown here only for dates within the last 30 days.'}
                />}

            {/* <div className="service-details">
                <div className="service-details__row">
                    <span className="service-details__label">Total Water purifiers</span>
                    <span className="service-details__value">{serviceProducts?.filter((p) => p.type === 'WATER_PURIFIER')?.length || 0} / {totalPurifiers || 0}</span>
                </div>
                <div className="service-details__row">
                    <span className="service-details__label">Total Vessel Filter</span>
                    <span className="service-details__value">{serviceProducts?.filter((p) => p.type === 'VESSEL_FILTER')?.length || 0} / {totalVessels || 0}</span>
                </div>
                <div className="service-details__row">
                    <span className="service-details__label">Total Add-ons</span>
                    <span className="service-details__value">{serviceProducts?.filter((p) => p.type === 'ADD_ON')?.length || 0} / {totalAddOns || 0}</span>
                </div>
            </div> */}
        </div>
    )
}

export default ServiceInfo