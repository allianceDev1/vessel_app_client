import React, { useEffect, useState } from 'react'
import './view-service-package.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useParams } from 'react-router-dom';
import { api } from '../../../api';
import { TbCarouselHorizontal, TbCheck, TbEye, TbEyeClosed, TbPencil, TbX } from 'react-icons/tb';
import { hexToRgba } from '../../../utils/color-utils';
import { modal, doDialog, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState';
import Button from '../../../components/UI_Primitives/buttons/Button';
import UpdatePackage from '../../../components/forms/update-package/UpdatePackage';
import UpdatePackageService from '../../../components/forms/update-package/UpdatePackageService';
import { isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';


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
                api.vfCv2Axios.get(`/package/${package_id}`),
                api.vfCv2Axios.get(`/package/service/list?hidden=Yes&packageIds=${package_id}&fields=service_name,service_limit,extra_charge_applied,service_charge_applied,credit_limit`)
            ]);

            setPackageInfo(packageRes.data)
            setServiceList(serviceRes.data)

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
                        await api.vfCv2Axios.patch(`/package/${package_id}/active-status`, { is_active })
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
                        onClick={() => openModal('Update package', <UpdatePackage data={packageInfo} setData={setPackageInfo} />)} />
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
                        <h4>{packageInfo?.work_limit ? `${packageInfo?.work_limit}` : 'Nil'}</h4>
                        <p>Work limit</p>
                    </div>
                    <div className="sub-item">
                        <h4>{packageInfo?.service_list ? `${packageInfo?.service_list.length}` : '0'}</h4>
                        <p>Services</p>
                    </div>
                </div>
                <div className={`status-fold ${packageInfo.is_active ? 'active' : 'inactive'}`}>
                    {packageInfo.is_active ? <TbCheck /> : <TbX />}
                    <p>{packageInfo.is_active ? 'Active' : 'Inactive'}</p>
                </div>
            </div>

            <div className="service-section">
                <h3 className='sub-title'>Available Services</h3>
                {serviceList?.length === 0
                    ? <EmptyState icon={<TbCarouselHorizontal />} title={'No services available'} description={'The package related service not created'}
                        hight='300px' />
                    : <div className="service-list">
                        {serviceList?.map((service, index) => (
                            <div className="service-item" key={service?.service_id}>
                                <div className="line-one">
                                    <h4>{service?.service_name}</h4>
                                    <p>{service?.service_limit ? `Service limit : ${service?.service_limit}` : 'No service limit'}</p>
                                </div>
                                <div className="line-two">
                                    <p className={service?.service_charge_applied ? 'active' : 'inactive'}>{service?.service_charge_applied ? <TbCheck /> : <TbX />} Service charge</p>
                                    <p className={service?.extra_charge_applied ? 'active' : 'inactive'}>{service?.extra_charge_applied ? <TbCheck /> : <TbX />} Extra charge</p>
                                    <p className={service?.credit_limit ? 'active' : 'inactive'}>{service?.credit_limit ? <TbCheck /> : <TbX />} Credit</p>

                                </div>
                                <div className="fold-action">
                                    <Button icon={<TbPencil />} size='medium' outlined rounded
                                        onClick={() => openModal(
                                            'Update service',
                                            <UpdatePackageService packageId={package_id} serviceId={service?.service_id} mode={service?.mode} setData={setServiceList} />,
                                            { width: '800px' }
                                        )} />
                                </div>
                            </div>

                        ))}
                    </div>}
            </div>
            <p>The package is updated at {isoToDDMonYYYY(new Date(packageInfo?.updated_at))} by {packageInfo?.updated_by}</p>
        </div >
    )
}

export default ViewServicePackage