import React from 'react'
import '../powerbi.css'

function ProductividadNacional() {

  return (
    <div className='powerbi'>
      <iframe
        title="Productividad nacional"
        src="https://app.powerbi.com/view?r=eyJrIjoiZWJiYTc3Y2MtOTNhMS00Yjk3LWE4OTktMTEzMjY0ZDFkYTYzIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default ProductividadNacional;