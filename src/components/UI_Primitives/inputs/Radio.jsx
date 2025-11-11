import React from 'react';
import './radio.scss';
import { FaCheck } from 'react-icons/fa';

function Radio({
    label,
    name,
    id,
    value = false,
    radioValue,
    customIcon = null,
    onChange = () => { },
    size = 'medium', // small, medium, large
    disabled = false,
    checked, // if provided (boolean) -> controlled component
    ...props
}) {
    const isControlled = typeof checked === 'boolean';


    const handleChange = (e) => {
        if (disabled) return;
        const payloadValue = radioValue !== undefined ? radioValue : e.target.checked;
        onChange({ target: { name, value: payloadValue, nativeEvent: e } });
    };

    return (
        <div className={`ui-radio-container ${size}`}>
            <label className="radio-label" htmlFor={id}>
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
                <span className="radio-custom" aria-hidden>
                    {(isControlled ? checked : value) && (customIcon ? customIcon : <FaCheck />)}
                </span>
                {label && <span className="label-text">{label}</span>}
            </label>
        </div>
    );
}

export default Radio;
