import React, { useEffect, useState } from 'react'
import './review-section.scss'
import { useDispatch, useSelector } from 'react-redux';
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service';
import { api } from '../../../../api';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';
import { TbFile } from 'react-icons/tb';
import BillSummery from '../service-form-components/BillSummery';
import Badge from '../../../UI_Primitives/badge/Badge';
import Button from '../../../UI_Primitives/buttons/Button';
import { calculateBillTotalAmount } from '../../../../utils/helpers/math-equations';
import { calculateServiceFormTotal } from '../../../../utils/helpers/service-form-total';
import Message from '../../../UI_Primitives/message/Message';



const ReviewSection = ({ pageKey, setOpenedBill }) => {
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings, review } = useSelector((state) => state.application)
    const [loading, setLoading] = useState('')
    const [error, setError] = useState({ error: false, title: null, message: null })

    const fetchReview = async () => {
        try {
            setLoading('fetch')

            const resReview = await api.ssTv2Axios.get(`/service/service-form/bill-reviews`, {
                params: {
                    work_key: serviceForm?.work_key
                }
            })

            dispatch(sfActions.updateReview({
                is_ready_to_pay: resReview?.is_ready_to_pay,
                is_editable: resReview?.is_editable,
                current_form_save_time: resReview?.current_form_save_time,
                bills: resReview?.bills
            }))

            dispatch(sfActions.updatePayment({
                compliment_amount: resReview?.wallet?.amount || 0
            }))

        } catch (error) {
            setError({ error: true, title: 'Review fetching failed', message: error.message })
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        if (serviceFormSettings?.form_saved_time !== review?.current_form_save_time) {
            fetchReview()
        }
        // eslint-disable-next-line
    }, [serviceFormSettings, review])

    // Current work bill amount must match the total amount of the current work form
    const currentWorkBill = review?.bills?.find(b => b?.this_work_bill)
    const billAmount = currentWorkBill ? Number(calculateBillTotalAmount(currentWorkBill?.items)) : null
    const formAmount = calculateServiceFormTotal(serviceForm)
    const amountMismatch = billAmount !== null && billAmount !== formAmount

    return (
        <div className="tech-service-form-page form-review">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            {/* Loading */}
            {loading === 'fetch' && <SkeletonGrid
                rows={2}
                columns={1}
                height={250}
                style={{ marginTop: "20px" }}
            />}

            {/* Error */}
            {error?.error && <ErrorState
                size='sm'
                hight='400px'
                title={error?.title}
                message={error?.message}
                icon={<TbFile />}
            />}

            {/* Content */}
            {!loading && !error?.error && <div className='tech-sf-review-page'>

                {/* Bill Summery */}
                <BillSummery />

                {/* Bills */}
                <div className="bills-container">
                    <h3 className='sub-title'>Bills</h3>
                    {review?.bills?.map((bill) => (
                        <div className='bill-item' key={bill?.service_srl_no} onClick={() => setOpenedBill(bill)}>
                            <div className="s-1">
                                <h4>{bill?.service_srl_no}</h4>
                                {bill?.this_work_bill && <Badge severity={'info'} value={'Current Work'} />}
                            </div>
                            <div className="s-2">
                                <p>Bill Amount</p>
                                <h3>₹{calculateBillTotalAmount(bill?.items, review?.zero_fee_items || [])}</h3>
                            </div>
                        </div>
                    ))}
                </div>
                {amountMismatch && <Message type='danger' head='Bill amount mismatch' style={{ marginTop: '20px' }}
                    message={`Current work bill amount (₹${billAmount}) does not match the current work total amount (₹${formAmount}). Please go back, review the work and save the form again.`} />}
                <div className="submit-section" style={{ marginTop: '40px' }}>
                    <Button label={'Next'} rounded style={{ width: '100%' }} severity={'secondary'} disabled={amountMismatch}
                        onClick={() => dispatch(sfSetting.page.next(1002))} />
                </div>
            </div>}
        </div>
    )
}

export default ReviewSection