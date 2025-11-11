import React, { useEffect, useState } from 'react'
import './input-color.scss'

const InputColor = ({
    label,
    name,
    id,
    value = '',
    defaultColors = false,
    preColors = [],
    customColors = false,
    onChange = () => { },
    error,
    helperText,
    required
}) => {
    const [colorList, setColorList] = useState(preColors)
    const [selectedColor, setSelectedColor] = useState(value)

    const handleChange = (colorCode) => {
        setSelectedColor(colorCode)
        onChange({ target: { name, value: colorCode } })
    }

    useEffect(() => {
        if (defaultColors && !preColors.length) {
            setColorList(['#cf0000', '#00ccff', '#03d200', '#fdc801', '#9801fe', '#0008cf'])
        }
        // eslint-disable-next-line
    }, [])

    return (
        <div className="ui-input-color-container">
            <div className={`border-input ${error ? 'error' : ''}`}>
                {label && <label htmlFor="" className='label'>
                    {label}
                    {required && <span className="required">*</span>}
                </label>}
                <div className="color-inputs">
                    {!colorList?.includes(selectedColor) &&
                        <label className="color-option">
                            <input type="radio" name="color" value={selectedColor} checked={true} />
                            <span className="color-circle" style={{ backgroundColor: value }}></span>
                        </label>}
                    {colorList?.map((color, index) => {
                        return (
                            <label className="color-option" key={index}>
                                <input type="radio" name="color" value={color} checked={color === selectedColor} onChange={(e) => handleChange(e.target.value)} />
                                <span className="color-circle" style={{ backgroundColor: color }}></span>
                            </label>
                        )
                    })}
                    {customColors && <label className="color-option custom-picker" data-name="Advanced" title="Advanced Color">
                        <input type="color" name="color" id="customColor" aria-label="Advanced color picker" onChange={(e) => handleChange(e.target.value)} />
                        <span className="color-circle rainbow"></span>
                    </label>}
                </div>
                {(error || helperText) && (
                    <div className="helper-text">{error || helperText}</div>
                )}
            </div>
        </div>
    )
}

export default InputColor