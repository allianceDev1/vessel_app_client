import React, { useMemo, useState } from 'react'
import './vf-service-work-home.scss'
import { useDispatch, useSelector } from 'react-redux';
import Select from '../../../UI_Primitives/inputs/Select';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Button from '../../../UI_Primitives/buttons/Button';
import { isoToYYYYMMDD, normalizeDate } from '../../../../utils/helpers/date-helpers';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import { doDialog } from '../../../../redux/features/non_persisted/miniSystemSlice';

const AdServiceWorkHome = ({ category, setWorkMenu, product, changeSubmitStatus }) => {
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [form, setForm] = useState({ estimate: 0, applied: 0, call: 0, remark: null })
    const [menuMeta, setMenuMeta] = useState({ materials: 0, bags: 0, spares: 0, services: 0 })


    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]

        setForm({
            estimate: current?.service_data?.service_charge?.estimate,
            applied: current?.service_data?.service_charge?.applied,
            call: current?.service_data?.service_charge?.call,
            remark: current?.service_data?.service_charge?.remark
        })

        setMenuMeta({
            spares: current?.work?.components_list?.filter(s => s.spare_type === 'spares')?.length,
            services: current?.work?.services_list?.length
        })

        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const clickComponentsMenu = (id) => {
        setWorkMenu({ type: 'components', id })
    }

    const clickServicesMenu = () => {
        setWorkMenu({ type: 'services' })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const updateData = {
            service_data: {
                service_charge: {
                    ...(productInForm?.service_data?.service_charge || {}),
                    estimate: form?.estimate || 0,
                    applied: form?.applied || 0,
                    call: form?.call || 0,
                    remark: form?.remark || ''
                }
            }
        }

        dispatch(sfActions.updateProduct(updateData))

        // If choose any work or components , then show the warming alert
        if (!menuMeta?.spares && !menuMeta?.services) {
            dispatch(doDialog.confirm({
                message: 'You have not selected any work or components, Are you sure to continue without work or components?',
                accept: {
                    onClick: () => {
                        dispatch(sfSetting.setActiveSubPage(202))
                    }
                }
            }))

            return;
        }

        dispatch(sfSetting.setActiveSubPage(202))
    }

    const handelChange = (e) => {

        if (e.target.name === 'service_charge') {
            const chargeDetail = category?.service_charges?.filter(c => c.charge_amount === Number(e.target.value))?.[0]

            const isWarrantyProduct = product?.product?.wr_expire_date &&
                normalizeDate(new Date(product?.product?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

            setForm({
                estimate: chargeDetail?.charge_amount || 0,
                applied: isWarrantyProduct ? 0 : chargeDetail?.charge_amount,
                call: chargeDetail?.call_count || 0,
                remark: ''
            })

            return;
        }

        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleChangeServiceData = (e) => {

        changeSubmitStatus(false)

        const updateData = {
            service_data: {
                next_service_date: e.target.value || null
            }
        }

        dispatch(sfActions.updateProduct(updateData))

    }

    const resetWorkCategory = () => {
        const resetAction = () => {
            dispatch(sfActions.resetService({ product_id: serviceFormSettings?.activeProduct?.[0] }))
        }

        dispatch(doDialog.confirm({
            message: 'Are you sure to reset work category?',
            accept: { onClick: () => resetAction() }
        }))
    }

    return (
        <div className="sf-sub-vf-service-work-home">
            <div className="menus">

                <div className={`menu-item ${menuMeta?.spares ? 'item-selected' : ''} ${!category?.spare_policies?.primary_spare?.access ? 'item-disable' : ''}`}
                    onClick={() => category?.spare_policies?.primary_spare?.access ? clickComponentsMenu('spares') : null}>
                    <h3>Spares</h3>
                    <p>{menuMeta?.spares ? `${menuMeta?.spares} items selected` : !category?.spare_policies?.primary_spare?.access ? "No access" : "Choose component items"}</p>
                </div>

                <div className={`menu-item ${menuMeta?.services ? 'item-selected' : ''} ${!category?.service_policy?.access ? 'item-disable' : ''}`}
                    onClick={() => category?.service_policy?.access ? clickServicesMenu() : null} >
                    <h3>Services</h3>
                    <p>{menuMeta?.services ? `${menuMeta?.services} items selected` : !category?.service_policy?.access ? "No access" : "Choose service works"}</p>
                </div>

            </div>

            <form action="" onSubmit={handleSubmit}>
                {/* Service charge */}
                <h4>Service Charge</h4>
                <Select label={'Service Charge'} name={'service_charge'} value={form?.estimate}
                    options={[{}, ...category?.service_charges?.map(s => ({ label: s?.charge_amount, value: s?.charge_amount }))]}
                    onChange={handelChange} required />

                {category?.service_charges?.[0]?.charge_amount !== form?.estimate &&
                    <InputText label={'Extra Charge Reason'} name={'remark'} value={form?.remark} onChange={handelChange} required />}


                {/* Assign Visit Date */}
                <h4 style={{ marginTop: '20px' }}>Assign Visit Date</h4>
                <InputText label={'Next Visit Date'} type={'date'} name={'service_date'} value={productInForm?.service_data?.next_service_date}
                    onChange={handleChangeServiceData} helperText={'Set the next visit date if you want to schedule the next service.'}
                    min={isoToYYYYMMDD(new Date())} />

                <div className="buttons">
                    <Button type='button' label={'Reset Work'} rounded severity={'danger'} onClick={resetWorkCategory} />
                    <Button label={'Next'} rounded />
                </div>
            </form>

        </div>
    )
}

export default AdServiceWorkHome