import React, { useState } from 'react'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect'
import Button from '../../../UI_Primitives/buttons/Button'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../api'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { PACKAGE_STATUSES } from '../../../../assets/javascript/pre_data/package'
import { parentProductTypes } from '../../../../assets/javascript/pre_data/product'

const FilterBox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    product_type: searchParams.get('product_type') || '',
    statuses: searchParams.get('statuses')?.split(',').filter(Boolean) || [],
    package_ids: searchParams.get('package_ids')?.split(',').filter(Boolean) || [],
    date_type: searchParams.get('date_type') || '',
    from_date: searchParams.get('from_date') || '',
    end_date: searchParams.get('end_date') || '',
  })

  const dateFilterTypes = ['RENEWED_DATE', 'START_DATE', 'EXPIRE_DATE', 'EXPIRED_AT', 'FREEZE_DATE']
  const statusFilterTypes = Object.entries(PACKAGE_STATUSES).map(([key, value]) => ({ label: toStandardText(key), value: String(value) }))


  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'product_type') {
      setForm((prev) => ({
        ...prev,
        product_type: value,
        package_ids: []
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleMultiInputChange = (e) => {
    setForm({ ...form, [e.name]: e.selectedValues?.map((c) => c.value) })
  }

  const { data: packageIdOptions = [] } = useQuery({
    queryKey: ['package_ids', form?.product_type],
    queryFn: async () => {
      if (!form?.product_type || !parentProductTypes.includes(form?.product_type)) return []
      const res = await api.vfCv2Axios.get(
        `/config/service-package/list?product_type=${form.product_type}&fields=package_id,package_name`
      )
      return res?.map((p) => ({ label: p?.package_name, value: p?.package_id })) || []
    },
    enabled: Boolean(form?.product_type && parentProductTypes.includes(form?.product_type)),
    staleTime: 30_000
  })

  const handleSubmit = (e) => {
    e.preventDefault();

    // validation
    if (!form?.product_type && !form?.statuses?.length && !form?.package_ids?.length && !form?.from_date && !form?.end_date) {
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams)

    newSearchParams.set('fl', 'Yes')

    if (form?.product_type) {
      newSearchParams.set('product_type', form?.product_type)
    } else {
      newSearchParams.delete('product_type')
    }

    if (form?.black_listed) {
      newSearchParams.set('black_listed', form?.black_listed)
    } else {
      newSearchParams.delete('black_listed')
    }

    if (form?.statuses?.length) {
      newSearchParams.set('statuses', form?.statuses?.join(','))
    } else {
      newSearchParams.delete('statuses')
    }

    if (form?.package_ids?.length) {
      newSearchParams.set('package_ids', form?.package_ids?.join(','))
    } else {
      newSearchParams.delete('package_ids')
    }

    if (form?.date_type) {
      newSearchParams.set('date_type', form?.date_type)
      newSearchParams.set('from_date', form?.from_date)
      newSearchParams.set('end_date', form?.end_date)
    } else {
      newSearchParams.delete('date_type')
      newSearchParams.delete('from_date')
      newSearchParams.delete('end_date')
    }

    navigate(`/controller/subscriptions?${newSearchParams.toString()}`)

    dispatch(modal.pull.all())
  }

  return (
    <div className="controller-customer-product-filter-comp-container">
      <form action="" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Select
          label={'Product Type'}
          name={'product_type'}
          value={form?.product_type}
          options={[{}, ...parentProductTypes.map(i => ({ label: toStandardText(i, true), value: i }))]}
          onChange={handleChange}
        />

        <MultiSelectInput
          label={'Packages'}
          options={packageIdOptions}
          name={'package_ids'}
          disabled={!form?.product_type}
          onChange={handleMultiInputChange}
          selected={packageIdOptions?.filter(item => form.package_ids?.includes(item.value))}
        />

        <MultiSelectInput label={'Status'} options={statusFilterTypes} name={'statuses'} onChange={handleMultiInputChange}
          selected={statusFilterTypes?.filter(item => form.statuses?.includes(item.value))} />

        <Select label={'Date Type'} name={'date_type'} value={form?.date_type} options={[{}, ...dateFilterTypes?.map(i => ({ label: toStandardText(i), value: i }))]}
          onChange={handleChange} required={form?.end_date || form?.from_date} />

        <InputText label={'From Date'} type='date' name={'from_date'} value={form?.from_date} onChange={handleChange}
          required={form?.date_type || form?.end_date} max={form?.end_date} />

        <InputText label={'End Date'} type='date' name={'end_date'} value={form?.end_date} onChange={handleChange}
          required={form?.date_type || form?.from_date} min={form?.from_date} />

        <Button label={'Apply Filter'} severity={'primary'} style={{ width: '100%' }}
          rounded disabled={!form?.product_type && !form?.statuses?.length && !form?.package_ids?.length && !form?.from_date && !form?.end_date} />
      </form>
    </div>
  )
}

export default FilterBox