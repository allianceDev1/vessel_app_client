import React, { useState } from 'react'
import TextArea from '../../../UI_Primitives/inputs/TextArea'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useQueryClient } from '@tanstack/react-query'

const CancelRegistration = ({ registrationId }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState('')
    const [form, setForm] = useState({ reason: null })
    const queryClient = useQueryClient()


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading('submit')

            await api.vfCv2Axios.put(`/service-registration/${registrationId}/cancel`, {
                reason: form?.reason
            })

            queryClient.invalidateQueries({
                queryKey: ['registration_info_controller', registrationId]
            })

            dispatch(modal.pull.all())

            dispatch(toast.push({
                type: 'success',
                head: 'Registration Cancelled'
            }))

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Cancellation failed',
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }


    return (
        <div className="tech-unschedule-service-comp">
            <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
                <TextArea label={'Reason of cancellation'} type='text' value={form?.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
                <Button label={'Cancel Registration'} spinIcon={loading} severity={'danger'} rounded
                    disabled={form?.reason?.length < 4} />
            </form>
        </div>
    )
}

export default CancelRegistration