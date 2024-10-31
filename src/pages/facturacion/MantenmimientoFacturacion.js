import React from 'react'
import '../powerbi.css'

function MantenimientoFacturacion() {

  return (
    <div className='powerbi'>
      <iframe
        title="Mantenimiento facturacion"
        src="https://app.powerbi.com/reportEmbed?reportId=fcfbec1b-da73-491c-aabc-23045ec0a975&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608"
      ></iframe>
    </div>
  );
}

export default MantenimientoFacturacion;