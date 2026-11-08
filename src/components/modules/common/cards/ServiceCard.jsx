import React, { useState } from 'react'
import './service-card.scss'
import { TbArrowUpRight, TbHash, TbSettings, TbTool, TbMessage2 } from 'react-icons/tb'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'

// RENEWAL_* / PACKAGE_* / ADDITIONAL_* -> color variant
const typeClass = (t) => {
    const v = String(t || '').toUpperCase()
    if (v.startsWith('RENEWAL')) return 'renewal'
    if (v.startsWith('PACKAGE')) return 'package'
    if (v.startsWith('ADDITIONAL')) return 'additional'
    return ''
}

const toList = (v) => (Array.isArray(v) ? v.flat(Infinity).filter(Boolean) : [])

const formatAmount = (v) => {
    const n = Number(v)
    if (v === null || v === undefined || v === '' || Number.isNaN(n)) return '0.00'
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const ServiceCard = ({ data, pointer = false, onClick = () => { } }) => {
    // Package color if available, otherwise the palette's primary color
    const color = data?.package_color_code || 'var(--color-primary)'
    const total = formatAmount(data?.grand_total_amount)
    const [expanded, setExpanded] = useState(false)

    const spares = toList(data?.spares)
    const works = toList(data?.service_works)

    // `pointer` keeps its old meaning: the card has a details page to navigate to
    const handleNavigate = (e) => {
        e.stopPropagation()
        onClick()
    }

    return (
        <div
            className={`service-card-item-container ${expanded ? 'expanded' : ''}`}
            style={{ cursor: 'pointer', '--pkg-color': color }}
            onClick={() => setExpanded((p) => !p)}
        >
            <div className="top-row">
                <div className="tags">
                    {data?.package_name ? <span className="pill pkg-pill"><i className="dot" />{data.package_name}</span> : null}
                    {data?.mode ? <span className="pill mode-pill">{toStandardText(data.mode)}</span> : null}
                    {data?.repeat ? <span className="pill repeat-pill">Repeat</span> : null}
                </div>
                <span className={`amount ${data?.package_id ? '' : 'no-package'}`}>₹{total}</span>
            </div>

            <h4 className="title">{data?.card_title}</h4>

            <div className="bottom-row">
                <p className="worker">{data?.worker_name}</p>
                <span className="date">{isoToDDMonYYYY(data?.date)}</span>
            </div>

            <div className={`details-wrapper ${expanded ? 'open' : ''}`}>
                <div className="details-inner">
                    <div className="details-head">
                        <span className="srl"><TbHash />{data?.service_srl_no}</span>
                        {pointer && (
                            <button type="button" className="nav-btn" title="Open details" onClick={handleNavigate}>
                                <TbArrowUpRight />
                            </button>
                        )}
                    </div>

                    {spares.length > 0 && (
                        <div className="detail-block">
                            <h5><TbSettings /> Spares</h5>
                            <ul className="item-list">
                                {spares.map((s, i) => (
                                    <li key={`s-${i}`} className={`item ${typeClass(s?.spare_type)}`} title={toStandardText(s?.spare_type)}>
                                        <span className="name">{s?.spare_name}</span>
                                        {s?.qty !== undefined && <span className="qty">×{s.qty}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {works.length > 0 && (
                        <div className="detail-block">
                            <h5><TbTool /> Service works</h5>
                            <ul className="item-list">
                                {works.map((w, i) => {
                                    const t = w?.service_type
                                    return (
                                        <li key={`w-${i}`} className={`item ${typeClass(t)}`} title={toStandardText(t)}>
                                            <span className="name">{w?.work_name}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )}

                    {data?.comment ? (
                        <div className="detail-block">
                            <h5><TbMessage2 /> Comment</h5>
                            <p className="text">{data.comment}</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default ServiceCard
