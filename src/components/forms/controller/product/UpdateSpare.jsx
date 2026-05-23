import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../api'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'


const UpdateSpare = ({ productId, customerId, spareId, spareUuid, spareName, Qty, warrantyStarted, warrantyPeriod, insertAt }) => {
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const [form, setForm] = useState({
        qty: String(Qty),
        insert_at: insertAt,
        wr_start_date: warrantyStarted,
        wr_period: Number(warrantyPeriod) > 0 ? String(warrantyPeriod) : ''
    })
    const [loading, setLoading] = useState(false)


    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)
        try {
            await api.vfCv2Axios.put(`/product/${productId}/spare/${spareUuid}`, form)

            queryClient.refetchQueries({
                queryKey: ['controller_customer_spare_list', customerId, productId],
            })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Success!',
                message: 'Updated Successfully'
            }))
        } catch (error) {
            dispatch(toast.push({
                type: "danger",
                head: 'Updating Failed',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>

                <div style={{ padding: '25px 0 ' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '17px', fontWeight: '500' }}>{spareName}</h3>
                    <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary-2)' }}>{spareId} </p>
                </div>

                <InputText label={'Quantity'} name={'qty'} value={form?.qty} onChange={handleChange} type={'number'} min={1} required />
                <InputText label={'Insert Date'} name={'insert_at'} value={form?.insert_at} onChange={handleChange} type={'date'} required />
                <InputText label={'Warranty Start Date'} name={'wr_start_date'} value={form?.wr_start_date} onChange={handleChange} type={'date'}
                    min={form?.insert_at} max={isoToYYYYMMDD(new Date())} required={form?.wr_period ? true : false} />
                <InputText label={'Warranty Period (Months)'} name={'wr_period'} value={form?.wr_period} onChange={handleChange} type={'number'} min={1}
                    required={form?.wr_start_date ? true : false} />
                <Button label={'Update Spare'} severity={'primary'} rounded spinIcon={loading} disabled={loading} />
            </form>
        </div>
    )
}

export default UpdateSpare