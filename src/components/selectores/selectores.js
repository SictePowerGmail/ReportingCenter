import React from 'react';
import './selectores.css'

const Selectores = ({
    onChange,
    value,
    options = [],
    className = '',
    name = '',
    defaultOption = 'Seleccione una opción ...',
}) => {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`selector ${className}`}
        >
            <option value="">{defaultOption}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default Selectores;
