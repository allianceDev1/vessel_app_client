import React, { useState } from 'react'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbAlertCircle } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'


const AddSpare = ({  productId }) => {
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(false)


    const { data: sparesData, isLoading: spareLoading, error } = useQuery({
        queryKey: ['spares'],
        queryFn: async () => {
            const res = await api.cnAv1Axios.get('/production/spares?limit=1000&fields=spare_name,spare_id,uuid&sortBy=spare_name&sortOrder=asc')

            return res.data?.map((s) => ({ label: s?.spare_name, value: s?.uuid })) || []
        },
        staleTime: 60_000
    })

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
            await api.vfCv2Axios.post(`/product/${productId}/spare`, form)

            queryClient.refetchQueries({
                queryKey: ['controller_customer_spare_list',  productId],
            })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Success!',
                message: 'New Spare Added Successfully'
            }))
        } catch (error) {
            dispatch(toast.push({
                type: "danger",
                head: 'Adding Spare Failed',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading(false)
        }
    }

    if (spareLoading) {
        return <SkeletonGrid rows={6} columns={1} height={'50px'} gap={'10px'} />
    }

    if (error) {
        return <div style={{ marginTop: '20px' }}>
            <ErrorState
                icon={<TbAlertCircle />}
                hight='300px'
                title={'Data Fetching Failed'}
                message={error?.message}
            />
        </div>
    }

    return (
        <div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
                <Select label={'Select Spare'} name={'spare_uuid'} value={form?.spare_uuid} onChange={handleChange} options={[{}, ...sparesData]}
                    required />
                <InputText label={'Quantity'} name={'qty'} value={form?.qty} onChange={handleChange} type={'number'} min={1} required />
                <InputText label={'Insert Date'} name={'insert_at'} value={form?.insert_at} onChange={handleChange} type={'date'} required />
                <InputText label={'Warranty Start Date'} name={'wr_start_date'} value={form?.wr_start_date} onChange={handleChange} type={'date'}
                    min={form?.insert_at} max={isoToYYYYMMDD(new Date())} required={form?.wr_period ? true : false} />
                <InputText label={'Warranty Period (Months)'} name={'wr_period'} value={form?.wr_period} onChange={handleChange} type={'number'} min={1}
                    required={form?.wr_start_date ? true : false} />
                <Button label={'Add Spare'} severity={'primary'} rounded spinIcon={loading} disabled={loading} />
            </form>
        </div>
    )
}

export default AddSpare