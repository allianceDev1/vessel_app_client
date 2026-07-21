import React, { useState } from 'react'
import './package-extend.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import TextArea from '../../../UI_Primitives/inputs/TextArea'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbCircleCheck } from 'react-icons/tb'
import { api } from '../../../../api'
import { useQueryClient } from '@tanstack/react-query'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'

const ClearOverdue = ({ expireDate, packageSrlNo }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({})
    const queryClient = useQueryClient()




    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.verify_text !== 'CLEAR') {
            return;
        }

        setLoading(true)

        try {
            await api.vfCv2Axios.post(`/package/${packageSrlNo}/clear-overdue`, {
                comment: form?.comment
            })

            queryClient.invalidateQueries({
                queryKey: ['customer_package_info', packageSrlNo],
            })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Successfully Cleared!',
                message: 'The package cleared from overdue list'
            }))

        } catch (error) {
            dispatch(toast.push({
                type: "danger",
                head: 'Updating Failed',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading(false)
        }

    }

    return (
        <div className="package-extension-comp-form-container">

            <p>This package has expired with pending service(s). Clearing the overdue status will remove the overdue
                flag and no further overdue alerts will be shown for this package. This action cannot be undone.</p>


            <form action="" onSubmit={handleSubmit}>
                <TextArea label={'Comment'} name={'comment'} value={form?.comment} required onChange={handleChange} />

                <p style={{ marginTop: '10px' }}>
                    To proceed the action, Type <b>CLEAR</b> in the field below to confirm.
                </p>
                <InputText label={'Confirmation'} name={'verify_text'} value={form?.verify_text}
                    required onChange={handleChange} rightIcon={form?.verify_text === 'CLEAR' && <TbCircleCheck />}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    autoComplete={'off'}
                    onKeyDown={(e) => {
                        if (
                            (e.ctrlKey || e.metaKey) &&
                            ["c", "v", "x"].includes(e.key.toLowerCase())
                        ) {
                            e.preventDefault()
                        }
                    }} />
                <Button label={'Clear Overdue'} rounded
                    severity={'danger'} spinIcon={loading} disabled={loading || !form?.comment || form.verify_text !== 'CLEAR'} />
            </form>
        </div>
    )
}

export default ClearOverdue