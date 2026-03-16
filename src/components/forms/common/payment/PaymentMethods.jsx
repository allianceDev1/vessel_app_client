import React, { useState } from 'react'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import { useDispatch } from 'react-redux'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'


const PaymentMethods = ({ balanceAmount, payments, setPayments }) => {
    const dispatch = useDispatch();
    const [formValid, setFormValid] = useState({})
    const [form, setForm] = useState({
        amount: balanceAmount
    })

    const methods = [
        { label: 'Bank Transfer', value: "BANK" },
        { label: 'Cheque', value: "CHEQUE" },
        { label: 'Cash On Service', value: "CASH" }
    ]

    const handleChange = (e) => {
        // Method
        if (e.target.name === 'method') {
            setForm({
                [e.target.name]: e.target.value,
                amount: balanceAmount
            })
            return;
        }

        // Amount
        if (e.target.name === 'amount') {
            if (!/^\d*\.?\d{0,2}$/.test(e.target.value)) return;
            if (Number(e.target.value) > balanceAmount) return;

            setForm({ ...form, [e.target.name]: e.target.value })
            return;
        }

        // Other
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleAddMethod = (e) => {
        e.preventDefault();

        // check the method already selected
        if (payments?.filter(p => p?.method === form?.method)?.length) {
            setFormValid({ method: 'The method already selected.' })
            return;
        }

        setPayments((state) => [
            ...state,
            {
                unique_id: new Date().getTime(),
                method: form?.method,
                amount: form?.amount,
                transaction_id: form?.transaction_id,
                cheque_no: form?.cheque_no,
                bank_name: form?.bank_name,
                cheque_date: form?.cheque_date
            }
        ])

        dispatch(modal.pull.all())
    }


    return (
        <div className="payment-methods-container">
            <form action="" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleAddMethod}>
                <Select label={'Payment Method'} name={'method'} value={form?.method} options={[{}, ...methods]}
                    onChange={handleChange} required error={formValid?.method} />
                <InputText label={'Amount'} name={'amount'} type='number' value={form?.amount} required
                    onChange={handleChange} min={0} max={balanceAmount} inputMode='decimal' step="any"
                    onKeyDown={(e) => {
                        if (['-', '+', 'e', 'E'].includes(e.key)) {
                            e.preventDefault();
                        }
                    }} />

                {/* Bank */}
                {form?.method === 'BANK' &&
                    <InputText label={'Transaction ID'} name={'transaction_id'} type='text' value={form?.transaction_id} required onChange={handleChange} />
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