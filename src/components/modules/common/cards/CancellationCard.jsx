import React, { useId } from 'react'
import './service-card.scss'
import { TbHash, TbUser } from 'react-icons/tb'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { getContrastText } from '../../../../utils/helpers/color-utils'

const CancellationCard = ({ data, pointer = false }) => {
    const tempColor = '#ff0000';
    const gradientId = useId();

    return (
        <div className="service-card-item-container" style={{ cursor: pointer ? 'pointer' : 'default' }}>
            <div className="card-header" style={{ color: 'white' }}>
                <svg className='gradient-background' viewBox="0 0 700 150">
                    <defs>
                        <linearGradient id={gradientId}>
                            <stop offset="0%" stopColor={tempColor} />
                            <stop offset="100%" stopColor="#000000" />
                        </linearGradient>
                    </defs>

                    <path
                        d="M0,0 L700,0 L700,70 C600,70 500,75 400,90 C300,105 200,155 0,130 Z"
                        fill={`url(#${gradientId})`}
                    />
                </svg>

                <div className="left">
                    <h4 style={{ color: getContrastText(tempColor) }}>Service Cancelled</h4>
                    <p style={{ color: getContrastText(tempColor) }}>Service Card</p>
                </div>
                <div className="right">
                    <p>{isoToDDMonYYYY(data?.date)}</p>
                </div>
            </div>

            <div className="middle-content">
                {data?.comment ? <div className="middle-border-2" style={{ marginTop: '10px' }}>
                    <p className='text' style={{ textAlign: 'end', }}>{data?.comment}</p>
                </div> : ''}
            </div>
            <div className="footer-content">
                <div className="footer-border"
                    style={{ backgroundColor: `${tempColor}18`, borderColor: `${tempColor}6b` }}
                >
                    <div className="left">
                        <TbHash />
                        <p>Index : {data?.service_index}</p>
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

export default CancellationCard