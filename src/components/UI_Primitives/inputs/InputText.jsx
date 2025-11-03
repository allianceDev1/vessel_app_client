import React, { useEffect, useState } from 'react';
import './input-text.scss';

function InputText({
    label,
    name,
    id,
    value,
    type = 'text',
    required,
    rightIcon,
    rightIconAction,
    inputStyle,
    onBlur,
    onFocus,
    error,
    helperText,
    size = 'medium', // small, medium, large
    ...props
}) {
    const [inputType, setInputType] = useState(type);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setInputType(type);
    }, [type]);

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
        if (!value && type === 'password') setInputType('text');
    };

    return (
        <div className={`ui-input-text-container ${size} ${error ? 'error' : ''}`}>
            <input
                id={id}
                name={name}
                value={value}
                required={required}
                type={inputType}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="input-text"
                style={inputStyle}
                {...props}
            />
            <label htmlFor={id || name} className={value || isFocused ? 'active' : ''}>
                {label}
                {required && <span className="required">*</span>}
            </label>
            {rightIcon && (
                <div className="icon-container" onClick={rightIconAction}>
                    {rightIcon}
                </div>
            )}
            {(error || helperText) && (
                <div className="helper-text">{error || helperText}</div>
            )}
        </div>
    );
}

export default InputText;