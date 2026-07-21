import React from 'react'
import './form-review.scss'
import { serviceFormPageRoute } from '../../../../../assets/javascript/pre_data/service';
import BillSummery from '../BillSummery';
import Badge from '../../../../UI_Primitives/badge/Badge';
import Button from '../../../../UI_Primitives/buttons/Button';
import { calculateBillTotalAmount } from '../../../../../utils/helpers/math-equations';


const ReviewForm = ({ page, review, payment, setOpenedBill, setActivePage }) => {


    return (
        <div className="tech-service-form-page form-review">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            {/* Content */}
            <div className='tech-sf-review-page'>
                {/* Bill Summery */}
                <BillSummery review={review} payment={payment} />

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
                <div className="submit-section">
                    <Button label={'Next'} rounded style={{ width: '100%' }} onClick={() => setActivePage(102)} />
                </div>
            </div>
        </div>
    )
}

export default ReviewForm