import React, { useState } from 'react'
import moment from 'moment';
import Select from '../../../UI_Primitives/inputs/Select'
import Button from '../../../UI_Primitives/buttons/Button'
import ButtonGroup from '../../../UI_Primitives/buttons/ButtonGroup'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import InputText from '../../../UI_Primitives/inputs/InputText'
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
        from_date: searchParams.get('from_date') || (searchParams.get('fl') ? "" : moment().format('YYYY-MM-DD')),
        end_date: searchParams.get('end_date') || (searchParams.get('fl') ? "" : moment().format('YYYY-MM-DD')),
        technician_id: searchParams.get('technician_id') || '',
        customer_id: searchParams.get('customer_id') || '',
        product_id: searchParams.get('product_id') || '',
        reg_no: searchParams.get('reg_no') || ''
    })

    const {
        data: techList,
        isLoading: techLoading,
        error: techError,
    } = useQuery({
        queryKey: ['vessel_staff_list', 'name_only'],
        queryFn: async () => {
            const res = await api.ttPv2Axios('/worker/account/list?nameOnly=Yes')
            return res
        },
        staleTime: 10 * 60_000
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.from_date && !form.end_date && !form.technician_id && !form.customer_id && !form.product_id) {
            return;
        }

        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('fl', 'Yes');
            form.from_date ? next.set('from_date', form.from_date) : next.delete('from_date')
            form.end_date ? next.set('end_date', form.end_date) : next.delete('end_date')
            form.technician_id ? next.set('technician_id', form.technician_id) : next.delete('technician_id')
            form.customer_id ? next.set('customer_id', form.customer_id) : next.delete('customer_id')
            form.product_id ? next.set('product_id', form.product_id) : next.delete('product_id')
            form.reg_no ? next.set('reg_no', form.reg_no) : next.delete('reg_no')
            return next;
        })

        dispatch(modal.pull.all())
    }

    const handleClear = () => {
        setForm({
            from_date: '',
            end_date: '',
            technician_id: '',
            customer_id: '',
            product_id: '',
            reg_no: '',
        })
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('fl');
            next.delete('from_date');
            next.delete('end_date');
            next.delete('technician_id');
            next.delete('customer_id');
            next.delete('product_id');
            next.delete('reg_no');
            return next;
        })
    }

    return (
        <div className="filter-services-box-container">
            {techLoading &&
                <SkeletonGrid rows={9} columns={1} height={'50px'} gap={'10px'} />}

            {techError &&
                <ErrorState icon={<TbLocation />} message={'Resources fetching failed.'}
                    hight='300px' />}

            {(!techLoading && !techError) &&
                <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <InputText label={'From Date'} name={'from_date'} type='date' value={form.from_date} onChange={handleChange}
                            max={form.end_date} required={true} />

                        <InputText label={'End Date'} name={'end_date'} type='date' value={form.end_date} onChange={handleChange}
                            min={form.from_date} required={true} />
                    </div>

                    <Select label={'Technician'} name={'technician_id'} value={form.technician_id} onChange={handleChange}
                        options={[{ label: '', value: '' }, ...techList?.map((t) => ({ label: t.full_name, value: t.worker_uuid }))]} />

                    <InputText label={'Customer Id'} name={'customer_id'} type='number' value={form.customer_id} onChange={handleChange} />

                    <InputText label={'Product Id'} name={'product_id'} type='text' style={{ textTransform: "uppercase" }} value={form.product_id} onChange={handleChange} />

                    <InputText label={'Reg No'} name={'reg_no'} type='text' style={{ textTransform: "uppercase" }} value={form.reg_no} onChange={handleChange} />

                    <ButtonGroup style={{ dispatch: "grid", }} rounded>
                        <Button label={'Clear'} type={'button'} severity={'primary'} outlined style={{ width: '100%' }} disabled={searchParams.get('fl') !== 'Yes'}
                            onClick={handleClear} />
                        <Button label={'Apply Filter'} severity={'primary'} style={{ width: '100%' }} disabled={(!form.from_date && !form.end_date && !form.technician_id && !form.customer_id && !form.status?.length && !form.product_id)} />
                    </ButtonGroup>
                </form>}
        </div>
    )
}

export default FilterBox