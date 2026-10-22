import React, { useEffect, useState } from 'react'
import './bill-summery.scss'
import { calculateBillsSummery } from '../../../../utils/helpers/math-equations'

const BillSummery = ({ review }) => {
    const [grandTotal, setGrandTotal] = useState(0)


    useEffect(() => {
        const summery = calculateBillsSummery(
            review?.bills ?? [],
            review?.zero_fee_items ?? []
        )
        setGrandTotal(summery)

    }, [review])

    return (
        <div className={`tech-bill-summery-comp-container`}>
            <div className="item item-total">
                <p>Receivable Amount</p>
                <p>₹{grandTotal || 0}</p>
            </div>
        </div>
    )
}

export default BillSummery