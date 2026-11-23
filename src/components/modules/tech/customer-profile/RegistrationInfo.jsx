import React from 'react'
import './registration-info.scss';
import {
    TbAlertCircle,
    TbCircleDashedLetterT,
    TbClockHour10,
    TbGrid3X3,
    TbNote,
    TbStatusChange
} from 'react-icons/tb';
import Badge from '../../../UI_Primitives/badge/Badge';
import { reg_priority } from '../../../../assets/javascript/pre_data/package';
import { toStandardText } from '../../../../utils/helpers/text-formatting';

const RegistrationInfo = ({ regId = null, regStatus = null, regType = null, serviceType = null, regTime = null, note = null, priority = 0, complaints = null }) => {
    const hasComplaints = Array.isArray(complaints) ? complaints.length > 0 : Boolean(complaints);
    const showPriority = [2, 3].includes(Number(priority));

    return (
        <div className="tech-registration-info-comp">
            {(hasComplaints || note) && (
                <div className="highlights">
                    {hasComplaints && (
                        <div className="highlight-item complaints">
                            <TbAlertCircle />
                            <p>{complaints}</p>
                        </div>
                    )}
                    {note && (
                        <div className="highlight-item note">
                            <TbNote />
                            <p>{note}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="content">
                {regId && (
                    <div className="item">
                        <TbGrid3X3 />
                        <p>{regId}</p>
                    </div>
                )}
                {regStatus && (
                    <div className="item">
                        <TbStatusChange />
                        <p>{regStatus}</p>
                    </div>
                )}
                {regTime && (
                    <div className="item">
                        <TbClockHour10 />
                        <p>{regTime}</p>
                    </div>
                )}
                {(regType || serviceType || showPriority) && (
                    <div className="item item-full">
                        <TbCircleDashedLetterT />
                        <p>
                            {toStandardText(regType || '')} for {toStandardText(serviceType || '')}
                            {showPriority ? <> <Badge value={reg_priority[priority][0]} severity={reg_priority[priority][1]} /></> : null}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RegistrationInfo