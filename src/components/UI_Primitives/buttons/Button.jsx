import React from 'react'
import './button.scss'

export const Button = ({
    label,
    severity,
    badge,
    icon,
    iconPos = "left",
    outlined = false,
    text = false,
    disabled = false,
    size = 'medium',
    spinIcon = false,
    style,
    loading = false,
    onClick = () => { },
    ...props
}) => {

    return (
        <button
            className={`${severity ? 'ui-button btn-' + severity : 'ui-button'} 
            ${outlined ? 'outlined' : ''} ${text ? 'text' : ''} ${size ? 'btn-size-' + size : ''} 
            ${spinIcon ? 'btn-spin-icon' : ''}`}
            disabled={disabled}
            onClick={onClick}
            style={style}
            {...props}
        >
            {(icon && iconPos !== 'right') && icon}
            {label && <span>{label}</span>}
            {badge && <span>{badge}</span>}
            {(icon && iconPos === 'right') && icon}
        </button>
    )
}

export default Button;