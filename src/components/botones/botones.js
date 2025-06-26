import React from 'react';
import './botones.css'

const Botones = ({
  onClick,
  children,
  className = '',
  ...rest
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`boton ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Botones;
