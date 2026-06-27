import React, { useState } from 'react'
import Select from '../../../UI_Primitives/inputs/Select'
import Button from '../../../UI_Primitives/buttons/Button'
import ButtonGroup from '../../../UI_Primitives/buttons/ButtonGroup'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import InputText from '../../../UI_Primitives/inputs/InputText'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect';
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../api'
import { TbLocation } from 'react-icons/tb'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'


const FilterBox = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [form, setForm] = useState({
        from_date: searchParams.get('from_date') || '',
        end_date: searchParams.get('end_date') || '',
        id_key: searchParams.get('id_key') || '',
        service_type: searchParams.get('service_type') || '',
        status: searchParams.get('fl') ? (searchParams.get('status')?.split(',')?.map(Number) || []) : [1, 2, 3, 4],
        city_id: searchParams.get('city_id') || '',
        rnd: searchParams.get('rnd') || ''
    })

    const statusList = [
        { label: "Registered", value: 1 },
        { label: "Proceed", value: 2 },
        { label: 'Scheduled', value: 3 },
        { label: 'On Visit', value: 4 },
        { label: 'Closed', value: 5 },
        { label: 'Cancelled', value: 6 },
    ]

    const serviceTypes = [
        { label: "Complaint", value: "COMPLAINT" },
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

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleMultiInputChange = (e) => {
        setForm({ ...form, [e.name]: e.selectedValues?.map((c) => c.value) })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.from_date && !form.end_date && !form.id_key && !form.service_type && !form.status?.length && !form.city_id) {
            return;
        }

        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('fl', 'Yes');
            form.from_date ? next.set('from_date', form.from_date) : next.delete('from_date')
            form.end_date ? next.set('end_date', form.end_date) : next.delete('end_date')
            form.id_key ? next.set('id_key', form.id_key) : next.delete('id_key')
            form.service_type ? next.set('service_type', form.service_type) : next.delete('service_type')
            form.status?.length ? next.set('status', form.status?.join(',')) : next.delete('status')
            form.city_id ? next.set('city_id', form.city_id) : next.delete('city_id')
            form.rnd ? next.set('rnd', form.rnd) : next.delete('rnd')
            return next;
        })

        dispatch(modal.pull.all())
    }

    const handleClear = () => {
        setForm({
            from_date: '',
            end_date: '',
            id_key: '',
            service_type: '',
            status: [],
            city_id: '',
            rnd: '',
        })
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('fl');
            next.delete('from_date');
            next.delete('end_date');
            next.delete('id_key');
            next.delete('service_type');
            next.delete('status');
            next.delete('city_id');
            next.delete('rnd');
            return next;
        })
    }

    return (
        <div className="filter-services-box-container">
            {cityLoading &&
                <SkeletonGrid rows={9} columns={1} height={'50px'} gap={'10px'} />}

            {cityError &&
                <ErrorState icon={<TbLocation />} message={'Resources fetching failed.'}
                    hight='300px' />}

            {(!cityLoading && !cityError) &&
                <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>

                    <InputText label={'Reg No / Customer Id'} name={'id_key'} style={{ textTransform: "uppercase" }} type='text' value={form.id_key} onChange={handleChange} />

                    <MultiSelectInput label={'Status'} name={'status'} options={statusList} onChange={handleMultiInputChange}
                        selected={statusList.filter(item => form.status.includes(item.value))}
                    />

                    <Select label={'Service type'} name={'service_type'} options={[{ label: '', value: '' }, ...serviceTypes]} value={form.service_type} onChange={handleChange} />

                    <Select label={'City'} name={'city_id'} options={[{ label: '', value: '' }, ...(cityList || [])?.map((city) => ({ label: city.city_name, value: city.city_id }))]}
                        value={form.city_id} onChange={handleChange} />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <InputText label={'From Date'} name={'from_date'} type='date' value={form.from_date} onChange={handleChange}
                            max={form.end_date} required={form.service_type || form.city_id || form?.status?.includes(5) || form?.status?.includes(6)} />

                        <InputText label={'End Date'} name={'end_date'} type='date' value={form.end_date} onChange={handleChange}
                            min={form.from_date} required={form.service_type || form.city_id || form?.status?.includes(5) || form?.status?.includes(6)} />
                    </div>

                    <ButtonGroup style={{ dispatch: "grid", }} rounded>
                        <Button label={'Clear'} type={'button'} severity={'primary'} outlined style={{ width: '100%' }} disabled={searchParams.get('fl') !== 'Yes'}
                            onClick={handleClear} />
                        <Button label={'Apply Filter'} severity={'primary'} style={{ width: '100%' }} disabled={(!form.from_date && !form.end_date && !form.id_key && !form.service_type && !form.status?.length && !form.city_id)} />
                    </ButtonGroup>
                </form>}
        </div>
    )
}

export default FilterBox