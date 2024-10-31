import React from 'react'
import '../powerbi.css'

function FacturacionConsolidado() {

  return (
    <div className='powerbi'>
      <iframe
        title="Consolidado facturacion"
        src="https://app.powerbi.com/reportEmbed?reportId=dae58578-0860-4693-8dd2-346071b5fc2d&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608"
      ></iframe>
    </div>
  );
}

export default FacturacionConsolidado;