import React from 'react'
import '../powerbi.css'

function CorporativoFinanciero() {

  return (
    <div className='powerbi'>
      <iframe
        title="Financiero corporativo"
        src="https://app.powerbi.com/view?r=eyJrIjoiNDMyN2FhMzEtYmYyMy00ZTE4LTg1NjktMDhiYmFmMmYwYmE1IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default CorporativoFinanciero;