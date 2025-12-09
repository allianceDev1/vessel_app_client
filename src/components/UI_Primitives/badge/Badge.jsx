import React from 'react'
import './badge.scss'

const Badge = ({ value, severity, size, className, style }) => {
    return (
        <span className={
            ` ${size ? 'ui-badge-' + size : 'ui-badge'}
            ${severity ? 'ui-badge ui-badge-' + severity : 'ui-badge'}
            ${className}`}
            style={style}>{value}</span>
    )
}

export default Badge