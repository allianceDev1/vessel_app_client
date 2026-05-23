import React from 'react'
import './service-card.scss'
import { TbHash, TbUser } from 'react-icons/tb'
import Badge from '../../../UI_Primitives/badge/Badge'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { getContrastText } from '../../../../utils/helpers/color-utils'

const InstallationCard = ({ data, pointer = false }) => {
    const tempColor = '#004b10'

    return (
        <div className="service-card-item-container"
            style={{ backgroundColor: 'var(--color-success-trans-33)', cursor: pointer ? 'pointer' : 'default' }}
        >
            <div className="card-header" style={{ color: 'white' }}>
                <svg className='gradient-background' viewBox="0 0 700 150">
                    <defs>
                        <linearGradient id="installGradient">
                            <stop offset="0%" stopColor={tempColor} />
                            <stop offset="100%" stopColor="#000000" />
                        </linearGradient>
                    </defs>

                    <path
                        d="M0,0 L700,0 L700,70 C600,70 500,75 400,90 C300,105 200,155 0,130 Z"
                        fill="url(#installGradient)"
                    />
                </svg>

                <div className="left">
                    <h4 style={{ color: getContrastText(tempColor) }}>{data?.card_title}</h4>
                    <p style={{ color: getContrastText(tempColor) }}>{toStandardText(data?.card_type)}</p>
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

                        <div className="badge-container">
                            {data?.repeat ? <Badge value={'Repeat'} severity={'danger'} /> : ""}
                            {data?.item_id ? <Badge value={`${data?.item_id}`} severity={'info'} /> : ''}
                        </div>
                    </div>
                </div>
                {(data?.comment || data?.product_name) ? <div className="middle-border-2">
                    {data?.comment && <p className='text'>{data?.comment}</p>}
                    {data?.product_name && <p className='text'>{data?.product_name}</p>}
                </div> : ''}
            </div>
            <div className="footer-content">
                <div className="footer-border"
                    style={{ backgroundColor: `${tempColor}18`, borderColor: `${tempColor}6b` }}
                >
                    <div className="left">
                        <TbHash />
                        <p>{data?.service_srl_no || 'Not Linked'}</p>
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

export default InstallationCard