import React, { useState } from 'react'
import ReviewForm from '../self-close-form-components/review-form/FormReview'
import BillReview from '../self-close-form-components/review-form/BillReview'



const Review = ({ page, review, payment, setReview, setActivePage }) => {
    const [openedBill, setOpenedBill] = useState({})


    return (
        <div className="tech-service-from-review">

            {!openedBill?.service_srl_no &&
                <ReviewForm page={page} review={review} payment={payment} setOpenedBill={setOpenedBill} setActivePage={setActivePage} />}
          
            {openedBill?.service_srl_no && <BillReview bill={openedBill} review={review} setOpenedBill={setOpenedBill}
                setReview={setReview} />}

        </div>
    )
}

export default Review