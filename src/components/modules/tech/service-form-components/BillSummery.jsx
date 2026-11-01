import React, { useEffect, useState } from 'react'
import './bill-summery.scss'
import { useSelector } from 'react-redux'
import { calculateBillsSummery } from '../../../../utils/helpers/math-equations'

const BillSummery = () => {
    const { review } = useSelector((state) => state.application)
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
            <div className="item">
                <p>Receivable Amount</p>
                <p>₹{grandTotal || 0}</p>
            </div>
        </div>
    )
}

export default BillSummery