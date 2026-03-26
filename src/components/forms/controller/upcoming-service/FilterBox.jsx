import React, { useEffect, useState } from 'react'
import moment from 'moment';
import Select from '../../../UI_Primitives/inputs/Select'
import Button from '../../../UI_Primitives/buttons/Button'
import ButtonGroup from '../../../UI_Primitives/buttons/ButtonGroup'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../api'
import { TbLocation } from 'react-icons/tb'
import InputText from '../../../UI_Primitives/inputs/InputText'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'

const FilterBox = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({
    product_type: searchParams.get('product_type') || '',
    service_type: searchParams.get('service_type') || '',
    package_id: searchParams.get('package_id') || '',
    city_id: searchParams.get('city_id') || '',
    service_index: searchParams.get('service_index') || '',
    from_date: searchParams.get('from_date') || moment().startOf('month').format('YYYY-MM-DD'),
    end_date: searchParams.get('end_date') || moment().endOf('month').format('YYYY-MM-DD'),
  })

  const productTypes = [
    { label: "Vessel Filter", value: "VESSEL_FILTER" },
    { label: "Add On", value: "ADD_ON" },
  ]

  const serviceTypes = [
    { label: "Service", value: "SERVICE" },
    { label: "Renewal", value: "RENEWAL" }
  ]

  const {
    data: cityList,
    isLoading: cityLoading,
    error: cityError,
  } = useQuery({
    queryKey: ['city_input_list'],
    queryFn: async () => {
      const res = await api.cnPv2Axios('/l/location/city?area_type=service')
      return res
    },
    staleTime: 30 * 60_000
  })

  const {
    data: packageList,
    isLoading: packageLoading,
    error: packageError,
  } = useQuery({
    queryKey: ['package_input_list'],
    queryFn: async () => {
      const res = await api.vfCv2Axios.get('/config/service-package/list?product_type=VESSEL_FILTER&fields=package_name')
      return res
    },
    staleTime: 30 * 60_000
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('fl', 'Yes');
      form.from_date ? next.set('from_date', form.from_date) : next.delete('from_date')
      form.end_date ? next.set('end_date', form.end_date) : next.delete('end_date')
      form.city_id ? next.set('city_id', form.city_id) : next.delete('city_id')
      form.product_type ? next.set('product_type', form.product_type) : next.delete('product_type')
      form.package_id ? next.set('package_id', form.package_id) : next.delete('package_id')
      form.service_type ? next.set('service_type', form.service_type) : next.delete('service_type')
      form.service_index ? next.set('service_index', form.service_index) : next.delete('service_index')
      return next;
    })

    dispatch(modal.pull.all())
  }

  const handleClear = () => {
    setForm({})
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('fl');
      next.delete('from_date');
      next.delete('end_date');
      next.delete('city_id');
      next.delete('product_type');
      next.delete('package_id');
      next.delete('service_type');
      next.delete('service_index');
      return next;
    })
  }

  return (
    <div className="filter-services-box-container">
      {(cityLoading || packageLoading) &&
        <SkeletonGrid rows={9} columns={1} height={'50px'} gap={'10px'} />}

      {(cityError || packageError) &&
        <ErrorState icon={<TbLocation />} message={'Resources fetching failed.'}
          hight='300px' />}

      {(!cityLoading || !packageLoading) && (!cityError || !packageError) &&
        <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
          <InputText label={'From Date'} name={'from_date'} type='date' value={form.from_date} onChange={handleChange}
            max={form.end_date} required />

          <InputText label={'End Date'} name={'end_date'} type='date' value={form.end_date} onChange={handleChange}
            min={form.from_date} required />

          <Select label={'City'} name={'city_id'} options={[{ label: '', value: '' }, ...(cityList || [])?.map((city) => ({ label: city.city_name, value: city.city_id }))]}
            value={form.city_id} onChange={handleChange} />

          <Select label={'Product type'} name={'product_type'} options={[{ label: '', value: '' }, ...productTypes]} value={form.product_type} onChange={handleChange} />

          <Select label={'Package'} name={'package_id'} options={[{ label: '', value: '' }, ...(packageList || [])?.map((pkg) => ({ label: pkg.package_name, value: pkg.package_id }))]}
            value={form.package_id} onChange={handleChange} />

          <Select label={'Service type'} name={'service_type'} options={[{ label: '', value: '' }, ...serviceTypes]} value={form.service_type} onChange={handleChange} />

          <InputText label={'Service Index'} name={'service_index'} type='number' min={1} value={form.service_index} onChange={handleChange} />

          <ButtonGroup style={{ dispatch: "grid", }} rounded>
            <Button label={'Clear'} type={'button'} severity={'primary'} outlined style={{ width: '100%' }} disabled={searchParams.get('fl') !== 'Yes'}
              onClick={handleClear} />
            <Button label={'Apply Filter'} severity={'primary'} style={{ width: '100%' }} />
          </ButtonGroup>
        </form>}
    </div>
  )
}

export default FilterBox