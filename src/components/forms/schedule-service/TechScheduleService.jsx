import React, { useState } from 'react'
import InputText from '../../UI_Primitives/inputs/InputText'
import Button from '../../UI_Primitives/buttons/Button'
import { api } from '../../../api'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useNavigate } from 'react-router-dom'
import { isoToYYYYMMDD } from '../../../utils/helpers/date-helpers'

const TechScheduleService = ({ registrationId, customerId, serviceType }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState('')
    const [form, setForm] = useState({ date: null, fromTime: null, endTime: null })


    const handleSubmit = async (e) => {
        e.preventDefault();

        const startTime = new Date(`${form?.date} ${form?.fromTime}`)
        const endTime = new Date(`${form?.date} ${form?.endTime}`)

        try {
            setLoading('submit')

            await api.vfTv2Axios.post(`/registered-service/schedule`, {
                registration_id: registrationId || null,
                customer_id: customerId,
                service_type: serviceType,
                schedule_slot_start_at: startTime,
                schedule_slot_finish_at: endTime
            })

            dispatch(modal.pull.all())

            dispatch(toast.push({
                type: 'success',
                head: 'Your work scheduled'
            }))

            navigate(-1)

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Service schedule failed',
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }


    return (
        <div className="tech-schedule-service-comp">
            <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
                <InputText label={'Schedule Date'} type='date' value={form?.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required min={isoToYYYYMMDD(new Date())} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <InputText label={'Start Time'} type='time' value={form?.fromTime} onChange={(e) => setForm({ ...form, fromTime: e.target.value })}
                        required max={form?.endTime} />
                    <InputText label={'End Time'} type='time' value={form?.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                        required min={form?.fromTime} />
                </div>
                <Button label={'Schedule work'} loading={loading} severity={'primary'} rounded
                    disabled={!form?.date || !form?.fromTime || !form?.endTime} />
            </form>
        </div>
    )
}

export default TechScheduleService