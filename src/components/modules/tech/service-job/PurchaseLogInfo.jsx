import React from 'react'
import './product-log.scss'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'




const PurchaseLogInfo = () => {
    const { service_srl_no, pp_product_id } = useParams();


    const { data } = useQuery({
        queryKey: ['service_job_purchase_log_view', service_srl_no, "pp", pp_product_id],
        queryFn: async () => {
            const data = await api.vfTv2Axios.get(`/completed/${service_srl_no}/purchase-log/${pp_product_id}`);
            return data
        },
        staleTime: 60_000
    })



    return (
        <div className="tech-service-job-log-view-container">
            <div className="text-content">
                <div className="item">
                    <p className='label'>Product ID & Type</p>
                    <div>
                        <p className='text-value'>{data?.product_id} - {toStandardText(data?.product_type)}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Product Name & Item / Model Id</p>
                    <div>
                        <p className='text-value'>{data?.product_name} - {data?.item_id}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Unique Purchase Id</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <p className='text-value'>{data?.unique_id}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Purchase Type</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <p className='text-value'>{toStandardText(data?.purchase_type)} {data?.zero_fee ? '(Zero Fee)' : ''}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Expire Date</p>
                    <div >
                        <p className='text-value'>{isoToDDMonYYYY(data?.expire_date)}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Chemical</p>
                    <div>
                        <p className='text-value'>{data?.element?.element_name}</p>
                    </div>
                </div>
            </div>

            <h4 className='sub-title'>Price</h4>
            <div className="text-content">
                <div className="item">
                    <p className='label'>Chemical Qty & Price</p>
                    <div>
                        <p className='text-value'>{data?.element?.qty} {data?.element?.unit} - ₹ {data?.element?.price?.charged || 0} / Unit</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Product Price / Rent Charge</p>
                    <div>
                        <p className='text-value'>₹ {data?.product_price?.charged || 0}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Service Charge</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <p className='text-value'>₹ {data?.service_charge?.applied || 0}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Total Amount</p>
                    <div >
                        <p className='text-value'>₹ {data?.total_price}</p>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default PurchaseLogInfo

