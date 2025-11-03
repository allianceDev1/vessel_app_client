import React from 'react'
import './message.scss'
import { FaRegCircleCheck, FaRegCircleXmark } from 'react-icons/fa6'
import { TbAlertCircle, TbAlertHexagon } from 'react-icons/tb';

const Message = ({ icon, type, head, message, content, className, style }) => {
    const iconMap = {
        success: <FaRegCircleCheck />,
        danger: <FaRegCircleXmark />,
        warning: <TbAlertHexagon />,
        info: <TbAlertCircle />
    };

    return (
        <div className={`alert-message ${type ? 'alert-message-' + type : ''} ${className}`} style={style}>
            {(icon || type) && <div className="icon">
                {icon ? icon : type ? iconMap[type] : ''}
            </div>}
            <div className="content">
                {head && <h4>{head}</h4>}
                {message && <span>{message}</span>}
                {content}
            </div>
        </div>
    )
}

export default Message