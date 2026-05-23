import React, { useEffect, useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api';
import { useQueryClient } from '@tanstack/react-query';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';

const ArrayElemCU = ({ uuid, title, stretcher, data, isEditMode = false }) => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false)


    useEffect(() => {

        const formTemp = {}

        if (isEditMode) {
            formTemp.order = (data?.order || '')
        }

        stretcher?.map((s, i) => {
            formTemp[s] = isEditMode ? (data?.data[i] || '') : ''
            return s;
        })

        setForm(formTemp)
        // eslint-disable-next-line
    }, [data, stretcher])


    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading('submit')

            if (isEditMode) {
                // Update

                const { order, ...acc } = form;

                const body = {
                    order,
                    data: Object.values(acc)
                }

                await api.vfCv2Axios.put(`/resources/form-resources/${title}/${uuid}`, body)

            } else {
                // Create New

                const body = {
                    stretcher_model: 'arrayElem',
                    title,
                    data: Object.values(form)
                }

                await api.vfCv2Axios.post(`/resources/form-resources`, body)
            }

            queryClient.refetchQueries({ queryKey: ['resources_values', title] })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Success!',
                message: 'Updated Successfully'
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

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {stretcher?.map((s, i) => {
                    return <InputText label={s} name={s} value={form?.[s]} onChange={handleChange} required />
                })}

                {isEditMode && <InputText label={'Order Index'} type='number' name={'order'} value={form?.order}
                    onChange={handleChange} min={1} required />}

                <Button label={isEditMode ? 'Update' : "Create"} rounded severity={'primary'}
                    spinIcon={loading} disabled={loading} />
            </form>
        </div>
    )
}

export default ArrayElemCU