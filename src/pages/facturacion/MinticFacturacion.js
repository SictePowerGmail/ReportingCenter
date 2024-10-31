import React from 'react'
import '../powerbi.css'

function MinticFacturacion() {

  return (
    <div className='powerbi'>
      <iframe
        title="Mintic facturacion"
        src="https://app.powerbi.com/reportEmbed?reportId=2ce4ae7a-fc21-4897-82a7-12e55f396d2d&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608"
      ></iframe>
    </div>
  );
}

export default MinticFacturacion;