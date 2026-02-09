import React, { useEffect, useState } from 'react'
import './payment.scss'
import { useDispatch, useSelector } from 'react-redux';
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service';
import BillSummery from '../service-form-components/BillSummery';
import { TbBuildingBank, TbCashBanknote, TbCircleDottedLetterC, TbCoinRupeeFilled, TbWallet, TbX } from 'react-icons/tb';
import { doDialog, modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import PaymentMethods from '../service-form-components/PaymentMethods';
import { sfActions } from '../../../../redux/features/persisted/applicationSlice';
import Message from '../../../UI_Primitives/message/Message'
import InputText from '../../../UI_Primitives/inputs/InputText';
import TextArea from '../../../UI_Primitives/inputs/TextArea';
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers';
import Button from '../../../UI_Primitives/buttons/Button';
import SubmitForm from '../service-form-components/payment/SubmitForm';
import { generateUniqueId } from '../../../../utils/helpers/generate_Id';


const Payment = ({ page, unlockAudio }) => {
    const dispatch = useDispatch();
    const { review, payment } = useSelector((state) => state.application)
    const [grandTotal, setGrandTotal] = useState(0)
    const [paidAmount, setPaidAmount] = useState(0)
    const [balanceAmount, setBalanceAmount] = useState(0)


    const handleOpenPaymentMethods = () => {
        dispatch(modal.push({
            title: "Payment Methods",
            body: <PaymentMethods />
        }))
    }

    const handleRemoveMethod = (id) => {
        dispatch(sfActions.updatePayment({
            ...payment,
            payment_methods: payment?.payment_methods?.filter(p => p?.unique_id !== id)
        }))
    }

    const handleChange = (e) => {
        dispatch(sfActions.updatePayment({
            ...payment,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = () => {

        // Validation
        if (review?.is_ready_to_pay) {
            if (balanceAmount && (!payment?.balance_payment_date || !payment?.balance_payment_reason)) {
                dispatch(toast.push({
                    type: "danger",
                    head: "Validation Error",
                    message: 'Enter balance payment date and reason'
                }))
                return;
            }

            if (grandTotal !== (balanceAmount + paidAmount)) {
                dispatch(toast.push({
                    type: 'danger',
                    head: 'Validation Error',
                    message: 'Entered amount must not exceed the total amount'
                }))

                return;
            }
        }

        unlockAudio();

        // Confirm
        const modalId = generateUniqueId(6)
        dispatch(modal.push({
            id: modalId,
            title: " ",
            body: <SubmitForm modalId={modalId} />,
            freezeClose: true
        }))
    }

    useEffect(() => {
        const totalAmount = payment?.bill_summery?.grand_total || 0
        const compliment = payment?.complement_amount || 0
        const grandAmount = totalAmount - compliment
        setGrandTotal(grandAmount)

        const enteredAmount = payment?.payment_methods?.reduce((acc, cur) => acc + Number(cur?.amount || 0), 0)
        const balance = grandAmount - enteredAmount

        setPaidAmount(enteredAmount)
        setBalanceAmount(balance)

    }, [payment])


    return (
        <div className="tech-service-form-page sf-page-four">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            {/* Summery */}
            <BillSummery expand={false} />

            {/* Payment methods */}
            <div className="payment-container">
                <h3 className='sub-title'>Payment Methods</h3>
                {payment?.payment_methods?.length ? <div className="payments-list">
                    {payment?.payment_methods?.map((pay) => {
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

                </div> : ''}

                {balanceAmount > 0 && <div className="payment-choose" onClick={handleOpenPaymentMethods}>
                    <h3>Select Payment Method</h3>
                    <TbCoinRupeeFilled />
                </div>}

                {paidAmount > 0 && <>
                    {paidAmount > grandTotal && <Message type={'warning'} head={'Alert'}
                        message={'Entered amount must not exceed the total amount.'} style={{ marginTop: '10px' }} />}
                </>}
            </div>

            {/* Balance Amount */}
            {balanceAmount > 0 ? <div className="balance-amount-container">
                <h3 className='sub-title'>Balance Amount</h3>
                <div className="balance-form-div">
                    <InputText label={'Balance Amount'} value={balanceAmount || 0} disabled />
                    <InputText label={'Next Payment Date'} name={'balance_payment_date'} value={payment?.balance_payment_date}
                        required onChange={handleChange} type='date' min={isoToYYYYMMDD(new Date())} />
                    <TextArea label={'Reason'} name={'balance_payment_reason'} value={payment?.balance_payment_reason}
                        required onChange={handleChange} />
                </div>
            </div> : ""}

            {/* Advance Amount */}
            {!review?.is_ready_to_pay &&
                <Message type={'info'}
                    head={'Payment Not Enabled'}
                    message={'The current service is not closed yet, so payment collection is not allowed. Payment can be collected only after the work is closed. However, you may collect an advance payment if required.'}
                    style={{ marginTop: '10px' }}
                />}

            {!review?.is_ready_to_pay &&
                <div className="advance-amount-container">
                    <h3 className='sub-title'>Advance Amount</h3>
                    <p className='info-note'>
                        The advance amount feature is not set up in the software yet. The advance collected from
                        the customer is handled manually by the finance team. Please ensure the advance amount is
                        collected and informed to finance.
                    </p>
                </div>}

            {/* Submit */}
            <Button label={'Complete Service'} rounded style={{ width: '100%', marginTop: '20px' }}
                severity={'primary'} onClick={handleSubmit} />

        </div>
    )
}

export default Payment