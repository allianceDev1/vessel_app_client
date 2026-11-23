import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useNavigate } from 'react-router-dom'
import { addDurationToDate, dateToDateTimeLocal, validateScheduleDateTime } from '../../../../utils/helpers/date-helpers'
import { useQueryClient } from '@tanstack/react-query'

const RescheduleService = ({ registrationId, isController = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState('')
  const [form, setForm] = useState({ dateTime: '', reason: '' })
  const queryClient = useQueryClient()

  const timeError = validateScheduleDateTime(form.dateTime, 6, 21)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (timeError) return;

    const startTime = new Date(form.dateTime)
    if (isNaN(startTime.getTime())) return;
    const endTime = addDurationToDate(startTime, { minutes: 30 })

    try {
      setLoading('submit')

      if (isController) {

        await api.ssCv2Axios.patch(`/service-registration/${registrationId}/reschedule`, {
          schedule_slot_start_at: startTime.toISOString(),
          schedule_slot_finish_at: endTime.toISOString(),
          reason: form.reason
        })

        dispatch(toast.push({
          type: 'success',
          head: 'Work rescheduled'
        }))

        queryClient.invalidateQueries({
          queryKey: ['registration_info_controller', registrationId]
        })

        dispatch(modal.pull.all())

      } else {
        await api.ssTv2Axios.patch(`/registered-service/${registrationId}/reschedule`, {
          schedule_slot_start_at: startTime.toISOString(),
          schedule_slot_finish_at: endTime.toISOString(),
          reason: form.reason
        })

        dispatch(toast.push({
          type: 'success',
          head: 'Your work rescheduled'
        }))

        dispatch(modal.pull.all())
        navigate('/tech/schedules')
      }

    } catch (error) {
      dispatch(toast.push({
        type: 'danger',
        head: 'Service reschedule failed',
        message: error.message,
      }))
    } finally {
      setLoading('')
    }
  }


  return (
    <div className="tech-reschedule-service-comp">
      <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
        <InputText label={'New schedule Date & Time'} type='datetime-local' value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
          required min={dateToDateTimeLocal(new Date())} error={timeError} helperText={'Choose schedule date and start time only'} />
        <InputText label={'Reason of reschedule'} type='text' value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
          required />
        <Button label={'Reschedule work'} spinIcon={loading} severity={'primary'} rounded
          disabled={!form.dateTime || Boolean(timeError) || (form.reason?.length || 0) < 4} />
      </form>
    </div>
  )
}

export default RescheduleService