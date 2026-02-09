import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Verification from '../service-form-components/review-form/Verification'
import ReviewForm from '../service-form-components/review-form/FormReview'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice'

const Review = ({ page }) => {
    const dispatch = useDispatch();
    const { verification } = useSelector((state) => state.application)
    const [openedBill, setOpenedBill] = useState('')


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
                {!openedBill && <ReviewForm page={page} resetVerificationType={resetVerificationType} />}
            </>}
        </div>
    )
}

export default Review