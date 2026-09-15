import React, { useEffect, useState } from 'react'
import './style.scss'
import { useDispatch } from 'react-redux'
import { price_unit_objects } from '../../../../assets/javascript/pre_data/units';
import { TbPlus, TbTrash, TbMoodAnnoyed } from 'react-icons/tb';
import { toast, modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../../api'
import { validateUpdatePackageServiceForm } from '../../../../utils/validators/package_form'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import InputText from '../../../UI_Primitives/inputs/InputText';
import MultiSelect from '../../../UI_Primitives/inputs/MultiSelect';
import Select from '../../../UI_Primitives/inputs/Select';
import Radio from '../../../UI_Primitives/inputs/Radio';
import Button from '../../../UI_Primitives/buttons/Button';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parentProductTypes, productTypes } from '../../../../assets/javascript/pre_data/product';
import { toStandardText } from '../../../../utils/helpers/text-formatting';
import { work_modes } from '../../../../assets/javascript/pre_data/package';



const CreateUpdateServiceCategory = ({ action = 'CREATE', data }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState('')
    const [vErr, setVErr] = useState({})
    const [form, setForm] = useState({})
    const [serviceCharge, setServiceCharge] = useState({})
    const queryClient = useQueryClient();


    const { data: resources, isLoading, error } = useQuery({
        queryKey: ['cn', 'service_category_resources'],
        queryFn: async () => {
            const packageRes = await api.vfCv2Axios.get(`/config/service-package/list?fields=fields=package_id,package_name,product_type,is_active&hidden=Yes`)
            const rulesRes = await api.vfCv2Axios.get(`/config/eligibility-rules`)

            return {
                packages: packageRes,
                eligibility_rules: rulesRes?.filter(i => i.enabled)
            }
        },
        staleTime: 60_000
    })

    const handleChangeForm = (e) => {

        if (e.target.name === 'mode' || e.target.name === 'product_type') {
            setForm({ ...form, [e.target.name]: e.target.value, target_package: '' })
            return;
        }

        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleMultiInputChange = (e) => {
        setForm({
            ...form,
            [e.name]: e.selectedValues?.map((c) => c.value) || []
        })
    }

    const handleChangePositionValue = (e) => {
        const value = e.target.value || null;

        if (value) {
            switch (e.target.name) {
                case 'current_spare_parts_price_type':
                    setForm({ ...form, current_spare_parts_access: true, current_spare_parts_price_type: e.target.value })
                    break;
                case 'current_service_work_price_type':
                    setForm({ ...form, current_service_work_access: true, current_service_work_price_type: e.target.value })
                    break;
                case 'target_spare_parts_price_type':
                    setForm({ ...form, target_spare_parts_access: true, target_spare_parts_price_type: e.target.value })
                    break;
                case 'target_service_work_price_type':
                    setForm({ ...form, target_service_work_access: true, target_service_work_price_type: e.target.value })
                    break;

                default:
                    break;
            }
        } else {
            switch (e.target.name) {
                case 'current_spare_parts_price_type':
                    setForm({ ...form, current_spare_parts_access: false, current_spare_parts_price_type: null })
                    break;
                case 'current_service_work_price_type':
                    setForm({ ...form, current_service_work_access: false, current_service_work_price_type: null })
                    break;
                case 'target_spare_parts_price_type':
                    setForm({ ...form, target_spare_parts_access: false, target_spare_parts_price_type: null })
                    break;
                case 'target_service_work_price_type':
                    setForm({ ...form, target_service_work_access: false, target_service_work_price_type: null })
                    break;

                default:
                    break;
            }
        }
    }

    const handleServiceChargeChange = (e) => {
        setServiceCharge({ ...serviceCharge, [e.target.name]: e.target.value })
    }

    const handleServiceChargeAdd = () => {
        // Validation
        if (!serviceCharge?.charge_amount || !serviceCharge?.call_count) {
            dispatch(toast.push({
                type: 'danger',
                message: 'Please fill the charge amount and call count'
            }))
            return;
        }


        if (form?.service_charges?.map((c) => c.charge_amount).includes(Number(serviceCharge?.charge_amount))) {
            dispatch(toast.push({
                type: 'danger',
                message: 'The service charge existed.'
            }))
            return;
        }

        setForm({ ...form, service_charges: [...(form?.service_charges || []), serviceCharge] })
        setServiceCharge({})
    }

    const handleRemoveCharge = (chargeAmount) => {
        setForm({ ...form, service_charges: form?.service_charges?.filter((c) => Number(c.charge_amount) !== Number(chargeAmount)) })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        const validation = validateUpdatePackageServiceForm(form)
        if (!validation.isValid) {
            setVErr(validation.errors)
            return
        }

        // submit
        setLoading('submit')
        try {

            const body = {
                service_name: form?.service_name,
                target_package: form?.target_package || null,
                package_product_only: form?.package_product_only || false,
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
                service_charge_applied: form?.service_charge_applied || false,
                service_charges: form?.service_charges || [],
                eligibility_rules: form?.eligibility_rules || []
            }

            if (form?.mode === 'RENEWAL') {
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
                )
            }

            if (action === 'CREATE') {
                body.product_type = form?.product_type
                body.mode = form?.mode

                await api.vfCv2Axios.post(`/config/service-category`, body)

                queryClient.refetchQueries({
                    queryKey: ['cn', 'service_category_list', form?.product_type],
                });

            } else if (action === 'UPDATE') {

                await api.vfCv2Axios.put(`/config/service-categories/${data?.category_id}`, body)

                queryClient.refetchQueries({
                    queryKey: ['cn', 'service_category', data?.category_id],
                });

                dispatch(toast.push({
                    type: 'success',
                    head: "Category updated",
                    message: 'Service category updated.'
                }))
            }

            dispatch(modal.pull.all())
        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: "Form validation failed",
                message: error.message
            }))
        } finally {
            setLoading('')
        }

    }



    useEffect(() => {

        // Set Form
        if (action === 'UPDATE') {

            const currentSpareParts = data?.coverage?.find(i => i?.coverage_id === 'SPARE_PARTS' && i?.position === 'CURRENT')
            const currentServiceWork = data?.coverage?.find(i => i?.coverage_id === 'SERVICE_WORK' && i?.position === 'CURRENT')
            const targetSpareParts = data?.coverage?.find(i => i?.coverage_id === 'SPARE_PARTS' && i?.position === 'TARGET')
            const targetServiceWork = data?.coverage?.find(i => i?.coverage_id === 'SERVICE_WORK' && i?.position === 'TARGET')

            setForm({
                mode: data?.mode,
                product_type: data?.product_type,
                service_name: data?.service_name || null,
                eligibility_rules: data?.rules?.map(r => r?.uuid) || [],
                service_charge_applied: data?.service_charge_applied || false,
                package_product_only: data?.package_product_only || false,
                target_package: data?.target_package || null,
                current_spare_parts_access: currentSpareParts?.access || false,
                current_spare_parts_price_type: currentSpareParts?.price_type || null,
                current_service_work_access: currentServiceWork?.access || false,
                current_service_work_price_type: currentServiceWork?.price_type || null,
                target_spare_parts_access: targetSpareParts?.access || false,
                target_spare_parts_price_type: targetSpareParts?.price_type || null,
                target_service_work_access: targetServiceWork?.access || false,
                target_service_work_price_type: targetServiceWork?.price_type || null,
                service_charges: data?.service_charges || []
            })
        }

        //eslint-disable-next-line
    }, [data])



    // Loading
    if (isLoading) {
        return <div className="update-pack-service-modal-load">
            <SkeletonGrid
                rows={8}
                columns={2}
                height={48}
            />
        </div>
    }

    // Error
    if (error) {
        return <ErrorState
            hight='400px'
            title={'Data fetching failed!'}
            message={error?.message}
            icon={<TbMoodAnnoyed />}
        />
    }

    return (
        <div className="update-service-category-modal">
            <form action="" onSubmit={handleSubmit} >
                <div className="inputs">

                    <div className="section">
                        <InputText label={'Service name'} name='service_name' value={form.service_name} onChange={handleChangeForm} required error={vErr.service_name} />
                        {action === 'CREATE' && <>
                            <Select label={'Product type'} name={'product_type'} options={[{}, ...productTypes?.map((a) => ({ label: toStandardText(a), value: a }))]}
                                required onChange={handleChangeForm} value={form.product_type} />
                            <Select label={'Mode'} name={'mode'} options={[{}, ...work_modes?.map((a) => ({ label: toStandardText(a), value: a }))]} required
                                onChange={handleChangeForm} value={form.mode} />
                        </>}

                        {form?.mode === "RENEWAL" &&
                            <Select label={'Package to be renewed'} name={'target_package'} onChange={handleChangeForm} value={form.target_package} required
                                options={[{}, ...resources?.packages?.filter(p => p?.product_type === form?.product_type)?.map(p => ({ label: p?.package_name, value: p?.package_id }))]}
                            />}

                        <MultiSelect label={'Eligibility rules'} name={'eligibility_rules'}
                            onChange={handleMultiInputChange}
                            options={resources?.eligibility_rules?.map(r => ({ label: r?.rule_name, value: r?.uuid }))}
                            selected={resources?.eligibility_rules.filter(item => form?.eligibility_rules?.includes(item.uuid))?.map(r => ({ label: r?.rule_name, value: r?.uuid }))}
                        />
                    </div>
                    <div className="section" style={{ marginTop: '20px' }}>
                        <div>
                            <h4 className='radio-input-label'>Service charge applied <span className={'required-span'}>*</span></h4>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                <Radio label={'Yes'} name={'service_charge_applied'} required radioValue={true} onChange={handleChangeForm} checked={form?.service_charge_applied === true} />
                                <Radio label={'No'} name={'service_charge_applied'} radioValue={false} onChange={handleChangeForm} checked={form?.service_charge_applied === false} />
                            </div>
                        </div>
                        <div>
                            <h4 className='radio-input-label'> Only for packages <span className={'required-span'}>*</span></h4>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                <Radio label={'Yes'} name={'package_product_only'} required radioValue={true} onChange={handleChangeForm} checked={form?.package_product_only === true} />
                                <Radio label={'No'} name={'package_product_only'} radioValue={false} onChange={handleChangeForm} checked={form?.package_product_only === false} />
                            </div>
                        </div>
                    </div>

                    <h3 className='sub-title'>Current position price types</h3>
                    <div className="section">
                        <Select label={'Price of Spares'} name={'current_spare_parts_price_type'} options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                            onChange={handleChangePositionValue} value={form.current_spare_parts_price_type || '_NO'} />
                        <Select label={'Price of service work'} name={'current_service_work_price_type'} options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                            onChange={handleChangePositionValue} value={form.current_service_work_price_type || '_NO'} />
                    </div>

                    {form?.mode === 'RENEWAL' && <>
                        <h3 className='sub-title'>Target position price types</h3>
                        <div className="section">
                            <Select label={'Price of Spares'} name={'target_spare_parts_price_type'} options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                onChange={handleChangePositionValue} value={form.target_spare_parts_price_type || '_NO'} />
                            <Select label={'Price of service work'} name={'target_service_work_price_type'} options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                onChange={handleChangePositionValue} value={form.target_service_work_price_type || '_NO'} />
                        </div>
                    </>}

                    <h3 className='sub-title'>Default service charges <span className={'required-span'}>*</span></h3>
                    <div className="">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                            <InputText label={'Charge amount'} name='charge_amount' value={serviceCharge.charge_amount} onChange={handleServiceChargeChange}
                                error={vErr.service_charges} type='number' min={0} />
                            <InputText label={'Call count'} name='call_count' value={serviceCharge.call_count} onChange={handleServiceChargeChange} type='number' min={0} />
                            <Button icon={<TbPlus />} severity={'info'} type={'button'} onClick={handleServiceChargeAdd} disabled={loading === 'submit'} />
                        </div>
                        {form?.service_charges?.length > 0
                            ? <>
                                {form?.service_charges?.map((charge, index) => (
                                    <div key={charge?.charge_amount} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                                        <InputText label={`Charge #${index + 1}`} value={charge.charge_amount} disabled />
                                        <InputText label={`Call`} value={charge.call_count} disabled />
                                        <Button icon={<TbTrash />} outlined severity={'danger'} type={'button'} onClick={() => handleRemoveCharge(charge.charge_amount)}
                                            disabled={loading === 'submit'} />
                                    </div>
                                ))}
                            </>
                            : ""}
                    </div>
                </div>
                <p className='description'>
                    The Package to be Renewed and Service Charges fields can only be updated within the Service Category form.
                    All other Package Service fields remain editable as usual through the Package Service form.
                </p>
                <div className="button-div">
                    <Button label={action === 'CREATE' ? "Create category" : 'Update category'} severity={'primary'} rounded style={{ width: '100%' }} spinIcon={loading === 'submit'} />
                </div>
            </form>
        </div>
    )
}

export default CreateUpdateServiceCategory