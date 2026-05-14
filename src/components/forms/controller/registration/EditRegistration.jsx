import React, { useEffect, useState } from 'react'
import './service-registration.scss'
import { vfCv2Axios } from '../../../../api/axios/axiosConfig'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SERVICE_PRIORITY_TEXT, SERVICE_TYPES } from '../../../../assets/javascript/pre_data/service'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { serviceRegistration } from '../../../../utils/validators/registration'
import { api } from '../../../../api'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { TbRegistered } from 'react-icons/tb'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Select from '../../../UI_Primitives/inputs/Select'
import MultiSelect from '../../../UI_Primitives/inputs/MultiSelect'
import InputPhoneNumber from '../../../UI_Primitives/inputs/InputPhoneNumber'
import Checkbox from '../../../UI_Primitives/inputs/Checkbox'
import TextArea from '../../../UI_Primitives/inputs/TextArea'
import Button from '../../../UI_Primitives/buttons/Button'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'



const EditRegistration = ({ regNo, initialData }) => {
    const dispatch = useDispatch()
    const [form, setForm] = useState({})
    const [vErr, setVErr] = useState({})
    const [loading, setLoading] = useState('')
    const queryClient = useQueryClient()


    const fetchResources = async () => {
        const [workers, inputs] = await Promise.all([
            await vfCv2Axios.get('/resources/service-workers/VESSEL_FILTER'),
            await vfCv2Axios.get('/resources/form-resources?titles=vf_complaint_reasons')
        ])
        return { workers, inputs: inputs?.find(i => i?.title === 'vf_complaint_reasons')?.values?.map(i => i?.data?.[0]) }
    }

    const { data: regData } = useQuery({
        queryKey: ['registration_info_controller', regNo],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get(`/service-registration/registration/${regNo}`)
            return res
        },
        initialData: initialData,
        staleTime: 10_000
    })

    const { data, isLoading, error } = useQuery({
        queryKey: ['registration_resources'],
        queryFn: fetchResources,
        staleTime: 60_000
    })

    useEffect(() => {
        if (regData) {
            setForm({
                service_type: regData?.about?.service_type,
                complaint_category: regData?.about?.complaint_category || [],
                priority: regData?.about?.priority || '1',
                additional_number: regData?.customer?.additional_number || {},
                assigned_technician_uuid: regData?.technician?.worker_uuid || null,
                comment: regData?.about?.comment || null
            })
        }

    }, [regData])


    const handleChange = (e) => {

        switch (e?.target?.name || e?.name) {
            // Multi select
            case 'complaint_category':
                setForm({ ...form, [e.name]: e.selectedValues?.map((c) => c.value) })

                break;

            // Mobile Number
            case 'additional_number':
                setForm({
                    ...form,
                    [e?.name]: e?.number ? { country_code: e?.country_code || null, number: e?.number || null } : undefined
                })
                break;

            // CheckBox
            case 'schedule_with_registration':
                setForm({ ...form, [e.target.name]: !form?.[e.target.name] })
                break;

            default:
                setForm({ ...form, [e.target.name]: e.target.value })
                break;
        }

    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validation = serviceRegistration(form)
        if (!validation?.isValid) {
            setVErr({ ...validation?.errors })
            return;
        } else {
            setVErr({})
        }

        try {
            setLoading('submit')

            const body = {
                service_type: form?.service_type,
                complaint_category: form?.service_type === 'COMPLAINT' ? form?.complaint_category : [],
                priority: Number(form?.priority) || 1,
                assigned_technician_uuid: form?.assigned_technician_uuid || null,
                schedule_with_registration: form?.schedule_with_registration || false,
                schedule_slot_start_at: form?.schedule_with_registration ? new Date(form?.schedule_date + ' ' + form?.start_time) : null,
                schedule_slot_finish_at: form?.schedule_with_registration ? new Date(form?.schedule_date + ' ' + form?.end_time) : null,
                additional_number: form?.additional_number || null,
                comment: form?.comment || null
            }

            await api.cnAv1Axios.put(`/customer/service/registration/${regNo}`, body)

            queryClient.invalidateQueries({
                queryKey: ['registration_info_controller', regNo]
            })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Success!',
                message: 'Registration Updated Successfully'
            }))

        } catch (error) {
            dispatch(toast.push({
                type: "danger",
                head: 'Updating Failed',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading('')
        }
    }

    if (isLoading) {
        return <>
            <SkeletonGrid rows={4} height={'45px'} gap={'10px'} width='100%' />
            <SkeletonGrid rows={1} height={'100px'} gap={'10px'} width='100%' style={{ marginTop: '10px' }} />
            <SkeletonGrid rows={1} height={'45px'} gap={'10px'} width='100%' style={{ marginTop: '10px' }} />
        </>
    }

    if (error) {
        return <ErrorState hight='300px' icon={<TbRegistered />} title={'Resources fetch failed'}
            message={error?.message || 'Something went wrong'} />
    }

    return (
        <div className="service-registration-com-container">
            <form action="" onSubmit={handleSubmit}>
                <div className="info">
                    <h5>Customer ID : {regData?.customer?.customer_id || '____'}</h5>
                    <h3>{regData?.customer?.customer_name || '______'}</h3>
                </div>

                <Select label={'Service Type'} name={'service_type'} required value={form?.service_type || ''} onChange={handleChange}
                    options={[{ label: '', value: '' }, ...SERVICE_TYPES?.map(i => ({ label: toStandardText(i), value: i }))]}
                    disabled={regData?.about?.is_under_rnd} helperText={regData?.about?.is_under_rnd ? 'This work is under R&D' : ''} />

                {form?.service_type === 'COMPLAINT' &&
                    <MultiSelect label={'What is the Complaint ?'} name={'complaint_category'} onChange={handleChange}
                        options={(data?.inputs || [])?.map(i => ({ label: i, value: i })) || []} searchable error={vErr.complaint_category}
                        selected={form?.complaint_category?.map(i => ({ label: i, value: i })) || []} />}


                <Select label={'Service Priority'} name={'priority'} required value={form?.priority || ''} onChange={handleChange}
                    options={[{ label: '', value: '' }, ...Object.entries(SERVICE_PRIORITY_TEXT).map(
                        ([key, value]) => ({ label: key, value: value }))]} />

                <InputPhoneNumber label={'Additional Number'} name={'additional_number'} value={`${form?.additional_number?.country_code || ''}${form?.additional_number?.number || ''}`}
                    onChange={handleChange} onlyCountries={['in']} country={'in'} />

                <Select label={'Technicians'} name={'assigned_technician_uuid'} value={form?.assigned_technician_uuid || ''} onChange={handleChange}
                    options={[{ label: '', value: '' }, ...(data?.workers || [])?.map(i => ({ label: i?.worker_name, value: i?.worker_uuid }))]}
                    required={form?.schedule_with_registration || regData?.status?.status > 1} disabled={regData?.status?.status > 3} />

                {regData?.status?.status < 3 && <>
                    {/* Schedule */}
                    <Checkbox label={'Schedule Service'} name={'schedule_with_registration'} onChange={handleChange} checked={form?.schedule_with_registration} />

                    {form?.schedule_with_registration && <>
                        <InputText label={'Schedule Date'} name={'schedule_date'} value={form?.schedule_date || ''} onChange={handleChange} type={'date'}
                            required error={vErr.schedule_date} />

                        <div style={{ display: "grid", gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

                            <InputText label={'Start Time'} name={'start_time'} value={form?.start_time || ''} onChange={handleChange} type={'time'}
                                required error={vErr.start_time} />

                            <InputText label={'End Time'} name={'end_time'} value={form?.end_time || ''} onChange={handleChange} type={'time'}
                                required error={vErr.end_time} />
                        </div>
                    </>}
                </>}

                <TextArea label={'Comments'} name={'comment'} value={form?.comment || ''} onChange={handleChange} />

                <Button label={'Update'} type='submit' style={{ width: '100%' }} severity={'primary'} rounded
                    spinIcon={loading === 'submit'} />
            </form>
        </div>
    )
}

export default EditRegistration