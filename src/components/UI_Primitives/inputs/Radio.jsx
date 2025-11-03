import React, { useState } from 'react';
import './radio.scss';
import { FaCheck } from 'react-icons/fa'; // Default check icon


function Radio({
    label,
    name,
    id,
    value = false,
    customIcon = false,
    onChange = () => { },
    size = 'medium', // small, medium, large
    disabled = false,
    checked = false,
    ...props
}) {
    const [isChecked, setIsChecked] = useState(value);

    const handleChange = (e) => {
        if (!disabled) {
            const newValue = e.target.checked;
            setIsChecked(newValue);
            onChange({ target: { name, value: newValue } });
        }
    };

    return (
        <div className={`ui-radio-container ${size}`}>
            <label className="radio-label">
                <input
                    type="radio"
                    id={id}
                    name={name}
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={disabled}
                    {...props}
                />
                <span className="radio-custom">
                    {isChecked && (customIcon ? customIcon : <FaCheck />)}
                </span>
                {label && <span className="label-text">{label}</span>}
            </label>
        </div>
    );
}

export default Radio;