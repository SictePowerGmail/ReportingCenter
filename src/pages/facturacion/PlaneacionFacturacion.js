import React from 'react'
import '../powerbi.css'

function PlaneacionFacturacion() {

  return (
    <div className='powerbi'>
      <iframe
        title="Planeación facturación"
        src="https://app.powerbi.com/reportEmbed?reportId=cb14eb01-0b57-48f0-9ce9-eb2dc88f2ab5&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608"
      ></iframe>
    </div>
  );
}

export default PlaneacionFacturacion;