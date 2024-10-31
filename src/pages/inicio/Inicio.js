import React from 'react'
import imagen from '../../images/01.jpg'

function Inicio() {
  
  return (
    <div className="div-Imagen">
      <img src={imagen} className="Imagen" alt="Imagen 1" />
    </div>
  );
}

export default Inicio;