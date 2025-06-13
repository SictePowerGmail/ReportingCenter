import React from 'react';
import './areaTextos.css';

const AreaTextos = ({
    value,
    onChange,
    placeholder = '',
    className = '',
    name,
    rows = 4,
    cols,
    ...rest
}) => {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`areaTexto ${className}`}
            name={name}
            rows={rows}
            cols={cols}
            {...rest}
        />
    );
};

export default AreaTextos;
