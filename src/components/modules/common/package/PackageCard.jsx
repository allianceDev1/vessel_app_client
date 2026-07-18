import React from 'react'
import './package-card.scss'
import { TbCrown } from 'react-icons/tb'
import { getPackageProgress, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { PACKAGE_STATUSES_TEXT } from '../../../../assets/javascript/pre_data/package'
import { useNavigate } from 'react-router-dom'

const PackageCard = ({ data, redirectUrl }) => {
    const navigate = useNavigate();
    const tempColor = '#000000'


    const packageProgress = getPackageProgress({ startDate: data?.start_date, endDate: data?.expire_date, currentDate: data?.expired_at ? data?.expired_at : new Date() })

    return (
        <div className="package-card-container" style={{
            borderColor: `${data?.color_code || tempColor}a8`,
            backgroundImage: `radial-gradient(${data?.color_code || tempColor}4b 0.7000000000000001px, #ffffff0e 0.7000000000000001px)`,
            cursor: redirectUrl ? 'pointer' : ''
        }} onClick={() => redirectUrl ? navigate(redirectUrl) : ''}>
            <div className="border">
                <div className="top-section">
                    <div className="icon-box" style={{ backgroundColor: `${data?.color_code || tempColor}38` }}>
                        <TbCrown style={{ color: `${data?.color_code || tempColor}` }} />
                    </div>
                    <div className="title-section">
                        <div className="head">
                            <h3 style={{ color: `${data?.color_code || tempColor}` }}>{data?.package_name}</h3>
                            <p>{data?.serial_number}</p>
                        </div>
                        <p>{data?.full_form}</p>
                    </div>
                </div>
                <div className="content">
                    <div className="box">
                        <h3>{data?.sr_works || 0} / {data?.number_of_services || 0}</h3>
                        <p>Services</p>
                    </div>
                    <div className="box">
                        <h3>{data?.visits || 0} - {data?.repeats || 0}</h3>
                        <p>Visit & Repeats</p>
                    </div>
                    <div className="date-graph">
                        <div className="date-status">
                            {data?.start_date ? <p>{isoToDDMonYYYY(data?.start_date)} to {isoToDDMonYYYY(data?.expire_date)}</p> : <p>Date not assigned</p>}
                            <p className={PACKAGE_STATUSES_TEXT[data?.package_status] || 'Pending'}>
                                {PACKAGE_STATUSES_TEXT[data?.package_status]}
                            </p>
                        </div>
                        <div className="outer-line">
                            <div style={{ width: `${packageProgress?.progress}%`, backgroundColor: `${data?.color_code || tempColor}` }} className={`inner-line`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default PackageCard