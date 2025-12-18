import React from 'react'
import './service-card.scss'
import Badge from '../../../UI_Primitives/badge/Badge'
import { TbCircleCheck, TbCircleX } from 'react-icons/tb'
import { getContrastText } from '../../../../utils/color-utils'
import { getIsoDayDifference, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'

const VesselServiceCard = ({ product, serviceType }) => {

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
                    <p className="item__text">Vessel</p>
                    {product?.package?.package_id ? <Badge value={product?.package?.name}
                        style={{ backgroundColor: product?.package?.color_code, color: getContrastText(product?.package?.color_code) }} /> : ''}
                </div>
                <div className="header__right">
                    <p className="item__text" style={{ color: `${(product?.service?.service_type || '').toLowerCase()}s` === (serviceType || '').toLowerCase() ? 'var(--color-info)' : '' }}>
                        {product?.service?.service_type}
                    </p>
                </div>
            </div>
            <div className="service-card__item">
                <div className="header__left">
                    <p className="item__text">S{product?.service?.total_services + 1 || 1} | {serviceGap > 0 ? `${serviceGap} Day(s)` : 'Date left'}</p>
                </div>
                <div className="header__right">
                    <p className="item__text">{isoToDDMonYYYY(new Date(product?.service?.service_date))}</p>
                </div>
            </div>

            <div className="service-card__eligibility">
                <h3 className="service-card__eligibility-title">Eligibility</h3>
                <div className="service-card__eligibility-list">
                    <div className="service-card__eligibility-item">
                        {product?.eligibility?.renewal
                            ? <TbCircleCheck className='service-card__icon service-card__icon--success' />
                            : <TbCircleX className='service-card__icon service-card__icon--error' />}
                        <div>
                            <span>Renewal</span>
                            {product?.eligibility?.renewal_note ? <span className="service-card__note">: {product?.eligibility?.renewal_note}</span> : ''}
                        </div>
                    </div>
                    <div className="service-card__eligibility-item">
                        {product?.eligibility?.ssp_renewal
                            ? <TbCircleCheck className='service-card__icon service-card__icon--success' />
                            : <TbCircleX className='service-card__icon service-card__icon--error' />}
                        <div>
                            <span>SSP Renewal</span>
                            {product?.eligibility?.ssp_renewal_note ? <span className="service-card__note">: {product?.eligibility?.ssp_renewal_note}</span> : ''}
                        </div>
                    </div>
                    <div className="service-card__eligibility-item">
                        {product?.eligibility?.service
                            ? <TbCircleCheck className='service-card__icon service-card__icon--success' />
                            : <TbCircleX className='service-card__icon service-card__icon--error' />}
                        <div>
                            <span>Service</span>
                            {product?.eligibility?.service_note ? <span className="service-card__note">: {product?.eligibility?.service_note}</span> : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VesselServiceCard