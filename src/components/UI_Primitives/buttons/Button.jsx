import React from 'react'
import './button.scss'
import { TbLoader } from 'react-icons/tb'

export const Button = ({
    label,
    severity,
    badge,
    icon,
    iconPos = "left",
    outlined = false,
    rounded = false,
    text = false,
    disabled = false,
    size = 'medium',
    spinIcon = false,
    style,
    onClick = () => { },
    ...props
}) => {

    return (
        <button
            className={`${severity ? 'ui-button btn-' + severity : 'ui-button'} 
            ${outlined ? 'outlined' : ''} ${text ? 'text' : ''} ${size ? 'btn-size-' + size : ''} 
            ${spinIcon ? 'btn-spin-icon' : ''}
            ${rounded ? 'btn-rounded' : ''}`}
            disabled={disabled}
            onClick={onClick}
            style={style}
            type={spinIcon ? 'button' : 'auto'}
            {...props}
        >
            {(icon && !spinIcon && iconPos !== 'right') && icon}
            {(spinIcon && iconPos !== 'right') && <TbLoader />}
            {label && <span>{label}</span>}
            {badge && <span>{badge}</span>}
            {(icon && !spinIcon && iconPos === 'right') && icon}
            {(spinIcon && iconPos === 'right') && <TbLoader />}
        </button>
    )
}

export default Button;