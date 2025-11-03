import React from 'react';
import './button-group.scss';

const ButtonGroup = ({ children, vertical = false, style }) => {
    return (
        <div className={`btn-group ${vertical ? 'btn-group-vertical' : ''}`} style={style}>
            {children}
        </div>
    )
}

export default ButtonGroup