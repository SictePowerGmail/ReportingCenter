import React from 'react'
import '../powerbi.css'

function OperacionesFacturacion() {

  return (
    <div className='powerbi'>
      <iframe
        title="Facturación operaciones"
        src="https://app.powerbi.com/reportEmbed?reportId=18dca057-81ed-47ba-9cbc-fdc150f22621&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608"
      ></iframe>
    </div>
  );
}

export default OperacionesFacturacion;