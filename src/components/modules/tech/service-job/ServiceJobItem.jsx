import React from 'react'
import './service-job-item.scss'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { useNavigate } from 'react-router-dom'

const ServiceJobItem = ({ data, redirectUrl }) => {
    const navigate = useNavigate()
    return (
        <div className="tech-service-job-item-container" onClick={() => redirectUrl ? navigate(redirectUrl) : ''}
            style={{ cursor: redirectUrl ? 'pointer' : "" }}>
            <h3>{data?.customer_id} - {data?.customer_name}</h3>
            <div className="line">
                <p>{data?.service_srl_no}</p>
                <p>{isoToDDMonYYYY(new Date(data?.service_date))}</p>
            </div>
            <div className="line">
                <p>Reg : {data?.registration_id}</p>
                <div>
                    <p>{data?.call || 0} Calls</p>
                    <p className={data?.bill_status === 'DRAFT' ? 'warning' : data?.bill_amount > 0 ? 'success' : ""}>
                        ₹ {parseFloat(data?.bill_amount || 0).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ServiceJobItem