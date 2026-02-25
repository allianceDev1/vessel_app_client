import React, { useState } from 'react'
import './service-filter.scss'
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import Button from '../../../UI_Primitives/buttons/Button';
import ButtonGroup from '../../../UI_Primitives/buttons/ButtonGroup';
import InputText from '../../../UI_Primitives/inputs/InputText';
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect';

const ServiceFilter = ({ filterFields: { cities, posts, packages } }) => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [form, setForm] = useState({
        customer_id: searchParams.get('customer_id') || null,
        city_id: searchParams.get('city_id')?.split(' ') || [],
        post: searchParams.get('post')?.split(' ') || [],
        packages: searchParams.get('packages')?.split(' ') || [],
        from_date: searchParams.get('from_date') || null,
        to_date: searchParams.get('to_date') || null
    })

    const handleChangeForm = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleMultiInputChange = (e) => {
        setForm({ ...form, [e.name]: e.selectedValues?.map((c) => c.value) })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        let filterFlag = false

        let newSearchParams = new URLSearchParams(searchParams)

        if (form?.customer_id) {
            newSearchParams.set('customer_id', form?.customer_id)
            filterFlag = true
        } else {
            newSearchParams.delete('customer_id')
        }

        if (form?.city_id.length > 0) {
            newSearchParams.set('city_id', form?.city_id?.join(' '))
            filterFlag = true
        } else {
            newSearchParams.delete('city_id')
        }

        if (form?.post.length > 0) {
            newSearchParams.set('post', form?.post?.join(' '))
            filterFlag = true
        } else {
            newSearchParams.delete('post')
        }

        if (form?.packages.length > 0) {
            newSearchParams.set('packages', form?.packages?.join(' '))
            filterFlag = true
        } else {
            newSearchParams.delete('packages')
        }

        if (form?.from_date && form?.to_date) {
            newSearchParams.set('from_date', form?.from_date)
            newSearchParams.set('to_date', form?.to_date)
            filterFlag = true
        } else {
            newSearchParams.delete('from_date')
            newSearchParams.delete('to_date')
        }

        if (filterFlag) {
            newSearchParams.set('fl', 'Yes')
            setSearchParams(newSearchParams)
            dispatch(modal.pull.all())
        }
    }

    const clearFilter = () => {
        let newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('customer_id')
        newSearchParams.delete('city_id')
        newSearchParams.delete('post')
        newSearchParams.delete('packages')
        newSearchParams.delete('from_date')
        newSearchParams.delete('to_date')
        newSearchParams.delete('fl')
        setSearchParams(newSearchParams)
        dispatch(modal.pull.all())
    }

    return (
        <div className="tech-service-filter-comp">
            <form action="" onSubmit={handleSubmit}>
                <InputText label={'Customer Id'} name={'customer_id'} value={form?.customer_id} onChange={handleChangeForm} />
                <MultiSelectInput label={'Available Cities'} name={'city_id'} options={cities} onChange={handleMultiInputChange}
                    selected={cities?.filter((c) => form?.city_id?.includes(c.value)) || []} />
                <MultiSelectInput label={'Available Post offices'} name={'post'} options={posts} onChange={handleMultiInputChange}
                    selected={posts?.filter((p) => form?.post?.includes(p.value)) || []} />
                <MultiSelectInput label={'Packages'} name={'packages'} options={packages} onChange={handleMultiInputChange}
                    selected={packages?.filter((p) => form?.packages?.includes(p.value)) || []} />
                <div className="date-range">
                    <InputText label={'From Date'} type='date' name={'from_date'} value={form?.from_date} onChange={handleChangeForm} max={form.to_date} />
                    <InputText label={'End Date'} type='date' name={'to_date'} value={form?.to_date} onChange={handleChangeForm} min={form.from_date} />
                </div>
                <ButtonGroup style={{ dispatch: "grid", }} rounded>
                    <Button label={'Clear'} type={'button'} severity={'primary'} outlined style={{ width: '100%' }} disabled={searchParams.get('fl') !== 'Yes'}
                        onClick={clearFilter} />
                    <Button label={'Apply Filter'} severity={'primary'} style={{ width: '100%' }} />
                </ButtonGroup>
            </form>
        </div>
    )
}

export default ServiceFilter