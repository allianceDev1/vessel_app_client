import React, { useState } from 'react'
import Button from '../../../UI_Primitives/buttons/Button'
import InputText from '../../../UI_Primitives/inputs/InputText'
import { api } from '../../../../api'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { TbCircleCheck } from 'react-icons/tb'



const ForceExpire = ({ packageSrlNo }) => {

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const queryClient = useQueryClient()
    const [text, setText] = useState('');

    
    const handelSubmit = async (e) => {
        e.preventDefault();

        if (text !== 'EXPIRE') {
            return;
        }

        try {
            await api.vfCv2Axios.post(`/package/${packageSrlNo}/force-expire`)

            queryClient.invalidateQueries({
                queryKey: ['customer_package_info', packageSrlNo],
            })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Expired!',
                message: 'The service package expired.'
            }))

        } catch (error) {
            dispatch(toast.push({
                type: "danger",
                head: 'Expire Failed!',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary-2)' }}>
                Force Expire lets you close a package before its package expire.
                If you need to reactivate the package later, you can do so using the Extend Package feature.
                Please provide a reason/comment before continuing.
            </p>
            <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--color-warning)' }}>
                The action does not remove the next service date from the product. Please update the next service date separately in the Product Details section.
            </p>

            <form action="" style={{ marginTop: '15px' }} onSubmit={handelSubmit}>

                <p style={{ marginTop: '30px', fontSize: '13px', color: 'var(--text-secondary-2)', marginBottom: '10px' }}>
                    To expire the service package, Type <b>EXPIRE</b> in the field below to confirm.
                </p>
                <InputText label={'Confirmation'} name={'verify_text'} value={text}
                    required onChange={(e) => setText(e.target.value)} rightIcon={text === 'EXPIRE' && <TbCircleCheck />}
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
                <Button style={{ marginTop: '10px', width: '100%' }} label={'Force Expire'} rounded
                    severity={'danger'} spinIcon={loading} disabled={text !== 'EXPIRE'} />
            </form>
        </div>
    )
}

export default ForceExpire