import React, { useMemo } from 'react'
import '../service-form-pages/payment.scss'
import { useDispatch } from 'react-redux';
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service';
import { TbBuildingBank, TbCashBanknote, TbCircleDottedLetterC, TbCoinRupeeFilled, TbWallet, TbX } from 'react-icons/tb';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers';
import { generateUniqueId } from '../../../../utils/helpers/generate_Id';
import { calculateBillsSummery } from '../../../../utils/helpers/math-equations';
import BillSummery from '../self-close-form-components/BillSummery';
import PaymentMethods from '../self-close-form-components/PaymentMethods';
import Message from '../../../UI_Primitives/message/Message'
import InputText from '../../../UI_Primitives/inputs/InputText';
import TextArea from '../../../UI_Primitives/inputs/TextArea';
import Button from '../../../UI_Primitives/buttons/Button';
import SubmitForm from '../self-close-form-components/payment/SubmitForm';


const Payment = ({ pageKey, review, payment, setPayment }) => {

    const dispatch = useDispatch();


    const handleOpenPaymentMethods = () => {
        dispatch(modal.push({
            title: "Payment Methods",
            body: <PaymentMethods payment={payment} setPayment={setPayment} />
        }))
    }

    const handleRemoveMethod = (id) => {
        setPayment((state) => ({
            ...state,
            payment_methods: state?.payment_methods?.filter(p => p?.unique_id !== id)
        }))
    }

    const handleChange = (e) => {
        setPayment((state) => ({
            ...state,
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
            body: <SubmitForm modalId={modalId} unenablePayment={!review?.is_ready_to_pay && grandTotal > 0}
                review={review} payment={payment} />,
            freezeClose: true
        }))
    }



    const { grandTotal, paidAmount, balanceAmount, complimentAmount } = useMemo(() => {
        const grandTotal = calculateBillsSummery(
            review?.bills ?? [],
            review?.zero_fee_items ?? []
        )

        const complimentAmount = payment?.compliment_amount ?? 0
        const otherMethodAmounts = payment?.payment_methods?.reduce((acc, cur) => acc + Number(cur?.amount || 0), 0) || 0
        const enteredAmount = (otherMethodAmounts || 0) + complimentAmount
        const balance = grandTotal - enteredAmount

        return {
            grandTotal: grandTotal ?? 0,
            paidAmount: enteredAmount ?? 0,
            balanceAmount: balance ?? 0,
            complimentAmount
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
            <BillSummery review={review} />

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

            {/* Submit */}
            <Button label={'Complete Service'} rounded style={{ width: '100%', marginTop: '20px' }}
                severity={'primary'} onClick={handleSubmit} />

        </div>
    )
}

export default Payment