import React, { useState, useMemo } from 'react'
import './replace-spare-modal.scss'
import {
    TbCircleX,
    TbShieldCheck,
    TbReceipt,
    TbCheck
} from 'react-icons/tb'
import InputText from '../../../../UI_Primitives/inputs/InputText'
import Textarea from '../../../../UI_Primitives/inputs/TextArea'
import Button from '../../../../UI_Primitives/buttons/Button'
import { isoToDDMonYYYY } from '../../../../../utils/helpers/date-helpers'
import { useSelector } from 'react-redux'
import { findSpareTypeAmount } from '../../../../../utils/flows/service_form_utils'

/**
 * ReplaceSpareModalContent
 * Rendered inside system modal. Handles product spare replacement,
 * strictly showing either Warranty Confirmation flow OR Non-Warranty (Paid) flow.
 */
const ReplaceSpareModal = ({
    currentSpare = null,
    productInForm,
    coverage,
    onConfirm = () => { },
    onClose = () => { }
}) => {

    const isWarranty = Boolean(currentSpare?.is_warranty_item);
    const { formResources, serviceFormSettings } = useSelector((state) => state.application);

    // Compatible spares list
    const compatibleSpares = useMemo(() => {
        const spareUuid = currentSpare?.spare_uuid || null;
        const activeProductType = serviceFormSettings?.activeProduct?.[1] || null

        if (!currentSpare || !spareUuid || !activeProductType) {
            return [];
        }

        let categorySpareList = formResources?.spare_list?.filter(s =>
            s?.applicable_for.includes(activeProductType)
            && s?.spare_uuid
            && s?.spare_category === currentSpare?.spare_category
        )

        const exactItem = [], alternativeItems = [];

        categorySpareList = categorySpareList?.map((spare) => {

            const priceObject = findSpareTypeAmount(
                (spare?.pricing || {}),
                currentSpare?.price_type || 'SELLING_RATE',
                productInForm?.service_data?.package_id || null,
                false
            )

            const spareWarrantyMonths = priceObject.charged > 0 && spare?.warranty_period ? spare?.warranty_period : 0

            if (spare?.spare_uuid === spareUuid) {
                exactItem.push({
                    spare_uuid: spare?.spare_uuid,
                    spare_id: spare?.spare_id,
                    spare_name: spare?.spare_name,
                    spare_category: spare?.spare_category,
                    is_active: true,
                    unit: spare?.unit,
                    pricing: priceObject,
                    is_exact: true,
                    warranty_period: spareWarrantyMonths
                })
            } else {
                alternativeItems.push({
                    spare_uuid: spare?.spare_uuid,
                    spare_id: spare?.spare_id,
                    spare_name: spare?.spare_name,
                    spare_category: spare?.spare_category,
                    is_active: true,
                    unit: spare?.unit,
                    pricing: priceObject,
                    is_exact: false,
                    warranty_period: spareWarrantyMonths
                })
            }

            return spare
        });

        return [...exactItem, ...alternativeItems]

    }, [currentSpare, isWarranty, formResources, serviceFormSettings]);

    // states
    const [selectedSpareUuid, setSelectedSpareUuid] = useState(compatibleSpares[0]?.spare_uuid || '')
    const [error, setError] = useState('')

    // Warranty Flow State (Option 1)
    const [warrantyConfirm, setWarrantyConfirm] = useState('YES') // 'YES' (Replace ₹0) | 'NO' (Charge customer)
    const [warrantyRejectReason, setWarrantyRejectReason] = useState('')

    // Non-Warranty / Paid Flow State (Option 2)
    const [paidBillingMode, setPaidBillingMode] = useState('FULL') // 'FULL' | 'ZERO' | 'CUSTOM'
    const [paidOverrideReason, setPaidOverrideReason] = useState('')

    const selectedSpare = useMemo(() => {
        return compatibleSpares.find((s) => s.spare_uuid === selectedSpareUuid) || {}
    }, [compatibleSpares, selectedSpareUuid])

    const standardRate = Number(selectedSpare?.pricing?.charged ?? 0)

    // Calculate final payable amount based on scenario
    const finalCharged = useMemo(() => {
        if (isWarranty) {
            return warrantyConfirm === 'YES' ? 0 : standardRate
        }
        // Non-warranty
        if (paidBillingMode === 'FULL') return standardRate
        if (paidBillingMode === 'ZERO') return 0

        return standardRate
    }, [isWarranty, warrantyConfirm, standardRate, paidBillingMode])


    const handleConfirm = () => {
        setError('')

        // Validation for Warranty scenario
        if (isWarranty && warrantyConfirm === 'NO' && !warrantyRejectReason.trim()) {
            setError('Please provide a reason why warranty replacement cannot be applied.')
            return
        }

        // Validation for Paid scenario
        if (!isWarranty) {
            if (paidBillingMode === 'ZERO' && !paidOverrideReason.trim()) {
                setError('Please provide a reason for zero amount replacement.')
                return
            }
        }

        const payload = {
            section_id: "PRODUCT_SPARE",
            original_spare_uuid: currentSpare?.spare_uuid,
            component_uuid: currentSpare?.component_uuid,
            spare_uuid: selectedSpare?.spare_uuid,
            spare_category: selectedSpare?.spare_category,
            qty: 1,
            is_warranty_item: isWarranty,
            is_exact_item: Boolean(selectedSpare?.is_exact),
            policy_mode: isWarranty
                ? (warrantyConfirm === 'YES' ? 'WARRANTY' : 'WARRANTY_REJECTED_PAID')
                : (paidBillingMode === 'FULL' ? 'PAID_FULL' : paidBillingMode === 'ZERO' ? 'PAID_ZERO_OVERRIDE' : 'PAID_CUSTOM'),
            policy_reason: isWarranty
                ? (warrantyConfirm === 'NO' ? warrantyRejectReason.trim() : '')
                : (paidBillingMode !== 'FULL' ? paidOverrideReason.trim() : ''),
            pricing: {
                list_price: selectedSpare?.pricing?.list_price || 0,
                charged: finalCharged,
                reason: selectedSpare?.pricing?.list_price !== finalCharged
                    ? isWarranty
                        ? currentSpare?.warranty_reason
                        : 'Spare policy changed'
                    : null
            },
            purchase_warranty_months: finalCharged > 0 && selectedSpare?.warranty_period ? selectedSpare?.warranty_period : 0
        }

        onConfirm(payload)
    }

    return (
        <div className="replace-spare-modal-content">
            {/* CURRENT PART BEING REMOVED */}
            <div className="current-part-banner">
                <div className="banner-sublabel">Current Part Being Removed</div>
                <div className="banner-part-row">
                    <TbCircleX className="alert-icon" />
                    <div className="part-info">
                        <h4 className="part-title">
                            {currentSpare?.spare_id} • {currentSpare?.spare_name}
                        </h4>
                        <p className="part-status">
                            Status: {!currentSpare?.is_active ? 'Inactive' : 'Active'} ({isWarranty ? 'Under Warranty' : 'No Warranty'})
                        </p>
                    </div>
                </div>
            </div>

            {/* COMPATIBLE REPLACEMENT OPTIONS */}
            <h4 className="section-heading">Compatible Replacement Options</h4>

            <div className="spares-radio-list">
                {compatibleSpares.map((spare) => {
                    const isChecked = spare.spare_uuid === selectedSpareUuid
                    return (
                        <div
                            key={spare.spare_uuid}
                            className={`spare-item-row ${isChecked ? 'selected' : ''}`}
                            onClick={() => setSelectedSpareUuid(spare.spare_uuid)}
                        >
                            <div className={`custom-radio ${isChecked ? 'checked' : ''}`}>
                                <div className="radio-dot" />
                            </div>

                            <div className="spare-info">
                                <div className="name-row">
                                    <span className="spare-name-text">{spare.spare_name}</span>
                                    {spare?.is_exact && (
                                        <span className="same-spare-tag">Exact Spare</span>
                                    )}
                                </div>
                                <div className="bottom-row">
                                    <span className="id-code">#{spare.spare_id}</span>
                                    {!!spare?.warranty_period && <span className="warranty-pill in-warranty">
                                        <TbShieldCheck className="pill-icon" />
                                        <span>{spare?.warranty_period} Months warranty</span>
                                    </span>}
                                </div>
                            </div>

                            <div className="spare-price">
                                {spare?.pricing?.list_price > spare?.pricing?.charged && (
                                    <span className="mrp-strike">₹{spare?.pricing?.list_price || 0}</span>
                                )}
                                <span className="charged-price">₹{spare?.pricing?.charged || 0}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {coverage?.coverage_section !== 'RENEWAL_SPARE' && <>
                {/* WARRANTY & POLICY SECTION: Only ONE of the two options is shown */}
                <h4 className="section-heading">Warranty & Policy Mode</h4>

                <div className="policy-box">
                    {isWarranty ? (
                        /* ================= OPTION 1: UNDER WARRANTY ================= */
                        <>
                            <div className="policy-banner warranty-banner">
                                <TbShieldCheck className="banner-icon" />
                                <div className="banner-text">
                                    <h5>Under Active Warranty Coverage</h5>
                                    <p>
                                        This spare is eligible for 100% cost waiver under warranty policy. Confirm if it can be replaced under warranty.
                                    </p>
                                </div>
                            </div>

                            <div className="policy-choice-group">
                                <span className="choice-label">Technician Warranty Confirmation:</span>
                                <div className="choice-options">
                                    <button
                                        type="button"
                                        className={`choice-btn ${warrantyConfirm === 'YES' ? 'active' : ''}`}
                                        onClick={() => {
                                            setWarrantyConfirm('YES')
                                            setError('')
                                        }}
                                    >
                                        <span className="choice-radio-indicator" />
                                        <div className="choice-content">
                                            <span className="choice-title">Yes, replace under warranty (₹0)</span>
                                            <span className="choice-desc">Covered under active warranty with 100% spare cost waiver. Warranty does not apply to this replacement if available.</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        className={`choice-btn ${warrantyConfirm === 'NO' ? 'active' : ''}`}
                                        onClick={() => {
                                            setWarrantyConfirm('NO')
                                            setError('')
                                        }}
                                    >
                                        <span className="choice-radio-indicator" />
                                        <div className="choice-content">
                                            <span className="choice-title">No, cannot replace under warranty (Charge customer)</span>
                                            <span className="choice-desc">Charge customer standard rate due to warranty rejection or physical damage</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {warrantyConfirm === 'NO' && (
                                <div className="inputs-container">
                                    <InputText
                                        label="Reason why warranty cannot be applied"
                                        name="warranty_reject_reason"
                                        id="warranty_reject_reason"
                                        value={warrantyRejectReason}
                                        onChange={(e) => {
                                            setWarrantyRejectReason(e.target.value)
                                            setError('')
                                        }}
                                        required
                                        helperText="Specify reason (e.g. physical damage, silt choking, unauthorized tampering)"
                                    />
                                </div>
                            )}

                            <div className="rate-summary-box">
                                <div className="summary-row">
                                    <span>Selected Spare Rate:</span>
                                    <span>₹{standardRate.toFixed(2)}</span>
                                </div>
                                {warrantyConfirm === 'YES' && (
                                    <div className="summary-row waiver-row">
                                        <span>Warranty Discount / Waiver:</span>
                                        <span>-₹{standardRate.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="summary-row final-row">
                                    <span>Net Payable by Customer:</span>
                                    <span>₹{finalCharged.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ================= OPTION 2: NON-WARRANTY / PAID ================= */
                        <>
                            <div className="policy-banner paid-banner">
                                <TbReceipt className="banner-icon" />
                                <div className="banner-text">
                                    <h5>Paid Spare Information</h5>
                                    <p>
                                        This spare was installed on <strong>{currentSpare?.insert_at ? isoToDDMonYYYY(currentSpare?.insert_at) : 'Unavailable date'}</strong> and is out of warranty. Default replacement is full charge.
                                    </p>
                                </div>
                            </div>

                            <div className="policy-choice-group">
                                <span className="choice-label">Replacement Charge Mode:</span>
                                <div className="choice-options">
                                    <button
                                        type="button"
                                        className={`choice-btn ${paidBillingMode === 'FULL' ? 'active' : ''}`}
                                        onClick={() => {
                                            setPaidBillingMode('FULL')
                                            setError('')
                                        }}
                                    >
                                        <span className="choice-radio-indicator" />
                                        <div className="choice-content">
                                            <span className="choice-title">Standard Full Charge (₹{standardRate})</span>
                                            <span className="choice-desc">Charge standard price according to spare catalog pricing</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className={`choice-btn ${paidBillingMode === 'ZERO' ? 'active' : ''}`}
                                        onClick={() => {
                                            setPaidBillingMode('ZERO')
                                            setError('')
                                        }}
                                    >
                                        <span className="choice-radio-indicator" />
                                        <div className="choice-content">
                                            <span className="choice-title">Replace with Zero Amount (₹0)</span>
                                            <span className="choice-desc">Waive spare cost with special technician approval/reason. Spare warranty does not apply to this replacement.</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {paidBillingMode === 'ZERO' && (
                                <div className="inputs-container">
                                    <Textarea
                                        label={'Reason for zero amount replacement'}
                                        name="paid_override_reason"
                                        id="paid_override_reason"
                                        value={paidOverrideReason}
                                        onChange={(e) => {
                                            setPaidOverrideReason(e.target.value)
                                            setError('')
                                        }}
                                        required
                                        rows={2}
                                        helperText="Specify justification (e.g. management approval, courtesy concession, repeat visit)"
                                    />
                                </div>
                            )}

                            <div className="rate-summary-box">
                                <div className="summary-row">
                                    <span>Standard Spare Rate:</span>
                                    <span>₹{standardRate.toFixed(2)}</span>
                                </div>
                                {paidBillingMode !== 'FULL' && (
                                    <div className="summary-row waiver-row">
                                        <span>Concession / Adjustment:</span>
                                        <span>-₹{Math.max(0, standardRate - finalCharged).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="summary-row final-row">
                                    <span>Net Payable by Customer:</span>
                                    <span>₹{finalCharged.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </>}

            {/* FIXED BOTTOM ACTION BUTTONS */}
            <div className="fixed-bottom-actions">
                {error && <p className="error-hint">{error}</p>}
                <div className="buttons">
                    <Button
                        label="Cancel"
                        severity="secondary"
                        outlined
                        rounded
                        onClick={onClose}
                    />
                    <Button
                        label={`Replace • ₹${finalCharged}`}
                        severity="primary"
                        rounded
                        icon={<TbCheck />}
                        onClick={handleConfirm}
                    />
                </div>
            </div>

        </div>
    )
}

export default ReplaceSpareModal
