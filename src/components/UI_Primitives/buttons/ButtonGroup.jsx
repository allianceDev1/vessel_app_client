import React from 'react';
import './button-group.scss';

const ButtonGroup = ({ children, vertical = false, style, rounded = false }) => {
    return (
        <div className={`btn-group ${vertical ? 'btn-group-vertical' : ''} ${rounded ? 'btn-group-rounded' : ''}`} style={style}>
            {children}
        </div>
    )
}

export default ButtonGroup