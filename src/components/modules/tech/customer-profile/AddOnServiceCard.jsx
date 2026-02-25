import React from 'react'
import './service-card.scss'
import { getIsoDayDifference, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState';
import { convertEligibilityToArray } from '../../../../utils/services/work_services';
import { TbCircleCheck, TbCircleX } from 'react-icons/tb';
import { toStandardText } from '../../../../utils/helpers/text-formatting';

const AddOnServiceCard = ({ product, serviceType }) => {

    const eligibility = convertEligibilityToArray(product?.eligibility || {})
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
                    <p className="item__text">ADD-ON</p>
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

            {eligibility?.length
                ? <div className="service-card__eligibility">
                    <h3 className="service-card__eligibility-title">Eligibility</h3>
                    <div className="service-card__eligibility-list">
                        {eligibility?.map((e, index) => {
                            return <div className="service-card__eligibility-item" key={index}>
                                {e?.[1]
                                    ? <TbCircleCheck className='service-card__icon service-card__icon--success' />
                                    : <TbCircleX className='service-card__icon service-card__icon--error' />}
                                <div>
                                    <span>{toStandardText(e?.[0] || '')}</span>
                                    {e?.[2] ? <span className="service-card__note">: {e?.[2]}</span> : ''}
                                </div>
                            </div>
                        })}
                    </div>
                </div>
                : <EmptyState  size='sm' description={'No information'} hight={'120px'} />}
        </div>
    )
}

export default AddOnServiceCard