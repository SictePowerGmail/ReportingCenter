import React, { useEffect } from 'react'
import imagen from '../../images/01.jpg'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import '../powerbi.css'

function Inicio() {
  const navigate = useNavigate();
  const cedulaUsuario = Cookies.get('userCedula');
  const nombreUsuario = Cookies.get('userNombre');

  useEffect(() => {
    const yaRecargado = localStorage.getItem('yaRecargado');

    if (cedulaUsuario === undefined && nombreUsuario === undefined) {
      navigate('/ReportingCenter', { state: { estadoNotificacion: false } });
    } else if (!yaRecargado) {
      localStorage.setItem('yaRecargado', 'true');
      // window.location.reload();
    }
  }, []);

  return (
    <div className="div-Imagen">
      <img src={imagen} className="Imagen" alt="Imagen 1" />
    </div>
  );
}

export default Inicio;