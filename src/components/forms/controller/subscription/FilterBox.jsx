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

const FilterBox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    statuses: searchParams.get('statuses')?.split(',') || [],
    package_ids: searchParams.get('package_ids')?.split(',') || [],
    date_type: searchParams.get('date_type') || '',
    from_date: searchParams.get('from_date') || '',
    end_date: searchParams.get('end_date') || '',
  })

  const dateFilterTypes = ['RENEWED_DATE', 'START_DATE', 'EXPIRE_DATE', 'EXPIRED_AT', 'FREEZE_DATE']
  const statusFilterTypes = Object.entries(PACKAGE_STATUSES).map(([key, value]) => ({ label: toStandardText(key), value: String(value) }))


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

  const { data: packageIdOptions,
    //  isLoading: resourcesLoading, error: resourcesError
  } = useQuery({
    queryKey: ['package_ids'],
    queryFn: async () => {
      const res = await api.vfCv2Axios.get(`/config/service-package/list?product_type=VESSEL_FILTER&fields=package_id,package_name`)
      return res?.map(p => ({ label: p?.package_name, value: p?.package_id }))
    },
    staleTime: 30_000
  })

  const handleSubmit = (e) => {
    e.preventDefault();

    // validation
    if (!form?.statuses?.length && !form?.package_ids?.length && !form?.from_date && !form?.end_date) {
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams)

    newSearchParams.set('fl', 'Yes')

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
        <MultiSelectInput label={'Packages'} options={packageIdOptions} name={'package_ids'} onChange={handleMultiInputChange}
          selected={packageIdOptions?.filter(item => form.package_ids?.includes(item.value))} />

        <MultiSelectInput label={'Status'} options={statusFilterTypes} name={'statuses'} onChange={handleMultiInputChange}
          selected={statusFilterTypes?.filter(item => form.statuses?.includes(item.value))} />

        <Select label={'Date Type'} name={'date_type'} value={form?.date_type} options={[{}, ...dateFilterTypes?.map(i => ({ label: toStandardText(i), value: i }))]}
          onChange={handleChange} required={form?.end_date || form?.from_date} />

        <InputText label={'From Date'} type='date' name={'from_date'} value={form?.from_date} onChange={handleChange}
          required={form?.date_type || form?.end_date} max={form?.end_date} />

        <InputText label={'End Date'} type='date' name={'end_date'} value={form?.end_date} onChange={handleChange}
          required={form?.date_type || form?.from_date} min={form?.from_date} />

        <Button label={'Apply Filter'} severity={'primary'} style={{ width: '100%' }}
          rounded disabled={!form?.statuses?.length && !form?.package_ids?.length && !form?.from_date && !form?.end_date} />
      </form>
    </div>
  )
}

export default FilterBox