import React, { useEffect, useState } from 'react'
import InputText from '../../UI_Primitives/inputs/InputText'
import Button from '../../UI_Primitives/buttons/Button'
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid'
import Select from '../../UI_Primitives/inputs/Select'
import { api } from '../../../api'
import { listInactiveAreaWorker } from '../../../utils/services/area_service'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../redux/features/non_persisted/miniSystemSlice'

const AddAreaTech = ({ cityId, activeWorkers, setData }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState('fetch')
    const [form, setForm] = useState({})
    const [workers, setWorkers] = useState([])


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // action
        try {
            setLoading('create')
            await api.vfCv2Axios.post(`/branch-area/${cityId}/technician`, {
                worker_uuid: form?.worker_uuid,
                from_date: form?.from_date,
                to_date: form?.to_date
            })

            const selectedWorker = workers.filter(w => w.value === form?.worker_uuid)[0]

            setData((state) => {
                return {
                    ...state,
                    vf_technicians: [
                        {
                            worker_uuid: form?.worker_uuid,
                            full_name: selectedWorker?.label,
                            from_date: form?.from_date,
                            to_date: form?.to_date,
                            is_deleted: false
                        },
                        ...(state?.vf_technicians || [])
                    ]
                }
            })

            dispatch(modal.pull.all())

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: "Creation failed",
                message: error.message,
            }))
        } finally {
            setLoading('')
        }

    }

    const fetchWorkers = async () => {
        try {
            setLoading('fetch')

            const list = await api.ttPv2Axios.get(`/worker/account/list?nameOnly=Yes`)
            const inactiveList = listInactiveAreaWorker(list.data, activeWorkers)
            setWorkers(inactiveList)

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: "Something went wrong",
                message: error.message,
            }))
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        // initial fetch
        fetchWorkers()
        //eslint-disable-next-line
    }, [])


    // loading
    if (loading === 'fetch') {
        return <div className="">
            <SkeletonGrid rows={4} columns={1} height={50} />
        </div>
    }

    return (
        <div className="update-area-tech-comp">
            <form action="" style={{ display: 'flex', flexDirection: "column", gap: '10px' }} onSubmit={handleSubmit}>
                <Select label={'Worker'} name={'worker_uuid'} value={form?.worker_uuid} onChange={handleChange} options={[{}, ...workers]}
                    required />
                <InputText label={'From date'} type='date' name={'from_date'} value={form?.from_date} onChange={handleChange}
                    required max={form?.to_date || ''} />
                <InputText label={'To date'} type='date' name={'to_date'} value={form?.to_date} onChange={handleChange} required
                    min={form?.from_date || ''} />
                <Button style={{ marginTop: '10px' }} label={'Add to City'} severity={'primary'} rounded spinIcon={loading === 'create' ? true : false} />
            </form>
        </div>
    )
}

export default AddAreaTech