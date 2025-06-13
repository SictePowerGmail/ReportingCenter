import React from 'react';
import './textos.css'

const Textos = ({
    children,
    className = '',
}) => {
    return (
        <span className={`texto ${className}`}>
            {children}
        </span>
    );
};

export default Textos;