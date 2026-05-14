import React, { useEffect, useState } from 'react';
import './input-text.scss';
const DATE_TYPES = ['date', 'datetime-local', 'month', 'week', 'time'];


function InputText({
    label,
    name,
    id,
    value = '',
    type = 'text',
    required=false,
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

    const isDateLike = DATE_TYPES.includes(type);

    const [inputType, setInputType] = useState(type);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setInputType(DATE_TYPES.includes(type) ? 'text' : type);
    }, [type]);

    const handleFocus = (e) => {
        setIsFocused(true);
        if (isDateLike) {
            setInputType(type);
            // try to open picker on supporting browsers
            if (e.target.showPicker) {
                try { e.target.showPicker(); } catch (err) { /* ignore */ }
            }
        }
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        const currentVal = e.target.value;
        if (isDateLike && (!currentVal || currentVal === '')) {
            setInputType('text');
        }
        if (onBlur) onBlur(e);
        if (!value && type === 'password') setInputType('text');
    };

    useEffect(() => {
        if (isDateLike && (!value || value === '') && !isFocused) {
            setInputType('text');
        }
        // if value set and empty was previously, you might want to reveal the date value
        if (isDateLike && value && value !== '') {
            // keep type as the actual date type so value is shown
            setInputType(type);
        }
    }, [value, isFocused, isDateLike, type]);

    return (
        <div className={`ui-input-text-container ${size} ${error ? 'error' : ''}`}>
            <input
                id={id || name}
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