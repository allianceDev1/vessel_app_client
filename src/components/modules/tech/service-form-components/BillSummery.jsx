import React, { useEffect, useState } from 'react'
import './bill-summery.scss'
import { useSelector } from 'react-redux'
import { calculateBillsSummery } from '../../../../utils/helpers/math-equations'

const BillSummery = ({ expand = true }) => {
    const { payment, review } = useSelector((state) => state.application)
    const [billSummery, setBillSummery] = useState({})


    useEffect(() => {
        const summery = calculateBillsSummery(
            review?.bills ?? [], 
            review?.zero_fee_items ?? [],
            payment?.complement_amount ?? 0
        )
        setBillSummery(summery)

    }, [payment, review])

    return (
        <div className={`tech-bill-summery-comp-container ${!expand ? 'fill-container' : ''}`}>
            {expand && <>
                <div className="item">
                    <p className="label">Grand Total</p>
                    <p className='value'>₹{billSummery?.subTotal || 0}</p>
                </div>

                <div className="item">
                    <p className="label">Complement (Less)</p>
                    <p className='value'>₹{billSummery?.discount || 0}</p>
                </div>
            </>}
            <div className="item item-total">
                <p>Receivable Amount</p>
                <p>₹{billSummery?.grandTotal || 0}</p>
            </div>
        </div>
    )
}

export default BillSummery