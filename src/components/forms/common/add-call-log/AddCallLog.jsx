import React, { useState } from 'react'
import './add-call-log.scss';
import TextArea from '../../../UI_Primitives/inputs/TextArea';
import Button from '../../../UI_Primitives/buttons/Button';
import { api } from '../../../../api';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';


const AddCallLog = ({ customerId, serviceType, isController }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState('')
    const [searchParams] = useSearchParams()


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading('submit')

            if (isController) {
                await api.vfCv2Axios.post(`/customer/${customerId}/call-log`, { message })
                dispatch(modal.pull.all())
                dispatch(toast.push({
                    type: "success",
                    head: 'Success!',
                    message: "Your call log Updated."
                }))

            } else {
                await api.vfTv2Axios.post(`/customer/${customerId}/call-log`, { message })

                queryClient.setQueryData(
                    ['tech_service_profile', customerId, serviceType, searchParams.get('reg_id')],
                    old => {
                        if (!old) return old
                        return {
                            ...old,
                            callLogs: [
                                {
                                    customer_id: customerId,
                                    called_at: new Date(),
                                    caller_category: 'Technician',
                                    message: message,
                                    call_uuid: '817ac624',
                                    called_by_uuid: '817ac624',
                                    called_by: 'You'
                                },
                                ...(old.callLogs || [])
                            ]
                        }
                    }
                )

                dispatch(modal.pull.all())
            }
        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Call log failed',
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }

    return (
        <div className="add-call-log-comp">
            <form action="" onSubmit={handleSubmit}>
                <TextArea label={'Message'} name={'message'} value={message} required onChange={(e) => setMessage(e.target.value)} />
                <Button label={'Submit'} rounded severity={'primary'} spinIcon={loading === 'submit'} disabled={message.length < 3} />
            </form>
        </div>
    )
}

export default AddCallLog