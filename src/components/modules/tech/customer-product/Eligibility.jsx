import React, { useMemo, useState } from 'react';
import './eligibility.scss';
import {
    TbAlertCircle,
    TbAlertTriangle,
    TbCheck,
    TbCircleCheck,
    TbCrown,
    TbDropletStar,
    TbRefresh,
    TbRotate,
    TbTool,
    TbX
} from 'react-icons/tb';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState';
import Badge from '../../../UI_Primitives/badge/Badge';
import Button from '../../../UI_Primitives/buttons/Button';
import { api } from '../../../../api';
import { toStandardText } from '../../../../utils/helpers/text-formatting';

const SERVICE_HEADS = [
    {
        key: 'COMPLAINT',
        title: 'Complaint',
        icon: <TbAlertTriangle />,
        description: 'Customer complaints and issue reports'
    },
    {
        key: 'SERVICE',
        title: 'Service',
        icon: <TbTool />,
        description: 'Routine maintenance and periodical services'
    },
    {
        key: 'RENEWAL',
        title: 'Renewal',
        icon: <TbRefresh />,
        description: 'Package subscription and plan renewals'
    }
];

const normalizeEligibility = (raw) => {
    const root = raw?.data?.data || raw?.data || raw || {};

    let services = [];
    if (Array.isArray(root?.services)) {
        services = root.services.map((s) => ({
            serviceId: s?.serviceId || s?.service_id || null,
            serviceName: s?.serviceName || s?.service_name || toStandardText(s?.mode || 'Service'),
            mode: (s?.mode || 'OTHER').toUpperCase(),
            category: s?.category || null,
            isEligible: Boolean(s?.isEligible ?? s?.status ?? s?.is_eligible),
            reason: s?.reason || s?.note || ''
        }));
    } else if (Array.isArray(root)) {
        services = root.map((item) => {
            if (Array.isArray(item)) {
                const [key, status, note] = item;
                return {
                    serviceId: null,
                    serviceName: toStandardText(key || 'Service'),
                    mode: (key || 'OTHER').toUpperCase(),
                    category: null,
                    isEligible: Boolean(status),
                    reason: note || ''
                };
            }
            return {
                serviceId: item?.serviceId || item?.service_id || null,
                serviceName: item?.serviceName || toStandardText(item?.mode || 'Service'),
                mode: (item?.mode || 'OTHER').toUpperCase(),
                category: item?.category || null,
                isEligible: Boolean(item?.isEligible ?? item?.status),
                reason: item?.reason || item?.note || ''
            };
        });
    } else if (typeof root === 'object' && root !== null) {
        Object.entries(root).forEach(([key, val]) => {
            if (['product_id', 'productId', 'success', 'message', 'hasPackage', 'packageId'].includes(key)) return;
            if (Array.isArray(val)) {
                const [status, note] = val;
                services.push({
                    serviceId: null,
                    serviceName: toStandardText(key),
                    mode: (key || 'OTHER').toUpperCase(),
                    category: null,
                    isEligible: Boolean(status),
                    reason: note || ''
                });
            } else if (typeof val === 'object' && val !== null) {
                services.push({
                    serviceId: val?.serviceId || val?.service_id || null,
                    serviceName: val?.serviceName || toStandardText(key),
                    mode: (val?.mode || key || 'OTHER').toUpperCase(),
                    category: val?.category || null,
                    isEligible: Boolean(val?.isEligible ?? val?.status),
                    reason: val?.reason || val?.note || ''
                });
            }
        });
    }

    return {
        productId: root?.productId || root?.product_id || null,
        hasPackage: Boolean(root?.hasPackage),
        packageId: root?.packageId || null,
        services
    };
};

const Eligibility = () => {
    const { customer_id, product_id } = useParams();
    const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ELIGIBLE' | 'INELIGIBLE'

    const { data: rawData, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['tech_product_eligibility', customer_id, product_id],
        queryFn: async () => {
            const res = await api.vfTv2Axios.get(`/product/${product_id}/eligibility`);
            const payload = res?.data || res;
            if (res?.success === false || payload?.success === false) {
                throw new Error(res?.message || payload?.message || 'Failed to fetch eligibility information');
            }
            return payload;
        },
        staleTime: 60_000,
        enabled: Boolean(product_id)
    });

    const eligibility = useMemo(() => normalizeEligibility(rawData), [rawData]);
    const services = useMemo(() => eligibility.services, [eligibility]);

    const stats = useMemo(() => {
        const total = services.length;
        const eligible = services.filter((s) => s.isEligible).length;
        const ineligible = total - eligible;
        return { total, eligible, ineligible };
    }, [services]);

    const filteredServices = useMemo(() => {
        if (filter === 'ELIGIBLE') return services.filter((s) => s.isEligible);
        if (filter === 'INELIGIBLE') return services.filter((s) => !s.isEligible);
        return services;
    }, [services, filter]);

    const servicesByHead = useMemo(() => {
        const map = {
            COMPLAINT: [],
            SERVICE: [],
            RENEWAL: [],
            OTHER: []
        };

        filteredServices.forEach((item) => {
            const mode = (item?.mode || '').toUpperCase();
            if (map[mode]) {
                map[mode].push(item);
            } else {
                map.OTHER.push(item);
            }
        });

        return map;
    }, [filteredServices]);

    if (isLoading) {
        return (
            <div className="tech-eligibility-container">
                <SkeletonGrid rows={1} columns={1} height={'140px'} gap={'10px'} />
                <SkeletonGrid rows={3} columns={1} height={'85px'} gap={'10px'} style={{ marginTop: '10px' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="tech-eligibility-container">
                <ErrorState
                    icon={<TbAlertCircle />}
                    title={'Eligibility Check Failed'}
                    message={error?.message || 'An error occurred while evaluating product service eligibility.'}
                    hight="320px"
                    footer={
                        <Button
                            label="Try Again"
                            icon={<TbRotate />}
                            size="small"
                            rounded
                            severity="primary"
                            spinIcon={isFetching}
                            disabled={isFetching}
                            onClick={() => refetch()}
                        />
                    }
                />
            </div>
        );
    }

    const currentProductId = eligibility?.productId || product_id;
    const hasPackage = eligibility?.hasPackage;
    const packageId = eligibility?.packageId;

    return (
        <div className="tech-eligibility-container">
            {/* Overview Card */}
            <div className="tech-eligibility-overview-card">
                <div className="overview-top-row">
                    <div className="top-left">
                        <div className="icon-wrap">
                            <TbDropletStar />
                        </div>
                        <div className="title-info">
                            <h3>Service Eligibility</h3>
                            <p>
                                Product ID: <strong>{currentProductId}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="top-right">
                        <Button
                            icon={<TbRotate />}
                            label="Refresh"
                            size="small"
                            severity="secondary"
                            outlined
                            rounded
                            spinIcon={isFetching}
                            disabled={isFetching}
                            onClick={() => refetch()}
                        />
                    </div>
                </div>

                {/* Package Status Banner */}
                <div className={`package-strip ${hasPackage ? 'active' : 'inactive'}`}>
                    <TbCrown />
                    <span className="package-text">
                        {hasPackage ? `Active Package: ${packageId || 'Subscribed'}` : 'No Active Package'}
                    </span>
                </div>

                {/* KPI Metrics */}
                <div className="overview-kpis">
                    <div className="kpi-item">
                        <span className="kpi-count">{stats.total}</span>
                        <span className="kpi-label">Total</span>
                    </div>
                    <div className="kpi-item success">
                        <span className="kpi-count">{stats.eligible}</span>
                        <span className="kpi-label">Eligible</span>
                    </div>
                    <div className="kpi-item danger">
                        <span className="kpi-count">{stats.ineligible}</span>
                        <span className="kpi-label">Not Eligible</span>
                    </div>
                </div>

                {/* Quick Filter Pills */}
                {services.length > 0 && (
                    <div className="filter-pills-row">
                        <button
                            type="button"
                            className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
                            onClick={() => setFilter('ALL')}
                        >
                            All ({stats.total})
                        </button>
                        <button
                            type="button"
                            className={`filter-pill ${filter === 'ELIGIBLE' ? 'active' : ''}`}
                            onClick={() => setFilter('ELIGIBLE')}
                        >
                            Eligible ({stats.eligible})
                        </button>
                        <button
                            type="button"
                            className={`filter-pill ${filter === 'INELIGIBLE' ? 'active' : ''}`}
                            onClick={() => setFilter('INELIGIBLE')}
                        >
                            Not Eligible ({stats.ineligible})
                        </button>
                    </div>
                )}
            </div>

            {/* Content List */}
            {services.length === 0 ? (
                <EmptyState
                    icon={<TbCircleCheck />}
                    title="No Services Found"
                    description="No service eligibility rules or services are registered for this product."
                    hight="240px"
                    footer={
                        <Button
                            label="Refresh"
                            icon={<TbRotate />}
                            size="small"
                            outlined
                            rounded
                            spinIcon={isFetching}
                            disabled={isFetching}
                            onClick={() => refetch()}
                        />
                    }
                />
            ) : filteredServices.length === 0 ? (
                <EmptyState
                    icon={<TbCircleCheck />}
                    title={`No ${filter === 'ELIGIBLE' ? 'Eligible' : 'Ineligible'} Services`}
                    description={`There are currently no ${filter === 'ELIGIBLE' ? 'eligible' : 'ineligible'} services for this product.`}
                    hight="220px"
                    footer={
                        <Button
                            label="Show All Services"
                            size="small"
                            outlined
                            rounded
                            onClick={() => setFilter('ALL')}
                        />
                    }
                />
            ) : (
                <>
                    {SERVICE_HEADS.map((head) => {
                        const groupServices = servicesByHead[head.key] || [];
                        if (groupServices.length === 0 && filter !== 'ALL') return null;

                        return (
                            <div className="tech-eligibility-section" key={head.key}>
                                <div className="section-header">
                                    <div className="header-title-wrap">
                                        <span className="section-icon">{head.icon}</span>
                                        <h4 className="section-name">{head.title}</h4>
                                    </div>
                                    <span className="section-badge">
                                        {groupServices.length} {groupServices.length === 1 ? 'Service' : 'Services'}
                                    </span>
                                </div>

                                <div className="services-list">
                                    {groupServices.length === 0 ? (
                                        <div className="empty-head-box">
                                            <p>No {head.title.toLowerCase()} services available</p>
                                        </div>
                                    ) : (
                                        groupServices.map((service, idx) => (
                                            <div
                                                className={`tech-service-card ${service.isEligible ? 'eligible' : 'ineligible'}`}
                                                key={service.serviceId || idx}
                                            >
                                                <div className="card-top">
                                                    <div className="card-title-group">
                                                        <div className={`status-mini-icon ${service.isEligible ? 'eligible' : 'ineligible'}`}>
                                                            {service.isEligible ? <TbCheck /> : <TbX />}
                                                        </div>
                                                        <div className="title-and-meta">
                                                            <h5 className="service-title">{service.serviceName}</h5>
                                                            <div className="meta-chips-row">
                                                                {service.serviceId && (
                                                                    <span className="meta-chip">
                                                                        ID: <strong>{service.serviceId}</strong>
                                                                    </span>
                                                                )}
                                                                {service.category && (
                                                                    <span className="meta-chip">
                                                                        Category: <strong>{service.category}</strong>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="card-status-badge">
                                                        <Badge
                                                            value={service.isEligible ? 'Eligible' : 'Not Eligible'}
                                                            severity={service.isEligible ? 'success' : 'danger'}
                                                        />
                                                    </div>
                                                </div>

                                                {service.isEligible ? (
                                                    <div className="eligible-banner">
                                                        <TbCircleCheck className="banner-icon" />
                                                        <span>Eligible for service registration and processing</span>
                                                    </div>
                                                ) : (
                                                    <div className="ineligible-banner">
                                                        <div className="banner-head">
                                                            <TbAlertCircle className="banner-icon" />
                                                            <span>Condition Not Met</span>
                                                        </div>
                                                        <p className="banner-desc">
                                                            {service.reason || 'This service is currently not eligible based on eligibility rules.'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {servicesByHead.OTHER.length > 0 && (
                        <div className="tech-eligibility-section" key="OTHER">
                            <div className="section-header">
                                <div className="header-title-wrap">
                                    <span className="section-icon"><TbCircleCheck /></span>
                                    <h4 className="section-name">Other Services</h4>
                                </div>
                                <span className="section-badge">
                                    {servicesByHead.OTHER.length} {servicesByHead.OTHER.length === 1 ? 'Service' : 'Services'}
                                </span>
                            </div>

                            <div className="services-list">
                                {servicesByHead.OTHER.map((service, idx) => (
                                    <div
                                        className={`tech-service-card ${service.isEligible ? 'eligible' : 'ineligible'}`}
                                        key={service.serviceId || idx}
                                    >
                                        <div className="card-top">
                                            <div className="card-title-group">
                                                <div className={`status-mini-icon ${service.isEligible ? 'eligible' : 'ineligible'}`}>
                                                    {service.isEligible ? <TbCheck /> : <TbX />}
                                                </div>
                                                <div className="title-and-meta">
                                                    <h5 className="service-title">{service.serviceName}</h5>
                                                    <div className="meta-chips-row">
                                                        {service.serviceId && (
                                                            <span className="meta-chip">
                                                                ID: <strong>{service.serviceId}</strong>
                                                            </span>
                                                        )}
                                                        {service.category && (
                                                            <span className="meta-chip">
                                                                Category: <strong>{service.category}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-status-badge">
                                                <Badge
                                                    value={service.isEligible ? 'Eligible' : 'Not Eligible'}
                                                    severity={service.isEligible ? 'success' : 'danger'}
                                                />
                                            </div>
                                        </div>

                                        {service.isEligible ? (
                                            <div className="eligible-banner">
                                                <TbCircleCheck className="banner-icon" />
                                                <span>Eligible for service registration and processing</span>
                                            </div>
                                        ) : (
                                            <div className="ineligible-banner">
                                                <div className="banner-head">
                                                    <TbAlertCircle className="banner-icon" />
                                                    <span>Condition Not Met</span>
                                                </div>
                                                <p className="banner-desc">
                                                    {service.reason || 'This service is currently not eligible based on eligibility rules.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Eligibility;