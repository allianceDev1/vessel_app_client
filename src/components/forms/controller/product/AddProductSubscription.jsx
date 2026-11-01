import React, { useState } from 'react';
import Select from '../../../UI_Primitives/inputs/Select';
import Button from '../../../UI_Primitives/buttons/Button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../api';
import { useDispatch } from 'react-redux';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import { toStandardText } from '../../../../utils/helpers/text-formatting';

const AddProductSubscription = ({ productId, productType }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [selectedPackageId, setSelectedPackageId] = useState('');
    const [loading, setLoading] = useState(false);

    const { data: packageList = [], isLoading, error } = useQuery({
        queryKey: ['config_service_package_list', productType],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/config/service-package/list?product_type=${productType}`);
            return res || [];
        },
        enabled: Boolean(productType),
        staleTime: 60_000
    });

    const activePackages = packageList.filter(p => p?.is_active !== false);

    const packageOptions = [
        { label: '', value: '' },
        ...activePackages.map(p => ({
            label: p?.package_name,
            value: p?.package_id
        }))
    ];

    const selectedPackage = activePackages.find(p => p?.package_id === selectedPackageId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPackageId) {
            return;
        }

        setLoading(true);
        try {
            const res = await api.vfCv2Axios.post('/package/create', {
                product_id: productId,
                package_id: selectedPackageId
            });

            // Refetch package history and product details
            queryClient.invalidateQueries({
                queryKey: ['product_service_package_history', productId]
            });
            queryClient.invalidateQueries({
                queryKey: ['controller_customer_product_info', productId]
            });

            dispatch(modal.pull.all());
            dispatch(toast.push({
                type: 'success',
                head: 'Subscription Created',
                message: res?.message || 'New subscription plan created successfully'
            }));
        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Creation Failed',
                message: error?.message || 'Failed to create subscription plan'
            }));
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '5px 0' }}>
                <SkeletonGrid rows={2} columns={1} height={'45px'} gap={'10px'} />
            </div>
        );
    }

    if (error) {
        return (
            <p style={{ color: 'var(--color-danger, #dc2626)', fontSize: '13px' }}>
                Failed to load subscription plans: {error?.message}
            </p>
        );
    }

    return (
        <div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '15px' }}>
                Select a subscription plan for this {toStandardText(productType) || 'product'} to apply to customer product.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Select
                    label={'Subscription Plan'}
                    name={'package_id'}
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    options={packageOptions}
                    required
                />

                {selectedPackage && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--surface-2, rgba(0, 0, 0, 0.03))',
                        border: '1px solid var(--border-default, #e5e7eb)',
                        fontSize: '13px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Plan:</span>
                            <span style={{ fontWeight: 600 }}>{selectedPackage?.package_name}</span>
                        </div>
                        {selectedPackage?.package_duration_months !== undefined && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Duration:</span>
                                <span style={{ fontWeight: 500 }}>{selectedPackage?.package_duration_months} Months</span>
                            </div>
                        )}
                        {selectedPackage?.number_of_services !== undefined && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Services:</span>
                                <span style={{ fontWeight: 500 }}>{selectedPackage?.number_of_services} Services</span>
                            </div>
                        )}
                        {selectedPackage?.tokens_count !== undefined && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Tokens:</span>
                                <span style={{ fontWeight: 500 }}>{selectedPackage?.tokens_count} Tokens</span>
                            </div>
                        )}
                    </div>
                )}

                {activePackages.length === 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--color-warning, #f59e0b)' }}>
                        No active subscription plans found for {toStandardText(productType)}.
                    </p>
                )}

                <Button
                    label={'Create Subscription'}
                    rounded
                    severity={'primary'}
                    spinIcon={loading}
                    disabled={loading || !selectedPackageId || activePackages.length === 0}
                    style={{ marginTop: '10px' }}
                />
            </form>
        </div>
    );
};

export default AddProductSubscription;
