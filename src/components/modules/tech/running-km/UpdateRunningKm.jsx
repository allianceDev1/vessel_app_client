import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api';
import { useDispatch } from 'react-redux';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';

const UpdateRunningKm = ({ data, setData }) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [km, setKm] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)
        // api
        try {
            await api.vfTv2Axios.post('/tech/running-kms/update', {
                date: data?.date,
                value: Number(km)
            })

            setData((state) => {
                const existed = state.find((item) => item?.date === data?.date)
                if (existed) {
                    return state.map((item) => {
                        if (item?.date === data?.date) {
                            return { ...item, value: Number(km) }
                        }
                        return item
                    })
                } else {
                    return [...state, { date: data?.date, value: Number(km) }]
                }
            })

            dispatch(modal.pull.all())
        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                title: "Failed",
                message: error?.message
            }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="tech-running-km-comp-container">
            <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
                <InputText label={'Enter Kilometer'} type='number' min={'0'} value={String(km)} onChange={(e) => setKm(e.target.value)} required />
                <Button label={'Update'} rounded severity={'primary'} style={{ width: '100%' }} spinIcon={loading} />
            </form>
        </div>
    )
}

export default UpdateRunningKm