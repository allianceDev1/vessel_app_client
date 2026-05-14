import React, { useState } from 'react'
import Textarea from '../../../UI_Primitives/inputs/TextArea'
import Button from '../../../UI_Primitives/buttons/Button'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { api } from '../../../../api'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'

const FreezeUnfreeze = ({ type, packageSrlNo }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const queryClient = useQueryClient()
    const [comment, setComment] = useState('')

    const handelSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await api.vfCv2Axios.post(`/package/${packageSrlNo}/${String(type).toLowerCase()}`, { comment })

            queryClient.invalidateQueries({
                queryKey: ['customer_package_info', packageSrlNo],
            })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Success!',
                message: res?.message
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
        <div className="freeze-comp-form-container">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary-2)' }}>
                Freezing this package will disable all package-based features and services for this customer.
                The package will continue as a normal non-package product until it is unfrozen.
                Please provide a reason/comment before continuing.
            </p>
            <form action="" style={{ marginTop: '15px' }} onSubmit={handelSubmit}>
                <Textarea label={'Comment'} name={'comment'} value={comment} onChange={(e) => setComment(e.target.value)}
                    required />
                <Button style={{ marginTop: '10px', width: '100%' }} label={toStandardText(type)} rounded
                    severity={type === 'FREEZE' ? 'danger' : 'primary'} spinIcon={loading} />
            </form>
        </div>
    )
}

export default FreezeUnfreeze