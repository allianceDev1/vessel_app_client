import React, { useMemo, useState } from 'react'
import './selected-work-summary.scss'
import { useSelector } from 'react-redux'
import { TbComponents, TbTools, TbChevronDown, TbChevronUp, TbReceipt, TbPackage, TbReceiptTax } from 'react-icons/tb'
import { calculateTaxAmount, toDecimal } from '../../../../../utils/helpers/math-equations'

const SelectedWorkSummary = ({ productInForm, serviceCategory }) => {
  const { formResources } = useSelector((state) => state.application || {})

  // Collapsible toggle state (default closed)
  const [isOpen, setIsOpen] = useState(false)

  // Spares list mapping with real data
  const displaySpares = useMemo(() => {
    const list = productInForm?.work?.components_list
    if (list && list.length > 0) {
      return list.map((s) => {
        const spareInfo = formResources?.spare_list?.find((item) => item?.spare_uuid === s?.spare_uuid)
        const qty = Number(s?.qty || 1)
        const rate = Number(s?.pricing?.charged ?? s?.rate ?? 0)
        return {
          spare_id: s?.spare_id || spareInfo?.spare_id || 'SP',
          spare_name: s?.spare_name || spareInfo?.spare_name || 'Component Item',
          spare_type: s?.selection_context || s?.spare_type || 'SPARE',
          qty,
          rate,
          total: qty * rate
        }
      })
    }
    return []
  }, [productInForm?.work?.components_list, formResources?.spare_list])

  // Works list mapping with real data
  const displayWorks = useMemo(() => {
    const list = productInForm?.work?.services_list
    if (list && list.length > 0) {
      return list.map((w) => {
        const workInfo = formResources?.service_work_list?.find((item) => item?.work_uuid === w?.work_uuid)
        const rate = Number(w?.pricing?.charged ?? w?.rate ?? 0)
        return {
          work_id: w?.work_id || workInfo?.work_id || 'WK',
          work_name: w?.work_name || workInfo?.work_name || 'Service Work Item',
          work_type: w?.selection_context || w?.work_type || w?.service_type || 'SERVICE',
          rate
        }
      })
    }
    return []
  }, [productInForm?.work?.services_list, formResources?.service_work_list])

  // Selected package details and amount (analyzed from ServiceCategories.jsx)
  const selectedPackage = useMemo(() => {
    const renewedPkg = productInForm?.service_data?.renewed_package
    const isRenewalMode = serviceCategory?.mode === 'RENEWAL' || productInForm?.service_data?.mode === 'RENEWAL'

    if (renewedPkg?.is_renewed || isRenewalMode) {
      const pkgName = renewedPkg?.package_name || serviceCategory?.target_package?.name || 'Renewal Package'
      const pkgId = renewedPkg?.package_id || serviceCategory?.target_package?.package_id || null

      let amount = 0
      if (renewedPkg?.price?.total_rate !== undefined && renewedPkg?.price?.total_rate !== null) {
        amount = Number(renewedPkg.price.total_rate) || 0
      } else if (renewedPkg?.price?.base_rate !== undefined && renewedPkg?.price?.base_rate !== null) {
        amount = Number(renewedPkg.price.base_rate) || 0
      } else if (serviceCategory?.target_package?.pricing_config) {
        const baseRate = serviceCategory?.target_package?.pricing_config?.base_price || 0
        const taxRate = serviceCategory?.target_package?.pricing_config?.gst?.rate || 0
        const taxType = serviceCategory?.target_package?.pricing_config?.gst?.type || null
        const tax = taxRate ? calculateTaxAmount(baseRate, taxRate, taxType) : 0
        amount = toDecimal(baseRate + (tax?.total_tax || 0), { precision: 2 })
      }

      return {
        package_id: pkgId,
        package_name: pkgName,
        package_type: 'RENEWAL_PACKAGE',
        amount
      }
    }

    return null
  }, [productInForm?.service_data?.renewed_package, productInForm?.service_data?.mode, serviceCategory])

  // Service charge calculation:
  // - service_data.service_charge_applied === false => don't show service charge
  // - if service_data.service_charge_applied && service_category > service_charge_applied both applied => apply amount, otherwise set zero
  // - if repeat work => minus index 0 charge value from service charge and show balance only
  // - repeat only affects service charge when service_data.service_charge_applied === true
  const { showServiceCharge, serviceChargeAmount, isRepeat } = useMemo(() => {
    const isServiceDataChargeApplied = Boolean(productInForm?.service_data?.service_charge_applied)
    if (!isServiceDataChargeApplied) {
      return {
        showServiceCharge: false,
        serviceChargeAmount: 0,
        isRepeat: false
      }
    }

    const isCategoryChargeApplied = Boolean(
      serviceCategory?.service_charge_applied && !productInForm?.service_data?.has_product_warranty
    )

    let rawCharge = 0
    if (isCategoryChargeApplied) {
      rawCharge = Number(
        productInForm?.service_data?.service_charge?.estimate ??
        serviceCategory?.service_charges?.[0]?.charge_amount ??
        0
      )
    } else {
      rawCharge = 0
    }

    const repeatActive = Boolean(productInForm?.service_data?.repeat?.tech_say)

    let finalCharge = rawCharge
    if (repeatActive) {
      const index0Value = Number(serviceCategory?.service_charges?.[0]?.charge_amount || 0)
      finalCharge = Math.max(0, rawCharge - index0Value)
    }

    return {
      showServiceCharge: true,
      serviceChargeAmount: finalCharge,
      isRepeat: repeatActive
    }
  }, [
    productInForm?.service_data?.service_charge_applied,
    productInForm?.service_data?.has_product_warranty,
    productInForm?.service_data?.service_charge?.estimate,
    productInForm?.service_data?.repeat?.tech_say,
    serviceCategory
  ])

  // Summary calculations
  const sparesTotalAmount = useMemo(() => {
    return displaySpares.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0)
  }, [displaySpares])

  const worksTotalAmount = useMemo(() => {
    return displayWorks.reduce((acc, curr) => acc + (Number(curr.rate) || 0), 0)
  }, [displayWorks])

  const grandTotalAmount = useMemo(() => {
    let total = sparesTotalAmount + worksTotalAmount
    if (selectedPackage) {
      total += Number(selectedPackage.amount) || 0
    }
    if (showServiceCharge) {
      total += Number(serviceChargeAmount) || 0
    }
    return total
  }, [sparesTotalAmount, worksTotalAmount, selectedPackage, showServiceCharge, serviceChargeAmount])

  const totalItemsCount = useMemo(() => {
    let count = displaySpares.length + displayWorks.length
    if (selectedPackage) count += 1
    if (showServiceCharge) count += 1
    return count
  }, [displaySpares.length, displayWorks.length, selectedPackage, showServiceCharge])

  const formatTypeLabel = (type) => {
    if (!type) return 'Standard'
    return String(type)
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const getTypeBadgeClass = (type) => {
    const t = String(type || '').toUpperCase()
    if (t.includes('RENEWAL')) return 'badge-renewal'
    if (t.includes('PACKAGE')) return 'badge-package'
    if (t.includes('ADDITIONAL')) return 'badge-additional'
    return 'badge-default'
  }

  const footerMetaItems = useMemo(() => {
    const items = []
    if (displaySpares.length > 0) {
      items.push({ key: 'spares', label: 'Spares', value: `₹${sparesTotalAmount.toLocaleString('en-IN')}` })
    }
    if (displayWorks.length > 0) {
      items.push({ key: 'works', label: 'Works', value: `₹${worksTotalAmount.toLocaleString('en-IN')}` })
    }
    if (selectedPackage) {
      items.push({ key: 'package', label: 'Package', value: `₹${Number(selectedPackage.amount).toLocaleString('en-IN')}` })
    }
    if (showServiceCharge) {
      items.push({ key: 'service_charge', label: 'Service Charge', value: `₹${Number(serviceChargeAmount).toLocaleString('en-IN')}` })
    }
    return items
  }, [displaySpares.length, displayWorks.length, sparesTotalAmount, worksTotalAmount, selectedPackage, showServiceCharge, serviceChargeAmount])



  return (
    <div className={`selected-section-card ${!isOpen ? 'collapsed' : ''}`}>
      <div
        className="card-header clickable"
        onClick={() => setIsOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
      >
        <div className="header-left">
          <div className="icon-box">
            <TbReceipt />
          </div>
          <div className="header-text">
            <h3>Selected Spares & Works</h3>
            <p>Tap to {isOpen ? 'hide' : 'view'} detailed list</p>
          </div>
        </div>
        <div className="header-right">
          <span className="count-pill">
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
          </span>
          <span className="toggle-chevron">
            {isOpen ? <TbChevronUp /> : <TbChevronDown />}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="card-body-expanded">
          {/* Spares Sub-list */}
          {displaySpares.length > 0 && (
            <div className="sub-list-block">
              <div className="sub-list-header">
                <div className="sub-title">
                  <div className="icon-tag spares">
                    <TbComponents />
                  </div>
                  <h4>Selected Spares ({displaySpares.length})</h4>
                </div>
                <span className="sub-total-tag">₹{sparesTotalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="mobile-items-list">
                {displaySpares.map((spare, idx) => (
                  <div className="mobile-item-card" key={`spare-${spare.spare_id}-${idx}`}>
                    <div className="card-top">
                      <div className="id-and-title">
                        <span className="item-code">#{spare.spare_id}</span>
                        <h4 className="item-name">{spare.spare_name}</h4>
                      </div>
                      <div className="item-total">
                        <span className="total-label">Total</span>
                        <span className="total-val">₹{Number(spare.total).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="card-bottom">
                      <span className={`type-tag ${getTypeBadgeClass(spare.spare_type)}`}>
                        {formatTypeLabel(spare.spare_type)}
                      </span>
                      <div className="qty-rate-pills">
                        <span className="pill">
                          Qty: <strong>{spare.qty}</strong>
                        </span>
                        <span className="pill">
                          Rate: <strong>₹{Number(spare.rate).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Works Sub-list */}
          {displayWorks.length > 0 && (
            <div className="sub-list-block">
              <div className="sub-list-header">
                <div className="sub-title">
                  <div className="icon-tag works">
                    <TbTools />
                  </div>
                  <h4>Selected Service Works ({displayWorks.length})</h4>
                </div>
                <span className="sub-total-tag">₹{worksTotalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="mobile-items-list">
                {displayWorks.map((work, idx) => (
                  <div className="mobile-item-card" key={`work-${work.work_id}-${idx}`}>
                    <div className="card-top">
                      <div className="id-and-title">
                        <span className="item-code">#{work.work_id}</span>
                        <h4 className="item-name">{work.work_name}</h4>
                      </div>
                      <div className="item-total">
                        <span className="total-label">Rate</span>
                        <span className="total-val">₹{Number(work.rate).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="card-bottom">
                      <span className={`type-tag ${getTypeBadgeClass(work.work_type)}`}>
                        {formatTypeLabel(work.work_type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Package Sub-list */}
          {selectedPackage && (
            <div className="sub-list-block">
              <div className="sub-list-header">
                <div className="sub-title">
                  <div className="icon-tag package">
                    <TbPackage />
                  </div>
                  <h4>Selected Package (1)</h4>
                </div>
                <span className="sub-total-tag">₹{Number(selectedPackage.amount).toLocaleString('en-IN')}</span>
              </div>

              <div className="mobile-items-list">
                <div className="mobile-item-card">
                  <div className="card-top">
                    <div className="id-and-title">
                      {selectedPackage.package_id && (
                        <span className="item-code">#{selectedPackage.package_id}</span>
                      )}
                      <h4 className="item-name">{selectedPackage.package_name}</h4>
                    </div>
                    <div className="item-total">
                      <span className="total-label">Amount</span>
                      <span className="total-val">₹{Number(selectedPackage.amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="card-bottom">
                    <span className="type-tag badge-package">
                      Renewal Package
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Charge Sub-list */}
          {showServiceCharge && (
            <div className="sub-list-block">
              <div className="sub-list-header">
                <div className="sub-title">
                  <div className="icon-tag service-charge">
                    <TbReceiptTax />
                  </div>
                  <h4>Service Charge</h4>
                </div>
                <span className="sub-total-tag">₹{Number(serviceChargeAmount).toLocaleString('en-IN')}</span>
              </div>

              <div className="mobile-items-list">
                <div className="mobile-item-card">
                  <div className="card-top">
                    <div className="id-and-title">
                      <span className="item-code">SERVICE-CHARGE</span>
                      <h4 className="item-name">
                        {isRepeat ? 'Service Charge (Repeat)' : 'Service Charge'}
                      </h4>
                    </div>
                    <div className="item-total">
                      <span className="total-label">Amount</span>
                      <span className="total-val">₹{Number(serviceChargeAmount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="card-bottom">
                    <span className={`type-tag ${isRepeat ? 'badge-renewal' : 'badge-default'}`}>
                      {isRepeat ? 'Repeat Work' : 'Standard Charge'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback if no items at all */}
          {totalItemsCount === 0 && (
            <div className="empty-summary-placeholder">
              <p>No spares or services selected yet</p>
            </div>
          )}
        </div>
      )}

      <div className="card-footer">
        <div className="footer-meta">
          {footerMetaItems.length === 0 ? (
            <span className="sub-stat">No items selected</span>
          ) : (
            footerMetaItems.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && <span className="stat-dot">•</span>}
                <span className="sub-stat">
                  {item.label}: <strong>{item.value}</strong>
                </span>
              </React.Fragment>
            ))
          )}
        </div>
        <div className="footer-total">
          <span className="label">Total:</span>
          <span className="amount">₹{grandTotalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}

export default SelectedWorkSummary
