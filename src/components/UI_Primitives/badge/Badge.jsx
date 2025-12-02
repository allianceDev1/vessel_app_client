import React from 'react'
import './badge.scss'

const Badge = ({ value, className, style }) => {
    return (
        <span className={`ui-badge ${className}`} style={style}>{value}</span>
    )
}

export default Badge