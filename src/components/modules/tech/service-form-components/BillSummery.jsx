import React, { useEffect, useState } from 'react'
import './bill-summery.scss'
import { useSelector } from 'react-redux'

const BillSummery = ({ expand = true }) => {
    const { payment } = useSelector((state) => state.application)
    const [grandTotal, setGrandTotal] = useState(0)

    useEffect(() => {
        const totalAmount = payment?.bill_summery?.grand_total || 0
        const compliment = payment?.complement_amount || 0
        setGrandTotal(totalAmount - compliment)
    }, [payment])

    return (
        <div className={`tech-bill-summery-comp-container ${!expand ? 'fill-container' : ''}`}>
            {expand && <>
                <div className="item">
                    <p className="label">Sub Total</p>
                    <p className='value'>₹{payment?.bill_summery?.sub_total || 0}</p>
                </div>
                {payment?.bill_summery?.tax?.total ? <div className="item">
                    <p className="label">Tax</p>
                    <p className='value'>₹{payment?.bill_summery?.tax?.total || 0}</p>
                </div> : ''}
                {payment?.bill_summery?.discount ? <div className="item">
                    <p className="label">Discount (Less)</p>
                    <p className='value'>₹{payment?.bill_summery?.discount || 0}</p>
                </div> : ''}
                <div className="item">
                    <p className="label">Complement (Less)</p>
                    <p className='value'>₹{payment?.complement_amount || 0}</p>
                </div>
            </>}
            <div className="item item-total">
                <p>Total Amount</p>
                {grandTotal ? <p>₹{grandTotal || 0}</p> : <p>___</p>}
            </div>
        </div>
    )
}

export default BillSummery