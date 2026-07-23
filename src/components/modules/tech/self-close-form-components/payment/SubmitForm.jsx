import React, { useEffect, useState } from 'react'
import './submit-form.scss'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../../../../../api'
import { audio, modal, toast } from '../../../../../redux/features/non_persisted/miniSystemSlice'
import { initAudio, unlockAudio } from '../../../../../utils/services/success_audio_services'
import { useNavigate } from 'react-router-dom'
import { calculateBillsSummery } from '../../../../../utils/helpers/math-equations'
import { convertIsoToAmPm, isoToDDMonYYYY } from '../../../../../utils/helpers/date-helpers'
import { getPaymentDisplay } from '../../../../../utils/services/work_services'
import Message from '../../../../UI_Primitives/message/Message'
import Button from '../../../../UI_Primitives/buttons/Button'




const SubmitForm = ({ modalId, unenablePayment, review, payment }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { internet } = useSelector((state) => state.system)
    const [formVerification, setFormVerification] = useState({ ok: false, type: null, message: null })
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ error: false, message: "" })
    const [apiProgress, setApiProgress] = useState(0);
    const [apiStatus, setApiStatus] = useState("");



    const handleProceed = async () => {
        setLoading(true)

        setError({ error: false, message: "" })

        if (!internet) {
            dispatch(toast.push({
                type: 'warning',
                message: 'No internet connection'
            }))

            setLoading(false)

            return;
        }

        if (!formVerification?.ok) {
            setLoading(false)
            return;
        }

        await unlockAudio();
        dispatch(audio.setUnlocked());

        try {


            const summery = calculateBillsSummery(
                review?.bills ?? [],
                review?.zero_fee_items ?? [],
                payment?.complement_amount ?? 0
            )
            const enteredAmount = payment?.payment_methods?.reduce((acc, cur) => acc + Number(cur?.amount || 0), 0) || 0
            const balance = summery?.grandTotal - enteredAmount

            // Setup Body
            const body = {
                customer_id: review?.customer_id,
                registration_id: review?.registration_id,
                grand_total: summery?.subTotal || 0,
                receivable_amount: summery?.grandTotal || 0, // without compliment
                payment_methods: payment?.payment_methods,
                promise_amount: balance,
                promise_date: payment?.balance_payment_date,
                promise_reason: payment?.balance_payment_reason,
                paid_amount: enteredAmount,
                paid_from_compliment: payment?.complement_amount,
                zero_fee_items: review?.zero_fee_items
            }

            const result = await api.vfTv2Axios.post('/service/service-form/self-close', body, {
                timeout: 5 * 60 * 1000,
                onUploadProgress: (progressEvent) => {
                    if (!progressEvent.total) return;

                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );

                    setApiProgress(percent);

                    if (percent < 100) {
                        setApiStatus(`Uploading data...`);
                    } else {
                        setApiStatus("Processing...");
                    }
                }
            })

            dispatch(modal.pull.single(modalId))

            const { status, description, color } = getPaymentDisplay({
                total: result?.totalBillAmount,
                paid: result?.paidAmount,
                verified: result?.verifiedAmount
            })

            navigate("/tech/service/work-success", {
                replace: true,
                state: {
                    serviceStatus: "SUCCESS",
                    date: `${isoToDDMonYYYY(result?.date)}, ${convertIsoToAmPm(result?.date)}`,
                    serviceNumber: null,
                    paymentStatus: status,
                    paymentDescription: description,
                    paymentColor: color,
                    totalBillAmount: result?.totalBillAmount,
                    verifiedAmount: result?.verifiedAmount,
                    receiptNo: result?.receiptNo,
                    customerName: result?.customerName,
                    customerId: result?.customerId,
                    unenable_payment: unenablePayment,
                    self_close: true,
                    registration_id: review?.registration_id
                }
            });

        } catch (error) {
            setError({
                error: true,
                message: error?.message
            })
        } finally {
            setLoading(false)
            setApiProgress(0);
            setApiStatus("");
        }
    }

    const closeModal = () => {
        dispatch(modal.pull.single(modalId))
    }

    useEffect(() => {
        // Check required element
        if (!review?.registration_id || !review?.customer_id) {
            setFormVerification({ ok: false, type: 'danger', message: "The required form element are missing" })

            return;
        }


        setFormVerification({ ok: true })

    }, [review])

    useEffect(() => {
        initAudio(); // prepare audio early
    }, []);



    return (
        <div className="s-form-close-service-container">
            {/* Proceed */}
            {!error?.error && !loading && <div className='submit-section'>
                <div className="text-section">
                    <h2>Close Service</h2>
                    <p>
                        By proceeding, the service will be closed and payment processing will be completed.
                        The customer will receive a notification confirming that the service has been closed.
                    </p>
                </div>

                {/* Messages */}
                {!internet ? <Message type={'danger'} message={"No internet connection"} /> : ''}

                {/* Buttons */}
                <div className="buttons-div">
                    <Button label={'Cancel'} rounded style={{ width: '100%', marginTop: '20px' }} onClick={closeModal} />
                    <Button label={'Proceed'} severity={'primary'} rounded style={{ width: '100%', marginTop: '20px' }}
                        onClick={handleProceed} disabled={!internet || !formVerification?.ok} />
                </div>
            </div>}

            {/* Loading */}
            {!error?.error && loading && <div className="loading-section">
                <h4>{apiStatus || 'Wait a moment...'}</h4>

                <div className="progress-bar">
                    <div className={apiProgress ? "progress" : "progress spin"} style={{ width: `${apiProgress}%` }}></div>
                </div>

                <p>Your request is currently being processed. <br></br>
                    Please wait and do not refresh the page or navigate away.</p>
            </div>}

            {/* Error */}
            {error?.error && <div className="error-section">
                <h4>Data Saving Failed</h4>

                <p>{error?.message}</p>

                <div className="buttons-div">
                    <Button label={'Cancel'} rounded style={{ width: '100%', marginTop: '20px' }} onClick={closeModal} />
                    <Button label={'Try again'} severity={'primary'} rounded style={{ width: '100%', marginTop: '20px' }}
                        onClick={handleProceed} disabled={!internet || !formVerification?.ok} />

                </div>

            </div>}


        </div>
    )
}

export default SubmitForm