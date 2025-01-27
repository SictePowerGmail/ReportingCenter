import React from 'react'
import '../powerbi.css'

function MedicionesFacturacion() {

  return (
    <div className='powerbi'>
      <iframe
        title="Mediciones facturación"
        src="https://app.powerbi.com/view?r=eyJrIjoiMGZjOGM3MDItY2RiOC00NmEzLWJhZDktZmEzMjRhZWU3ZTY0IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default MedicionesFacturacion;