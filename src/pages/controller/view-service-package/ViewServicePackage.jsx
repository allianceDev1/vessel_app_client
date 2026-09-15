import { useEffect } from 'react'
import './view-service-package.scss'
import { useDispatch, useSelector } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api';
import { TbCarouselHorizontal, TbCheck, TbChevronDown, TbEye, TbEyeClosed, TbPencil, TbPlus, TbPointFilled, TbTrash, TbX } from 'react-icons/tb';
import { hexToRgba } from '../../../utils/helpers/color-utils';
import { modal, doDialog, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState';
import Button from '../../../components/UI_Primitives/buttons/Button';
import UpdatePackage from '../../../components/forms/controller/update-package/CreateUpdatePackage';
import Message from '../../../components/UI_Primitives/message/Message'
import { isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';
import { getExpiryMessage, toStandardText } from '../../../utils/helpers/text-formatting';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown';
import CreatePackageService from '../../../components/forms/controller/update-package/CreatePackageService';


const ViewServicePackage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { package_id } = useParams();
    const { user } = useSelector((state) => state.user)

    const openModal = (title, body, style) => {
        dispatch(modal.push({
            show: true,
            title,
            body,
            style
        }))
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['cn', 'service_package', package_id],
        queryFn: async () => {

            const [packageRes, serviceRes] = await Promise.all([
                api.vfCv2Axios.get(`/config/service-package/${package_id}`),
                api.vfCv2Axios.get(`/config/service-package/service/list?hidden=Yes&packageIds=${package_id}&fields=service_name,is_active`)
            ]);

            const { pricing_config, ...pInfo } = packageRes;

            return {
                packageInfo: {
                    ...pInfo,
                    package_fund: pricing_config?.base_price || 0,
                    gst_rate: pricing_config?.gst?.rate || null,
                    service_work_fund_type: pricing_config?.fund_distribution?.filter((a) => a.fund_type === 'SERVICE_WORK')?.[0]?.value_type || null,
                    service_work_fund: pricing_config?.fund_distribution?.filter((a) => a.fund_type === 'SERVICE_WORK')?.[0]?.value || null,
                    spare_parts_fund_type: pricing_config?.fund_distribution?.filter((a) => a.fund_type === 'SPARE_PARTS')?.[0]?.value_type || null,
                    spare_parts_fund: pricing_config?.fund_distribution?.filter((a) => a.fund_type === 'SPARE_PARTS')?.[0]?.value || null
                },
                serviceCategoryList: serviceRes
            }


        },
        staleTime: 60_000
    })

    const updateActiveStatus = (is_active) => {
        dispatch(doDialog.confirm({
            message: is_active ?
                'Do you want to continue?'
                : 'This action will disable the package. Do you want to continue?',
            accept: {
                onClick: async () => {
                    try {

                        await api.vfCv2Axios.patch(`/config/service-package/${package_id}/active-status`, { is_active })

                        queryClient.setQueryData(
                            ['cn', 'service_package', package_id],
                            (oldData) => {
                                if (!oldData) return oldData;

                                return {
                                    ...oldData,
                                    packageInfo: {
                                        ...oldData?.packageInfo,
                                        is_active
                                    }
                                };
                            }
                        );
                    } catch (error) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Update failed',
                            message: error.message
                        }))
                    }
                }
            }
        }))
    }

    const handleRemovePackage = () => {
        dispatch(doDialog.confirm({
            message: 'This action will be remove this service package and package service categories. Do you want to continue?',
            accept: {
                onClick: async () => {
                    try {

                        await api.vfCv2Axios.delete(`/config/service-package/${package_id}`)

                        queryClient.refetchQueries({
                            queryKey: ['cn', 'service_packages', data?.packageInfo?.product_type]
                        })

                        dispatch(toast.push({
                            type: 'success',
                            head: 'Package removed!',
                            message: 'Service package and package service categories removed.'
                        }))

                        navigate(`/controller/app-config/service-packages?parent_product=${data?.packageInfo?.product_type}`)

                    } catch (error) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Package remove failed',
                            message: error.message
                        }))
                    }
                }
            }
        }))
    }

    useEffect(() => {
        dispatch(page.setTitle({}))

        // eslint-disable-next-line
    }, [])


    // loading
    if (isLoading) {
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
    if (error) {
        return <ErrorState
            hight='80vh'
            title={'Data fetching failed!'}
            message={error?.message}
            icon={<TbCarouselHorizontal />}
        />
    }

    return (
        <div className="view-service-package-page">
            {user?.allowed_origins?.includes('vessel_c_admin') &&
                <div className="top-section">
                    <div className="action-buttons">

                        <Button label={'Service Category'} icon={<TbPlus />} size='small' severity={'primary'} rounded style={{ width: '170px' }}
                            onClick={() => openModal('Add Service Category', <CreatePackageService productType={data?.packageInfo?.product_type} packageId={package_id} />)} />

                        <Dropdown
                            button={{
                                label: 'Action',
                                icon: < TbChevronDown />, iconPos: 'right',
                                rounded: true, outlined: true, size: 'small', style: { width: '110px' }
                            }}
                            list={[
                                {
                                    items: [
                                        {
                                            icon: <TbPencil />,
                                            label: 'Update package',
                                            onClick: () => openModal('Update package', <UpdatePackage action={'UPDATE'} data={data?.packageInfo} />, { width: "800px" })
                                        },
                                        (
                                            data?.packageInfo?.is_active
                                                ? {
                                                    icon: <TbEyeClosed />,
                                                    label: 'Disable',
                                                    theme: "danger",
                                                    onClick: () => updateActiveStatus(false)
                                                }
                                                : {
                                                    icon: <TbEye />,
                                                    label: 'Enable',
                                                    theme: "info",
                                                    onClick: () => updateActiveStatus(true),
                                                    disabled: !data?.serviceCategoryList?.length
                                                }
                                        ),
                                        {
                                            icon: <TbTrash />,
                                            label: 'Remove',
                                            theme: "danger",
                                            onClick: () => handleRemovePackage()
                                        }
                                    ]
                                }
                            ]} />
                    </div>
                </div>}
            <div className="package-title" style={{
                borderColor: data?.packageInfo?.color_code,
                background: `linear-gradient(50deg,
                    ${hexToRgba(data?.packageInfo?.color_code, 0.3)} 25%,
                    ${hexToRgba(data?.packageInfo?.color_code, 0.5)} 60%,
                    ${hexToRgba(data?.packageInfo?.color_code, 0.7)} 85%)`
            }}>
                <h1 style={{ color: data?.packageInfo.color_code }}>{data?.packageInfo?.package_name}</h1>
                <p>( {data?.packageInfo?.full_form} )</p>
                <p className='package-id'>Package ID : {package_id || data?.packageInfo?.package_id}</p>
                <div className="sub-items">
                    <div className="sub-item">
                        <h4>{data?.packageInfo?.package_duration_months ? `${data?.packageInfo?.package_duration_months} mo` : 'Nil'}</h4>
                        <p>Duration</p>
                    </div>
                    <div className="sub-item">
                        <h4>{data?.packageInfo?.tokens_count ? `${data?.packageInfo?.tokens_count}` : 'Nil'}</h4>
                        <p>Tokens</p>
                    </div>
                    <div className="sub-item">
                        <h4>{data?.packageInfo?.number_of_services ? `${data?.packageInfo?.number_of_services}` : '0'}</h4>
                        <p>SR In Duration</p>
                    </div>
                    <div className="sub-item">
                        <h4>{data?.packageInfo?.package_fund ? `₹ ${data?.packageInfo?.package_fund}` : '₹ 0'}</h4>
                        <p>Package Fund</p>
                    </div>
                </div>

                <p className='expire-note'>{getExpiryMessage({
                    packageDuration: data?.packageInfo?.expire_types?.find(i => i === "PACKAGE_DURATION"),
                    remainingTokens: data?.packageInfo?.expire_types?.find(i => i === "REMAINING_TOKENS"),
                    operator: data?.packageInfo?.et_query_operator || null,
                })}</p>
                <div className={`status-fold ${data?.packageInfo.is_active ? 'active' : 'inactive'}`}>
                    {data?.packageInfo.is_active ? <TbCheck /> : <TbX />}
                    <p>{data?.packageInfo.is_active ? 'Active' : 'Inactive'}</p>
                </div>
            </div>

            <p>The package is updated at {isoToDDMonYYYY(new Date(data?.packageInfo?.updated_at))} by {data?.packageInfo?.updated_by}</p>

            {!Number(data?.packageInfo?.package_fund ?? 0) &&
                <Message type={'info'} head={'Zero-Fee Package'} message={`This package is configured as a Zero-Fee Package. 
                The renewal charge is set to zero, and no amount will be collected at renewal time.`} />}

            <div className="service-section">

                <h3 className='sub-title'>Package Service Categories</h3>

                {data?.serviceCategoryList?.length === 0
                    ? <EmptyState icon={<TbCarouselHorizontal />} title={'No services available'} description={'The package related service not created'}
                        hight='300px' />
                    : <div className="service-list">
                        {data?.serviceCategoryList?.map((item) => {
                            return (
                                <div
                                    className="item"
                                    key={item?.category_uuid || item?.service_id}
                                    onClick={() => navigate(`/controller/app-config/service-packages/${package_id}/service-category/${item?.service_id}`)}
                                >
                                    <div className="head">
                                        <h3>{item?.service_name}</h3>
                                        <div>
                                            <p>Cat. ID : {item?.category_id}</p>
                                            <TbPointFilled />
                                            <p>Mode : {toStandardText(item?.mode)}</p>
                                        </div>
                                        <div>
                                            <p>PSC ID : {item?.service_id}</p>
                                        </div>
                                    </div>
                                    <div className={`status-fold ${item.is_active ? 'active' : 'inactive'}`}>
                                        {item.is_active ? <TbCheck /> : <TbX />}
                                        <p>{item.is_active ? 'Active' : 'Inactive'}</p>
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