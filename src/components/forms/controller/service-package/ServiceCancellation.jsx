import React, { useState } from 'react'
import Textarea from '../../../UI_Primitives/inputs/TextArea'
import Button from '../../../UI_Primitives/buttons/Button'
import InputText from '../../../UI_Primitives/inputs/InputText'
import { api } from '../../../../api'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TbCircleCheck } from 'react-icons/tb'
import Select from '../../../UI_Primitives/inputs/Select'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'



const ServiceCancellation = ({ package_id, packageSrlNo }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const queryClient = useQueryClient()
    const [form, setForm] = useState({})
    const [text, setText] = useState('');

    const handelSubmit = async (e) => {
        e.preventDefault();

        if (text !== 'CANCEL') {
            return;
        }

        try {
            await api.vfCv2Axios.post(`/package/${packageSrlNo}/cancel-service`, form)

            queryClient.invalidateQueries({
                queryKey: ['package_service_cards', packageSrlNo],
            })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Success!',
                message: 'Service cancelled successfully'
            }))

        } catch (error) {
            dispatch(toast.push({
                type: "danger",
                head: 'Cancellation Failed',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const { data: categoryList, isLoading, error } = useQuery({
        queryKey: ['package_sr_category_service_mode_list', package_id],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/config/service-package/service/list?hidden=Yes&packageIds=${package_id}&fields=service_name`)
            return res.filter((c) => c.mode === 'SERVICE')
        },
        staleTime: 60_000
    })

    if (isLoading) {
        return <div>
            <SkeletonGrid
                rows={5}
                columns={1}
                height={'45px'}
                gap={'10px'}
            />
        </div>
    }


    return (
        <div className="">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary-2)' }}>
                After cancellation, one service will be removed from the customer's package. This action cannot be undone.
            </p>

            <form action="" style={{ marginTop: '15px' }} onSubmit={handelSubmit}>
                <Select label={'Service Category'} name={'service_id'} options={[{}, ...categoryList?.map(v => ({ label: v?.service_name, value: v?.service_id }))]} type='date'
                    required onChange={handleChange} style={{ marginBottom: '10px' }} value={form?.service_id} />
                <Textarea label={'Comment'} name={'comment'} value={form?.comment} onChange={handleChange}
                    required />

                <p style={{ marginTop: '30px', fontSize: '13px', color: 'var(--text-secondary-2)', marginBottom: '10px' }}>
                    To cancel the package service, Type <b>CANCEL</b> in the field below to confirm.
                </p>
                <InputText label={'Confirmation'} name={'verify_text'} value={text}
                    required onChange={(e) => setText(e.target.value)} rightIcon={text === 'CANCEL' && <TbCircleCheck />}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    onKeyDown={(e) => {
                        if (
                            (e.ctrlKey || e.metaKey) &&
                            ["c", "v", "x"].includes(e.key.toLowerCase())
                        ) {
                            e.preventDefault()
                        }
                    }} />
                <Button style={{ marginTop: '10px', width: '100%' }} label={'Cancel Service'} rounded
                    severity={'danger'} spinIcon={loading} disabled={text !== 'CANCEL' || !form?.comment || !form?.service_id} />
            </form>
        </div>
    )
}

export default ServiceCancellation