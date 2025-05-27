import React, { useEffect } from 'react'
import imagen1 from '../../images/Principal.jpg'
import imagen2 from '../../images/Telec 2.jpg'
import imagen3 from '../../images/Obr Civ 1.jpg'
import imagen4 from '../../images/Electr 1.jpg'
import imagen5 from '../../images/Telec 1.jpg'
import imagen6 from '../../images/Obr Civ 2.jpg'
import imagen7 from '../../images/Electr 2.jpg'
import imagen8 from '../../images/Telec 3.jpg'
import imagen9 from '../../images/Electr 3.jpg'
import imagen10 from '../../images/Telec 4.jpg'

import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
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
    }
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const imagenes = [imagen1, imagen2, imagen3, imagen4, imagen5, imagen6, imagen7, imagen8, imagen9, imagen10];

  return (
    <div className="div-Imagen">
      <Slider {...settings}>
        {imagenes.map((img, idx) => (
          <div key={idx}>
            <img src={img} alt={`Imagen ${idx + 1}`} className="Imagen" />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Inicio;