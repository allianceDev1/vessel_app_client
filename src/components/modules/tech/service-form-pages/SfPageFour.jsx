import React, { useEffect, useState } from 'react'
import './sf-page-four.scss'
import { useDispatch, useSelector } from 'react-redux';
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service';
import BillSummery from '../service-form-components/BillSummery';
import { TbBuildingBank, TbCashBanknote, TbCircleDottedLetterC, TbCoinRupeeFilled, TbWallet, TbX } from 'react-icons/tb';
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import PaymentMethods from '../service-form-components/PaymentMethods';
import { sfActions } from '../../../../redux/features/persisted/applicationSlice';
import Message from '../../../UI_Primitives/message/Message'


const SfPageFour = ({ page }) => {
    const dispatch = useDispatch();
    const { payment } = useSelector((state) => state.application)
    const [grandTotal, setGrandTotal] = useState(0)
    const [paidAmount, setPaidAmount] = useState(0)
    const [balanceAmount, setBalanceAmount] = useState(0)
    const [nonClearAmount, setNonClearAmount] = useState(0)
    const [methods, setMethods] = useState([])


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


    useEffect(() => {
        const totalAmount = payment?.bill_summery?.grand_total || 0
        const compliment = payment?.complement_amount || 0
        setGrandTotal(totalAmount - compliment)

        const enteredAmount = payment?.payment_methods?.reduce((acc, cur) => acc + Number(cur?.amount || 0), 0)
        const balance = totalAmount - enteredAmount


        setPaidAmount(enteredAmount)
        setBalanceAmount(totalAmount - enteredAmount)


    }, [payment])



    return (
        <div className="tech-service-form-page sf-page-four">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            {/* Summery */}
            <BillSummery fill />

            {/* Payment methods */}
            {/* <div className="payment-container">
                <h3 className='title'>Payment Methods</h3>
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

                <div className="payment-choose" onClick={handleOpenPaymentMethods}>
                    <h3>Select Payment Method</h3>
                    <TbCoinRupeeFilled />
                </div>

                {paidAmount > 0 && <>
                    {paidAmount > grandTotal && <Message type={'warning'} head={'Alert'}
                        message={'Entered amount must not exceed the total amount.'} style={{ marginTop: '10px' }} />}
                </>}
            </div> */}

            {/* Balance Amount */}
            {/* Advance Amount */}
            <div className="advance-amount-container">
                <h3 className='title'>Advance Amount</h3>
                {/* <div className="payment-item" key={pay?.unique_id}>
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
                </div> */}
                <div className="payment-choose" onClick={handleOpenPaymentMethods}>
                    <h3>Add Advance to Wallet</h3>
                    <TbWallet />
                </div>
                <p className='info-note'>The advance amount will be credited to the customer’s wallet.
                    The wallet balance can be used for the customer’s next service.
                    Each wallet is linked to the customer’s unique wallet ID.</p>
            </div>
        </div>
    )
}

export default SfPageFour