import React from 'react'
import '../powerbi.css'

function PlaneacionFinanciero() {

  return (
    <div className='powerbi'>
      <iframe
        title="Financiero planeación"
        src="https://app.powerbi.com/reportEmbed?reportId=6d86e89d-f035-4141-ac78-d5e0ae84ae23&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608"
      ></iframe>
    </div>
  );
}

export default PlaneacionFinanciero;