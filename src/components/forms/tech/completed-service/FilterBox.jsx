import React, { useState } from 'react'
import moment from 'moment';
import Button from '../../../UI_Primitives/buttons/Button'
import ButtonGroup from '../../../UI_Primitives/buttons/ButtonGroup'
import InputText from '../../../UI_Primitives/inputs/InputText'
import { useSearchParams } from 'react-router-dom'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'


const FilterBox = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [form, setForm] = useState({
        from_date: searchParams.get('from_date') || (searchParams.get('fl') ? "" : moment().format('YYYY-MM-DD')),
        end_date: searchParams.get('end_date') || (searchParams.get('fl') ? "" : moment().format('YYYY-MM-DD')),
        customer_id: searchParams.get('customer_id') || ''
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.from_date && !form.end_date && !form.customer_id) {
            return;
        }

        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('fl', 'Yes');
            form.from_date ? next.set('from_date', form.from_date) : next.delete('from_date')
            form.end_date ? next.set('end_date', form.end_date) : next.delete('end_date')
            form.customer_id ? next.set('customer_id', form.customer_id) : next.delete('customer_id')
            return next;
        })

        dispatch(modal.pull.all())
    }

    const handleClear = () => {
        setForm({
            from_date: '',
            end_date: '',
            customer_id: ''
        })
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('fl');
            next.delete('from_date');
            next.delete('end_date');
            next.delete('customer_id');
            return next;
        })
    }

    return (
        <div className="filter-services-box-container">
            <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <InputText label={'From Date'} name={'from_date'} type='date' value={form.from_date} onChange={handleChange}
                        max={form.end_date} required={true} />

                    <InputText label={'End Date'} name={'end_date'} type='date' value={form.end_date} onChange={handleChange}
                        min={form.from_date} required={true} />
                </div>

                <InputText label={'Customer Id'} name={'customer_id'} type='number' value={form.customer_id} onChange={handleChange} />

                <ButtonGroup style={{ dispatch: "grid", }} rounded>
                    <Button label={'Clear'} type={'button'} severity={'primary'} outlined style={{ width: '100%' }} disabled={searchParams.get('fl') !== 'Yes'}
                        onClick={handleClear} />
                    <Button label={'Apply Filter'} severity={'primary'} style={{ width: '100%' }} disabled={(!form.from_date && !form.end_date && !form.customer_id)} />
                </ButtonGroup>
            </form>
        </div>
    )
}

export default FilterBox