import React, { useState } from 'react'
import Button from '../../../UI_Primitives/buttons/Button'
import InputText from '../../../UI_Primitives/inputs/InputText'
import { api } from '../../../../api'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { TbCircleCheck } from 'react-icons/tb'

const SetLastSubscription = ({ packageSrlNo, productId }) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const queryClient = useQueryClient()
    const [text, setText] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (text !== 'APPLY') {
            return
        }

        setLoading(true)

        try {
            const res = await api.vfCv2Axios.post(`/package/${packageSrlNo}/set-last-subscription`)

            // Invalidate package info and product queries
            queryClient.invalidateQueries({
                queryKey: ['customer_package_info', packageSrlNo],
            })
            if (productId) {
                queryClient.invalidateQueries({
                    queryKey: ['controller_customer_product_info', productId],
                })
                queryClient.invalidateQueries({
                    queryKey: ['product_service_package_history', productId],
                })
            }

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: 'success',
                head: 'Success!',
                message: res?.message || 'Package set as last package successfully'
            }))

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Action Failed!',
                message: error?.message || 'Failed to set as last subscription'
            }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                Setting this subscription as the <b>Last Subscription</b> will mark it as the most recent expired subscription record for the associated product.
            </p>
            <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--color-warning)' }}>
                This updates the product's last package reference, which affects renewal contexts, package extension eligibility, and service history tracking.
            </p>

            <form style={{ marginTop: '15px' }} onSubmit={handleSubmit}>
                <p style={{ marginTop: '25px', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                    To confirm this action, Type <b>APPLY</b> in the field below.
                </p>
                <InputText
                    label={'Confirmation'}
                    name={'verify_text'}
                    value={text}
                    required
                    onChange={(e) => setText(e.target.value)}
                    rightIcon={text === 'APPLY' && <TbCircleCheck />}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    autoComplete={'off'}
                    onKeyDown={(e) => {
                        if (
                            (e.ctrlKey || e.metaKey) &&
                            ['c', 'v', 'x'].includes(e.key.toLowerCase())
                        ) {
                            e.preventDefault()
                        }
                    }}
                />
                <Button
                    style={{ marginTop: '15px', width: '100%' }}
                    label={'Set Last Subscription'}
                    rounded
                    severity={'primary'}
                    spinIcon={loading}
                    disabled={loading || text !== 'APPLY'}
                />
            </form>
        </div>
    )
}

export default SetLastSubscription
