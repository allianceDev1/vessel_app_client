import React from 'react'
import './service-card.scss'
import { getIsoDayDifference, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState';

const AddOnServiceCard = ({ product, serviceType }) => {

    const serviceGap = getIsoDayDifference(new Date(product?.service?.service_date), new Date())

    return (
        <div className="tech-customer-service-card">
            <div className="service-card__item">
                <div className="header__left">
                    <p className="item__text">{product?.product_name}</p>
                </div>
                <div className="header__right">
                    <p className="item__text">ID : {product?.product_id}</p>
                </div>
            </div>
            <div className="service-card__item">
                <div className="header__left">
                    <p className="item__text">Add-On</p>
                </div>
                <div className="header__right">
                    <p className="item__text" style={{ color: `${(product?.service?.service_type || '').toLowerCase()}s` === (serviceType || '').toLowerCase() ? 'var(--color-info)' : '' }}>
                        {product?.service?.service_type}
                    </p>
                </div>
            </div>
            <div className="service-card__item">
                <div className="header__left">
                    <p className="item__text">{serviceGap > 0 ? `${serviceGap} Day(s)` : 'Time over'}</p>
                </div>
                <div className="header__right">
                    <p className="item__text">{isoToDDMonYYYY(new Date(product?.service?.service_date))}</p>
                </div>
            </div>

            <EmptyState description={'No information'} hight={'120px'} />
        </div>
    )
}

export default AddOnServiceCard