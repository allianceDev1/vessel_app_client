import React from 'react'
import '../customer-view/about-customer.scss'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import {  TbDropletStar} from 'react-icons/tb'
import Badge from '../../../UI_Primitives/badge/Badge'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { getContrastText } from '../../../../utils/helpers/color-utils'


const AboutProduct = () => {
    const { customer_id, product_id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['tech_customer_product_info', customer_id, product_id],
        queryFn: async () => {
            const data = await api.vfTv2Axios.get(`/product/${product_id}/about`)
            return data;
        },
        staleTime: 60_000
    })


    if (isLoading) {
        return <div>
            <SkeletonGrid rows={4} columns={3} height={'60px'} gap={'10px'} responsive={{
                md: { rows: 6, columns: 2 },
                sm: { rows: 8, columns: 1 },
            }} />
            <SkeletonGrid rows={3} columns={3} height={'60px'} gap={'10px'} style={{ marginTop: '30px' }} responsive={{
                md: { rows: 4, columns: 2 },
                sm: { rows: 5, columns: 1 },
            }} />
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbDropletStar />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="tech-about-customer-container">
            <div className="reg-content">
                <div className="list">
                    <div className="item">
                        <p className='label'>Customer ID & Name</p>
                        <div>
                            <p className='text-value'>{data?.customer_name} ({data?.customer_id})</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Product Id</p>
                        <div>
                            <p className='text-value'>{data?.product_id} </p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Product Name & Order Id</p>
                        <div>
                            <p className='text-value'>{data?.product_name} {data?.order_id ? `(${data?.order_id})` : ''} </p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Product Type & Origin</p>
                        <div>
                            <p className='text-value'>{toStandardText(data?.product_type)} - {toStandardText(data?.origin_category)}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Installation Mode</p>
                        <div>
                            <p className='text-value'>{data?.installation_mode}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Product Warranty</p>
                        <div >
                            {data?.warranty?.has_warranty
                                ? <p className='text-value'>{isoToDDMonYYYY(data?.warranty?.start_date)} to {isoToDDMonYYYY(data?.warranty?.expire_date)} </p>
                                : <p className='text-value'>No Warranty</p>}
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Note</p>
                        <div>
                            <p className='text-value'>{data?.note || "Nil"}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Blocked Packages</p>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {data?.blocked_packages?.map(p => (
                                <Badge key={p?.package_id} value={p?.package_name}
                                    style={{ backgroundColor: p?.color_code, color: getContrastText(p?.color_code) }} />
                            ))}
                            {data?.blocked_packages?.length === 0 && <p className='text-value'>Nil</p>}
                        </div>
                    </div>
                </div>
            </div>
            <h3 className='sub-title' style={{ marginTop: "25px" }}>Service & Rent</h3>
            <div className="reg-content">
                <div className="list">
                    <div className="item">
                        <p className='label'>Subscription</p>
                        <div>
                            {data?.package?.package_id
                                ? <Badge value={data?.package?.package_name}
                                    style={{ backgroundColor: data?.package?.color_code, color: getContrastText(data?.package?.color_code) }} />
                                : <p className='text-value'>No Subscription</p>}
                        </div>
                    </div>
                    {data?.package?.package_id && <div className="item">
                        <p className='label'>Package Duration</p>
                        <div>
                            <p className='text-value'>{isoToDDMonYYYY(data?.package?.start_date)} to {isoToDDMonYYYY(data?.package?.expire_date)} </p>
                        </div>
                    </div>}
                    <div className="item">
                        <p className='label'>Next Service Date</p>
                        <div>
                            <p className='text-value'>{data?.service?.next_service_date ? isoToDDMonYYYY(data?.service?.next_service_date) : "Nil"}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Last Visit Date</p>
                        <div>
                            <p className='text-value'>{data?.service?.last_service_date ? isoToDDMonYYYY(data?.service?.last_service_date) : "Nil"}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Rent Duration</p>
                        <div >
                            {data?.rental?.has_rental
                                ? <p className='text-value'>{isoToDDMonYYYY(data?.rental?.rent_start_date)} to {isoToDDMonYYYY(data?.rental?.rent_end_date)} </p>
                                : <p className='text-value'>Not rental</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutProduct