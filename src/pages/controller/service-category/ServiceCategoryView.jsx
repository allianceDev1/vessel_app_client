import './service-category-view.scss'
import Button from '../../../components/UI_Primitives/buttons/Button'
import {
    TbArrowLeft,
    TbCarouselHorizontal,
    TbCheck,
    TbEye,
    TbEyeClosed,
    TbPencil,
    TbPointFilled,
    TbTrash,
    TbX
} from 'react-icons/tb'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { doDialog, modal, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice'
import Message from '../../../components/UI_Primitives/message/Message'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../api'
import { serviceChargeSort, toStandardText } from '../../../utils/helpers/text-formatting'
import Badge from '../../../components/UI_Primitives/badge/Badge'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import CreateUpdateServiceCategory from '../../../components/forms/controller/service-category/CreateUpdateServiceCategory'

const ServiceCategoryView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { category_id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['cn', 'service_category', category_id],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/config/service-categories/${category_id}`)
            return res
        },
        staleTime: 60_000
    })

    const openUpdateModal = () => {
        dispatch(modal.push({
            title: 'Update service category',
            body: <CreateUpdateServiceCategory action={'UPDATE'} data={data} />,
            style: { width: '700px' }
        }))
    }

    const handelChangeStatus = (status) => {
        dispatch(doDialog.confirm({
            message: 'Do you want to change status ?',
            accept: {
                onClick: async () => {
                    try {
                        await api.vfCv2Axios.post(`/config/service-categories/${category_id}/status`, {
                            status: status
                        })

                        queryClient.setQueryData(
                            ['cn', 'service_category', category_id],
                            (oldData) => {
                                if (!oldData) return oldData;

                                return {
                                    ...oldData,
                                    is_active: status === 'ENABLE' ? true : false
                                };
                            }
                        );
                    } catch (error) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Action failed',
                            message: error?.message || ''
                        }))
                    }
                }
            }
        }))
    }

    const handelRemove = () => {
        dispatch(doDialog.confirm({
            message: 'Do you want to remove the service category ?',
            accept: {
                onClick: async () => {
                    try {
                        await api.vfCv2Axios.delete(`/config/service-categories/${category_id}`)

                        queryClient.refetchQueries({
                            queryKey: ['cn', 'service_category_list', data?.product_type]
                        })
                        navigate(`/controller/app-config/service-categories?parent_product=${data?.product_type}`)

                        dispatch(toast.push({
                            type: 'success',
                            head: 'Category removed !',
                            message: 'The service category removed.'
                        }))

                    } catch (error) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Action failed',
                            message: error?.message || ''
                        }))
                    }
                }
            }
        }))
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Service Category', note: "View and manage service category configuration" }))
        // eslint-disable-next-line
    }, [])

    // loading
    if (isLoading) {
        return (
            <div className="service-category-view-page-container">
                <SkeletonGrid rows={1} columns={1} height={'180px'} />
                <SkeletonGrid rows={1} columns={3} height={'100px'} style={{ marginTop: '20px' }} />
                <SkeletonGrid rows={2} columns={2} height={'140px'} style={{ marginTop: '20px' }} />
            </div>
        )
    }

    if (error) {
        return (
            <ErrorState
                hight='70vh'
                title={'Data fetching failed!'}
                message={error?.message}
                icon={<TbCarouselHorizontal />}
            />
        )
    }

    return (
        <div className="service-category-view-page-container">
            <div className="back-nav">
                <Button
                    label="Back to Service Categories"
                    icon={<TbArrowLeft />}
                    text
                    size="small"
                    onClick={() => navigate(`/controller/app-config/service-categories?parent_product=${data?.product_type || ''}`)}
                />
            </div>

            {data?.package_product_only && (
                <Message
                    type={'warning'}
                    head={'This category only for packages'}
                    message={'The category not listing for non package customers.'}
                    style={{ marginBottom: '20px' }}
                />
            )}

            <div className="top-section">
                <div className="title-section">
                    <h3>
                        {data?.service_name || 'Service Category'}
                        {data?.is_active
                            ? <Badge value={'Active'} severity={'success'} />
                            : <Badge value={'Inactive'} severity={'danger'} />}
                    </h3>
                    <div className="meta-details">
                        <span>Id: {data?.category_id}</span>
                        {data?.mode && (
                            <>
                                <TbPointFilled />
                                <span className="badge-mode">{toStandardText(data.mode)}</span>
                            </>
                        )}
                        {data?.product_type && (
                            <>
                                <TbPointFilled />
                                <span>{toStandardText(data.product_type)}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="action-section">
                    <Button
                        label={'Update'}
                        icon={<TbPencil />}
                        outlined
                        size='small'
                        rounded
                        style={{ width: '110px' }}
                        onClick={openUpdateModal}
                        severity={'secondary'}
                    />
                    {data?.is_active ? (
                        <Button
                            label={'Disable'}
                            icon={<TbEyeClosed />}
                            size='small'
                            rounded
                            outlined
                            severity={'danger'}
                            onClick={() => handelChangeStatus('DISABLE')}
                            style={{ width: '110px' }}
                        />
                    ) : (
                        <Button
                            label={'Enable'}
                            icon={<TbEye />}
                            size='small'
                            rounded
                            outlined
                            severity={'info'}
                            onClick={() => handelChangeStatus('ENABLE')}
                            style={{ width: '110px' }}
                        />
                    )}
                    <Button
                        label={'Remove'}
                        icon={<TbTrash />}
                        severity={'danger'}
                        size='small'
                        rounded
                        style={{ width: '110px' }}
                        onClick={handelRemove}
                    />
                </div>
            </div>

            <div className="info-cards-section">
                <div className="info-card">
                    <span className="card-label">Package Charge Applied</span>
                    <span className="card-value">
                        {data?.package_charge_applied ? (
                            <>
                                <TbCheck style={{ color: 'var(--color-success)' }} />
                                <span>Yes</span>
                            </>
                        ) : (
                            <>
                                <TbX style={{ color: 'var(--color-danger)' }} />
                                <span>No</span>
                            </>
                        )}
                    </span>
                </div>

                <div className="info-card">
                    <span className="card-label">Service Charge Applied</span>
                    <span className="card-value">
                        {data?.service_charge_applied ? (
                            <>
                                <TbCheck style={{ color: 'var(--color-success)' }} />
                                <span>Yes</span>
                            </>
                        ) : (
                            <>
                                <TbX style={{ color: 'var(--color-danger)' }} />
                                <span>No</span>
                            </>
                        )}
                    </span>
                </div>

                <div className="info-card">
                    <span className="card-label">Customer Scope</span>
                    <span className="card-value">
                        {data?.package_product_only ? 'Package Only' : 'All Customers'}
                    </span>
                </div>
            </div>

            <div className="section-container access-section">
                <h3 className='sub-title'>Coverage & Price Types</h3>
                <div className="access-content">
                    {data?.coverage?.map((c, index) => (
                        <div className="item" key={c?.category_id || index}>
                            <p className="name">
                                {c?.position ? `${toStandardText(c.position)} ` : ''}
                                {toStandardText(c?.coverage_id || '')}
                            </p>
                            <div className="rate-details">
                                {c?.price_type && (
                                    <p className="rate-type">{serviceChargeSort(c.price_type) || toStandardText(c.price_type)}</p>
                                )}
                                {c?.access ? (
                                    <TbCheck style={{ color: 'var(--color-success)' }} />
                                ) : (
                                    <TbX style={{ color: 'var(--color-danger)' }} />
                                )}
                            </div>
                        </div>
                    ))}
                    {(!data?.coverage || data.coverage.length === 0) && (
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No coverage rules configured.</p>
                    )}
                </div>
            </div>

            <div className="last-section">
                <div className="listing-section">
                    <h3 className='sub-title'>Service Charges</h3>
                    <div className="access-content">
                        {data?.service_charges?.map((s, index) => (
                            <div className="item" key={index}>
                                <p className="name">#{index + 1}</p>
                                <div className="rate-details">
                                    <p className="rate-type">₹{s?.charge_amount}</p>
                                    <p className="rate-type">Call : {s?.call_count}</p>
                                </div>
                            </div>
                        ))}
                        {(!data?.service_charges || data.service_charges.length === 0) && (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No service charges configured.</p>
                        )}
                    </div>
                </div>

                <div className="listing-section">
                    <h3 className='sub-title'>Eligibility Rules</h3>
                    <div className="access-content">
                        {data?.rules?.map((r, index) => (
                            <div className="item" key={r?.uuid || r?.name || index}>
                                <p className="name">{r?.name}</p>
                                {r?.enabled ? (
                                    <Badge value={'Enabled'} severity={'primary'} />
                                ) : (
                                    <Badge value={'Disabled'} severity={'danger'} />
                                )}
                            </div>
                        ))}
                        {(!data?.rules || data.rules.length === 0) && (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No eligibility rules configured.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServiceCategoryView