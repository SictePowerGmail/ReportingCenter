import React, { useEffect } from 'react'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../inicio.scss'

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

  const imagenes = [
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297344/Principal_uionbk.jpg',
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297345/Telec_2_wmowse.jpg',
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297342/Obr_Civ_1_cjopsi.jpg',
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297342/Electr_1_u8w2hw.jpg', 
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297344/Telec_1_tow9ku.jpg', 
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297343/Obr_Civ_2_cpxs6n.jpg', 
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297344/Electr_2_wok2fp.jpg', 
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297345/Telec_3_qdnbuw.jpg', 
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297343/Electr_3_xdizwr.jpg', 
    'https://res.cloudinary.com/dcozwbcpi/image/upload/v1753297347/Telec_4_pkfnpo.jpg'
  ];

  return (
    <div className="div-Imagen">
      <div className="titulo-carrusel">
        <h1>CENTRO DE CONTROL DE OPERACIONES TECNICAS</h1>
        <div className='lineaHorizontal'></div>
      </div>
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