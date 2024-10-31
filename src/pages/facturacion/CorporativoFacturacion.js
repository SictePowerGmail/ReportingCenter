import React from 'react'
import '../powerbi.css'

function CorporativoFacturacion() {

  return (
    <div className='powerbi'>
      <iframe
        title="Corporativo facturacion"
        src="https://app.powerbi.com/reportEmbed?reportId=a8b6ab9c-8bec-4dda-9e35-d077c9863beb&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608"
      ></iframe>
    </div>
  );
}

export default CorporativoFacturacion;