import React, { useEffect, useMemo, useRef, useState } from 'react';
import './multi-select.scss';
import Checkbox from './Checkbox';
import InputText from './InputText';

function MultiSelectInput({
  label,
  name,
  options = [], // Array of { value: string, label: string, disabled: false }
  rightIcon,
  rightIconAction,
  selectStyle,
  error,
  helperText,
  disabled = false,
  size = 'medium', // small, medium, large
  onChange = () => { },
  selected = [],
  searchable = false, // Enable/disable search
  searchPlaceholder = 'Search',
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(selected || []);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setSelectedValues(selected || []);
  }, [selected]);

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);


  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const query = searchQuery.trim();
    const regex = new RegExp(query, "i");
    return options.filter(opt => regex.test(opt?.label ?? ""));

  }, [options, searchQuery, searchable]);

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
          {searchable && (
            <div className="multiselect-search">
              <InputText size='small' label={searchPlaceholder} ref={searchRef} value={searchQuery} type='search'
                onChange={(e) => setSearchQuery(e.target.value)} onClick={(e) => e.stopPropagation()} />
            </div>
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <span key={option.value} className="option-item">
                <Checkbox
                  label={option.label}
                  name={name}
                  value={option.value}
                  onChange={(e) => handleCheckboxChange(e, { label: option.label, value: option.value })}
                  checked={selectedValues?.map((v) => v.value)?.includes(option.value)}
                  disabled={option.disabled}
                />
              </span>
            ))
          ) : (<div className="no-options"><p>No Options</p></div>)}
        </div>
      )}
      {(error || helperText) && (
        <div className="helper-text">{error || helperText}</div>
      )}
    </div>
  );
}

export default MultiSelectInput;