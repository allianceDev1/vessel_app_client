import React, { useState } from 'react'
import InputText from '../../UI_Primitives/inputs/InputText'
import Button from '../../UI_Primitives/buttons/Button'
import { isoToYYYYMMDD } from '../../../utils/helpers/date-helpers'
import { api } from '../../../api'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../redux/features/non_persisted/miniSystemSlice'

const UpdateAreaTech = ({ data, submitAction }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState("")
    const [form, setForm] = useState({
        from_date: data?.from_date ? isoToYYYYMMDD(new Date(data?.from_date)) : null,
        to_date: data?.to_date ? isoToYYYYMMDD(new Date(data?.to_date)) : null
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // action
        try {
            setLoading('update')
            await api.vfCv2Axios.patch(`/branch-area/${data?.city_id}/technician`, {
                worker_uuid: data?.worker_uuid,
                from_date: form?.from_date,
                to_date: form?.to_date
            })

            submitAction(form, data);

            dispatch(modal.pull.all())

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: "Update failed",
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }

    return (
        <div className="update-area-tech-comp">
            <form action="" style={{ display: 'flex', flexDirection: "column", gap: '10px' }} onSubmit={handleSubmit}>
                <InputText label={'Worker'} id={'worker'} value={data?.worker_name} disabled />
                <InputText label={'City name'} id={'city'} value={data?.city_name} disabled />
                <InputText label={'From date'} type='date' name={'from_date'} value={form?.from_date} onChange={handleChange}
                    required max={form?.to_date || ''} />
                <InputText label={'To date'} type='date' name={'to_date'} value={form?.to_date} onChange={handleChange} required
                    min={form?.from_date || ''} />
                <Button style={{ marginTop: '10px' }} label={'Update'} severity={'primary'} rounded spinIcon={loading === 'update' ? true : false} />
            </form>
        </div>
    )
}

export default UpdateAreaTech