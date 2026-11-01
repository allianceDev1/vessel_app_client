import React from 'react'
import './state-style.scss'


const ErrorState = ({ width = '100%', hight = '100%', title, message, icon, footer }) => {
    return (
        <div className="ui-state-component" style={{ width, height: hight }}>
            <div className="ui-state-content">
                <div className="ui-state-icon" style={{ color: 'var(--color-danger)' }}>
                    {icon}
                </div>
                <div className="ui-state-text">
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>
                {footer}
            </div>
        </div>
    )
}

export default ErrorState