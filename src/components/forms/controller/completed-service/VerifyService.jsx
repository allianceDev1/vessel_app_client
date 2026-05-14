import React, { useState } from 'react'
import Textarea from '../../../UI_Primitives/inputs/TextArea'
import Button from '../../../UI_Primitives/buttons/Button'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { api } from '../../../../api'
import { useQueryClient } from '@tanstack/react-query'

const VerifyService = ({ registrationId, serviceSrlNo, verifyType }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        pending_reason: '',
        comment: ''
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)

        try {

            await api.cnAv1Axios.post('/service-job/manual-verification', {
                product_type: "VESSEL_FILTER",
                registration_id: registrationId,
                service_srl_no: serviceSrlNo,
                verification_type: verifyType,
                pending_reason: form?.pending_reason || '',
                comment: form?.comment || ''
            })

            queryClient.setQueryData(
                ['service_job_view', serviceSrlNo, 'about'],
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        verification: {
                            verified: true,
                            verification_type: verifyType,
                            verified_at: new Date(),
                            verify_by: 'You',
                        }
                    };
                }
            );

            dispatch(toast.push({
                type: 'success',
                head: 'Verification Success'
            }))

            dispatch(modal.pull.all())

        } catch (error) {

            dispatch(toast.push({
                type: 'danger',
                head: 'Verification Failed',
                message: error?.message || 'Something Wrong'
            }))

        } finally {
            setLoading(false)
        }
    }


    return (
        <div>
            <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }} onSubmit={handleSubmit}>
                <Textarea label={"Verification Deny Reason"} name={'pending_reason'} onChange={handleChange}
                    value={form?.pending_reason} required />
                <Textarea label={"Comments"} name={'comment'} onChange={handleChange}
                    value={form?.comment} />
                <Button label={'Complete Verification'} rounded severity={'primary'} disabled={loading}
                    spinIcon={loading} />
            </form>
        </div>
    )
}

export default VerifyService