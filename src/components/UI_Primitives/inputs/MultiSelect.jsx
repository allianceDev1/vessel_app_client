import React, { useEffect, useRef, useState } from 'react';
import './multi-select.scss';
import Checkbox from './Checkbox';

function MultiSelectInput({
  label,
  name,
  options = [], // Array of { value: string, label: string }
  rightIcon,
  rightIconAction,
  selectStyle,
  error,
  helperText,
  disabled = false,
  size = 'medium', // small, medium, large
  onChange = () => { },
  selected = [],
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(selected || []);
  const wrapperRef = useRef(null);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen)
  };

  const handleCheckboxChange = (e, { label, value }) => {
    const isChecked = e.target.checked;
    const newSelectedValues = isChecked
      ? [...selectedValues, { label, value }]
      : selectedValues.filter((v) => v.value !== value);
    setSelectedValues(newSelectedValues);
    onChange({ name, selectedValues: newSelectedValues });
  };

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayText = selectedValues.length === 1
    ? selectedValues[0]?.label
    : selectedValues.length > 1
      ? `${selectedValues?.[0]?.label} & ${selectedValues.length - 1} item${(selectedValues.length - 1) > 1 ? 's' : ''} selected`
      : '';

  return (
    <div className={`ui-multiselect-container ${size} ${error ? 'error' : ''}`} ref={wrapperRef}>
      <div
        className={`multiselect-trigger ${(isOpen || selectedValues.length) ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
        style={selectStyle}
        tabIndex={0}
        {...props}
      >
        <span className="multiselect-label">{label}</span>
        {displayText}
        {rightIcon && (
          <div className="icon-container" onClick={rightIconAction}>
            {rightIcon}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="multiselect-options">
          {options.map((option) => (
            <span key={option.value} className='option-item'>
              <Checkbox label={option.label} name={name} value={option.value} onChange={(e) => handleCheckboxChange(e, { label: option.label, value: option.value })}
                checked={selectedValues?.map((v) => v.value)?.includes(option.value)} />
            </span>
          ))}
        </div>
      )}
      {(error || helperText) && (
        <div className="helper-text">{error || helperText}</div>
      )}
    </div>
  );
}

export default MultiSelectInput;