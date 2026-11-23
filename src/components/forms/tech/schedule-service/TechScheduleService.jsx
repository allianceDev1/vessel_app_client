import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useNavigate } from 'react-router-dom'
import { addDurationToDate, dateToDateTimeLocal, validateScheduleDateTime } from '../../../../utils/helpers/date-helpers'

const getProductType = (products) => {
    const parentTypes = new Set();
    (products || []).forEach((p) => {
        const pType = p?.parent_type;
        const normalized = pType?.toUpperCase();
        if (normalized === 'WATER_PURIFIER' || normalized === 'VESSEL_FILTER') {
            parentTypes.add(normalized);
        }
    });

    if (parentTypes.has('WATER_PURIFIER') && parentTypes.has('VESSEL_FILTER')) {
        return 'DEFAULT';
    }
    if (parentTypes.has('WATER_PURIFIER')) {
        return 'WATER_PURIFIER';
    }
    if (parentTypes.has('VESSEL_FILTER')) {
        return 'VESSEL_FILTER';
    }
    return 'DEFAULT';
};

const TechScheduleService = ({ registrationId, customerId, serviceType, serviceProducts, productType }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState('')
    const [form, setForm] = useState({ dateTime: '' })

    const timeError = validateScheduleDateTime(form.dateTime, 6, 21)

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (timeError) return;

        const startTime = new Date(form.dateTime)
        if (isNaN(startTime.getTime())) return;
        const endTime = addDurationToDate(startTime, { minutes: 30 })

        try {
            setLoading('submit')

            let type = null
            if (productType) {
                type = productType
            } else {
                type = getProductType(serviceProducts);
            }

            await api.cnAv1Axios.post(`/customer/service/technician/schedule`, {
                registration_id: registrationId || null,
                customer_id: customerId,
                product_type: type,
                service_type: serviceType,
                schedule_slot_start_at: startTime.toISOString(),
                schedule_slot_finish_at: endTime.toISOString()
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
                <InputText label={'Schedule Date & Time'} type='datetime-local' value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                    required min={dateToDateTimeLocal(new Date())} error={timeError} helperText={'Choose schedule date and start time only'} />
                <Button label={'Schedule work'} spinIcon={loading} severity={'primary'} rounded
                    disabled={!form.dateTime || Boolean(timeError)} />
            </form>
        </div>
    )
}

export default TechScheduleService