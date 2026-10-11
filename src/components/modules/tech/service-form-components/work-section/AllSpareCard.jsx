import React from 'react'
import './all-spare-card.scss'
import {
    TbPlus,
    TbMinus,
} from 'react-icons/tb'

/**
 * AllSpareCard
 * Compact mobile-friendly item row designed for high-density listing (100+ spares).
 * Keeps all data elements intact without extra whitespace.
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
            {/* Left Content: Name & Price/ID Meta */}
            <div className="card-main-content">
                <div className="title-row">
                    <h4 className="spare-name" title={spare_name}>
                        {spare_name}
                    </h4>
                </div>

                <div className="meta-price-row">
                    <span className={`actual-price ${actualPrice === 0 ? 'zero-price' : ''}`}>
                        ₹{actualPrice}
                    </span>
                    {hasDiscount && (
                        <>
                            <span className="mrp-price">₹{mrpPrice}</span>
                            <span className="save-badge">Save ₹{discountAmount}</span>
                        </>
                    )}
                    {spare_id && <span className="spare-id-code">#{spare_id}</span>}
                    {!is_active && <span className="inactive-badge">Unavailable</span>}
                </div>
            </div>

            {/* Right Action: Compact Add Button or Inline Stepper */}
            <div className="card-action-side">
                {isAdded ? (
                    <div className="stepper-wrapper">
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

                            <span className="qty-number">
                                {count}
                                {unit && <small className="unit-label">{unit}</small>}
                            </span>

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

                        {count > 1 && (
                            <div className="subtotal-text">
                                Total: ₹{itemTotal}
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
                        <span>Add</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export default AllSpareCard
