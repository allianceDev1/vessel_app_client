import React from 'react'
import './about-customer.scss'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbMapPin, TbMoodSpark } from 'react-icons/tb'
import { redirectViewLocation } from '../../../../utils/services/location_services'
import Contacts from '../customer-profile/Contacts'

const AboutCustomer = () => {
    const { customer_id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['customer_profile', customer_id],
        queryFn: async () => {
            const data = await api.cnAv1Axios(`/customer/${customer_id}/profile`)
            return data;
        },
        staleTime: 60_000
    })

    const handleViewLocation = () => {
        if (!data?.address?.location?.length) {
            return
        }
        redirectViewLocation(null, data?.address?.location?.[0], data?.address?.location?.[1], data?.address?.place, data?.address?.post)
    };

    if (isLoading) {
        return <div>
            <SkeletonGrid rows={8} columns={1} height={'55px'} gap={'10px'} style={{ marginTop: '30px' }} />
            <SkeletonGrid rows={8} columns={1} height={'55px'} gap={'10px'} style={{ marginTop: '30px' }} />
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbMoodSpark />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="tech-about-customer-container">
            <Contacts contacts={{ primary: data?.primary_number, secondary: data?.secondary_number, whatsapp: data?.whatsapp_number, }} />
            <div className="reg-content">
                <div className="list">
                    <div className="item">
                        <p className='label'>Customer Name</p>
                        <div>
                            <p className='text-value'>{data?.customer_name}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Address, Place</p>
                        <div>
                            <p className='text-value'>{data?.address?.address}, {data?.address?.place}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Post , Pin code</p>
                        <div>
                            <p className='text-value'>{data?.address?.post}, {data?.address?.pin_code}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Landmark</p>
                        <div>
                            <p className='text-value'>{data?.address?.land_mark}</p>
                        </div>
                    </div>
                    <div className="item location" onClick={handleViewLocation}>
                        <p className='label'>Map Location</p>
                        <div>
                            <p className='text-value'>{data?.address?.location?.length
                                ? `${data?.address?.location?.[0]}, ${data?.address?.location?.[1]}`
                                : 'Not available'}</p>
                            {data?.address?.location?.length ? <TbMapPin /> : ""}
                        </div>
                    </div>
                    <div className="item success-item">
                        <p className='label'>Debit / Complimentary Amount</p>
                        <div>
                            <p className='text-value'>₹ {data?.debit_amount}</p>
                        </div>
                    </div>
                    <div className="item danger-item">
                        <p className='label'>Credit Amount</p>
                        <div>
                            <p className='text-value'>₹ {data?.credit_amount}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Note</p>
                        <div>
                            <p className='text-value'>{data?.note || 'Nil'}</p>
                        </div>
                    </div>
                </div>
            </div>
            <h3 className='sub-title' style={{ marginTop: "25px" }}>Site Info</h3>
            <div className="reg-content">
                <div className="list">
                    <div className="item">
                        <p className='label'>Site Category</p>
                        <div>
                            <p className='text-value'>{data?.site_info?.site_category || 'Nil'}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Work Site</p>
                        <div>
                            <p className='text-value'>{data?.site_info?.work_site || 'Nil'}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Source</p>
                        <div>
                            <p className='text-value'>{data?.site_info?.source || 'Nil'}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Tank Capacity</p>
                        <div>
                            <p className='text-value'>{data?.site_info?.tank_capacity_ltr || '0'} Ltr</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Floor Hight</p>
                        <div>
                            <p className='text-value'>{data?.site_info?.floor_hight || '0'} Feet</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>T Hight</p>
                        <div>
                            <p className='text-value'>{data?.site_info?.t_hight || '0'} Feet</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutCustomer