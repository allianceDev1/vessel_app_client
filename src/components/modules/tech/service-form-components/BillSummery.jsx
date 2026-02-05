import React, { useEffect, useState } from 'react'
import './bill-summery.scss'
import { useSelector } from 'react-redux'

const BillSummery = ({ fill = false }) => {
    const { payment } = useSelector((state) => state.application)
    const [grandTotal, setGrandTotal] = useState(0)

    useEffect(() => {
        const totalAmount = payment?.bill_summery?.grand_total || 0
        const compliment = payment?.complement_amount || 0
        setGrandTotal(totalAmount - compliment)
    }, [payment])

    return (
        <div className={`tech-bill-summery-comp-container ${fill ? 'fill-container' : ''}`}>
            {!fill && <>
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
                <div className="item" style={{ marginBottom: '10px' }}>
                    <p className="label">Complement (Less)</p>
                    <p className='value'>₹{payment?.complement_amount || 0}</p>
                </div>
            </>}
            <div className="amount-section">
                <h3>Total Amount</h3>
                <div>
                    {grandTotal ? <h2>₹{grandTotal || 0}</h2> : <h2>___</h2>}
                </div>
            </div>
        </div>
    )
}

export default BillSummery