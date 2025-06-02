import React from 'react'
import '../powerbi.css'

function ReporteSicte() {

  return (
    <div className='powerbi'>
      <iframe
        title="Reporte Sicte"
        src="https://app.powerbi.com/view?r=eyJrIjoiMGIxNDE2NWQtYzY1ZC00OTg2LWJiMjItY2EwZGJjZmNiZGU5IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default ReporteSicte;