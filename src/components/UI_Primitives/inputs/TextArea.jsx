import React, { useState } from 'react';
import './text-area.scss';

function Textarea({
    label,
    name,
    id,
    value = '', // Ensure controlled component
    required=false,
    textareaStyle,
    onBlur,
    onFocus,
    error,
    helperText,
    size = 'medium', // small, medium, large
    rows = 4, // Default rows for textarea
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    return (
        <div className={`ui-textarea-container ${size} ${error ? 'error' : ''}`}>
            <textarea
                id={id}
                name={name}
                value={value}
                required={required}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={textareaStyle}
                rows={rows}
                {...props}
            />
            <label htmlFor={id || name} className={value || isFocused ? 'active' : ''}>
                {label}
                {required && <span className="required">*</span>}
            </label>

            {(error || helperText) && (
                <div className="helper-text">{error || helperText}</div>
            )}
        </div>
    );
}

export default Textarea;