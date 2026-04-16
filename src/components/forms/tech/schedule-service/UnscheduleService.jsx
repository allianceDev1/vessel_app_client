import React, { useState } from 'react'
import TextArea from '../../../UI_Primitives/inputs/TextArea'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

const UnscheduleService = ({ registrationId, isController = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState('')
    const [form, setForm] = useState({ reason: null })
    const queryClient = useQueryClient()


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading('submit')

            if (isController) {
                await api.vfCv2Axios.patch(`/service-registration/${registrationId}/unschedule`, {
                    reason: form?.reason
                })

                queryClient.invalidateQueries({
                    queryKey: ['registration_info_controller', registrationId]
                })


                dispatch(modal.pull.all())

                dispatch(toast.push({
                    type: 'success',
                    head: 'Work unscheduled'
                }))

            } else {
                await api.vfTv2Axios.patch(`/registered-service/${registrationId}/unschedule`, {
                    reason: form?.reason
                })

                dispatch(modal.pull.all())

                dispatch(toast.push({
                    type: 'success',
                    head: 'Your work unscheduled'
                }))

                navigate('/tech/schedules')
            }



        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Service unschedule failed',
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }


    return (
        <div className="tech-unschedule-service-comp">
            <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
                <p style={{ fontSize: '14px', textAlign: 'justify', color: 'var(--text-secondary-2)' }}>The selected service will be removed from the
                    schedule and returned to Proceed status without changing the assigned technician.</p>
                <TextArea label={'Reason of unschedule'} type='text' value={form?.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
                <Button label={'Unschedule work'} spinIcon={loading} severity={'danger'} rounded
                    disabled={form?.reason?.length < 4} />
            </form>
        </div>
    )
}

export default UnscheduleService