import React from 'react'
import './call-log-item.scss';
import { convertIsoToAmPm, isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers';

const CallLogItem = ({ data }) => {
    return (
        <div className="tech-call-log-item-container">
            <p className='message'>{data?.message}</p>
            <div>
                <p>{data?.caller_category === 'Controller' ? 'Admin' : data?.called_by}</p>
                <p>{isoToDDMonYYYY(data?.called_at)}, {convertIsoToAmPm(data?.called_at)}</p>
            </div>
        </div>
    )
}

export default CallLogItem