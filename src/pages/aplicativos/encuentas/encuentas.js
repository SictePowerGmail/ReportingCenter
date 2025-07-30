import React, { useState, useEffect, useRef } from 'react';
import './encuentas.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'
import CargandoDatos from '../../../components/cargandoDatos/cargandoDatos';
import Textos from '../../../components/textos/textos';
import Entradas from '../../../components/entradas/entradas';
import Botones from '../../../components/botones/botones';

const Encuentas = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagenes, setImagenes] = useState('');

    const cargarDatos = async (usuario) => {
        try {
            setLoading(true)
            const responseImagenes = await axios.get(`${process.env.REACT_APP_API_URL}/imagenes/encuestas`);
            const data = responseImagenes.data;
            setImagenes(data)
            console.log(data)
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, []);

    const obtenerFechaFormateada = () => {
        const fecha = new Date();
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');
        const hh = String(fecha.getHours()).padStart(2, '0');
        const min = String(fecha.getMinutes()).padStart(2, '0');
        const ss = String(fecha.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };

    return (
        <div className="Encuentas">
            {loading ? (
                <CargandoDatos text={'Cargando Datos'} />
            ) : (
                <>
                    <div className='PaginaVolver'>
                        <Botones className='agregar' onClick={() => navigate('/SupervisionPrincipal')}><FaArrowLeft /><Textos className='parrafo'>Volver</Textos></Botones>
                    </div>

                    <div className='campo'>
                        <Textos className='subtitulo'>Fecha</Textos>
                        <Entradas
                            value={obtenerFechaFormateada()}
                            disabled
                        ></Entradas>
                    </div>

                    <div className='campo'>
                        <Textos className='subtitulo'>Correo</Textos>
                        <Entradas
                            type="email"
                            placeholder='Por favor diligencie el correo'
                            required
                            pattern="[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+"
                            title="Debe contener un @ y un dominio válido"
                        ></Entradas>
                    </div>

                    <div className='campo'>
                        <Textos className='subtitulo'>Encuesta</Textos>
                        <Entradas
                            value={'Cometas 2025'}
                            disabled
                        ></Entradas>
                    </div>

                    <div className="galeria">
                        {Array.isArray(imagenes) && imagenes.map((img) => (
                            <div key={img.public_id}>
                                <img src={img.secure_url} alt={img.display_name} style={{ width: '200px' }} />
                                <p>{img.display_name}</p>
                            </div>
                        ))}
                    </div>

                    {/* cartas con foto y detalles
                    Resultado parcial de la encuesta */}


                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </>
            )}
        </div>
    );
};

export default Encuentas;