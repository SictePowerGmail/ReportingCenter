import React from 'react'
import '../powerbi.css'

function Seguimiento() {

  return (
    <div className='powerbi'>
      <iframe
        title="Seguimiento empalmes"
        src="https://app.powerbi.com/view?r=eyJrIjoiMWU2N2QwMTctNjJkYi00ZmVlLWFmY2UtZTE0YjU4MmE2ODQzIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default Seguimiento;