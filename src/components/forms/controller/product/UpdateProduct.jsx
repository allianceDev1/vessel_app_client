import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Select from '../../../UI_Primitives/inputs/Select'
import Button from '../../../UI_Primitives/buttons/Button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import { useDispatch } from 'react-redux'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { originCategories } from '../../../../assets/javascript/pre_data/product'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'

const UpdateProduct = ({ data, productId, customerId }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const [form, setForm] = useState({
        sku: data?.sku || '',
        order_id: data?.order_id || '',
        origin_category: data?.origin_category || '',
        installation_mode: data?.installation_mode_uuid || '',
        wr_start_date: data?.warranty?.start_date ? isoToYYYYMMDD(data?.warranty?.start_date) : null,
        wr_period: data?.warranty?.period || ''
    })
    const [loading, setLoading] = useState(false)

    const { data: resourcesData, isLoading } = useQuery({
        queryKey: ['installation_mode_list'],
        queryFn: async () => {

            const res = await api.vfCv2Axios.get(`/resources/form-resources?titles=installation_mode`)
            const modesList = res?.[0]?.values?.map(v => ({ label: v?.data?.[0], value: v?.uuid }))
            return modesList
        },
        staleTime: 30_000
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
            await api.vfCv2Axios.put(`/product/${productId}`, form)

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

    if (isLoading) {
        return <SkeletonGrid rows={7} height={'50px'} gap={'10px'} />
    }

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <InputText label={'SKU'} name={'sku'} value={form?.sku} required
                    onChange={handleChange} />
                {data?.product_type === 'VESSEL_FILTER' &&
                    <InputText label={'Order Id'} name={'order_id'} required value={form?.order_id}
                        onChange={handleChange} />}
                <Select label={'Origin'} name={'origin_category'} required value={form?.origin_category}
                    onChange={handleChange} options={[{}, ...originCategories?.map(i => ({ label: toStandardText(i), value: i }))]} />
                <Select label={'Installation Mode'} name={'installation_mode'} options={[{}, ...resourcesData]} required
                    onChange={handleChange} value={form?.installation_mode} />
                <InputText label={'Product Warranty Start Date'} name={'wr_start_date'} value={form?.wr_start_date} required
                    onChange={handleChange} type='date' />
                <InputText label={'Product Warranty Period'} name={'wr_period'} value={form?.wr_period} required
                    onChange={handleChange} type='number' />
                <Button label={'Update Product'} rounded severity={'primary'} spinIcon={loading} disabled={loading} />
            </form>
        </div>
    )
}

export default UpdateProduct