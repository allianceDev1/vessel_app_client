import React from 'react';
import './radio-card.scss';
import { FaCheck } from 'react-icons/fa';

function RadioCard({
    label,
    description,
    name,
    id,
    value = false,
    radioValue,
    customIcon = null,
    onChange = () => { },
    disabled = false,
    checked, // controlled boolean
    style,
    className = '',
    ...props
}) {
    const isControlled = typeof checked === 'boolean';
    const isChecked = isControlled ? checked : !!value;

    const handleChange = (e) => {
        if (disabled) return;
        const payloadValue = radioValue !== undefined ? radioValue : e.target.checked;
        onChange({ target: { name, value: payloadValue, nativeEvent: e } });
    };

    return (
        <label
            htmlFor={id}
            className={`ui-radio-card ${isChecked ? 'checked' : ''} ${disabled ? 'disabled' : ''} ${className}`}
            style={style}
        >
            <input
                type="radio"
                id={id}
                name={name}
                {...(isControlled ? { checked } : { defaultChecked: !!value })}
                onChange={handleChange}
                disabled={disabled}
                {...(radioValue !== undefined ? { value: radioValue } : {})}
                {...props}
            />

            <div className="card-content">
                {label && <span className="card-title">{label}</span>}
                {description && <span className="card-description">{description}</span>}
            </div>

            <span className="card-radio-indicator" aria-hidden="true">
                {isChecked && (customIcon ? customIcon : <FaCheck />)}
            </span>
        </label>
    );
}

export default RadioCard;
