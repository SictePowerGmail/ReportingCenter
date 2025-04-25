import React from 'react'
import '../../powerbi.css'
import Cookies from 'js-cookie';

function Capacidades() {

  const role = Cookies.get('userRole');

  return (
    <div className='powerbi'>
      <iframe
        title="Capacidades"
        src={`https://bryansicte.github.io/Sicte-SAS-Capacidades/#/Principal?role=${encodeURIComponent(role)}`}
      ></iframe>
    </div>
  );
}

export default Capacidades;