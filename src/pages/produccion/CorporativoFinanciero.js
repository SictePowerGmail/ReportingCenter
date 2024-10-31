import React from 'react'
import '../powerbi.css'

function CorporativoFinanciero() {

  return (
    <div className='powerbi'>
      <iframe
        title="Financiero corporativo"
        src="https://app.powerbi.com/reportEmbed?reportId=0bda64d1-6a0f-4d87-870b-3cf9fd39e367&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608"
      ></iframe>
    </div>
  );
}

export default CorporativoFinanciero;