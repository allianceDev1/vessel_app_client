import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './input-phone-number.scss'

const InputPhoneNumber = ({
    label,
    name,
    id,
    value = '',
    required,
    rightIcon,
    rightIconAction,
    onBlur,
    onFocus,
    onChange = () => { },
    error,
    helperText,
    size = 'medium', // small, medium, large
    inputProps,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);


    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    const handleOnChange = (value, data) => {
        let countryCode = null, mobile = null
        if ((value?.length || 0) > (data?.dialCode?.length || 0)) {
            countryCode = data?.dialCode
            const codeLength = data?.dialCode?.length;
            mobile = value.slice(codeLength);
        } else {
            countryCode = value
        }
        onChange({ country_code: countryCode, number: mobile, name })
    };

    return (
        <div className={`ui-input-phone-number-container ${size} ${error ? 'error' : ''} ${value || isFocused ? 'active' : ''} ${isFocused ? 'focus' : ''}`}>
            <PhoneInput
                inputProps={{
                    name,
                    id,
                    required,
                    ...inputProps
                }}
                value={value}
                onChange={handleOnChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
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

export default InputPhoneNumber