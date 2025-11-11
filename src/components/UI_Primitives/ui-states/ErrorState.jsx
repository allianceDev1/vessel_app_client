import React from 'react'
import './state-style.scss'


const ErrorState = ({ width = '100%', hight = '100%', title, message, icon, footer }) => {
    return (
        <div className="ui-state-component" style={{ width, height: hight }}>
            <div className="content">
                <div className="icon" style={{ color: 'var(--color-danger)' }}>
                    {icon}
                </div>
                <div className="text">
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>
                {footer}
            </div>
        </div>
    )
}

export default ErrorState