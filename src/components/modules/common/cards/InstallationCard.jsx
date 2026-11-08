import React, { useState } from 'react'
import './service-card.scss'
import { TbHash, TbBox, TbMessage2, TbFileText, TbUserSearch } from 'react-icons/tb'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'

const InstallationCard = ({ data, pointer = false }) => {
    const [expanded, setExpanded] = useState(false)
    const hasComment = !!data?.comment
    // Prospect id from e-form no: "Q" -> "LES", then drop the last 5 chars (incl. the "-")
    const prospectId = data?.e_form_srl_no
        ? String(data.e_form_srl_no).replace('Q', 'LES').slice(0, -5)
        : null

    return (
        <div
            className={`service-card-item-container installation ${expanded ? 'expanded' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setExpanded((p) => !p)}
        >
            <div className="top-row">
                <div className="tags">
                    <span className="pill pkg-pill"><i className="dot" />{toStandardText(data?.card_type) || 'Installation'}</span>
                    {data?.sku ? <span className="pill mode-pill">{data.sku}</span> : null}
                    {data?.repeat ? <span className="pill repeat-pill">Repeat</span> : null}
                </div>
            </div>

            <h4 className="title">{data?.card_title}</h4>

            <div className="bottom-row">
                <p className="worker">{data?.worker_name}</p>
                <span className="date">{isoToDDMonYYYY(data?.date)}</span>
            </div>

            <div className={`details-wrapper ${expanded ? 'open' : ''}`}>
                <div className="details-inner">
                    <div className="details-head">
                        <div className="srl-group">
                            <span className="srl" title="Installation No"><TbHash />{data?.installation_srl_no || 'Not Linked'}</span>
                            {data?.e_form_srl_no ? <span className="srl" title="E-Form No"><TbFileText />{data.e_form_srl_no}</span> : null}
                            {prospectId ? <span className="srl" title="Prospect ID"><TbUserSearch />{prospectId}</span> : null}
                        </div>
                    </div>

                    {data?.product_name ? (
                        <div className="detail-block">
                            <h5><TbBox /> Product</h5>
                            <p className="text">{data.product_name}</p>
                        </div>
                    ) : null}

                    {hasComment ? (
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

export default InstallationCard
