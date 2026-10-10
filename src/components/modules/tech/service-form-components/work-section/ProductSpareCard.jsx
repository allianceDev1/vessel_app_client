import React from 'react'
import './product-spare-card.scss'
import {
    TbShieldCheck,
    TbShieldX,
    TbTrash,
    TbRotateClockwise,
    TbTag,
    TbAlertTriangle,
    TbX
} from 'react-icons/tb'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'


/**
 * ProductSpareCard
 * Mobile-friendly item card representing an installed spare in the customer's product.
 *
 * @param {Object} props
 * @param {Object} props.data - Product spare object
 * @param {Function} props.onSelect - Callback when selecting SAME or REPLACE: (item, selectionType) => void
 * @param {Function} props.onDelete - Callback to remove spare from product: (item) => void
 * @param {Function} props.onUndoDelete - Callback to undo deletion/removal: (item) => void
 * @param {Boolean} props.isReadOnly - Whether actions are disabled
 * @param {String} props.className - Optional extra classes
 */
const ProductSpareCard = ({
    data,
    onSelect = () => { },
    onDelete = () => { },
    onUndoDelete = () => { },
    isReadOnly = false,
    className = ''
}) => {
    const {
        spare_id,
        component_uuid,
        spare_name,
        spare_category,
        is_warranty_item = false,
        is_active = true,
        is_selected = false,
        selection_type = null,
        is_removed = false,
        pricing = { list_price: 0, charged: 0 },
    } = data || {}

    const uniqueId = component_uuid ? String(component_uuid).slice(-4).toUpperCase() : null
    const actualPrice = Number(pricing?.charged ?? 0)
    const mrpPrice = Number(pricing?.list_price ?? 0)
    const hasDiscount = mrpPrice > actualPrice

    const handleSelectAction = (type) => {
        if (isReadOnly || is_removed) return
        // Toggle off if already selected with the same type, otherwise set type
        const nextType = (is_selected && selection_type === type) ? null : type
        onSelect(data, nextType)
    }

    const handleDelete = (e) => {
        e?.stopPropagation?.()
        if (isReadOnly) return
        onDelete(data)
    }

    const handleUndo = (e) => {
        e?.stopPropagation?.()
        if (isReadOnly) return
        onUndoDelete(data)
    }

    return (
        <div
            className={`product-spare-card ${is_removed ? 'is-deleted' : ''} ${is_selected ? 'is-selected' : ''} ${!is_active ? 'is-inactive' : ''} ${className}`}
        >
            {/* Header: Name, IDs & Actions */}
            <div className="card-top-section">
                <div className="left-info">
                    <div className="title-row">
                        <h4 className="spare-name" title={spare_name}>
                            {spare_name}
                        </h4>
                    </div>

                    <div className="meta-row">
                        <span className="spare-id-code">#{spare_id}</span>
                        {uniqueId && <span className="unique-chip">uid: {uniqueId}</span>}
                        {spare_category && (
                            <span className="category-tag">
                                <TbTag className="tag-icon" />
                                {toStandardText(spare_category)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="right-action">
                    {/* Delete or Undo trigger */}
                    {is_selected ? (
                        <button
                            type="button"
                            className="clear-btn"
                            onClick={handleUndo}
                            title="Undo removal"
                            aria-label="Undo removal"
                        >
                            <TbX />
                            <span>Unselect</span>
                        </button>
                    ) : is_removed ? (
                        <button
                            type="button"
                            className="undo-btn"
                            onClick={handleUndo}
                            title="Undo removal"
                            aria-label="Undo removal"
                        >
                            <TbRotateClockwise />
                            <span>Undo</span>
                        </button>
                    ) : (
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
                </div>
            </div>

            {/* Badges & Price Row */}
            <div className="card-bottom-section">
                <div className="badge-group">
                    {is_warranty_item ? (
                        <span className="warranty-pill in-warranty">
                            <TbShieldCheck className="pill-icon" />
                            <span>Warranty</span>
                        </span>
                    ) : (
                        <span className="warranty-pill out-warranty">
                            <TbShieldX className="pill-icon" />
                            <span>No Warranty</span>
                        </span>
                    )}

                    {!is_active && (
                        <span className="status-pill inactive">
                            <TbAlertTriangle className="pill-icon" />
                            <span>Inactive</span>
                        </span>
                    )}
                </div>

                <div className="pricing-info">
                    {hasDiscount && (
                        <span className="mrp-price">₹{mrpPrice}</span>
                    )}
                    <span className="actual-price">
                        {!Number(actualPrice) ? <span className="warranty-free">₹{actualPrice}</span> : `₹${actualPrice}`}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ProductSpareCard
