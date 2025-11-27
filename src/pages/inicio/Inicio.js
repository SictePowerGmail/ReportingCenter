import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../inicio.scss'
import axios from 'axios';
import CargandoDatos from '../../components/cargandoDatos/cargandoDatos';

function Inicio() {
  const navigate = useNavigate();
  const cedulaUsuario = Cookies.get('userCedula');
  const nombreUsuario = Cookies.get('userNombre');
  const [loading, setLoading] = useState(true);
  const [imagenes, setImagenes] = useState([]);

  const cargarDatos = async (event) => {
    setLoading(true);

    try {
      const imagenesData = await axios.get(`${process.env.REACT_APP_API_URL}/imagenes/inicio`);
      const archivos = imagenesData.data.archivos;
      console.log(archivos)
      const urls = archivos.map(a => `https://lh3.googleusercontent.com/d/${a.id}=s0`);
      console.log(urls)
      setImagenes(urls);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const yaRecargado = localStorage.getItem('yaRecargado');

    if (cedulaUsuario === undefined && nombreUsuario === undefined) {
      navigate('/ReportingCenter', { state: { estadoNotificacion: false } });
    } else if (!yaRecargado) {
      localStorage.setItem('yaRecargado', 'true');
    }

    cargarDatos();
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

  if (loading) {
    <CargandoDatos text={'Cargando Datos'} />
  }

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