import React from 'react'
import './registration-info.scss';
import { TbAlignJustified, TbCircleDashedLetterT, TbClockHour10, TbFileDescription, TbGrid3X3 } from 'react-icons/tb';
import Badge from '../../../UI_Primitives/badge/Badge';
import { reg_priority } from '../../../../assets/javascript/pre_data/package';

const RegistrationInfo = ({ regId = null, regType = null, regTime = null, note = null, priority = 0, complaints = null }) => {
    return (
        <div className="tech-registration-info-comp">
            <div className="title">
                <TbFileDescription />
                <h4>Registration Info</h4>
            </div>
            <div className="content">
                <div className="item">
                    <TbGrid3X3 />
                    <p>Reg ID</p>
                    <p>: {regId}</p>
                </div>
                <div className="item">
                    <TbClockHour10 />
                    <p>Reg Time</p>
                    <p>: {regTime}</p>
                </div>
                <div className="item">
                    <TbCircleDashedLetterT />
                    <p>Reg Type</p>
                    <p>: {regType} {priority && <Badge value={reg_priority[priority][0]} severity={reg_priority[priority][1]} />}</p>
                </div>
                {complaints && <div className="item">
                    <TbAlignJustified />
                    <p>Complaints</p>
                    <p>: {complaints}</p>
                </div>}
            </div>
            <div className="note">
                <p><span>Note : </span> {note ? note : 'No Note'} </p>
            </div>
        </div>
    )
}

export default RegistrationInfo