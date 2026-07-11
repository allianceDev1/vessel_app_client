import React from 'react'
import '../customer-view/about-customer.scss'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbBorderLeftPlus, TbCircleLetterT, TbCrown, TbPlayCard4, TbPower, TbSnowflake, TbSnowflakeOff } from 'react-icons/tb'
import Badge from '../../../UI_Primitives/badge/Badge'
import Button from '../../../UI_Primitives/buttons/Button'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { getIsoDayDifference, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import { useDispatch, useSelector } from 'react-redux'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import PackageExtend from '../../../forms/controller/service-package/PackageExtend'
import FreezeUnfreeze from '../../../forms/controller/service-package/FreezeUnfreeze'
import ActivatePackage from '../../../forms/controller/service-package/ActivatePackage'
import TokenTopUps from './TokenTopUps'
import ServiceCancellation from '../../../forms/controller/service-package/ServiceCancellation'


const AboutPackage = () => {
    const dispatch = useDispatch();
    const { serial_number } = useParams();
    const { user } = useSelector((state) => state.user)

    const { data, isLoading, error } = useQuery({
        queryKey: ['customer_package_info', serial_number],
        queryFn: async () => {
            const data = await api.vfCv2Axios(`/package/${serial_number}/about`)
            return data;
        },
        staleTime: 60_000
    })

    const openPackageExtensionModel = () => {
        dispatch(modal.push({
            title: "Extend Package Expire Date",
            body: <PackageExtend
                expireDate={data?.expire_date}
                packageSrlNo={serial_number}
            />
        }))
    }

    const openFreezeUnFreezeModel = (type) => {
        dispatch(modal.push({
            title: type === 'FREEZE' ? 'Freeze the Package' : 'Unfreeze the Package',
            body: <FreezeUnfreeze type={type} packageSrlNo={serial_number} />
        }))
    }

    const openActivationModel = () => {
        dispatch(modal.push({
            title: 'Activate the Package',
            body: <ActivatePackage packageSrlNo={serial_number} />
        }))
    }

    const openTopUpsHistoryModel = () => {
        dispatch(modal.push({
            title: 'Token Top-ups History',
            body: <TokenTopUps serial_number={serial_number} />,
            style: { width: "1000px" }
        }))
    }

    const openCancellationModal = () => {
        dispatch(modal.push({
            title: "Service Index Cancellation",
            body: <ServiceCancellation packageSrlNo={serial_number} />
        }))
    }

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
        <div className="controller-about-customer-container">
            <div className="menu-buttons">
                {user?.allowed_origins?.includes('vessel_c_admin') && <>
                    {data?.package_status === 1 && <Button icon={<TbPower />} label={'Activate'} size='small' severity={'success'} rounded style={{ width: '110px' }}
                        onClick={openActivationModel} />}
                    {data?.package_status === 2 && <Button icon={<TbSnowflake />} label={'Freeze'} size='small' severity={'danger'} rounded style={{ width: '100px' }}
                        onClick={() => openFreezeUnFreezeModel('FREEZE')} />}
                    {data?.package_status === 4 && <Button icon={<TbSnowflakeOff />} label={'Unfreeze'} size='small' severity={'info'} rounded style={{ width: '110px' }}
                        onClick={() => openFreezeUnFreezeModel('UNFREEZE')} />}
                </>}
                {user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a)) && <>
                    {data?.package_status === 2 && <Button icon={<TbPlayCard4 />} label={'Cancel Service'} size='small' severity={'danger'} rounded style={{ width: '150px' }}
                        outlined onClick={() => openCancellationModal()} />}
                    {(data?.package_status === 2 || data?.is_last_package) && <Button icon={<TbBorderLeftPlus />} label={'Extend'} size='small' outlined rounded style={{ width: '110px' }}
                        onClick={openPackageExtensionModel} />}
                </>}
                {data?.token?.top_up_times > 0 && <Button icon={<TbCircleLetterT />} label={'All Top-ups'} size='small' outlined rounded style={{ width: '125px' }}
                    onClick={openTopUpsHistoryModel} />}
            </div>
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
            <h3 className='sub-title' style={{ marginTop: "25px" }}>Renewal Context</h3>
            <div className="reg-content">
                <div className="list">
                    <div className="item">
                        <p className='label'>Renewed At</p>
                        <div>
                            <p className='text-value'>{data?.renewal_context?.renewed_at ? isoToDDMonYYYY(data?.renewal_context?.renewed_at) : "Nil"}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Package Name</p>
                        <div>
                            {data?.renewal_context?.package_name ?
                                <Badge value={data?.renewal_context?.package_name} style={{ backgroundColor: data?.renewal_context?.color_code, color: getContrastText(data?.renewal_context?.color_code) }} />
                                : <p className='text-value'>No Package</p>}
                        </div>
                    </div>
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