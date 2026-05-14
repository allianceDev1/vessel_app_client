import React, { useState } from 'react'
import Textarea from '../../../UI_Primitives/inputs/TextArea'
import Button from '../../../UI_Primitives/buttons/Button'
import InputText from '../../../UI_Primitives/inputs/InputText'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { api } from '../../../../api'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { TbCircleCheck } from 'react-icons/tb'



const ServiceCancellation = ({ packageSrlNo }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const queryClient = useQueryClient()
    const [comment, setComment] = useState('')
    const [text, setText] = useState('');

    const handelSubmit = async (e) => {
        e.preventDefault();

        if (text !== 'CANCEL') {
            return;
        }

        try {
            const res = await api.vfCv2Axios.post(`/package/${packageSrlNo}/service-cancellation`, { comment })

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

    return (
        <div className="">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary-2)' }}>
                After cancellation, one service will be removed from the customer's package. This action cannot be undone.
            </p>
            <form action="" style={{ marginTop: '15px' }} onSubmit={handelSubmit}>
                <Textarea label={'Comment'} name={'comment'} value={comment} onChange={(e) => setComment(e.target.value)}
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
                    severity={'danger'} spinIcon={loading} disabled={text !== 'CANCEL' || !comment} />
            </form>
        </div>
    )
}

export default ServiceCancellation