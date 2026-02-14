import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Verification from '../service-form-components/review-form/Verification'
import ReviewForm from '../service-form-components/review-form/FormReview'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice'
import BillReview from '../service-form-components/review-form/BillReview'

const Review = ({ page }) => {
    const dispatch = useDispatch();
    const { verification } = useSelector((state) => state.application)
    const [openedBill, setOpenedBill] = useState({})


    const resetVerificationType = () => {
        dispatch(sfActions.updateVerification({
            verification_type: null,
            is_verified: false,
            verification_at: null
        }))
    }

    return (
        <div className="tech-service-from-review">
            {!verification?.is_verified && <Verification resetVerificationType={resetVerificationType} />}
            {verification?.is_verified && <>
                {!openedBill?.service_srl_no && <ReviewForm page={page} resetVerificationType={resetVerificationType} setOpenedBill={setOpenedBill} />}
                {openedBill?.service_srl_no && <BillReview bill={openedBill} setOpenedBill={setOpenedBill} />}
            </>}
        </div>
    )
}

export default Review