import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../api'
import { useDispatch } from 'react-redux'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'

const UpdateServiceDate = ({ data, productId, customerId }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const [form, setForm] = useState({
        next_service_date: data?.service?.next_service_date ? isoToYYYYMMDD(data?.service?.next_service_date) : '',
        rent_start_date: data?.rental?.rent_start_date ? isoToYYYYMMDD(data?.rental?.rent_start_date) : '',
        rent_period: data?.rental?.rent_period ? String(data?.rental?.rent_period) : '',
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
            await api.vfCv2Axios.put(`/product/${productId}/service-date`, form)

            queryClient.refetchQueries({
                queryKey: ['controller_customer_product_info', customerId, productId],
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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                <InputText label={'Next Service Date'} name={'next_service_date'} value={form?.next_service_date} required
                    onChange={handleChange} type='date' />

                {data?.product_type === 'ADD_ON' &&
                    <>
                        <InputText label={'Rent Start Date'} name={'rent_start_date'} value={form?.rent_start_date} required
                            onChange={handleChange} type='date' />

                        <InputText label={'Rent Period'} name={'rent_period'} value={form?.rent_period} required
                            onChange={handleChange} type='number' />
                    </>}

                <Button label={'Update'} rounded severity={'primary'} spinIcon={loading} disabled={loading}
                    style={{ marginTop: "10px" }} />
            </form>
        </div>
    )
}

export default UpdateServiceDate