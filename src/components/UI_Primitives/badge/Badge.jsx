import React from 'react'
import './badge.scss'

const Badge = ({ value, severity, size, className, style, title }) => {
    return (
        <span className={
            ` ${size ? 'ui-badge-' + size : 'ui-badge'}
            ${severity ? 'ui-badge ui-badge-' + severity : 'ui-badge'}
            ${className}`}
            title={title || ''}
            style={style}>{value}</span>
    )
}

export default Badge