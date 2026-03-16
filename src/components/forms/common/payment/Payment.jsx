import React, { useEffect, useState } from 'react'
import './payment.scss'
import PaymentMethods from './PaymentMethods'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Textarea from '../../../UI_Primitives/inputs/TextArea'
import { normalizeMoney } from '../../../../utils/helpers/math-equations'
import { TbBuildingBank, TbCashBanknote, TbCircleDottedLetterC, TbCoinRupeeFilled, TbX } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'



//! The Payment Component Only Call Under the Form Element For working the input validation


const Payment = ({
    receivableAmount = 0,
    state = {},
    setState = () => { }
}) => {

    const dispatch = useDispatch();
    const [balanceAmount, setBalanceAmount] = useState(0)
    const [payments, setPayments] = useState(state?.payments || [])
    const [paymentLater, setPaymentLater] = useState(state?.payment_later || {})

    const handleOpenPaymentMethods = () => {
        dispatch(modal.push({
            title: "Payment Methods",
            body: <PaymentMethods balanceAmount={balanceAmount} payments={payments} setPayments={setPayments} />
        }))
    }

    const handleRemoveMethod = (id) => {
        setPayments((state) => state.filter(p => p?.unique_id !== id))
    }

    const handleChange = (e) => {
        setPaymentLater({
            ...paymentLater,
            [e.target.name]: e.target.value
        })
    }

    useEffect(() => {

        const total = Number(receivableAmount) || 0
        const enteredAmount = payments?.reduce((acc, cur) => acc + Number(cur?.amount || 0), 0) || 0
        const balance = total - enteredAmount
        setBalanceAmount(balance)

        setState({
            receivable_amount: receivableAmount,
            paid_amount: enteredAmount,
            balance_amount: balance,
            payments: payments,
            payment_later: paymentLater
        })

    }, [payments, paymentLater])

    return (
        <div className="payment-form-container">

            {/* Summery */}
            <div className="summery">
                <p>Receivable Amount</p>
                <p>₹{normalizeMoney(receivableAmount)}</p>
            </div>

            {/* Payment Option */}
            <div className="payment-container">
                <h3 className='sub-title'>Payment Methods</h3>
                <div className="payments-list">
                    {payments?.map((pay) => {
                        return <div className="payment-item" key={pay?.unique_id}>
                            <div className="icon">
                                {pay?.method === "BANK" && <TbBuildingBank />}
                                {pay?.method === "CHEQUE" && <TbCircleDottedLetterC />}
                                {pay?.method === "CASH" && <TbCashBanknote />}
                            </div>
                            <div className="text">
                                <h4>
                                    {pay?.method === "BANK" && "Bank Transfer"}
                                    {pay?.method === "CHEQUE" && "Cheque"}
                                    {pay?.method === "CASH" && "Cash On Service"}
                                </h4>
                                <p>₹{pay?.amount}</p>
                            </div>
                            <div className="action" onClick={() => handleRemoveMethod(pay?.unique_id)}>
                                <TbX />
                            </div>
                        </div>
                    })}
                </div>

                {balanceAmount > 0 && <div className="payment-choose" onClick={handleOpenPaymentMethods}>
                    <h3>Select Payment Method</h3>
                    <TbCoinRupeeFilled />
                </div>}

                {/* Balance Amount */}
                {balanceAmount > 0 ?
                    <div className="balance-amount-container">
                        <h3 className='sub-title'>Balance Amount</h3>
                        <div className="balance-form-div">
                            <InputText label={'Balance Amount'} value={balanceAmount || 0} disabled />
                            <InputText label={'Next Payment Date'} name={'balance_payment_date'} required
                                value={paymentLater?.balance_payment_date} onChange={handleChange} type='date'
                                min={isoToYYYYMMDD(new Date())} />
                            <Textarea label={'Reason'} name={'balance_payment_reason'} value={paymentLater?.balance_payment_reason}
                                required onChange={handleChange} />
                        </div>
                    </div>
                    : ""}
            </div>
        </div>
    )
}

export default Payment