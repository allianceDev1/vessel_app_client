import React from 'react'
import '../customer-view/about-customer.scss'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbCrown } from 'react-icons/tb'
import Badge from '../../../UI_Primitives/badge/Badge'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { getIsoDayDifference, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'


const AboutPackage = () => {
    const { serial_number } = useParams();


    const { data, isLoading, error } = useQuery({
        queryKey: ['customer_package_info', serial_number],
        queryFn: async () => {
            const data = await api.vfTv2Axios.get(`/package/${serial_number}/about`)
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
                icon={<TbCrown />}
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
                        <p className='label'>Product Id</p>
                        <div>
                            <p className='text-value'>{data?.product_id}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Serial Number & Status</p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <p className='text-value'>{data?.serial_number} </p>
                            {data?.package_status === 1 ? <Badge value={'Pending'} /> :
                                data?.package_status === 2 ? <Badge value={'Active'} severity={'success'} /> :
                                    data?.package_status === 3 ? <Badge value={'Expired'} severity={'danger'} /> :
                                        data?.package_status === 4 ? <Badge value={'Frozen'} severity={'warning'} />
                                            : ''}
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Package Name</p>
                        <div style={{ color: data?.color_code }}>
                            <p className='text-value'>{data?.full_form} ({data?.package_name}) </p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Package Duration</p>
                        <div>
                            <p className='text-value'>{isoToDDMonYYYY(data?.start_date)} to {isoToDDMonYYYY(data?.expire_date)} ( {getIsoDayDifference(new Date(data?.expire_date), new Date(data?.start_date))} Days )</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Tokens & Remaining</p>
                        <div>
                            <p className='text-value'>{data?.token?.total_tokens ? `${data?.token?.remaining_tokens} out of ${data?.token?.total_tokens}` : 'No Tokens'}</p>
                        </div>
                    </div>
                    {data?.package_status === 4 && <>
                        <div className="item">
                            <p className='label'>Freezed Date</p>
                            <div>
                                <p className='text-value'>{isoToDDMonYYYY(data?.freeze?.action_at) || 'Nil'}</p>
                            </div>
                        </div>
                        <div className="item">
                            <p className='label'>Freeze Reason</p>
                            <div>
                                <p className='text-value'>{data?.freeze?.comment || 'Nil'}</p>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
            <h3 className='sub-title' style={{ marginTop: "25px" }}>Package Credentials</h3>
            <div className="reg-content">
                <div className="list">
                    <div className="item">
                        <p className='label'>Duration (Months)</p>
                        <div>
                            <p className='text-value'>{data?.package_credentials?.duration_months} Months</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Number of Services (SR)</p>
                        <div>
                            <p className='text-value'>{data?.package_credentials?.number_of_services}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Expire Condition</p>
                        <div>
                            {data?.package_credentials?.expire_types?.length === 1
                                ? <p className='text-value'> Complete the {toStandardText(data?.package_credentials?.expire_types[0])}</p> :
                                data?.package_credentials?.expire_types?.length === 2
                                    ? <p className='text-value'> Complete the {toStandardText(data?.package_credentials?.expire_types[0])} {toStandardText(data?.package_credentials?.et_query_operator)} {toStandardText(data?.package_credentials?.expire_types[1])}</p> : ""}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutPackage