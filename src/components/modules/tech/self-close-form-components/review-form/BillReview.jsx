import React, { useEffect, useState } from 'react'
import '../../service-form-pages/bill-review.scss'
import Button from '../../../../UI_Primitives/buttons/Button';
import { TbCheck } from 'react-icons/tb';
import { calculateBillTotalAmount } from '../../../../../utils/helpers/math-equations';
import { groupItemsByGroupId } from '../../../../../utils/services/work_services';


const BillReview = ({ bill, review, setReview, setOpenedBill }) => {
    const [billItems, setBillItems] = useState([])



    const clickCheckBox = (unique_key, isDisabled) => {
        if (isDisabled) return;

        const isIncluded = review?.zero_fee_items?.includes(unique_key)

        if (isIncluded) {
            setReview((state) => ({
                ...state,
                zero_fee_items: state?.zero_fee_items?.filter(i => i !== unique_key)
            }))
        } else {
            setReview((state) => ({
                ...state,
                zero_fee_items: [...(state?.zero_fee_items || []), unique_key]
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
                    return (
                        <div className="list-section" key={group?.group_id}>
                            <div className="item-header">
                                <h5>{group?.group_name}</h5>
                                <span className="group-count">{group?.items?.length || 0} items</span>
                            </div>

                            <div className="items-list">
                                {group?.items?.map((item) => {
                                    const isDisabled = !review?.is_editable || ['INSTALLATION_CHARGE', 'SERVICE_CHARGE'].includes(item?.item_id) ||
                                        ['PACKAGE', 'SERVICE_TOKEN'].includes(item?.item_category) || Number(item?.total) === 0
                                        || ['RENEWAL_SERVICE', 'RENEWAL_SPARE']?.includes(item?.item_type)

                                    const isChecked = !review?.zero_fee_items?.includes(item?.unique_key);
                                    const estimateAmount = Number(item?.pricing?.list || 0) * Number(item?.qty || 1);
                                    const chargedAmount = Number(item?.total || 0);

                                    return (
                                        <div
                                            className={`item ${!isChecked ? 'unselected' : ''} ${isDisabled ? 'item-disabled' : ''}`}
                                            key={item?.unique_key}
                                            onClick={() => clickCheckBox(item?.unique_key, isDisabled)}
                                        >
                                            <div className="checkbox-section">
                                                <div className={`item-checkbox ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`}>
                                                    <TbCheck />
                                                </div>
                                            </div>

                                            <div className="item-body">
                                                <div className="item-top-row">
                                                    <h3 className="item-name">{item?.item_name}</h3>
                                                    <span className="charged-value">₹{chargedAmount}</span>
                                                </div>

                                                <div className="item-bottom-row">
                                                    <div className="item-meta">
                                                        {item?.item_type && (
                                                            <span className="item-type-badge">
                                                                {item?.item_type?.replace(/_/g, ' ')}
                                                            </span>
                                                        )}
                                                        <span className="qty-text">
                                                            Qty: <strong>{item?.qty} {item?.unit || ''}</strong>
                                                        </span>
                                                    </div>

                                                    <span className="estimate-value">
                                                        Est: ₹{estimateAmount}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}

                <div className="grand-total-card">
                    <div className="grand-total-info">
                        <span className="gt-label">Grand Total</span>
                        <span className="gt-sub">Payable bill amount</span>
                    </div>
                    <h3 className="gt-amount">₹{calculateBillTotalAmount(bill?.items, review?.zero_fee_items || [])}</h3>
                </div>

            </div>

            <Button label={'Done'} rounded style={{ width: '100%' }} onClick={() => setOpenedBill({})} severity={'secondary'} />
        </div>
    )
}

export default BillReview