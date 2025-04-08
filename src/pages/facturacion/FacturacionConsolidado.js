import React from 'react'
import '../powerbi.css'

function FacturacionConsolidado() {

  return (
    <div className='powerbi'>
      <iframe
        title="Consolidado facturacion"
        src="https://app.powerbi.com/view?r=eyJrIjoiMjNkODVlMjEtODc3YS00ZjA2LWI0NmEtNmFjZTgyMzhhMzZkIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default FacturacionConsolidado;