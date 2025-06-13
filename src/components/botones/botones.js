import React from 'react';
import './botones.css'

const Botones = ({
  onClick,
  children,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`boton ${className}`}
    >
      {children}
    </button>
  );
};

export default Botones;
