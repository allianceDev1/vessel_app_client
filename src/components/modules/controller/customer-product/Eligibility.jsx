import React, { useMemo } from 'react';
import './eligibility.scss';
import {
    TbAlertCircle,
    TbAlertTriangle,
    TbCheck,
    TbCircleCheck,
    TbCircleX,
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

const Eligibility = () => {
    const { product_id } = useParams();

    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['controller_customer_pr_eligibility', product_id],
        queryFn: async () => {
            const res = await api.vfCv2Axios(`/product/${product_id}/eligibility`);
            const payload = res?.data || res;
            if (res?.success === false || payload?.success === false) {
                throw new Error(res?.message || payload?.message || 'Failed to fetch eligibility information');
            }
            return payload;
        },
        staleTime: 60_000,
        enabled: Boolean(product_id)
    });

    const eligibility = useMemo(() => {
        return data?.data || data || {};
    }, [data]);
    const services = useMemo(() => {
        return Array.isArray(eligibility?.services) ? eligibility.services : [];
    }, [eligibility]);

    const servicesByHead = useMemo(() => {
        const map = {
            COMPLAINT: [],
            SERVICE: [],
            RENEWAL: [],
            OTHER: []
        };

        services.forEach((item) => {
            const mode = (item?.mode || '').toUpperCase();
            if (map[mode]) {
                map[mode].push(item);
            } else {
                map.OTHER.push(item);
            }
        });

        return map;
    }, [services]);

    const stats = useMemo(() => {
        const total = services.length;
        const eligible = services.filter((s) => s.isEligible).length;
        const ineligible = total - eligible;
        return { total, eligible, ineligible };
    }, [services]);

    if (isLoading) {
        return (
            <div className="controller-eligibility-customer-container">
                <div className="container">
                    <SkeletonGrid rows={1} columns={1} height={'85px'} gap={'10px'} />
                    <SkeletonGrid rows={4} columns={1} height={'110px'} gap={'14px'} style={{ marginTop: '15px' }} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="controller-eligibility-customer-container">
                <div className="container">
                    <ErrorState
                        icon={<TbCircleX />}
                        title={'Eligibility Check Failed'}
                        message={error?.message || 'An error occurred while evaluating product service eligibility.'}
                        hight="360px"
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
            </div>
        );
    }

    const productId = eligibility?.productId || product_id;
    const hasPackage = Boolean(eligibility?.hasPackage);
    const packageId = eligibility?.packageId;

    return (
        <div className="controller-eligibility-customer-container">
            <div className="container">
                {/* Header Overview Card */}
                <div className="eligibility-overview-card">
                    <div className="overview-header">
                        <div className="header-left">
                            <div className="product-icon-wrap">
                                <TbDropletStar />
                            </div>
                            <div className="product-title-info">
                                <h3>Service Eligibility</h3>
                                <p>
                                    Product ID: <strong>{productId}</strong>
                                </p>
                            </div>
                        </div>
                        <div className="header-right">
                            <div className={`package-badge ${hasPackage ? 'active' : 'inactive'}`}>
                                <TbCrown />
                                <span>{hasPackage ? `Package: ${packageId || 'Active'}` : 'No Active Package'}</span>
                            </div>
                            <Button
                                icon={<TbRotate />}
                                label="Refresh"
                                size="small"
                                severity={'secondary'}
                                outlined
                                rounded
                                spinIcon={isFetching}
                                disabled={isFetching}
                                onClick={() => refetch()}
                            />
                        </div>
                    </div>

                    <div className="overview-stats">
                        <div className="stat-item">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Services</span>
                        </div>
                        <div className="stat-item success">
                            <span className="stat-value">{stats.eligible}</span>
                            <span className="stat-label">Eligible</span>
                        </div>
                        <div className="stat-item danger">
                            <span className="stat-value">{stats.ineligible}</span>
                            <span className="stat-label">Not Eligible</span>
                        </div>
                    </div>
                </div>

                {services.length === 0 ? (
                    <EmptyState
                        icon={<TbCircleCheck />}
                        title="No Eligibility Services Found"
                        description="No service eligibility rules or services are registered for this product."
                        hight="280px"
                        footer={
                            <Button
                                label="Refresh"
                                icon={<TbRotate />}
                                size="small"
                                outlined
                                rounded
                                onClick={() => refetch()}
                            />
                        }
                    />
                ) : (
                    <>
                        {SERVICE_HEADS.map((head) => {
                            const groupServices = servicesByHead[head.key] || [];
                            return (
                                <div className="eligibility-section" key={head.key}>
                                    <div className="section-head">
                                        <div className="head-title-wrap">
                                            <span className="head-icon">{head.icon}</span>
                                            <h3 className="head-title">{head.title}</h3>
                                        </div>
                                        <span className="head-count">
                                            {groupServices.length} {groupServices.length === 1 ? 'Service' : 'Services'}
                                        </span>
                                    </div>

                                    <div className="service-list">
                                        {groupServices.length === 0 ? (
                                            <div className="empty-section-item">
                                                <p>No {head.title.toLowerCase()} services configured for this product</p>
                                            </div>
                                        ) : (
                                            groupServices.map((service, idx) => (
                                                <div
                                                    className={`service-item-card ${service.isEligible ? 'eligible' : 'ineligible'}`}
                                                    key={service.serviceId || idx}
                                                >
                                                    <div className="card-main">
                                                        <div className="card-left">
                                                            <div className={`status-badge-icon ${service.isEligible ? 'eligible' : 'ineligible'}`}>
                                                                {service.isEligible ? <TbCheck /> : <TbX />}
                                                            </div>
                                                            <div className="service-details">
                                                                <h4 className="service-name">
                                                                    {service.serviceName || toStandardText(service.mode || 'Service')}
                                                                </h4>
                                                                <div className="service-meta-row">
                                                                    {service.serviceId && (
                                                                        <span className="meta-tag">
                                                                            Service ID: <strong>{service.serviceId}</strong>
                                                                        </span>
                                                                    )}
                                                                    {service.category && (
                                                                        <span className="meta-tag">
                                                                            Category: <strong>{service.category}</strong>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card-right">
                                                            <Badge
                                                                value={service.isEligible ? 'Eligible' : 'Not Eligible'}
                                                                severity={service.isEligible ? 'success' : 'danger'}
                                                            />
                                                        </div>
                                                    </div>

                                                    {service.isEligible ? (
                                                        <div className="eligible-status-message">
                                                            <TbCircleCheck className="msg-icon" />
                                                            <span>Eligible for service registration and processing</span>
                                                        </div>
                                                    ) : (
                                                        <div className="ineligible-reason-box">
                                                            <div className="reason-label">
                                                                <TbAlertCircle className="reason-icon" />
                                                                <span>Condition Not Met</span>
                                                            </div>
                                                            <p className="reason-text">
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
                            <div className="eligibility-section" key="OTHER">
                                <div className="section-head">
                                    <div className="head-title-wrap">
                                        <span className="head-icon"><TbCircleCheck /></span>
                                        <h3 className="head-title">Other Services</h3>
                                    </div>
                                    <span className="head-count">
                                        {servicesByHead.OTHER.length} {servicesByHead.OTHER.length === 1 ? 'Service' : 'Services'}
                                    </span>
                                </div>

                                <div className="service-list">
                                    {servicesByHead.OTHER.map((service, idx) => (
                                        <div
                                            className={`service-item-card ${service.isEligible ? 'eligible' : 'ineligible'}`}
                                            key={service.serviceId || idx}
                                        >
                                            <div className="card-main">
                                                <div className="card-left">
                                                    <div className={`status-badge-icon ${service.isEligible ? 'eligible' : 'ineligible'}`}>
                                                        {service.isEligible ? <TbCheck /> : <TbX />}
                                                    </div>
                                                    <div className="service-details">
                                                        <h4 className="service-name">
                                                            {service.serviceName || toStandardText(service.mode || 'Service')}
                                                        </h4>
                                                        <div className="service-meta-row">
                                                            {service.serviceId && (
                                                                <span className="meta-tag">
                                                                    Service ID: <strong>{service.serviceId}</strong>
                                                                </span>
                                                            )}
                                                            {service.category && (
                                                                <span className="meta-tag">
                                                                    Category: <strong>{service.category}</strong>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-right">
                                                    <Badge
                                                        value={service.isEligible ? 'Eligible' : 'Not Eligible'}
                                                        severity={service.isEligible ? 'success' : 'danger'}
                                                    />
                                                </div>
                                            </div>

                                            {service.isEligible ? (
                                                <div className="eligible-status-message">
                                                    <TbCircleCheck className="msg-icon" />
                                                    <span>Eligible for service registration and processing</span>
                                                </div>
                                            ) : (
                                                <div className="ineligible-reason-box">
                                                    <div className="reason-label">
                                                        <TbAlertCircle className="reason-icon" />
                                                        <span>Condition Not Met</span>
                                                    </div>
                                                    <p className="reason-text">
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
        </div>
    );
};

export default Eligibility;