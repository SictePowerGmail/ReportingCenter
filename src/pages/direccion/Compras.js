import React from 'react'
import '../powerbi.css'

function Compras() {

    return (
        <div className='powerbi'>
            <iframe
                title="Compras"
                src="https://app.powerbi.com/view?r=eyJrIjoiOWY0ZGEyMjgtY2VmNC00ODM5LTkzZDEtZGY2YWZiNGFjNjlmIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
            ></iframe>
        </div>
    );
}

export default Compras;