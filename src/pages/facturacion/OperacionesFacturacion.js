import React from 'react'
import '../powerbi.css'

function OperacionesFacturacion() {

  return (
    <div className='powerbi'>
      <iframe
        title="Facturación operaciones"
        src="https://app.powerbi.com/view?r=eyJrIjoiZDBiMTRiZDgtZTA3Mi00MzIxLWFhYzYtNGI1MzE2NGQ1MWMxIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default OperacionesFacturacion;