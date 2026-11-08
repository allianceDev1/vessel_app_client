import React, { useMemo } from 'react'
import './payment.scss'
import { useDispatch, useSelector } from 'react-redux';
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service';
import { TbBuildingBank, TbCashBanknote, TbCircleDottedLetterC, TbCoinRupeeFilled, TbShieldCheckFilled, TbWallet, TbX } from 'react-icons/tb';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice';
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers';
import { generateUniqueId } from '../../../../utils/helpers/generate_Id';
import { calculateBillsSummery } from '../../../../utils/helpers/math-equations';
import BillSummery from '../service-form-components/BillSummery';
import PaymentMethods from '../service-form-components/PaymentMethods';
import Message from '../../../UI_Primitives/message/Message'
import InputText from '../../../UI_Primitives/inputs/InputText';
import TextArea from '../../../UI_Primitives/inputs/TextArea';
import Button from '../../../UI_Primitives/buttons/Button';
import SubmitForm from '../service-form-components/payment/SubmitForm';
import { toStandardText } from '../../../../utils/helpers/text-formatting';


const Payment = ({ pageKey }) => {
    const dispatch = useDispatch();
    const { review, payment, verification } = useSelector((state) => state.application)

    const setVerificationType = (type) => {
        dispatch(sfActions.updateVerification({
            verification_type: type,
            is_verified: false,
            verification_at: null
        }))
    }

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

            if (grandTotal < paidAmount) {
                dispatch(toast.push({
                    type: 'danger',
                    head: 'Amount not correct',
                    message: 'Entered amount must not exceed the total amount'
                }))

                return;
            }

            if (grandTotal !== (balanceAmount + paidAmount)) {
                dispatch(toast.push({
                    type: 'danger',
                    head: 'Amount not correct',
                    message: 'Entered amount must not exceed the total amount'
                }))

                return;
            }

            if (balanceAmount && (!payment?.balance_payment_date || !payment?.balance_payment_reason)) {
                dispatch(toast.push({
                    type: "danger",
                    head: "Something Missing",
                    message: 'Enter balance payment date and reason'
                }))
                return;
            }

        }

        // Confirm
        const modalId = generateUniqueId(6)
        dispatch(modal.push({
            id: modalId,
            title: " ",
            body: <SubmitForm modalId={modalId} unenablePayment={!review?.is_ready_to_pay && grandTotal > 0} />,
            freezeClose: true
        }))
    }

    const { grandTotal, paidAmount, balanceAmount, complimentAmount } = useMemo(() => {
        const grandTotal = calculateBillsSummery(
            review?.bills ?? [],
            review?.zero_fee_items ?? []
        )

        const complimentAmount = payment?.compliment_amount ?? 0
        let complimentTakes = 0
        let enteredAmount = 0

        if (complimentAmount > 0 && grandTotal > 0) {
            enteredAmount = Math.min(complimentAmount, grandTotal)
            complimentTakes = enteredAmount
        }

        const otherMethodAmounts = payment?.payment_methods?.reduce((acc, cur) => acc + Number(cur?.amount || 0), 0) || 0
        enteredAmount += (otherMethodAmounts ?? 0)
        const balance = grandTotal - enteredAmount

        return {
            grandTotal: grandTotal ?? 0,
            paidAmount: enteredAmount ?? 0,
            balanceAmount: balance ?? 0,
            complimentAmount: complimentTakes
        }

    }, [payment, review])


    return (
        <div className="tech-service-form-page sf-page-four">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            {/* Summery */}
            <BillSummery />

            {/* Verification */}
            <div className="verification-container">
                <div>
                    <TbShieldCheckFilled />
                    <p>Service verified by {toStandardText(verification?.verification_type)}</p>
                </div>
                <div>
                    {verification?.verification_type !== 'OTP' &&
                        <p className='action' onClick={() => setVerificationType('OTP')}>Use OTP ?</p>}
                </div>
            </div>


            {/* Payment methods */}
            {(grandTotal > 0 && review?.is_ready_to_pay) ? <div className="payment-container">
                <h3 className='sub-title'>Payment Methods</h3>
                <div className="payments-list">
                    {complimentAmount ? <div className="payment-item" >
                        <div className="icon">
                            <TbWallet />
                        </div>
                        <div className="text">
                            <h4>₹ {complimentAmount ?? 0}</h4>
                            <p>Wallet</p>
                        </div>
                    </div> : ''}

                    {payment?.payment_methods?.map((pay) => {
                        return <div className="payment-item" key={pay?.unique_id}>
                            <div className="icon">
                                {pay?.method === "BANK" && <TbBuildingBank />}
                                {pay?.method === "CHEQUE" && <TbCircleDottedLetterC />}
                                {pay?.method === "CASH" && <TbCashBanknote />}
                            </div>
                            <div className="text">
                                <h4>
                                    ₹ {pay?.amount}
                                </h4>
                                <p>
                                    {pay?.method === "BANK" && "Bank Transfer"}
                                    {pay?.method === "CHEQUE" && "Cheque"}
                                    {pay?.method === "CASH" && "Cash On Service"}
                                </p>
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

                {paidAmount > 0 && <>
                    {paidAmount > grandTotal && <Message type={'warning'} head={'Alert'}
                        message={'Entered amount must not exceed the total amount.'} style={{ marginTop: '10px' }} />}
                </>}
            </div> : ''}

            {/* Balance Amount */}
            {balanceAmount > 0 && review?.is_ready_to_pay ? <div className="balance-amount-container">
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
            {(!review?.is_ready_to_pay && grandTotal > 0) &&
                <Message type={'info'}
                    head={'Payment Not Enabled'}
                    message={'The current service is not closed yet, so payment collection is not allowed. Payment can be collected only after the work is closed. However, you may collect an advance payment if required.'}
                    style={{ marginTop: '10px' }}
                />}

            {(!review?.is_ready_to_pay && grandTotal > 0) &&
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