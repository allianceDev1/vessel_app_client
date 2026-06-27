import React, { useState } from 'react'
import './postpone-service.scss';
import Checkbox from '../../../UI_Primitives/inputs/Checkbox';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Button from '../../../UI_Primitives/buttons/Button';
import Select from '../../../UI_Primitives/inputs/Select';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import { useDispatch } from 'react-redux';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../../api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';


const PostponeService = ({ customerId, products, serviceType, isController = false }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const [searchParams] = useSearchParams()
    const [selectedProducts, setSelectedProducts] = useState(products?.map((p) => p.product_id) || [])
    const [form, setForm] = useState({ postpone_date: null, reason: null })
    const [loading, setLoading] = useState('')



    const handleProductSelect = (productId) => {
        const isSelected = selectedProducts.filter((pId) => pId === productId).length > 0

        if (isSelected) {
            setSelectedProducts(selectedProducts.filter((pId) => pId !== productId))
        } else {
            setSelectedProducts([...selectedProducts, productId])
        }
    }

    const handelChangeInputs = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading('submit')

            if (isController) {
                await api.vfCv2Axios.post(`/service/${customerId}/postpone`, {
                    postpone_date: form?.postpone_date,
                    products: selectedProducts,
                    reason: form?.reason
                })

                dispatch(modal.pull.all())
                dispatch(toast.push({
                    type: "success",
                    head: 'Success!',
                    message: "Service date Updated."
                }))
            } else {
                await api.vfTv2Axios.post(`/service/${customerId}/postpone`, {
                    postpone_date: form?.postpone_date,
                    products: selectedProducts,
                    reason: form?.reason
                })

                queryClient.setQueryData(
                    ['tech_service_profile', customerId, serviceType, searchParams.get('reg_id')],
                    old => {
                   
                        if (!old) return old
                        return {
                            ...old,
                            upServices: {
                                ...old.upServices,
                                products: (old.upServices?.products || [])?.map(p => {

                                    if (p.service?.service_type === 'SERVICE' && selectedProducts.includes(p.product_id)) {
                                 
                                        return {
                                            ...p,
                                            service: {
                                                ...p.service,
                                                service_date: new Date(form?.postpone_date)
                                            }
                                        }
                                    }
                                    return p
                                })
                            }
                        }
                    }
                )

                dispatch(modal.pull.all())
            }


        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Postpone failed',
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }

    const {
        data,
        isLoading
    } = useQuery({
        queryKey: ['service_postpone_reasons'],
        queryFn: async () => {
            const res = await api.vfTv2Axios.get(`/service/form-resources?titles=service_postpone_reasons`)
            const postponeList = res?.[0] || {}
            return postponeList?.values?.map(v => v.data?.[0]) || []
        },
        staleTime: 60_000
    })



    if (isLoading) return (
        <div className="postpone-service-load">
            <SkeletonGrid height={'150px'} />
            <SkeletonGrid height={'50px'} rows={'4'} />
        </div>
    )

    return (
        <div className="postpone-service-comp">
            <ul>
                <li>Only service products are listed here; renewal products are not included.</li>
                <li>If a product is unchecked, it will continue to appear in the service list without being postponed.</li>
                <li>When the postponed date is within 30 days, the product will not be hidden from the service list.</li>
                <li>Postponing a service does not affect other products.</li>
                <li>The maximum allowed postpone date is limited to the earliest renewal date among the selected vessels.</li>
            </ul>

            <form action="" onSubmit={handleSubmit}>
                <div className="products">
                    <h4>Products</h4>
                    {products?.map((product) => (<Checkbox key={product?.product_id} label={`${product?.product_id} - ${product?.product_name}`}
                        name={'product'} onChange={() => handleProductSelect(product.product_id)}
                        checked={selectedProducts.filter((productId) => productId === product.product_id).length ? true : false} />))}
                </div>
                <InputText label={'Postpone date'} name={'postpone_date'} value={form?.postpone_date} onChange={handelChangeInputs}
                    type='date' required={true} />
                <Select label={'Postpone reason'} name={'reason'} options={[{ value: '', label: '' }, ...data.map(r => ({ value: r, label: r })), { value: '_input_write_', label: 'Other' },]}
                    value={form?.reason} onChange={handelChangeInputs} required={true} />
                <Button label={'Postpone'} rounded severity={'danger'} disabled={selectedProducts.length === 0 || !form?.postpone_date || !form?.reason}
                    style={{ width: '100%' }} spinIcon={loading === 'submit'} />
            </form>
        </div>
    )
}

export default PostponeService