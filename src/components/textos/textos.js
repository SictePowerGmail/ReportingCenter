import React from 'react';
import './textos.css'

const Textos = ({
    children,
    className = '',
    ...rest
}) => {
    return (
        <span className={`texto ${className}`} {...rest}>
            {children}
        </span>
    );
};

export default Textos;