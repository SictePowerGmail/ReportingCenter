import React from 'react'
import '../powerbi.css'

function MedicionesFacturacion() {

  return (
    <div className='powerbi'>
      <iframe
        title="Mediciones facturación"
        src="https://app.powerbi.com/view?r=eyJrIjoiOGE2M2MxMjItZDdmNC00NDIzLTg0NDEtY2FjYTJjYjIzZmExIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default MedicionesFacturacion;