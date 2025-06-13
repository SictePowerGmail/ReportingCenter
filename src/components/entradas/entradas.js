import React from 'react';
import './entradas.css';

const Entradas = ({
    onChange,
    value,
    placeholder = '',
    type = 'text',
    className = '',
    name,
    ...rest
}) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`entrada ${className}`}
            name={name}
            {...rest}
        />
    );
};

export default Entradas;