import React, { useEffect, useMemo } from 'react';
import './package-service-category-view.scss';
import Button from '../../../components/UI_Primitives/buttons/Button';
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
} from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { doDialog, modal, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api';
import { serviceChargeSort, toStandardText } from '../../../utils/helpers/text-formatting';
import Badge from '../../../components/UI_Primitives/badge/Badge';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import UpdatePackageService from '../../../components/forms/controller/update-package/UpdatePackageService';

const PackageServiceCategoryView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { package_id, service_id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['cn', 'package_service_category', package_id, service_id],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/config/service-package/${package_id}/${service_id}`);
            return res;
        },
        staleTime: 60_000
    });

    const openUpdateModal = () => {
        dispatch(modal.push({
            title: 'Update Package Service Category',
            body: <UpdatePackageService packageId={package_id} serviceData={data} />,
            style: { width: '720px' }
        }));
    };

    const handleChangeStatus = (status) => {
        dispatch(doDialog.confirm({
            message: `Do you want to ${status === 'ENABLE' ? 'enable' : 'disable'} this package service category?`,
            accept: {
                onClick: async () => {
                    try {
                        await api.vfCv2Axios.post(`/config/service-package/${package_id}/${service_id}/status`, {
                            status: status
                        });

                        queryClient.setQueryData(
                            ['cn', 'package_service_category', package_id, service_id],
                            (oldData) => {
                                if (!oldData) return oldData;
                                return {
                                    ...oldData,
                                    is_active: status === 'ENABLE'
                                };
                            }
                        );

                        queryClient.refetchQueries({
                            queryKey: ['cn', 'service_package', package_id]
                        });

                        dispatch(toast.push({
                            type: 'success',
                            head: 'Status updated',
                            message: `Service category has been ${status === 'ENABLE' ? 'enabled' : 'disabled'}.`
                        }));
                    } catch (err) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Action failed',
                            message: err?.message || 'Failed to update status'
                        }));
                    }
                }
            }
        }));
    };

    const handleRemove = () => {
        dispatch(doDialog.confirm({
            message: 'Are you sure you want to remove this service category from the package?',
            accept: {
                onClick: async () => {
                    try {
                        await api.vfCv2Axios.delete(`/config/service-package/${package_id}/${service_id}`);

                        queryClient.refetchQueries({
                            queryKey: ['cn', 'service_package', package_id]
                        });

                        navigate(`/controller/app-config/service-packages/${package_id}`);

                        dispatch(toast.push({
                            type: 'success',
                            head: 'Service removed',
                            message: 'The package service category has been removed.'
                        }));
                    } catch (err) {
                        dispatch(toast.push({
                            type: 'danger',
                            head: 'Action failed',
                            message: err?.message || 'Failed to remove service category'
                        }));
                    }
                }
            }
        }));
    };

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Package Service Category', note: "View and manage service category configurations" }));
        // eslint-disable-next-line
    }, []);

    const coverageItems = useMemo(() => {
        if (Array.isArray(data?.coverage)) {
            return data.coverage;
        }
        if (data?.coverage && typeof data.coverage === 'object') {
            return Object.entries(data.coverage).map(([key, val]) => ({
                coverage_id: key,
                position: val?.position || 'CURRENT',
                price_type: val?.price_type,
                access: val?.access ?? true
            }));
        }
        return [];
    }, [data?.coverage]);

    const rulesList = useMemo(() => {
        if (Array.isArray(data?.rules)) return data.rules;
        if (Array.isArray(data?.eligibility_rules)) return data.eligibility_rules;
        return [];
    }, [data?.rules, data?.eligibility_rules]);

    // Loading State
    if (isLoading) {
        return (
            <div className="package-service-category-view-page-container">
                <SkeletonGrid rows={1} columns={1} height={'180px'} />
                <SkeletonGrid rows={2} columns={3} height={'100px'} style={{ marginTop: '20px' }} />
                <SkeletonGrid rows={2} columns={2} height={'140px'} style={{ marginTop: '20px' }} />
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <ErrorState
                hight='70vh'
                title={'Data fetching failed!'}
                message={error?.message}
                icon={<TbCarouselHorizontal />}
            />
        );
    }

    return (
        <div className="package-service-category-view-page-container">
            <div className="back-nav">
                <Button
                    label="Back to Package"
                    icon={<TbArrowLeft />}
                    text
                    size="small"
                    onClick={() => navigate(`/controller/app-config/service-packages/${package_id}`)}
                />
            </div>

            <div className="top-section">
                <div className="title-section">
                    <h3>
                        {data?.service_name || 'Service Category'}
                        {data?.is_active
                            ? <Badge value={'Active'} severity={'success'} />
                            : <Badge value={'Inactive'} severity={'danger'} />}
                    </h3>
                    <div className="meta-details">
                        <span>PSC ID: {data?.service_id || service_id}</span>
                        {data?.category_id && (
                            <>
                                <TbPointFilled />
                                <span>Cat. ID: {data.category_id}</span>
                            </>
                        )}
                        {package_id && (
                            <>
                                <TbPointFilled />
                                <span>Package ID: {package_id}</span>
                            </>
                        )}
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
                            onClick={() => handleChangeStatus('DISABLE')}
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
                            onClick={() => handleChangeStatus('ENABLE')}
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
                        onClick={handleRemove}
                    />
                </div>
            </div>

            <div className="info-cards-section">
                <div className="info-card">
                    <span className="card-label">Service Limit</span>
                    <span className="card-value">
                        {data?.service_limit && Number(data.service_limit) > 0
                            ? `${data.service_limit} Services`
                            : 'Unlimited (0)'}
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
            </div>

            <div className="section-container access-section">
                <h3 className='sub-title'>Coverage & Price Types</h3>
                <div className="access-content">
                    {coverageItems.map((c, index) => (
                        <div className="item" key={c?.coverage_id ? `${c?.position || ''}_${c?.coverage_id}_${index}` : index}>
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
                    {coverageItems.length === 0 && (
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No coverage rules configured.</p>
                    )}
                </div>
            </div>

            {rulesList.length > 0 && (
                <div className="last-section">
                    <div className="listing-section">
                        <h3 className='sub-title'>Eligibility Rules</h3>
                        <div className="rules-content">
                            {rulesList.map((r, index) => {
                                const ruleName = typeof r === 'string' ? r : (r?.name || r?.rule_name || `Rule #${index + 1}`);
                                const isEnabled = typeof r === 'object' ? (r?.enabled ?? true) : true;
                                return (
                                    <div className="item" key={r?.uuid || r?.id || index}>
                                        <p className="name">{ruleName}</p>
                                        {isEnabled ? (
                                            <Badge value={'Enabled'} severity={'primary'} />
                                        ) : (
                                            <Badge value={'Disabled'} severity={'danger'} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageServiceCategoryView;
