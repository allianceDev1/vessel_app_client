import React, { useState } from 'react'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect'
import Button from '../../../UI_Primitives/buttons/Button'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../api'
import { originCategories, vesselProductTypes } from '../../../../assets/javascript/pre_data/product'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'

const FilterCustomerProduct = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        city_id: searchParams.get('city_id') || '',
        product_id: searchParams.get('product_id') || '',
        installation_mode: searchParams.get('installation_mode') || '',
        product_type: searchParams.get('product_type') || '',
        origin_category: searchParams.get('origin_category') || '',
        package_filter_type: searchParams.get('package_filter_type') || '',
        package_ids: searchParams.get('package_ids')?.split(',') || [],
        date_filtration_type: searchParams.get('date_filtration_type') || '',
        from_date: searchParams.get('from_date') || '',
        end_date: searchParams.get('end_date') || '',
    })

    const packageFilterTypes = ['CURRENT_PACKAGE', 'LAST_PACKAGE', "BLOCKED_PACKAGE"]
    const dateFiltrationTypes = [
        'INSTALLATION_DATE', 'NEXT_SERVICE_DATE', 'PACKAGE_START_DATE', 'PACKAGE_EXPIRE_DATE', 'RENT_START_DATE',
        'RENT_EXPIRE_DATE', 'LAST_VISIT_DATE', 'WARRANTY_START_DATE', 'WARRANTY_EXPIRE_DATE'
    ]

    const handleChange = (e) => {

        let value = e.target.value
        setForm({
            ...form,
            [e.target.name]: value
        })
    }

    const handleMultiInputChange = (e) => {
        setForm({ ...form, [e.name]: e.selectedValues?.map((c) => c.value) })
    }

    const { data: resourcesData,
        //  isLoading: resourcesLoading, error: resourcesError
    } = useQuery({
        queryKey: ['customer_filter_resources'],
        queryFn: async () => {

            const apis = [
                api.cnPv2Axios.get(`/l/location/city?area_type=service`),
                api.vfCv2Axios.get(`/resources/form-resources?titles=installation_mode`),
                api.vfCv2Axios.get(`/config/service-package/list?product_type=VESSEL_FILTER&fields=package_id,package_name`)
            ]

            const [cityRes, installationModeRes, packageRes] = await Promise.all(apis);

            const cityList = cityRes?.map(c => ({ label: c?.city_name, value: c?.city_id }))
            const modesList = installationModeRes?.[0]?.values?.map(v => ({ label: v?.data?.[0], value: v?.uuid }))
            const packageList = packageRes?.map(p => ({ label: p?.package_name, value: p?.package_id }))

            return { cityList, modesList, packageList };
        },
        staleTime: 30_000
    })


    const handleSubmit = (e) => {
        e.preventDefault();

        // validation
        if (!form.city_id && !form.product_id && !form.installation_mode && !form?.product_type && !form?.origin_category
            && !form?.package_ids?.length && !form?.from_date && !form?.end_date
        ) {
            return;
        }

        const newSearchParams = new URLSearchParams(searchParams)

        newSearchParams.set('fl', 'Yes')

        if (form?.city_id) {
            newSearchParams.set('city_id', form?.city_id)
        } else {
            newSearchParams.delete('city_id')
        }

        if (form?.product_id) {
            newSearchParams.set('product_id', form?.product_id)
        } else {
            newSearchParams.delete('product_id')
        }

        if (form?.installation_mode) {
            newSearchParams.set('installation_mode', form?.installation_mode)
        } else {
            newSearchParams.delete('installation_mode')
        }

        if (form?.product_type) {
            newSearchParams.set('product_type', form?.product_type)
        } else {
            newSearchParams.delete('product_type')
        }

        if (form?.origin_category) {
            newSearchParams.set('origin_category', form?.origin_category)
        } else {
            newSearchParams.delete('origin_category')
        }

        if (form?.package_ids?.length) {
            newSearchParams.set('package_ids', form?.package_ids?.join(','))
            newSearchParams.set('package_filter_type', form?.package_filter_type)
        } else {
            newSearchParams.delete('package_ids')
            newSearchParams.delete('package_filter_type')
        }

        if (form?.date_filtration_type) {
            newSearchParams.set('date_filtration_type', form?.date_filtration_type)
            newSearchParams.set('from_date', form?.from_date)
            newSearchParams.set('end_date', form?.end_date)
        } else {
            newSearchParams.delete('date_filtration_type')
            newSearchParams.delete('from_date')
            newSearchParams.delete('end_date')
        }

        navigate(`/controller/customers/filter?${newSearchParams.toString()}`)

        dispatch(modal.pull.all())

    }

    return (
        <div className="controller-customer-product-filter-comp-container">
            <form action="" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Select label={'City'} name={'city_id'} value={form?.city_id} options={[{}, ...(resourcesData?.cityList || [])]}
                    onChange={handleChange} />

                <InputText label={'Product ID'} name={'product_id'} value={form?.product_id} onChange={handleChange} />

                <Select label={'Installation Mode'} options={[{}, ...(resourcesData?.modesList || [])]} name={'installation_mode'}
                    value={form?.installation_mode} onChange={handleChange} />

                <Select label={'Product Type'} options={[{}, ...vesselProductTypes?.map(i => ({ label: toStandardText(i), value: i }))]}
                    name={'product_type'} value={form?.product_type} onChange={handleChange} />

                <Select label={'Product Origin'} options={[{}, ...originCategories?.map(i => ({ label: toStandardText(i), value: i }))]}
                    name={'origin_category'} value={form?.origin_category} onChange={handleChange} />

                {form?.product_type === 'VESSEL_FILTER' ? <>

                    <Select label={'Package Filter Type'} options={[{}, ...packageFilterTypes?.map(i => ({ label: toStandardText(i), value: i }))]}
                        name={'package_filter_type'} value={form?.package_filter_type} onChange={handleChange} required={form?.package_ids?.length ? true : false} />

                    <MultiSelectInput label={'Packages'} options={resourcesData?.packageList} name={'package_ids'} onChange={handleMultiInputChange}
                        selected={resourcesData?.packageList?.filter(item => form.package_ids?.includes(item.value))} />
                </> : ''}

                <Select label={'Filter Type'} options={[{}, ...dateFiltrationTypes?.map(i => ({ label: toStandardText(i), value: i }))]}
                    name={'date_filtration_type'} value={form?.date_filtration_type} onChange={handleChange}
                    required={form?.end_date || form?.from_date} />

                <InputText label={'From Date'} type='date' name={'from_date'} value={form?.from_date} onChange={handleChange}
                    required={form?.date_filtration_type || form?.end_date} max={form?.end_date} />

                <InputText label={'End Date'} type='date' name={'end_date'} value={form?.end_date} onChange={handleChange}
                    required={form?.date_filtration_type || form?.from_date} min={form?.from_date} />

                <Button label={'Apply Filter'} severity={'primary'} style={{ width: '100%' }}
                    rounded disabled={!form.city_id && !form.product_id && !form.installation_mode && !form?.product_type && !form?.origin_category
                        && !form?.package_ids?.length && !form?.from_date && !form?.end_date} />


            </form>
        </div>
    )
}

export default FilterCustomerProduct