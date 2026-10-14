import React from 'react'
import './product-spare-card.scss'
import {
    TbShieldCheck,
    TbShieldX,
    TbTrash,
    TbRotateClockwise,
    TbTag,
    TbAlertTriangle,
    TbX,
    TbReplace,
    TbCheckbox
} from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { modal, toast } from '../../../../../redux/features/non_persisted/miniSystemSlice'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'
import ReplaceSpareModal from './ReplaceSpareModal'
import { sfActions, sfSetting } from '../../../../../redux/features/persisted/applicationSlice'


/**
 * ProductSpareCard
 * Mobile-friendly item card representing an installed spare in the customer's product.
 *
 * @param {Object} props
 * @param {Object} props.data - Product spare object
 * @param {Function} props.coverage - Callback when selecting SAME or REPLACE: (item, selectionType, details) => void
 * @param {Function} props.productInForm - Callback to remove spare from product: (item) => void
 */
const ProductSpareCard = ({
    data,
    productInForm,
    coverage
}) => {
    const dispatch = useDispatch()

    const {
        spare_id,
        spare_uuid,
        component_uuid,
        spare_name,
        spare_category,
        is_warranty_item = false,
        is_active = true,
        is_selected = false,
        selection_info = {},
        is_removed = false,
        pricing = { list_price: 0, charged: 0 },
    } = data || {}

    const uniqueId = component_uuid ? String(component_uuid).slice(-3).toUpperCase() : null
    const actualPrice = Number(pricing?.charged ?? 0)
    const mrpPrice = Number(pricing?.list_price ?? 0)
    const hasDiscount = mrpPrice > actualPrice

    const handleCardClick = () => {
        if (is_selected || is_removed) return;

        dispatch(modal.push({
            title: 'Replace Spare Part',
            body: <ReplaceSpareModal
                currentSpare={data}
                coverage={coverage}
                productInForm={productInForm}
                onConfirm={(replacementData) => handleConfirmReplacement(replacementData)}
                onClose={() => {
                    dispatch(modal.pull.all())
                }}
            />

        }))
    }

    const handleConfirmReplacement = (replacementData) => {

        const isSelected = productInForm?.work?.components_list?.find(c => c?.component_uuid === replacementData?.component_uuid)

        if (isSelected) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Already selected',
                message: 'The spare already selected.'
            }));
            return;
        }

        // add to cart
        dispatch(sfActions.updateProduct.innerFields({
            work: {
                ...(productInForm?.work || {}),
                components_list: [
                    ...(productInForm?.work?.components_list || []),
                    {
                        selection_context: coverage?.coverage_section,
                        ...replacementData,
                    }
                ]
            }
        }));

        const spareChargeIncreaseFlag = Boolean(
            replacementData?.spare_category === 'PUMP' ||
            (replacementData?.spare_category === "MEMBRANE" && coverage?.coverage_section !== 'RENEWAL_SPARE'))

        if (spareChargeIncreaseFlag) {
            dispatch(sfActions.updateProduct.increaseSCIndex())
        }

        dispatch(sfSetting.productSubmit.resetStatus())
        dispatch(modal.pull.all())
    }

    const handleDelete = (e) => {
        e?.stopPropagation?.()

        if (!is_selected && !is_removed) {

            dispatch(sfActions.updateProduct.innerFields({
                work: {
                    ...(productInForm?.work || {}),
                    removed_components_list: [
                        ...(productInForm?.work?.removed_components_list || []),
                        {
                            spare_uuid,
                            component_uuid
                        }
                    ]
                }
            }))

            dispatch(sfSetting.productSubmit.resetStatus())
        }
    }

    const handleUndo = (e) => {
        e?.stopPropagation?.()

        if (is_removed) {

            let componentList = productInForm?.work?.removed_components_list || []
            componentList = componentList?.filter(c => c?.component_uuid !== component_uuid)

            dispatch(sfActions.updateProduct.innerFields({
                work: {
                    ...(productInForm?.work || {}),
                    removed_components_list: componentList
                }
            }))

            dispatch(sfSetting.productSubmit.resetStatus())
        }

    }

    const handleUnSelect = (e) => {
        e?.stopPropagation?.();

        if (is_selected && selection_info?.selected_context === coverage?.coverage_section) {

            let componentList = productInForm?.work?.components_list || []
            componentList = componentList?.filter(c => c?.component_uuid !== component_uuid)

            dispatch(sfActions.updateProduct.innerFields({
                work: {
                    ...(productInForm?.work || {}),
                    components_list: componentList
                }
            }))

            const spareChargeIncreaseFlag = Boolean(
                data?.spare_category === 'PUMP' ||
                (data?.spare_category === "MEMBRANE" && coverage?.coverage_section !== 'RENEWAL_SPARE'))

            if (spareChargeIncreaseFlag) {
                dispatch(sfActions.updateProduct.decreaseSCIndex())
            }

            dispatch(sfSetting.productSubmit.resetStatus())
        }

    }

    return (
        <div
            className={`product-spare-card ${is_removed ? 'is-deleted' : ''} ${is_selected ? 'is-selected' : ''} ${!is_active ? 'is-inactive' : ''}`}
            onClick={handleCardClick}
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
                        selection_info?.selected_context === coverage?.coverage_section ?
                            <button
                                type="button"
                                className="clear-btn"
                                onClick={handleUnSelect}
                                title="Undo removal"
                                aria-label="Undo removal"
                            >
                                <TbX />
                                <span>Unselect</span>
                            </button>
                            : ""
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

            {/* Replacement Details Preview (if replaced) */}
            {is_selected && (
                <div className="replacement-preview-row">
                    {selection_info?.selection_type === 'REPLACE' ?
                        <span className="replace-tag">
                            <TbReplace />
                            <span>Replaced with another spare</span>
                        </span>
                        : <span className="replace-tag">
                            <TbCheckbox />
                            <span>Replaced with exact spare</span>
                        </span>}

                    {selection_info?.policy_mode && (
                        <span className="policy-mini-badge">
                            {selection_info.policy_mode === 'WARRANTY'
                                ? 'Warranty (₹0)'
                                : selection_info.policy_mode === 'PAID_ZERO_OVERRIDE'
                                    ? 'Zero Fee (₹0)'
                                    : `Paid (₹${selection_info.charged_amount})`}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

export default ProductSpareCard
