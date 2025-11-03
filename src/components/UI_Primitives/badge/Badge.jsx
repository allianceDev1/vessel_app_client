import React from 'react'
import './badge.scss'

const Badge = ({ value, className }) => {
    return (
        <span className={`ui-badge ${className}`}>{value}</span>
    )
}

export default Badge