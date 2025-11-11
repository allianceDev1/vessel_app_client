import React from 'react'
import './state-style.scss'


const EmptyState = ({ width = '100%', hight = '100%', title, description, icon, footer }) => {
    return (
        <div className="ui-state-component" style={{ width, height: hight }}>
            <div className="content">
                {icon && <div className="icon">
                    {icon}
                </div>}
                <div className="text">
                    {title && <h2>{title}</h2>}
                    {description && <p>{description}</p>}
                </div>
                {footer}
            </div>
        </div>
    )
}

export default EmptyState