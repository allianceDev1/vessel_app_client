import React, { useEffect, useState } from 'react'
import './bill-review.scss'
import Button from '../../../../UI_Primitives/buttons/Button';
import { TbCheck } from 'react-icons/tb';
import { calculateBillTotalAmount } from '../../../../../utils/helpers/math-equations';
import { groupItemsByGroupId } from '../../../../../utils/services/work_services';


const BillReview = ({ bill, review, setReview, setOpenedBill }) => {
    const [billItems, setBillItems] = useState([])


    
    const clickCheckBox = (itemUUID, isDisabled) => {
        if (isDisabled) return;

        const isIncluded = review?.zero_fee_items?.includes(itemUUID)

        if (isIncluded) {
            setReview((state) => ({
                ...state,
                zero_fee_items: state?.zero_fee_items?.filter(i => i !== itemUUID)
            }))
        } else {
            setReview((state) => ({
                ...state,
                zero_fee_items: [...(state?.zero_fee_items || []), itemUUID]
            }))
        }
    }

    useEffect(() => {
        const grouped = groupItemsByGroupId(bill?.items || []);
        setBillItems(grouped)
    }, [bill?.items])

    return (
        <div className="tech-bill-review-page-container">
            {/* Title */}
            <div className="title-section">
                <h3>{bill?.service_srl_no}</h3>
                <p>Review and Edit Single Service Form</p>
            </div>

            {/* Items */}
            <div className="bill-border">
                {billItems?.map((group) => {
                    return <div className="list-section" key={group?.group_id}>
                        <div className="item-header">
                            <h5>{group?.group_name}</h5>
                        </div>
                        {group?.items?.map((item) => {
                            const isDisabled = !review?.is_editable || ['INSTALLATION_CHARGE', 'SERVICE_CHARGE'].includes(item?.item_id) ||
                                ['PACKAGE', 'SERVICE_TOKEN'].includes(item?.item_category) || Number(item?.total) === 0
                                || ['RENEWAL_SERVICE', 'RENEWAL_SPARE']?.includes(item?.item_type)


                            return <div className="item" key={item?.uuid} onClick={() => clickCheckBox(item?.uuid, isDisabled)}>
                                <div className="checkbox-section">
                                    <div className={`item-checkbox ${!review?.zero_fee_items?.includes(item?.uuid) ? "checked" : ''} ${isDisabled ? 'disabled' : ''}`} >
                                        <TbCheck />
                                    </div>
                                </div>
                                <div>
                                    <div className="name-section">
                                        <h3>{item?.item_name}</h3>
                                    </div>
                                    <div className="detail-section">
                                        <div>
                                            {item?.unit
                                                ? <p className="single-price">1 item for Rs.{item?.pricing?.charged}</p>
                                                : <p className="single-price">This not spare or service</p>}
                                            <p className="qty">Qty: {item?.qty} {item?.unit}</p>
                                        </div>
                                        <div>
                                            <p className="estimate">Estimate ₹{Number(item?.pricing?.list || 0) * Number(item?.qty || 1)}</p>
                                            <p className="price">₹{Number(item?.total || 0)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>
                })}

                <div className="grand-total">
                    <h3>Grand Total : ₹{calculateBillTotalAmount(bill?.items, review?.zero_fee_items || [])}</h3>
                </div>

            </div>

            <Button label={'Done'} rounded style={{ width: '100%' }} onClick={() => setOpenedBill({})} />
        </div>
    )
}

export default BillReview