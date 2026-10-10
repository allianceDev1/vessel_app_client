import React, { useMemo, useState } from 'react'
import './selected-work-summary.scss'
import { useSelector } from 'react-redux'
import { TbComponents, TbTools, TbChevronDown, TbChevronUp, TbReceipt } from 'react-icons/tb'

// Sample preview data for mobile design preview
const SAMPLE_SPARES = [
  {
    spare_id: 'SP-1042',
    spare_name: 'Sediment Filter Cartridge 10"',
    spare_type: 'RENEWAL_SPARE',
    qty: 2,
    rate: 350,
    total: 700
  },
  {
    spare_id: 'SP-2081',
    spare_name: 'Activated Carbon Block Pre-Filter',
    spare_type: 'PACKAGE_SPARE',
    qty: 1,
    rate: 650,
    total: 650
  },
  {
    spare_id: 'SP-3310',
    spare_name: 'RO Membrane 75 GPD Dow Filmtec',
    spare_type: 'ADDITIONAL_SPARE',
    qty: 1,
    rate: 1850,
    total: 1850
  }
]

const SAMPLE_WORKS = [
  {
    work_id: 'WK-101',
    work_name: 'Full System Sanitation & Flushing',
    work_type: 'RENEWAL_SERVICE',
    rate: 400
  },
  {
    work_id: 'WK-204',
    work_name: 'Membrane Housing Descaling & Leak Test',
    work_type: 'PACKAGE_SERVICE',
    rate: 250
  },
  {
    work_id: 'WK-302',
    work_name: 'Booster Pump Flow Rate Calibration',
    work_type: 'ADDITIONAL_SERVICE',
    rate: 350
  }
]

const SelectedWorkSummary = ({ productInForm: propProductInForm }) => {
  const { serviceForm, serviceFormSettings } = useSelector((state) => state.application || {})

  // Collapsible toggle state (default closed)
  const [isOpen, setIsOpen] = useState(false)
  const [menuMeta, setMenuMeta] = useState({
    renewal_spares: 0,
    package_spares: 0,
    additional_spares: 0,
    renewal_services: 0,
    package_services: 0,
    additional_services: 0
  })


  const productInForm = useMemo(() => {
    const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]

    setMenuMeta({
      renewal_spares: current?.work?.components_list?.filter((s) => s.spare_type === 'RENEWAL_SPARE')?.length,
      package_spares: current?.work?.components_list?.filter((s) => s.spare_type === 'PACKAGE_SPARE')?.length,
      additional_spares: current?.work?.components_list?.filter((s) => s.spare_type === 'ADDITIONAL_SPARE')?.length,
      renewal_services: current?.work?.services_list?.filter((s) => s.service_type === 'RENEWAL_SERVICE')?.length,
      package_services: current?.work?.services_list?.filter((s) => s.service_type === 'PACKAGE_SERVICE')?.length,
      additional_services: current?.work?.services_list?.filter((s) => s.service_type === 'ADDITIONAL_SERVICE')?.length
    })

    return current || {}
    // eslint-disable-next-line
  }, [serviceForm?.service_products])


  // Spares list mapping with design preview fallback
  const displaySpares = useMemo(() => {
    const list = productInForm?.work?.components_list
    if (list && list.length > 0) {
      return list.map((s) => {
        const qty = Number(s?.qty || 1)
        const rate = Number(s?.pricing?.charged ?? s?.rate ?? 0)
        return {
          spare_id: s?.spare_id || s?.spare_uuid || 'SP-001',
          spare_name: s?.spare_name || 'Component Item',
          spare_type: s?.spare_type || 'SPARE',
          qty,
          rate,
          total: qty * rate
        }
      })
    }
    return SAMPLE_SPARES
  }, [productInForm?.work?.components_list])

  // Works list mapping with design preview fallback
  const displayWorks = useMemo(() => {
    const list = productInForm?.work?.services_list
    if (list && list.length > 0) {
      return list.map((w) => {
        const rate = Number(w?.pricing?.charged ?? w?.rate ?? 0)
        return {
          work_id: w?.service_id || w?.service_uuid || 'WK-001',
          work_name: w?.service_name || 'Service Work Item',
          work_type: w?.service_type || 'SERVICE',
          rate
        }
      })
    }
    return SAMPLE_WORKS
  }, [productInForm?.work?.services_list])

  // Summary calculations
  const sparesTotalAmount = useMemo(() => {
    return displaySpares.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0)
  }, [displaySpares])

  const worksTotalAmount = useMemo(() => {
    return displayWorks.reduce((acc, curr) => acc + (Number(curr.rate) || 0), 0)
  }, [displayWorks])

  const grandTotalAmount = useMemo(() => {
    return sparesTotalAmount + worksTotalAmount
  }, [sparesTotalAmount, worksTotalAmount])

  const totalItemsCount = useMemo(() => {
    return displaySpares.length + displayWorks.length
  }, [displaySpares.length, displayWorks.length])

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
                      <span className="item-code">{spare.spare_id}</span>
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

          {/* Service Works Sub-list */}
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
                      <span className="item-code">{work.work_id}</span>
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
        </div>
      )}

      <div className="card-footer">
        <div className="footer-meta">
          <span className="sub-stat">
            Spares: <strong>₹{sparesTotalAmount.toLocaleString('en-IN')}</strong>
          </span>
          <span className="stat-dot">•</span>
          <span className="sub-stat">
            Works: <strong>₹{worksTotalAmount.toLocaleString('en-IN')}</strong>
          </span>
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

