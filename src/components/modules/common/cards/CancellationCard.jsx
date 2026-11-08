import React, { useState } from 'react'
import './service-card.scss'
import { TbHash, TbMessage2 } from 'react-icons/tb'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'

const CancellationCard = ({ data, pointer = false }) => {
    const [expanded, setExpanded] = useState(false)
    const hasComment = !!data?.comment
    const hasIndex = data?.service_index !== undefined && data?.service_index !== null && data?.service_index !== ''

    return (
        <div
            className={`service-card-item-container cancellation ${expanded ? 'expanded' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setExpanded((p) => !p)}
        >
            <div className="top-row">
                <div className="tags">
                    <span className="pill pkg-pill"><i className="dot" />Cancelled</span>
                </div>
            </div>

            <h4 className="title">Service Cancelled</h4>

            <div className="bottom-row">
                <p className="worker">{data?.worker_name}</p>
                <span className="date">{isoToDDMonYYYY(data?.date)}</span>
            </div>

            {(hasIndex || hasComment) && (
                <div className={`details-wrapper ${expanded ? 'open' : ''}`}>
                    <div className="details-inner">
                        {hasIndex && (
                            <div className="details-head">
                                <div className="srl-group">
                                    <span className="srl" title="Service Index"><TbHash />Index : {data.service_index}</span>
                                </div>
                            </div>
                        )}

                        {hasComment && (
                            <div className="detail-block">
                                <h5><TbMessage2 /> Comment</h5>
                                <p className="text">{data.comment}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CancellationCard
