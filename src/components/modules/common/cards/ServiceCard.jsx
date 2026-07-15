import React, { useId } from 'react'
import './service-card.scss'
import { TbHash, TbUser } from 'react-icons/tb'
import Badge from '../../../UI_Primitives/badge/Badge'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { getContrastText } from '../../../../utils/helpers/color-utils'

const ServiceCard = ({ data, pointer = false, onClick = () => { } }) => {
    const tempColor = '#464646'
    const gradientId = useId();

    return (
        <div className="service-card-item-container" style={{ cursor: pointer ? 'pointer' : 'default' }} onClick={onClick}>
            <div className="card-header" style={{ color: 'white' }}>
                <svg className='gradient-background' viewBox="0 0 700 150">
                    <defs>
                        <linearGradient id={gradientId}>
                            <stop offset="0%" stopColor={data?.package_color_code || tempColor} />
                            <stop offset="100%" stopColor="#000000" />
                        </linearGradient>
                    </defs>

                    <path
                        d="M0,0 L700,0 L700,70 C600,70 500,75 400,90 C300,105 200,155 0,130 Z"
                        fill={`url(#${gradientId})`}
                    />
                </svg>

                <div className="left">
                    <h4 style={{ color: getContrastText(data?.package_color_code || tempColor) }}>{data?.card_title}</h4>
                    <p style={{ color: getContrastText(data?.package_color_code || tempColor) }}>{toStandardText(data?.card_type)}</p>
                </div>
                <div className="right">
                    <p>{isoToDDMonYYYY(data?.date)}</p>
                </div>
            </div>

            <div className="middle-content">
                <div className="middle-border-1">
                    <div className="left">

                    </div>
                    <div className="right">
                        <p>{toStandardText(data?.mode)}</p>
                        <div className="badge-container">
                            {data?.package_id ? <Badge value={data?.package_name} style={{
                                backgroundColor: data?.package_color_code,
                                color: getContrastText(data?.package_color_code)
                            }} /> : ''}
                            {data?.repeat ? <Badge value={'Repeat'} severity={'danger'} /> : ""}
                        </div>
                    </div>
                </div>
                {data?.comment ? <div className="middle-border-2">
                    <p className='text'>{data?.comment}</p>
                </div> : ''}
            </div>
            <div className="footer-content">
                <div className="footer-border"
                    style={{ backgroundColor: `${data?.package_color_code || tempColor}18`, borderColor: `${data?.package_color_code || tempColor}6b` }}
                >
                    <div className="left">
                        <TbHash />
                        <p>{data?.service_srl_no}</p>
                    </div>
                    <div className="right">
                        <p>{data?.worker_name}</p>
                        <TbUser />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServiceCard