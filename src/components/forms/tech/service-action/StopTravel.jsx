import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import Button from '../../../UI_Primitives/buttons/Button';
import Textarea from '../../../UI_Primitives/inputs/TextArea';
import { api } from '../../../../api';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const StopTravel = ({ registrationId, visitId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState('')
    const [form, setForm] = useState({ reason: null })


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading('submit')

            await api.vfTv2Axios.post(`/registered-service/${registrationId}/stop-travel`, {
                reason: form?.reason,
                visit_uuid: visitId
            })

            dispatch(modal.pull.all())

            dispatch(toast.push({
                type: 'success',
                head: 'Your travel is stopped'
            }))

            navigate('/tech/schedules')

            queryClient.removeQueries({
                queryKey: ['tech_schedule_profile']
            })

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Travel stop failed',
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }

    return (
        <div className="tech-stop-travel-comp">
            <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
                <p style={{ fontSize: '14px', textAlign: 'justify', color: 'var(--text-secondary-2)' }}>
                    Once you submit the reason, a cancellation message will be sent to the customer, and the service will
                    return to the schedule list with a scheduled status, allowing you to create a new visit at a later time.
                </p>
                <Textarea label={'Reason of stop'} type='text' value={form?.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
                <Button label={'Stop Travel'} spinIcon={loading} severity={'danger'} rounded
                    disabled={!form?.reason || form?.reason?.length < 4} />
            </form>
        </div>
    )
}

export default StopTravel