import React, { useEffect, useState } from 'react'
import './style.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api';
import { useQueryClient } from '@tanstack/react-query';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import { TbCircleX, TbSend } from 'react-icons/tb';

const Array3ElemCU = ({ uuid, title, stretcher, data, isEditMode = false }) => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false)
    const [sectionForm, setSectionForm] = useState({})


    useEffect(() => {

        const formTemp = {}

        if (isEditMode) {
            formTemp.order = (data?.order || '')
        }

        stretcher?.map((s, i) => {
            if (i === 0) {
                formTemp[s] = isEditMode ? (data?.data[i] || '') : ''
            } else {
                formTemp[s] = isEditMode ? (data?.data[i] || []) : []
            }
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

    const handleChangeSection = (e) => {
        setSectionForm({
            ...sectionForm,
            [e.target.name]: e.target.value
        })
    }

    const handleSectionButton = (type) => {

        if (!sectionForm?.[type]) {
            return;
        }

        const isExisted = (form?.[type] || [])?.find(i => i === sectionForm?.[type])

        if (isExisted) {
            dispatch(toast.push({
                type: "danger",
                head: "The option already exited",
                message: "Choose different option"
            }))
            return;
        }

        setForm({
            ...form,
            [type]: [
                ...(form?.[type] || []),
                sectionForm?.[type]
            ]
        })

        setSectionForm({
            ...sectionForm,
            [type]: ''
        })

    }

    const handleRemoveSectionItems = (type, value) => {
        setForm({
            ...form,
            [type]: (form?.[type] || [])?.filter(v => v !== value)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const { order, ...acc } = form;
        const values = Object.values(acc);

        let unFillFlag = false
        values?.map(v => {
            if (!v.length) {
                unFillFlag = true
            }
            return v
        })

        if (unFillFlag) {
            dispatch(toast.push({
                type: "danger",
                head: 'You have not completed fields',
                message: 'All Fields are required. Place Fill'
            }))
            return;
        }

        // Do
        try {
            setLoading('submit');

            if (isEditMode) {
                // Update

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
        <div className='array-3-element-form-container'>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {stretcher?.map((s, i) => {
                    if (i === 0) {
                        return <InputText label={s} name={s} value={form?.[s]} onChange={handleChange} required />
                    }
                    return <div className='multi-list-input'>
                        <label>{s}</label>
                        {form?.[s]?.length > 0
                            ? <div className="list">
                                {form?.[s]?.map((value) => {
                                    return <div className="item">
                                        <p>{value}</p>
                                        <TbCircleX onClick={() => handleRemoveSectionItems(s, value)} />
                                    </div>
                                })}
                            </div>
                            : <div className='no-item'>
                                <p>Add Options</p>
                            </div>}

                        <div className="action">
                            <InputText size='small' label={s} name={s} value={sectionForm?.[s]} onChange={handleChangeSection} />
                            <Button type='button' label={<TbSend />} rounded outlined size='small' onClick={() => handleSectionButton(s)} />
                        </div>
                    </div>
                })}

                {isEditMode && <InputText label={'Order Index'} type='number' name={'order'} value={form?.order}
                    onChange={handleChange} min={1} required />}

                <Button label={isEditMode ? 'Update' : "Create"} rounded severity={'primary'}
                    spinIcon={loading} disabled={loading} />
            </form>
        </div>
    )
}

export default Array3ElemCU