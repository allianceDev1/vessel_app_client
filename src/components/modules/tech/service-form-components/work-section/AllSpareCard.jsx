import React from 'react'
import './all-spare-card.scss'
import {
    TbPlus,
    TbMinus,
    TbShieldCheck,
} from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { sfActions } from '../../../../../redux/features/persisted/applicationSlice'

/**
 * AllSpareCard
 * Compact mobile-friendly item row designed for high-density listing (100+ spares).
 * Keeps all data elements intact without extra whitespace.
 *
 * @param {Object} props
 * @param {Object} props.data - Spare catalog item object
 * @param {Object} props.productInForm 
 * @param {Object} props.workMenu 
 *
 */
const AllSpareCard = ({
    data,
    productInForm,
    workMenu,
}) => {
    const {
        spare_id,
        spare_uuid,
        spare_name,
        pricing = { list_price: 0, charged: 0 },
        is_active = true,
        is_selected = false,
        qty = 0,
        unit,
        warranty_period = 0
    } = data || {}

    const dispatch = useDispatch();

    const count = Number(qty || 0)
    const actualPrice = Number(pricing?.charged ?? 0)
    const mrpPrice = Number(pricing?.list_price ?? 0)
    const hasDiscount = mrpPrice > actualPrice
    const itemTotal = count * actualPrice

    const handleIncrement = (e) => {
        e?.stopPropagation?.();

        let componentList = [...(productInForm?.work?.components_list || [])];
        const spareIndex = componentList?.findIndex(c =>
            c?.section_id === 'ALL_SPARE' &&
            c?.spare_uuid === spare_uuid &&
            c?.selection_context === workMenu)

        // already selected
        if (spareIndex !== -1) {
            componentList = componentList?.map((comp, index) => {
                if (index === spareIndex) {
                    return {
                        ...comp,
                        qty: Number(comp.qty || 0) + 1
                    }
                }
                return comp
            })
        } else {
            // not selected already
            componentList.push({
                selection_context: workMenu,
                section_id: "ALL_SPARE",
                original_spare_uuid: null,
                component_uuid: null,
                spare_uuid,
                qty: 1,
                pricing,
                purchase_warranty_months: warranty_period || 0
            })
        }

        dispatch(sfActions.updateProduct.innerFields({
            work: {
                ...(productInForm?.work || {}),
                components_list: componentList
            }
        }))

    }

    const handleDecrement = (e) => {
        e?.stopPropagation?.()

        let componentList = [...(productInForm?.work?.components_list || [])];

        const spareIndex = componentList?.findIndex(c =>
            c?.section_id === 'ALL_SPARE' &&
            c?.spare_uuid === spare_uuid &&
            c?.selection_context === workMenu)


        const spare = componentList?.[spareIndex] || {}

        if (!spare) {
            return;
        }

        // already selected
        if (spare?.qty === 1) {
            componentList = componentList?.filter((comp, index) => index !== spareIndex)
        } else {
            componentList = componentList?.map((comp, index) => {
                if (index === spareIndex) {
                    return {
                        ...comp,
                        qty: Number(comp.qty || 0) - 1
                    }
                }
                return comp
            })

        }

        dispatch(sfActions.updateProduct.innerFields({
            work: {
                ...(productInForm?.work || {}),
                components_list: componentList
            }
        }))


    }

    return (
        <div
            className={`all-spare-card ${is_selected ? 'is-added' : ''} ${!is_active ? 'is-inactive' : ''}`}
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
                    {hasDiscount && <span className="mrp-price">₹{mrpPrice}</span>}
                    {spare_id && <span className="spare-id-code">#{spare_id}</span>}

                    {!!warranty_period && <span className="warranty-pill in-warranty">
                        <TbShieldCheck className="pill-icon" />
                        <span>{warranty_period} M Warranty</span>
                    </span>}
                </div>
            </div>

            {/* Right Action: Compact Add Button or Inline Stepper */}
            <div className="card-action-side">
                {is_selected ? (
                    <div className="stepper-wrapper">
                        <div className="stepper-controls">
                            <button
                                type="button"
                                className="stepper-btn minus-btn"
                                onClick={handleDecrement}
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
                                disabled={!is_active}
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
                        onClick={handleIncrement}
                        disabled={!is_active}
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
