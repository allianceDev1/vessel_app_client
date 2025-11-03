import React, { useState } from 'react';
import './checkbox.scss';
import { FaCheck } from 'react-icons/fa'; // Default tick icon

function Checkbox({
    label,
    name,
    id,
    checkIcon = false,
    onChange = () => { },
    size = 'medium', // small, medium, large
    disabled = false,
    checked = false,
    ...props
}) {
    const [isChecked, setIsChecked] = useState(checked || false);

    const handleChange = (e) => {
        if (!disabled) {
            const newValue = e.target.checked;
            setIsChecked(newValue);
            onChange({ target: { name, value: e.target.value, checked: newValue } });
        }
    };

    return (
        <div className={`ui-checkbox-container ${size}`}>
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    id={id}
                    name={name}
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={disabled}
                    {...props}
                />
                <span className="checkbox-custom">
                    {isChecked && (checkIcon ? checkIcon : <FaCheck />)}
                </span>
                {label && <span className="label-text">{label}</span>}
            </label>
        </div>
    );
}

export default Checkbox;