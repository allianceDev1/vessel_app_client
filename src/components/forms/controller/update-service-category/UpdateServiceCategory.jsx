import React, { useEffect, useState } from 'react'
import './style.scss'
import { useDispatch } from 'react-redux'
import { price_unit_objects } from '../../../../assets/javascript/pre_data/units';
import { TbCash, TbPlus, TbTrash, TbMoodAnnoyed } from 'react-icons/tb';
import { toast, modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../../api'
import { validateUpdatePackageServiceForm } from '../../../../utils/validators/package_form'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Select from '../../../UI_Primitives/inputs/Select';
import Radio from '../../../UI_Primitives/inputs/Radio';
import Button from '../../../UI_Primitives/buttons/Button';
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';



const UpdateServiceCategory = ({ serviceCategory, setData }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState('')
    const [vErr, setVErr] = useState({})
    const [packages, setPackages] = useState([])
    const [form, setForm] = useState({})
    const [serviceCharge, setServiceCharge] = useState({})
    const [error, setError] = useState({ error: false, title: null, message: null })

    const fetchApi = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })

            const packageRes = await api.vfCv2Axios.get(`/config/service-package/list?product_type=Vessel&fields=package_name`)
            setPackages(packageRes?.map(i => ({ label: i.package_name, value: i.package_id })))

        } catch (err) {
            setError({ error: true, title: 'Data fetching failed', message: err.message })
        } finally {
            setLoading('')
        }
    }

    const handleChangeForm = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleChangeServiceCard = (e) => {
        const value = e.target.value || null;

        if (value) {
            switch (e.target.name) {
                case 'materials_price_type':
                    setForm({ ...form, materials_access: true, materials_price_type: e.target.value })
                    break;
                case 'bag_price_type':
                    setForm({ ...form, bag_access: true, bag_price_type: e.target.value })
                    break;
                case 'primary_spare_price_type':
                    setForm({ ...form, primary_spare_access: true, primary_spare_price_type: e.target.value })
                    break;

                default:
                    break;
            }
        } else {
            switch (e.target.name) {
                case 'materials_price_type':
                    setForm({ ...form, materials_access: false, materials_price_type: null })
                    break;
                case 'bag_price_type':
                    setForm({ ...form, bag_access: false, bag_price_type: null })
                    break;
                case 'vessel_price_type':
                    setForm({ ...form, vessel_access: false, vessel_price_type: null })
                    break;
                case 'primary_spare_price_type':
                    setForm({ ...form, primary_spare_access: false, primary_spare_price_type: null })
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

        // Update data
        setLoading('submit')
        try {
            await api.vfCv2Axios.put(`/config/service-categories/${serviceCategory?.category_id}`, form)

            setData((state) => state.map((s) => {
                if (s.category_id === serviceCategory?.category_id) {
                    return {
                        ...s,
                        service_name: form?.service_name,
                        service_charges: form?.service_charges || [],
                        target_package: form?.target_package,
                        package_product_only: form?.package_product_only,
                        spare_policies: {
                            bag: {
                                access: form?.bag_access,
                                price_type: form?.bag_price_type
                            },
                            materials: {
                                access: form?.materials_access,
                                price_type: form?.materials_price_type
                            },
                            primary_spare: {
                                access: form?.primary_spare_access,
                                price_type: form?.primary_spare_price_type
                            }
                        },
                        service_charge_applied: form?.service_charge_applied,
                        extra_charge_applied: form?.extra_charge_applied
                    }
                }
                return s
            }))

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
        if (serviceCategory?.mode === "RENEWAL") {
            // Initial fetch
            fetchApi();
        }

        // Set Form
        setForm({
            service_name: serviceCategory?.service_name || null,
            package_product_only: serviceCategory?.package_product_only || false,
            target_package: serviceCategory?.target_package || null,
            bag_access: serviceCategory?.spare_policies?.bag?.access || false,
            primary_spare_access: serviceCategory?.spare_policies?.primary_spare?.access || false,
            materials_access: serviceCategory?.spare_policies?.materials?.access || false,
            bag_price_type: serviceCategory?.spare_policies?.bag?.price_type || null,
            primary_spare_price_type: serviceCategory?.spare_policies?.primary_spare?.price_type || null,
            materials_price_type: serviceCategory?.spare_policies?.materials?.price_type || null,
            service_charge_applied: serviceCategory?.service_charge_applied || false,
            extra_charge_applied: serviceCategory?.extra_charge_applied || false,
            service_charges: serviceCategory?.service_charges || []
        })

        //eslint-disable-next-line
    }, [serviceCategory])



    // Loading
    if (loading === 'fetch') {
        return <div className="update-pack-service-modal-load">
            <SkeletonGrid
                rows={8}
                columns={2}
                height={48}
            />
        </div>
    }

    // Error
    if (error?.error) {
        return <ErrorState
            hight='400px'
            title={error?.title}
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
                        {serviceCategory?.mode === "RENEWAL" &&
                            <Select label={'Package to be renewed'} name={'target_package'} options={[{}, ...packages]}
                                onChange={handleChangeForm} value={form.target_package} />}

                        <h3 className='sub-title'>Price types</h3>
                        <Select label={'Price of Materials'} name={'materials_price_type'} options={[{ label: 'No Rate', value: '' }, ...price_unit_objects]}
                            onChange={handleChangeServiceCard} value={form.materials_price_type} />
                        <Select label={'Price of Material bag'} name={'bag_price_type'} options={[{ label: 'No Rate', value: '' }, ...price_unit_objects]}
                            onChange={handleChangeServiceCard} value={form.bag_price_type} />
                        <Select label={'Price of Spares'} name={'primary_spare_price_type'} options={[{ label: 'No Rate', value: '' }, ...price_unit_objects]}
                            onChange={handleChangeServiceCard} value={form.primary_spare_price_type} />

                        <h4 className='radio-input-label'> Only for packages <span className={'required-span'}>*</span></h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <Radio label={'Yes'} name={'package_product_only'} required radioValue={true} onChange={handleChangeForm} checked={form?.package_product_only === true} />
                            <Radio label={'No'} name={'package_product_only'} radioValue={false} onChange={handleChangeForm} checked={form?.package_product_only === false} />
                        </div>
                    </div>
                    <div className="section">
                        <h4 className='radio-input-label'>Service charge applied <span className={'required-span'}>*</span></h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <Radio label={'Yes'} name={'service_charge_applied'} required radioValue={true} onChange={handleChangeForm} checked={form?.service_charge_applied === true} />
                            <Radio label={'No'} name={'service_charge_applied'} radioValue={false} onChange={handleChangeForm} checked={form?.service_charge_applied === false} />
                        </div>
                        <h4 className='radio-input-label'>Extra charge applied <span className={'required-span'}>*</span></h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <Radio label={'Yes'} name={'extra_charge_applied'} required radioValue={true} onChange={handleChangeForm} checked={form?.extra_charge_applied === true} />
                            <Radio label={'No'} name={'extra_charge_applied'} radioValue={false} onChange={handleChangeForm} checked={form?.extra_charge_applied === false} />
                        </div>


                        <h3 className='sub-title'>Default service charges <span className={'required-span'}>*</span></h3>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                            <InputText label={'Charge amount'} name='charge_amount' value={serviceCharge.charge_amount} onChange={handleServiceChargeChange}
                                error={vErr.service_charges} type='number' min={0} />
                            <InputText label={'Call count'} name='call_count' value={serviceCharge.call_count} onChange={handleServiceChargeChange} type='number' min={0} />
                            <Button icon={<TbPlus />} severity={'info'} type={'button'} onClick={handleServiceChargeAdd} disabled={loading === 'submit'} />
                        </div>
                        {form?.service_charges?.length > 0
                            ? <>
                                {form?.service_charges?.map((charge, index) => (
                                    <div key={charge?.charge_amount} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                        <InputText label={`Charge #${index + 1}`} value={charge.charge_amount} disabled />
                                        <InputText label={`Call`} value={charge.call_count} disabled />
                                        <Button icon={<TbTrash />} outlined severity={'danger'} type={'button'} onClick={() => handleRemoveCharge(charge.charge_amount)}
                                            disabled={loading === 'submit'} />
                                    </div>
                                ))}
                            </>
                            : <EmptyState icon={<TbCash />} description={'Add default service charges'} />}

                    </div>
                </div>
                <p className='description'>
                    The target package (Renewal) and service charges can be updated within this service category
                    form; however, changes to these values are not available or supported in the package services
                    view. All other package service inputs remain editable as usual.
                </p>
                <div className="button-div">
                    <Button label={'Update'} severity={'primary'} rounded style={{ width: '100%' }} spinIcon={loading === 'submit'} />
                </div>
            </form>
        </div>
    )
}

export default UpdateServiceCategory