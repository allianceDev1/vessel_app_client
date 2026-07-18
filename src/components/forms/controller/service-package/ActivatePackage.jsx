import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button';
import { TbCircleCheck } from 'react-icons/tb';
import { api } from '../../../../api';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';

const ActivatePackage = ({ packageSrlNo }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (text !== 'ACTIVATE') {
            return;
        }

        try {
            const res = await api.vfCv2Axios.post(`/package/${packageSrlNo}/activate`)

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
                head: 'Activation Failed',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary-2)' }}>
                This package is currently not activated. You can force activate the package. The package can only be activated if no other package is currently active.
                Once activated, the package status cannot be changed back to Pending.
            </p>

            <p style={{ marginTop: '30px', fontSize: '13px', color: 'var(--text-secondary-2)' }}>
                To activate the package, Type <b>ACTIVATE</b> in the field below to confirm.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <InputText label={'Confirmation'} name={'verify_text'} value={text}
                    required onChange={(e) => setText(e.target.value)} rightIcon={text === 'ACTIVATE' && <TbCircleCheck />}
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
                <Button label={'Activate Package'} rounded severity={'success'} spinIcon={loading} disabled={text !== 'ACTIVATE'} />
            </form>
        </div>
    )
}

export default ActivatePackage