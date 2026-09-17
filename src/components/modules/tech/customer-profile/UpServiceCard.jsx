import React from 'react'
import './service-card.scss'
import Badge from '../../../UI_Primitives/badge/Badge'
import { TbCircleCheck, TbCircleX } from 'react-icons/tb'
import { getContrastText } from '../../../../utils/helpers/color-utils.js'
import { getIsoDayDifference, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers.js'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState.jsx'
import { toStandardText } from '../../../../utils/helpers/text-formatting.js'

const UpServiceCard = ({ product, serviceType }) => {
   
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
                    <p className="item__text">{toStandardText(product?.type)}</p>
                    {product?.package?.package_id
                        ? <Badge value={product?.package?.name}
                            style={{ backgroundColor: product?.package?.color_code, color: getContrastText(product?.package?.color_code) }} />
                        : <Badge value={'No subscription'} severity={'secondary'} />}
                </div>
                <div className="header__right">
                    <p className="item__text" style={{ color: `${(product?.service?.service_type || '').toLowerCase()}` === (serviceType || '').toLowerCase() ? 'var(--color-info)' : '' }}>
                        {product?.service?.service_type}
                    </p>
                </div>
            </div>
            <div className="service-card__item">
                <div className="header__left">
                    <p className="item__text">S{product?.service?.total_services + 1 || 1} | {serviceGap > 0 ? `${serviceGap} Day(s)` : 'Time over'}</p>
                </div>
                <div className="header__right">
                    <p className="item__text">{isoToDDMonYYYY(new Date(product?.service?.service_date))}</p>
                </div>
            </div>

            {product?.eligibility?.services?.length
                ? <div className="service-card__eligibility">
                    <h3 className="service-card__eligibility-title">Eligibility</h3>
                    <div className="service-card__eligibility-list">
                        {product?.eligibility?.services?.map((e) => {
                            return <div className="service-card__eligibility-item" key={e?.serviceId}>
                                {e?.isEligible
                                    ? <TbCircleCheck className='service-card__icon service-card__icon--success' />
                                    : <TbCircleX className='service-card__icon service-card__icon--error' />}
                                <div>
                                    <span>{e?.serviceName}</span>
                                    {/* {!e?.isEligible ? <span className="service-card__note">: {e?.reason}</span> : ''} */}
                                </div>
                            </div>
                        })}
                    </div>
                </div>
                : <EmptyState size='sm' description={'No information'} hight={'120px'} />}


        </div>
    )
}

export default UpServiceCard