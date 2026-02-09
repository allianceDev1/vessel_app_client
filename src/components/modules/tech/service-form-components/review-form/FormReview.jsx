import React, { useEffect, useState } from 'react'
import './form-review.scss'
import { useDispatch, useSelector } from 'react-redux';
import { serviceFormPageRoute } from '../../../../../assets/javascript/pre_data/service';
import { api } from '../../../../../api';
import { sfActions, sfSetting } from '../../../../../redux/features/persisted/applicationSlice';
import SkeletonGrid from '../../../../UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../../UI_Primitives/ui-states/ErrorState';
import { TbFile, TbShieldCheckFilled } from 'react-icons/tb';
import BillSummery from '../BillSummery';
import Badge from '../../../../UI_Primitives/badge/Badge';
import Button from '../../../../UI_Primitives/buttons/Button';
import { toStandardText } from '../../../../../utils/helpers/text-formatting';


const ReviewForm = ({ page, resetVerificationType }) => {
    const dispatch = useDispatch();
    const { verification, serviceForm, serviceFormSettings, review, } = useSelector((state) => state.application)
    const [loading, setLoading] = useState('')
    const [error, setError] = useState({ error: false, title: null, message: null })

    const fetchReview = async () => {
        try {
            setLoading('fetch')

            const resReview = await api.vfTv2Axios.get(`/service/service-form/bill-reviews`, {
                params: {
                    service_form_uuid: serviceForm?.service_form_uuid,
                    registration_id: serviceForm?.registration_id,
                    visit_uuid: serviceForm?.visit_uuid
                }
            })

            dispatch(sfActions.updateReview({
                is_ready_to_pay: resReview?.is_ready_to_pay,
                is_editable: resReview?.is_editable,
                current_form_save_time: resReview?.current_form_save_time,
                bills: resReview?.bills
            }))

            dispatch(sfActions.updatePayment({
                bill_summery: resReview?.bills_summery,
                complement_amount: resReview?.wallet?.amount || 0
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
    }, [serviceFormSettings, review])

    return (
        <div className="tech-service-form-page form-review">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            {/* Verification */}
            <div className="verification-container">
                <div>
                    <TbShieldCheckFilled />
                    <p>Verified By {toStandardText(verification?.verification_type)}</p>
                </div>
                <div>
                    {verification?.verification_type !== 'OTP' &&
                        <p className='action' onClick={resetVerificationType}>Use OTP ?</p>}
                </div>
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
                    {review?.bills?.map((bill, index) => (
                        <div className='bill-item'>
                            <div className="s-1">
                                <h4>{bill?.service_srl_no}</h4>
                                {bill?.this_work_bill && <Badge severity={'info'} value={'Current Work'} />}
                            </div>
                            <div className="s-2">
                                <p>Bill Amount</p>
                                <h3>₹{bill?.pricing?.grand_total || 0}</h3>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="submit-section">
                    <Button label={'Next'} rounded style={{ width: '100%' }} onClick={() => dispatch(sfSetting.setActivePage(102))} />
                </div>
            </div>}
        </div>
    )
}

export default ReviewForm