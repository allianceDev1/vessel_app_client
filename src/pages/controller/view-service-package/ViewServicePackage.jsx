import React, { useEffect, useState } from 'react'
import './view-service-package.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useParams } from 'react-router-dom';
import { api } from '../../../api';
import { TbCarouselHorizontal, TbCheck, TbEdit, TbEye, TbEyeClosed, TbPencil, TbPointFilled, TbX } from 'react-icons/tb';
import { hexToRgba } from '../../../utils/helpers/color-utils';
import { modal, doDialog, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState';
import Button from '../../../components/UI_Primitives/buttons/Button';
import UpdatePackage from '../../../components/forms/controller/update-package/UpdatePackage';
import UpdatePackageService from '../../../components/forms/controller/update-package/UpdatePackageService';
import Message from '../../../components/UI_Primitives/message/Message'
import { isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';
import { serviceChargeSort, toStandardText } from '../../../utils/helpers/text-formatting';
import { serviceCategoryListStretcher } from '../../../utils/services/package_service';


const ViewServicePackage = () => {
    const dispatch = useDispatch();
    const { package_id } = useParams();
    const [packageInfo, setPackageInfo] = useState({})
    const [serviceList, setServiceList] = useState([])
    const [loading, setLoading] = useState('fetch')
    const [error, setError] = useState({ error: false, title: null, message: null })

    const openModal = (title, body, style) => {
        dispatch(modal.push({
            show: true,
            title,
            body,
            style
        }))
    }

    const fetchApi = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })

            const [packageRes, serviceRes] = await Promise.all([
                api.vfCv2Axios.get(`/config/service-package/${package_id}`),
                api.vfCv2Axios.get(`/config/service-package/service/list?hidden=Yes&packageIds=${package_id}&fields=service_name,coverage,service_policy,package_charge_applied,target_package,service_charge_applied,service_charges,service_limit`)
            ]);

            const { pricing_config, ...pInfo } = packageRes;

            setPackageInfo({
                ...pInfo,
                package_fund: pricing_config?.base_price || 0,
                gst_rate: pricing_config?.gst?.rate || null,
                service_work_fund_type: pricing_config?.fund_distribution?.filter((a) => a.fund_type === 'SERVICE_WORK')?.[0]?.value_type || null,
                service_work_fund: pricing_config?.fund_distribution?.filter((a) => a.fund_type === 'SERVICE_WORK')?.[0]?.value || null,
                spare_parts_fund_type: pricing_config?.fund_distribution?.filter((a) => a.fund_type === 'SPARE_PARTS')?.[0]?.value_type || null,
                spare_parts_fund: pricing_config?.fund_distribution?.filter((a) => a.fund_type === 'SPARE_PARTS')?.[0]?.value || null
            })
            setServiceList(serviceCategoryListStretcher(serviceRes))

        } catch (err) {
            setError({ error: true, title: 'Data fetching failed', message: err.message })
        } finally {
            setLoading('')
        }
    }

    const updateActiveStatus = (is_active) => {
        dispatch(doDialog.confirm({
            message: 'This action will disable the package. Do you want to continue?',
            accept: {
                onClick: async () => {
                    try {
                        setLoading('update')
                        await api.vfCv2Axios.patch(`/config/service-package/${package_id}/active-status`, { is_active })
                        setPackageInfo({ ...packageInfo, is_active })
                    } catch (error) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Update failed',
                            message: error.message
                        }))
                    } finally {
                        setLoading('')
                    }
                }
            }
        }))
    }

    const handelEditService = (item) => {
        dispatch(modal.push({
            title: 'Update Package Service',
            body: <UpdatePackageService packageId={package_id} serviceData={item} setServiceList={setServiceList} />
        }))
    }

    useEffect(() => {
        dispatch(page.setTitle({}))

        // Initial fetch
        fetchApi();
        // eslint-disable-next-line
    }, [])


    // loading
    if (loading === 'fetch') {
        return <div className="view-service-packages-page-load">
            <div className="top-section">
                <SkeletonGrid
                    rows={1}
                    columns={1}
                    height={170}
                />
                <SkeletonGrid
                    rows={2}
                    columns={2}
                    height={90}
                    style={{ marginTop: '40px' }}
                    responsive={{
                        md: { columns: 1, rows: 4 }
                    }}
                />
            </div>
        </div>
    }

    // Error
    if (error?.error) {
        return <ErrorState
            hight='80vh'
            title={error?.title}
            message={error?.message}
            icon={<TbCarouselHorizontal />}
        />
    }

    return (
        <div className="view-service-package-page">
            <div className="top-section">
                <div className="action-buttons">
                    <Button label={'Update'} icon={<TbPencil />} size='small' outlined rounded style={{ width: '100px' }}
                        onClick={() => openModal('Update package', <UpdatePackage data={packageInfo} setData={setPackageInfo} />, { width: "800px" })} />
                    {packageInfo?.is_active
                        ? <Button label={'Disable'} icon={<TbEyeClosed />} severity={'danger'} size='small' rounded style={{ width: '100px' }}
                            onClick={() => updateActiveStatus(false)} />
                        : <Button label={'Enable'} icon={<TbEye />} severity={'info'} size='small' rounded style={{ width: '100px' }}
                            onClick={() => updateActiveStatus(true)} />}
                </div>
            </div>
            <div className="package-title" style={{
                borderColor: packageInfo?.color_code,
                background: `linear-gradient(50deg,
                    ${hexToRgba(packageInfo?.color_code, 0.3)} 25%,
                    ${hexToRgba(packageInfo?.color_code, 0.5)} 60%,
                    ${hexToRgba(packageInfo?.color_code, 0.7)} 85%)`
            }}>
                <h1 style={{ color: packageInfo.color_code }}>{packageInfo?.package_name}</h1>
                <p>( {packageInfo?.full_form} )</p>
                <div className="sub-items">
                    <div className="sub-item">
                        <h4>{packageInfo?.package_duration_months ? `${packageInfo?.package_duration_months} mo` : 'Nil'}</h4>
                        <p>Duration</p>
                    </div>
                    <div className="sub-item">
                        <h4>{packageInfo?.tokens_count ? `${packageInfo?.tokens_count}` : 'Nil'}</h4>
                        <p>Tokens</p>
                    </div>
                    <div className="sub-item">
                        <h4>{packageInfo?.number_of_services ? `${packageInfo?.number_of_services}` : '0'}</h4>
                        <p>SR In Duration</p>
                    </div>
                    <div className="sub-item">
                        <h4>{packageInfo?.package_fund ? `₹ ${packageInfo?.package_fund}` : '₹ 0'}</h4>
                        <p>Package Fund</p>
                    </div>
                </div>
                <div className={`status-fold ${packageInfo.is_active ? 'active' : 'inactive'}`}>
                    {packageInfo.is_active ? <TbCheck /> : <TbX />}
                    <p>{packageInfo.is_active ? 'Active' : 'Inactive'}</p>
                </div>
            </div>

            <p>The package is updated at {isoToDDMonYYYY(new Date(packageInfo?.updated_at))} by {packageInfo?.updated_by}</p>

            {!Number(packageInfo?.package_fund ?? 0) &&
                <Message type={'info'} head={'Zero-Fee Package'} message={`This package is configured as a Zero-Fee Package. 
                The renewal charge is set to zero, and no amount will be collected at renewal time.`} />}

            <div className="service-section">
                <h3 className='sub-title'>Package Service Categories</h3>
                {serviceList?.length === 0
                    ? <EmptyState icon={<TbCarouselHorizontal />} title={'No services available'} description={'The package related service not created'}
                        hight='300px' />
                    : <div className="service-list">
                        {serviceList?.map((item, index) => {
                            return (
                                <div className="item" key={item?.category_uuid}>
                                    <div className="head">
                                        <h3>{item?.service_name}</h3>
                                        <div>
                                            <p>{item?.category_id}</p>
                                            <TbPointFilled />
                                            <p>Mode : {toStandardText(item?.mode)}</p>
                                        </div>
                                    </div>
                                    <div className="list-section">
                                        <div className="list-item">
                                            <div className={`part part-one`}>
                                                <p>Materials Charge & Access</p>
                                            </div>
                                            <div className={`part part-two`}>
                                                {item?.coverage?.MATERIAL?.access ? <p>{serviceChargeSort(item?.coverage?.MATERIAL?.price_type)}</p> : ''}
                                            </div>
                                            <div className={`part part-three ${item?.coverage?.MATERIAL?.access ? 'success' : 'danger'}`}>
                                                {item?.coverage?.MATERIAL?.access ? <TbCheck /> : <TbX />}
                                            </div>
                                        </div>
                                        <div className="list-item">
                                            <div className={`part part-one`}>
                                                <p>Bag Charge & Access</p>
                                            </div>
                                            <div className={`part part-two`}>
                                                {item?.coverage?.MATERIALS_BAG?.access ? <p>{serviceChargeSort(item?.coverage?.MATERIALS_BAG?.price_type)}</p> : ''}
                                            </div>
                                            <div className={`part part-three ${item?.coverage?.MATERIALS_BAG?.access ? 'success' : 'danger'}`}>
                                                {item?.coverage?.MATERIALS_BAG?.access ? <TbCheck /> : <TbX />}
                                            </div>
                                        </div>
                                        <div className="list-item">
                                            <div className={`part part-one`}>
                                                <p>Spare Charge & Access</p>
                                            </div>
                                            <div className={`part part-two`}>
                                                {item?.coverage?.PRIMARY_SPARES?.access ? <p>{serviceChargeSort(item?.coverage?.PRIMARY_SPARES?.price_type)}</p> : ''}
                                            </div>
                                            <div className={`part part-three ${item?.coverage?.PRIMARY_SPARES?.access ? 'success' : 'danger'}`}>
                                                {item?.coverage?.PRIMARY_SPARES?.access ? <TbCheck /> : <TbX />}
                                            </div>
                                        </div>
                                        <div className="list-item">
                                            <div className={`part part-one`}>
                                                <p>Service Work & Access</p>
                                            </div>
                                            <div className={`part part-two`}>
                                                {item?.coverage?.SERVICE_WORK?.access ? <p>{serviceChargeSort(item?.coverage?.SERVICE_WORK?.price_type)}</p> : ''}
                                            </div>
                                            <div className={`part part-three ${item?.coverage?.SERVICE_WORK?.access ? 'success' : 'danger'}`}>
                                                {item?.coverage?.SERVICE_WORK?.access ? <TbCheck /> : <TbX />}
                                            </div>
                                        </div>
                                        <div className="list-item">
                                            <div className={`part part-one`}>
                                                <p>Package Fund</p>
                                            </div>
                                            <div className={`part part-two`}>
                                                {item?.package_charge_applied ? <p>{item?.target_package}*</p> : ''}
                                            </div>
                                            <div className={`part part-three ${item?.package_charge_applied ? 'success' : 'danger'}`}>
                                                {item?.package_charge_applied ? <TbCheck /> : <TbX />}
                                            </div>
                                        </div>
                                        <div className="list-item">
                                            <div className={`part part-one`}>
                                                <p>Service Charge</p>
                                            </div>
                                            <div className={`part part-two`}></div>
                                            <div className={`part part-three ${item?.service_charge_applied ? 'success' : 'danger'}`}>
                                                {item?.service_charge_applied ? <TbCheck /> : <TbX />}
                                            </div>
                                        </div>
                                        <div className="list-item">
                                            <div className={`part part-one`}>
                                                <p>Service Limit</p>
                                            </div>
                                            <div className={`part part-two`}>
                                                {item?.service_limit ? <p>{item?.service_limit}</p> : <p>Unlimit</p>}
                                            </div>
                                            <div className={`part part-three ${item?.service_limit ? 'success' : 'danger'}`}>
                                                {item?.service_limit ? <TbCheck /> : <TbX />}
                                            </div>
                                        </div>
                                    </div>
                                    {item?.service_charges?.length && <div className="list-section">
                                        <h4 className='section-title'>Service Charges</h4>
                                        {item?.service_charges?.map((charge, index) => {
                                            return (
                                                <div className="list-item" key={index}>
                                                    <div className={`part part-one`}>
                                                        <p>Charge {index + 1}</p>
                                                    </div>
                                                    <div className={`part part-two`}>
                                                        <p>₹ {charge?.charge_amount}</p>
                                                    </div>
                                                    <div className={`part part-three`}>
                                                        <p>{charge?.call_count} Call</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>}
                                    <div className="buttons">
                                        <Button icon={<TbEdit />} rounded outlined size='small' onClick={() => handelEditService(item)} />
                                    </div>
                                </div>)
                        })}
                    </div>}
            </div>

            <p className='info-text'>
                NOTE : Changes to package duration, work limit, SR in duration, expiry type, and expiry action apply only
                to newly added package products. Existing packages will continue under their original service
                conditions, and their current package details will remain visible in the customer profile.
            </p>
        </div >
    )
}

export default ViewServicePackage