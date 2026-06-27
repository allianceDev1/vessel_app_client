import React, { useState } from 'react'
import './style.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Select from '../../../UI_Primitives/inputs/Select'
import { originCategories, vesselProductTypes } from '../../../../assets/javascript/pre_data/product'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbAlertCircle } from 'react-icons/tb'
import Checkbox from '../../../UI_Primitives/inputs/Checkbox'
import Button from '../../../UI_Primitives/buttons/Button'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'

const AddCustomerProduct = ({ customerId }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        customer_id: customerId || ''
    })

    const { data: installationModes, isLoading: resourcesLoading, error: resourcesError } = useQuery({
        queryKey: ['installation_modes'],
        queryFn: async () => {
            let result = await api.vfCv2Axios.get('/resources/form-resources?titles=installation_mode')

            return result?.[0]?.values || []
        },
        staleTime: 60_000
    })

    const handleChange = (e) => {

        let value = e.target.value

        // convert to capital
        if (['sku', 'order_id', 'eq_form_srl_no'].includes(e.target.name)) {
            value = String(value).toUpperCase()
        }

        setForm({
            ...form,
            [e.target.name]: value
        })
    }

    const handleChangeWarranty = (e) => {
        if (form?.product_warranty) {
            setForm({
                ...form,
                [e.target.name]: false,
                product_warranty_start_date: '',
                product_warranty_period: ''
            })
        } else {
            setForm({
                ...form,
                [e.target.name]: true
            })
        }
    }

    const handelSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)

        const body = {
            customer_id: form?.customer_id,
            origin_category: form?.origin_category,
            product_type: form?.product_type,
            parent_type: 'VESSEL_FILTER',
            sku: form?.sku,
            order_id: form?.order_id || null,
            installation_mode: form?.installation_mode,
            product_warranty_start_date: form?.product_warranty ? form?.product_warranty_start_date : null,
            product_warranty_period: form?.product_warranty ? form?.product_warranty_period : 0,
            specifications: [],
            installation_date: form?.installation_date || null,
            eq_form_srl_no: form?.eq_form_srl_no || null
        }

        if (form?.v_free_spare) {
            body.specifications.push({ specification_id: 'VESSEl_FREE_SPACE', value: form?.v_free_spare })
        }

        if (form?.v_fitting_size) {
            body.specifications.push({ specification_id: 'FITTINGS_SIZE', value: form?.v_fitting_size })
        }

        try {
            await api.cnAv1Axios.post('/customer/product', body)

            dispatch(toast.push({
                type: "success",
                head: "New product added to customer"
            }))

            dispatch(modal.pull.all())
        } catch (error) {

            dispatch(toast.push({
                type: "danger",
                head: "Product Adding Failed",
                message: error?.message || "Something Wrong"
            }))

        } finally {
            setLoading(false)
        }


    }

    if (resourcesLoading) {
        return <div style={{ marginTop: '20px' }}>
            <SkeletonGrid rows={6} columns={2} height={'60px'} gap={'10px'}
                responsive={{
                    sm: { rows: 10, columns: 1 }
                }} />
        </div>
    }

    if (resourcesError) {
        return <div style={{ marginTop: '20px' }}>
            <ErrorState
                icon={<TbAlertCircle />}
                hight='300px'
                title={'Data Fetching Failed'}
                message={resourcesError?.message}
            />
        </div>
    }

    return (
        <div className="add-customer-product-comp-container">
            <form action="" onSubmit={handelSubmit}>
                <div className="input-group">
                    <InputText label={'Customer Id'} name={'customer_id'} value={form?.customer_id || ''} onChange={handleChange} type={'number'} required
                        disabled={customerId} />

                    <Select label={'Origin Category'} name={'origin_category'} required value={form?.origin_category || ''} onChange={handleChange}
                        options={[{ label: '', value: '' }, ...originCategories?.map(i => ({ label: toStandardText(i), value: i }))]} />

                    <Select label={'Product Type'} name={'product_type'} required value={form?.product_type || ''} onChange={handleChange}
                        options={[{ label: '', value: '' }, ...vesselProductTypes?.map(i => ({ label: toStandardText(i), value: i }))]} />

                    <Select label={'Installation Mode'} name={'installation_mode'} required value={form?.installation_mode || ''} onChange={handleChange}
                        options={[{ label: '', value: '' }, ...(installationModes || [])?.map(i => ({ label: i?.data?.[0], value: i?.uuid }))]} />

                    <InputText label={'Model Id / SKU'} name={'sku'} value={form?.sku || ''} onChange={handleChange} required />

                    {form?.product_type !== 'ADD_ON' &&
                        <InputText label={'Order Id'} name={'order_id'} value={form?.order_id || ''} onChange={handleChange} required />}
                </div>

                <div className='input-checkbox'>
                    <Checkbox label={'Include product warranty'} name={'product_warranty'} onChange={handleChangeWarranty} checked={form?.product_warranty} />
                </div>

                {form?.product_warranty &&
                    <div className="input-group">
                        <InputText label={'Warranty Start Date'} name={'product_warranty_start_date'} value={form?.product_warranty_start_date || ''} onChange={handleChange} required
                            type='date' />

                        <InputText label={'Warranty Period (Months)'} name={'product_warranty_period'} value={form?.product_warranty_period || ''} onChange={handleChange} required
                            type='number' />
                    </div>}

                <div className="input-group" style={{ margin: '10px 0' }}>
                    {form?.product_type !== 'ADD_ON' && <>
                        <InputText label={'Vessel Free Spare'} name={'v_free_spare'} value={form?.v_free_spare || ''} onChange={handleChange} type={'number'} />

                        <InputText label={'Fitting Size'} name={'v_fitting_size'} value={form?.v_fitting_size || ''} onChange={handleChange} type={'number'} />
                    </>}

                    <InputText label={'Installation Date'} name={'installation_date'} value={form?.installation_date || ''} onChange={handleChange} type='date' />

                    <InputText label={'Enquiry Srl Number'} name={'eq_form_srl_no'} value={form?.eq_form_srl_no || ''} onChange={handleChange} />
                </div>

                <Button label={'Create Product'} severity={'primary'} rounded style={{ width: '100%' }} spinIcon={loading}
                    disabled={loading} />
            </form>
        </div>
    )
}

export default AddCustomerProduct