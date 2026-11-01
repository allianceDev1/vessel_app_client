import React, { useState } from 'react'
import ReviewForm from '../self-close-form-components/review-form/FormReview'
import BillReview from '../self-close-form-components/review-form/BillReview'



const Review = ({ pageKey, review, setReview, setActivePage }) => {
    const [openedBill, setOpenedBill] = useState({})


    return (
        <div className="tech-service-from-review">

            {!openedBill?.service_srl_no &&
                <ReviewForm pageKey={pageKey} review={review} setOpenedBill={setOpenedBill} setActivePage={setActivePage} />}

            {openedBill?.service_srl_no && <BillReview bill={openedBill} review={review} setOpenedBill={setOpenedBill}
                setReview={setReview} />}

        </div>
    )
}

export default Review