import React, { useEffect, useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import Select from '../../../UI_Primitives/inputs/Select'
import { api } from '../../../../api'
import { listInactiveAreaWorker } from '../../../../utils/services/area_service'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useQuery, useQueryClient } from '@tanstack/react-query'


const AddAreaTech = ({ cityId, activeWorkers, setData }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState('fetch')
    const [form, setForm] = useState({})
    const queryClient = useQueryClient();


    const {
        data: techList,
        isLoading: techLoading
    } = useQuery({
        queryKey: ['vessel_staff_list', 'name_only'],
        queryFn: async () => {
            const res = await api.ttPv2Axios('/worker/account/list?nameOnly=Yes')
            return res
        },
        staleTime: 10 * 60_000
    })


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

            queryClient.setQueryData(
                ['branch_area_details', cityId],
                (oldData) => {
                    if (!oldData) return oldData;

                    const selectedWorker = techList.filter(w => w.worker_uuid === form?.worker_uuid)[0]
                  
                    return {
                        ...oldData,
                        vf_technicians: [
                            {
                                worker_uuid: form?.worker_uuid,
                                full_name: selectedWorker?.full_name,
                                from_date: form?.from_date,
                                to_date: form?.to_date,
                                is_deleted: false
                            },
                            ...(oldData?.vf_technicians || [])
                        ]
                    };
                }
            );

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

    // loading
    if (techLoading) {
        return <div className="">
            <SkeletonGrid rows={4} columns={1} height={50} />
        </div>
    }

    return (
        <div className="update-area-tech-comp">
            <form action="" style={{ display: 'flex', flexDirection: "column", gap: '10px' }} onSubmit={handleSubmit}>
                <Select label={'Worker'} name={'worker_uuid'} value={form?.worker_uuid} onChange={handleChange}
                    options={[{}, ...techList?.map(t => ({ label: t.full_name, value: t.worker_uuid }))]} required />
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