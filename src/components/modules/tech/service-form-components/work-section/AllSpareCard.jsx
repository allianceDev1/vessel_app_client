import React from 'react'
import './all-spare-card.scss'
import {
    TbPlus,
    TbMinus,
    TbTag,
} from 'react-icons/tb'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'



/**
 * AllSpareCard
 * Mobile-friendly item card representing a spare item from the catalog inventory.
 * Supports quick adding, quantity stepper (+/-), direct deletion, and price breakdown.
 *
 * @param {Object} props
 * @param {Object} props.data - Spare catalog item object
 * @param {Function} props.onSelect - Callback when adding/selecting item: (item) => void
 * @param {Function} props.onDelete - Callback when removing item / resetting qty: (item) => void
 * @param {Function} props.onQtyChange - Callback when quantity changes: (item, newQty) => void
 * @param {Function} props.onIncrement - Callback to increase quantity: (item) => void
 * @param {Function} props.onDecrement - Callback to decrease quantity: (item) => void
 * @param {Boolean} props.isReadOnly - Whether interactions are disabled
 * @param {String} props.className - Optional extra classes
 */
const AllSpareCard = ({
    data,
    onSelect = () => { },
    onDelete = () => { },
    onQtyChange = () => { },
    onIncrement = () => { },
    onDecrement = () => { },
    isReadOnly = false,
    className = ''
}) => {
    const {
        spare_id,
        spare_name,
        spare_category,
        pricing = { list_price: 0, charged: 0 },
        is_active = true,
        is_selected = false,
        qty = 0,
        unit
    } = data || {}

    const count = Number(qty || 0)
    const isAdded = is_selected || count > 0

    const actualPrice = Number(pricing?.charged ?? 0)
    const mrpPrice = Number(pricing?.list_price ?? 0)
    const hasDiscount = mrpPrice > actualPrice
    const discountAmount = mrpPrice - actualPrice
    const itemTotal = count * actualPrice

    const handleAdd = (e) => {
        e?.stopPropagation?.()
        if (isReadOnly || !is_active) return
        onSelect(data)
        if (onQtyChange && count === 0) {
            onQtyChange(data, 1)
        }
    }

    const handleIncrement = (e) => {
        e?.stopPropagation?.()
        if (isReadOnly || !is_active) return
        if (onIncrement) {
            onIncrement(data)
        }
        if (onQtyChange) {
            onQtyChange(data, count + 1)
        }
    }

    const handleDecrement = (e) => {
        e?.stopPropagation?.()
        if (isReadOnly) return
        if (count <= 1) {
            // Reaching 0 removes the item
            if (onDelete) {
                onDelete(data)
            }
            if (onQtyChange) {
                onQtyChange(data, 0)
            }
        } else {
            if (onDecrement) {
                onDecrement(data)
            }
            if (onQtyChange) {
                onQtyChange(data, count - 1)
            }
        }
    }

    return (
        <div
            className={`all-spare-card ${isAdded ? 'is-added' : ''} ${!is_active ? 'is-inactive' : ''} ${className}`}
        >
            {/* Top row: Spare title, ID & Delete button (if added) */}
            <div className="card-top-section">
                <div className="left-info">
                    <div className="title-row">
                        <h4 className="spare-name" title={spare_name}>
                            {spare_name}
                        </h4>
                    </div>

                    <div className="meta-row">
                        <span className="spare-id-code">#{spare_id}</span>
                        {spare_category && (
                            <span className="category-tag">
                                <TbTag className="tag-icon" />
                                {toStandardText(spare_category)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Trash button appears when spare is added/selected */}
                {/* <div className="right-action">
                    {isAdded && (
                        <button
                            type="button"
                            className="delete-btn"
                            onClick={handleDelete}
                            title="Remove spare"
                            aria-label="Remove spare"
                        >
                            <TbTrash />
                        </button>
                    )}
                </div> */}
            </div>

            {/* Middle row: Pricing breakdown */}
            <div className="card-middle-section">
                <div className="price-details">
                    {!hasDiscount && (
                        <>
                            <span className="save-badge">Save ₹{discountAmount}</span>
                            <span className="mrp-price">₹{mrpPrice}</span>
                        </>
                    )}
                    <span className="actual-price">₹{actualPrice}</span>
                </div>
            </div>

            {/* Bottom row: Add button or Quantity Stepper */}
            <div className="card-bottom-section">
                {isAdded ? (
                    <div className="stepper-row">
                        <div className="stepper-controls">
                            <button
                                type="button"
                                className="stepper-btn minus-btn"
                                onClick={handleDecrement}
                                disabled={isReadOnly}
                                aria-label="Decrease quantity"
                            >
                                <TbMinus />
                            </button>

                            <div className="quantity-display">
                                <span className="qty-number">{count}</span>
                                <span className="qty-label">{unit || 'qty'}</span>
                            </div>

                            <button
                                type="button"
                                className="stepper-btn plus-btn"
                                onClick={handleIncrement}
                                disabled={isReadOnly || !is_active}
                                aria-label="Increase quantity"
                            >
                                <TbPlus />
                            </button>
                        </div>

                        {count > 0 && (
                            <div className="total-calculation">
                                <span className="calc-label">Total:</span>
                                <span className="calc-amount">₹{itemTotal.toFixed(0)}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        type="button"
                        className="add-spare-btn"
                        onClick={handleAdd}
                        disabled={isReadOnly || !is_active}
                    >
                        <TbPlus className="btn-icon" />
                        <span>Add Spare</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export default AllSpareCard

