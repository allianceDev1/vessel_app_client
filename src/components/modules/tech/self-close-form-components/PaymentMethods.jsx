import React, { useState } from 'react'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'


const PaymentMethods = ({ payment, setPayment }) => {
    const dispatch = useDispatch();

    const [form, setForm] = useState({})
    const methods = [
        { label: 'Bank Transfer', value: "BANK" },
        { label: 'Cheque', value: "CHEQUE" },
        { label: 'Cash On Service', value: "CASH" }
    ]




    
    const handleChange = (e) => {
        if (e.target.name === 'method') {
            setForm({ [e.target.name]: e.target.value })
            return;
        }
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleAddMethod = (e) => {
        e.preventDefault();

        // check the method already selected
        if (payment?.payment_methods?.filter(p => p?.method === form?.method)?.length) {
            dispatch(toast.push({
                type: 'danger',
                message: 'The method already selected.'
            }))

            return;
        }

        setPayment((state) => ({
            ...state,
            payment_methods: [...(state?.payment_methods || []), {
                unique_id: new Date().getTime(),
                method: form?.method,
                amount: form?.amount,
                txn_id: form?.txn_id,
                cheque_no: form?.cheque_no,
                bank_name: form?.bank_name,
                cheque_date: form?.cheque_date
            }]
        }))

        dispatch(modal.pull.all())
    }


    return (
        <div className="tech-payment-method-comp-container">
            <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleAddMethod}>
                <Select label={'Payment Method'} name={'method'} value={form?.method} options={[{}, ...methods]}
                    onChange={handleChange} required />
                <InputText label={'Amount'} name={'amount'} type='number' value={form?.amount} required
                    onChange={handleChange} min={0} />

                {/* Bank */}
                {form?.method === 'BANK' &&
                    <InputText label={'Transaction ID'} name={'txn_id'} type='text' value={form?.txn_id} required onChange={handleChange} />
                }

                {/* Cheque */}
                {form?.method === 'CHEQUE' && <>
                    <InputText label={'Cheque No'} name={'cheque_no'} type='text' value={form?.cheque_no} required onChange={handleChange} />
                    <InputText label={'Bank Name'} name={'bank_name'} type='text' value={form?.bank_name} required onChange={handleChange} />
                    <InputText label={'Cheque Date'} name={'cheque_date'} type='date' value={form?.cheque_date} required onChange={handleChange}
                        min={isoToYYYYMMDD(new Date())} />
                </>}

                {/* Button */}
                <Button label={'Add Method'} rounded style={{ marginTop: '20px', width: '100%' }} />


            </form>
        </div>
    )
}

export default PaymentMethods