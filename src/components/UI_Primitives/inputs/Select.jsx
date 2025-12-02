import React, { useState } from 'react';
import './input-text.scss';
import InputText from './InputText';
import { GrClose } from 'react-icons/gr';

function Select({
    label,
    name,
    id,
    value = '',
    options = [], // Array of { value: string, label: string }
    required,
    selectStyle,
    onBlur,
    onFocus,
    error,
    helperText,
    onChange = () => { },
    size = 'medium', // small, medium, large
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [inputWrite, setInputWrite] = useState(false)

    const handleChange = (e) => {
        if (e.target.value === '_input_write_') {
            setInputWrite(true)
        } else {
            onChange(e)
        }
    }

    const clickCancelWriteInput = () => {
        setInputWrite(false)
        onChange({ target: { name, value: "" } });
    }

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    return (
        inputWrite
            ? <InputText
                id={id || name}
                label={`${label} : Write...`}
                name={name}
                value={value}
                required={required}
                style={selectStyle}
                onChange={onChange}
                autoFocus={true}
                rightIcon={<GrClose />}
                rightIconAction={clickCancelWriteInput}
                {...props}
            />
            : <div className={`ui-input-text-container ${size} ${error ? 'error' : ''}`}>
                <select
                    id={id}
                    name={name}
                    value={value}
                    required={required}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={selectStyle}
                    onChange={handleChange}
                    {...props}
                >
                    {options.map((option, index) => (
                        <option key={`${option.value}-${index}`} value={option.value} >
                            {option.label}
                        </option>
                    ))}
                </select>
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

export default Select;