import React from 'react'
import '../powerbi.css'

function HistoricoKPI() {

  return (
    <div className='powerbi'>
      <iframe
        title="HistoricoKPI"
        src="https://app.powerbi.com/view?r=eyJrIjoiYjUyYjVhYjUtNDMwNC00OGYwLTgzZmItODRiZjFhOTFiZmI3IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default HistoricoKPI;