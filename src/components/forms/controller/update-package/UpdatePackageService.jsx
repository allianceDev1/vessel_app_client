import React, { useEffect, useState } from 'react'
import './style.scss'
import { useDispatch } from 'react-redux'
import { price_unit_objects } from '../../../../assets/javascript/pre_data/units';
import { toast, modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../../api'

import InputText from '../../../UI_Primitives/inputs/InputText';
import Select from '../../../UI_Primitives/inputs/Select';
import Radio from '../../../UI_Primitives/inputs/Radio';
import Button from '../../../UI_Primitives/buttons/Button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';

const UpdatePackageService = ({ packageId, serviceData, onSuccess }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState('');
    const [form, setForm] = useState({});

    const { data: eligibilityRules = [], isLoading: isLoadingRules } = useQuery({
        queryKey: ['cn', 'eligibility_rules_active'],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get('/config/eligibility-rules');
            return res?.filter(i => i.enabled) || [];
        },
        staleTime: 60_000
    });

    useEffect(() => {
        if (!serviceData) return;

        let coverageList = [];
        if (Array.isArray(serviceData?.coverage)) {
            coverageList = serviceData.coverage;
        } else if (serviceData?.coverage && typeof serviceData.coverage === 'object') {
            coverageList = Object.entries(serviceData.coverage).map(([key, val]) => ({
                coverage_id: key,
                position: val?.position || 'CURRENT',
                access: val?.access ?? true,
                price_type: val?.price_type || null
            }));
        }

        const currentSpareParts = coverageList.find(i => (i?.coverage_id === 'SPARE_PARTS' || i?.coverage_id === 'PRIMARY_SPARES') && (i?.position === 'CURRENT' || !i?.position));
        const currentServiceWork = coverageList.find(i => (i?.coverage_id === 'SERVICE_WORK' || i?.coverage_id === 'SERVICE') && (i?.position === 'CURRENT' || !i?.position));
        const targetSpareParts = coverageList.find(i => (i?.coverage_id === 'SPARE_PARTS' || i?.coverage_id === 'PRIMARY_SPARES') && i?.position === 'TARGET');
        const targetServiceWork = coverageList.find(i => (i?.coverage_id === 'SERVICE_WORK' || i?.coverage_id === 'SERVICE') && i?.position === 'TARGET');

        const ruleIds = Array.isArray(serviceData?.eligibility_rules)
            ? serviceData.eligibility_rules.map(r => typeof r === 'string' ? r : (r?.uuid || r?.id || r?.rule_uuid))
            : (Array.isArray(serviceData?.rules) ? serviceData.rules.map(r => typeof r === 'string' ? r : (r?.uuid || r?.id || r?.rule_uuid)) : []);

        setForm({
            mode: serviceData?.mode,
            service_limit: serviceData?.service_limit ?? 0,
            service_charge_applied: serviceData?.service_charge_applied ?? false,
            current_spare_parts_access: currentSpareParts?.access || false,
            current_spare_parts_price_type: currentSpareParts?.price_type || null,
            current_service_work_access: currentServiceWork?.access || false,
            current_service_work_price_type: currentServiceWork?.price_type || null,
            target_spare_parts_access: targetSpareParts?.access || false,
            target_spare_parts_price_type: targetSpareParts?.price_type || null,
            target_service_work_access: targetServiceWork?.access || false,
            target_service_work_price_type: targetServiceWork?.price_type || null,
            eligibility_rules: ruleIds
        });
    }, [serviceData]);

    const handleChangeForm = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleMultiInputChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.name]: e.selectedValues?.map((c) => c.value) || []
        }));
    };

    const handleChangePositionValue = (e) => {
        const value = e.target.value || null;
        if (value) {
            switch (e.target.name) {
                case 'current_spare_parts_price_type':
                    setForm(prev => ({ ...prev, current_spare_parts_access: true, current_spare_parts_price_type: value }));
                    break;
                case 'current_service_work_price_type':
                    setForm(prev => ({ ...prev, current_service_work_access: true, current_service_work_price_type: value }));
                    break;
                case 'target_spare_parts_price_type':
                    setForm(prev => ({ ...prev, target_spare_parts_access: true, target_spare_parts_price_type: value }));
                    break;
                case 'target_service_work_price_type':
                    setForm(prev => ({ ...prev, target_service_work_access: true, target_service_work_price_type: value }));
                    break;
                default:
                    break;
            }
        } else {
            switch (e.target.name) {
                case 'current_spare_parts_price_type':
                    setForm(prev => ({ ...prev, current_spare_parts_access: false, current_spare_parts_price_type: null }));
                    break;
                case 'current_service_work_price_type':
                    setForm(prev => ({ ...prev, current_service_work_access: false, current_service_work_price_type: null }));
                    break;
                case 'target_spare_parts_price_type':
                    setForm(prev => ({ ...prev, target_spare_parts_access: false, target_spare_parts_price_type: null }));
                    break;
                case 'target_service_work_price_type':
                    setForm(prev => ({ ...prev, target_service_work_access: false, target_service_work_price_type: null }));
                    break;
                default:
                    break;
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading('submit');

        try {
            const body = {
                coverage: [
                    {
                        coverage_id: "SPARE_PARTS",
                        position: "CURRENT",
                        access: form?.current_spare_parts_access || false,
                        price_type: form?.current_spare_parts_price_type || null
                    },
                    {
                        coverage_id: "SERVICE_WORK",
                        position: "CURRENT",
                        access: form?.current_service_work_access || false,
                        price_type: form?.current_service_work_price_type || null
                    }
                ],
                service_limit: Number(form?.service_limit || 0),
                service_charge_applied: form?.service_charge_applied === true || form?.service_charge_applied === 'true',
                eligibility_rules: form?.eligibility_rules || []
            };

            if (form?.mode === 'RENEWAL' || serviceData?.mode === 'RENEWAL') {
                body.coverage.push(
                    {
                        coverage_id: "SPARE_PARTS",
                        position: "TARGET",
                        access: form?.target_spare_parts_access || false,
                        price_type: form?.target_spare_parts_price_type || null
                    },
                    {
                        coverage_id: "SERVICE_WORK",
                        position: "TARGET",
                        access: form?.target_service_work_access || false,
                        price_type: form?.target_service_work_price_type || null
                    }
                );
            }

            const targetServiceId = serviceData?.service_id;
            await api.vfCv2Axios.put(`/config/service-package/${packageId}/${targetServiceId}`, body);

            await Promise.all([
                queryClient.refetchQueries({
                    queryKey: ['cn', 'package_service_category', packageId, targetServiceId]
                }),
                queryClient.refetchQueries({
                    queryKey: ['cn', 'service_package', packageId]
                })
            ]);

            dispatch(toast.push({
                type: 'success',
                head: 'Success',
                message: 'Package service category updated successfully'
            }));

            if (onSuccess) onSuccess();
            dispatch(modal.pull.all());
        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: "Form update failed",
                message: error.message
            }));
        } finally {
            setLoading('');
        }
    };

    if (isLoadingRules) {
        return (
            <div className="update-pack-service-modal">
                <SkeletonGrid rows={6} columns={1} height={48} />
            </div>
        );
    }

    return (
        <div className="update-pack-service-modal">
            <form onSubmit={handleSubmit}>
                <div className="inputs">
                    <div className="section">
                        <InputText
                            label={'Service limit'}
                            name='service_limit'
                            type='number'
                            value={form.service_limit}
                            onChange={handleChangeForm}
                            required
                            min={0}
                            helperText={'Enter the service limit. Set 0 for unlimited services.'}
                        />

                        <MultiSelectInput
                            label={'Eligibility rules'}
                            name={'eligibility_rules'}
                            onChange={handleMultiInputChange}
                            options={eligibilityRules.map(r => ({ label: r?.rule_name || r?.name, value: r?.uuid }))}
                            selected={eligibilityRules
                                .filter(item => form?.eligibility_rules?.includes(item.uuid))
                                .map(r => ({ label: r?.rule_name || r?.name, value: r?.uuid }))}
                        />

                        <h4 className='radio-input-label'>Service charge applied <span className={'required-span'}>*</span></h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <Radio
                                label={'Yes'}
                                name={'service_charge_applied'}
                                required
                                radioValue={true}
                                onChange={() => setForm(prev => ({ ...prev, service_charge_applied: true }))}
                                checked={form?.service_charge_applied === true}
                            />
                            <Radio
                                label={'No'}
                                name={'service_charge_applied'}
                                radioValue={false}
                                onChange={() => setForm(prev => ({ ...prev, service_charge_applied: false }))}
                                checked={form?.service_charge_applied === false}
                            />
                        </div>

                        <h3 className='sub-title'>Current position price types</h3>
                        <div className="section" style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", gap: '10px' }}>
                            <Select
                                label={'Price of Spares'}
                                name={'current_spare_parts_price_type'}
                                options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                onChange={handleChangePositionValue}
                                value={form.current_spare_parts_price_type || ''}
                            />
                            <Select
                                label={'Price of service work'}
                                name={'current_service_work_price_type'}
                                options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                onChange={handleChangePositionValue}
                                value={form.current_service_work_price_type || ''}
                            />
                        </div>

                        {(form?.mode === 'RENEWAL' || serviceData?.mode === 'RENEWAL') && (
                            <>
                                <h3 className='sub-title'>Target position price types</h3>
                                <div className="section" style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", gap: '10px' }}>
                                    <Select
                                        label={'Price of Spares'}
                                        name={'target_spare_parts_price_type'}
                                        options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                        onChange={handleChangePositionValue}
                                        value={form.target_spare_parts_price_type || ''}
                                    />
                                    <Select
                                        label={'Price of service work'}
                                        name={'target_service_work_price_type'}
                                        options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                        onChange={handleChangePositionValue}
                                        value={form.target_service_work_price_type || ''}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="button-div" style={{ marginTop: '20px' }}>
                    <Button
                        label={'Update Service'}
                        severity={'primary'}
                        rounded
                        style={{ width: '100%' }}
                        spinIcon={loading === 'submit'}
                    />
                </div>
            </form>
        </div>
    );
};

export default UpdatePackageService;