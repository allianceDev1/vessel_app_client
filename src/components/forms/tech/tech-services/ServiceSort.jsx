import React, { useState } from 'react'
import Select from '../../../UI_Primitives/inputs/Select'
import ButtonGroup from '../../../UI_Primitives/buttons/ButtonGroup'
import Button from '../../../UI_Primitives/buttons/Button'
import { useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'


const ServiceSort = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [form, setForm] = useState({
        field: searchParams.get('field') || null,
        order: searchParams.get('order') || null
    })

    const handleChangeForm = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const fieldOptions = [
        { label: 'Customer Id', value: 'customer_id' },
        { label: 'City', value: 'city' },
        { label: 'Post office', value: 'post' },
        { label: 'Date', value: 'date' }
    ]

    const handleSubmit = (e) => {
        e.preventDefault();

        let sortFlag = false

        let newSearchParams = new URLSearchParams(searchParams)

        if (form?.field) {
            newSearchParams.set('field', form?.field)
            sortFlag = true
        } else {
            newSearchParams.delete('field')
        }

        if (form?.order) {
            newSearchParams.set('order', form?.order)
            sortFlag = true
        } else {
            newSearchParams.delete('order')
        }

        if (sortFlag) {
            newSearchParams.set('sr', 'Yes')
            setSearchParams(newSearchParams)
            dispatch(modal.pull.all())
        }
    }

    const clearSort = () => {
        let newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('field')
        newSearchParams.delete('order')
        newSearchParams.delete('sr')
        setSearchParams(newSearchParams)
        dispatch(modal.pull.all())
    }

    return (
        <div className='tech-service-filter-comp'>
            <form onSubmit={handleSubmit}>
                <Select label={'Field'} name={'field'} value={form?.field} options={[{ label: '', value: '' }, ...fieldOptions]} onChange={handleChangeForm} required={true} />
                <Select label={'Order'} name={'order'} onChange={handleChangeForm} value={form?.order} required={true}
                    options={[{ label: '', value: '' }, { label: 'Ascending', value: 'asc' }, { label: 'Descending', value: 'desc' }]} />
                <ButtonGroup style={{ dispatch: "grid", }} rounded>
                    <Button label={'Clear'} type={'button'} severity={'primary'} outlined style={{ width: '100%' }} disabled={searchParams.get('sr') !== 'Yes'}
                        onClick={clearSort} />
                    <Button label={'Apply Sort'} severity={'primary'} style={{ width: '100%' }} />
                </ButtonGroup>
            </form>
        </div>
    )
}

export default ServiceSort