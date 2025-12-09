import React from 'react'
import './call-logs.scss'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'

const CallLogs = ({ data }) => {
    return (
        <div className="tech-customer-call-logs">
            <h2>Call Logs</h2>
            {data?.map((log) => {
                return <div className="description__item" key={log.call_uuid}>
                    <div className="header__left">
                        <p className="item__text">{isoToDDMonYYYY(new Date(log.called_at))}</p>
                    </div>
                    <div className="header__right">
                        <p className="item__text">{log?.message || 'No message'}<br></br> ({log?.caller_category === 'Controller' ? 'Controller' : log?.called_by})</p>
                    </div>
                </div>
            })}
        </div>
    )
}

export default CallLogs