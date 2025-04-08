import React from 'react'
import '../powerbi.css'

function OperacionesFinanciero() {

  return (
    <div className='powerbi'>
      <iframe
        title="Financiero operaciones"
        src="https://app.powerbi.com/view?r=eyJrIjoiNmY2YmRmY2QtZWU0NC00OGI3LWFjMjgtZGVmNjE4ODMzZTlhIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default OperacionesFinanciero;