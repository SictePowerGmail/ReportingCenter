import React from 'react'
import '../powerbi.css'

function Compras() {

    return (
        <div className='powerbi'>
            <iframe
                title="Compras"
                src="https://app.powerbi.com/view?r=eyJrIjoiMDQ4MWUwMTAtMmI4NS00NTdmLTljZTQtZTE2MGVjYmIyMjljIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
            ></iframe>
        </div>
    );
}

export default Compras;