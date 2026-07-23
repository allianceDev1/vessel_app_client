import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button';
import { TbCircleCheck, TbFlagShare } from 'react-icons/tb';
import { api } from '../../../../api';
import { useDispatch } from 'react-redux';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';


const TransferOwnership = ({ status, productId, customerId }) => {
    const [form, setForm] = useState({
        product_id: productId,
        from_customer_id: customerId,
        to_customer_id: '',
        reason: ''
    })
    const dispatch = useDispatch();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)

        if (text !== 'TRANSFER' || !form?.to_customer_id || !form?.reason) {
            return;
        }

        try {
           await api.vfCv2Axios.post(`/product/transfer`, form)

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Ownership Transferred',
                message: `Ownership transferred successfully to the Customer ID: ${form?.to_customer_id}`
            }))

        } catch (error) {
            dispatch(toast.push({
                type: "danger",
                head: 'Transfer Failed',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary-2)' }}>
                By transferring the ownership of this product to a new Customer ID, only the product's current ownership details,
                active warranty information, and any available service packages will be transferred.
            </p>

            <p style={{ marginTop: '15px', fontSize: '13px', color: 'var(--text-secondary-2)' }}>
                The following records will not be transferred and will remain associated with the previous customer:
                previous service job records, R&D work reports, postponement records and related logs.
                All historical data will continue to be linked to the original Customer ID to maintain data integrity and
                traceability.
            </p>


            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", gap: '10px', }}>
                    <InputText label={'Product Id'} value={form?.product_id} disabled />
                    <InputText label={'Current Customer Id'} value={form?.from_customer_id} disabled />
                </div>

                <InputText label={'Transfer To Customer Id'} value={form?.to_customer_id} name={'to_customer_id'}
                    onChange={handleChange} required type='number' />
                <InputText label={'Reason'} value={form?.reason} name={'reason'} onChange={handleChange} required />

                <p style={{ fontSize: '13px', color: 'var(--color-warning)' }}>
                    The transfer may take up to 5 minutes to be reflected across all systems.
                </p>
                <p style={{ marginTop: '30px', fontSize: '13px', color: 'var(--text-secondary-2)' }}>
                    To proceed, Type <b>TRANSFER</b> in the field below to confirm.
                </p>
                <InputText label={'Confirmation'} name={'verify_text'} value={text}
                    required onChange={(e) => setText(e.target.value)} rightIcon={text === 'TRANSFER' && <TbCircleCheck />}
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
                <Button
                    label={'Transfer Ownership'}
                    icon={<TbFlagShare />}
                    severity={'danger'} 
                    rounded disabled={text !== "TRANSFER" || !form?.to_customer_id || !form?.reason}
                    spinIcon={loading}
                />
            </form>
        </div >
    )
}

export default TransferOwnership