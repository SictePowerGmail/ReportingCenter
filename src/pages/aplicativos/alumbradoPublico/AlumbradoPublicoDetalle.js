import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import './AlumbradoPublicoDetalle.css'
import Cookies from 'js-cookie';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from 'react-icons/fa'
import CargandoDatos from '../../../components/cargandoDatos/cargandoDatos';
import Entradas from '../../../components/entradas/entradas';
import Botones from '../../../components/botones/botones';
import Textos from '../../../components/textos/textos';

function AlumbradoPublicoDetalle() {
    const [loading, setLoading] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(() => {
        const guardado = localStorage.getItem('formularioAlumbradoPublico');
        return guardado ? JSON.parse(guardado) : {
            ot: '',
            descripcion: ''
        };
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormulario(prev => {
            const actualizado = { ...prev, [name]: value };
            localStorage.setItem('formularioAlumbradoPublico', JSON.stringify(actualizado));
            return actualizado;
        });
        return;
    };

    const guardarDatos = async () => {
        setEnviando(true);

        const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/alumbradoPublico/crearRegistro`, formulario);

        if (response2.status >= 200 && response2.status < 300) {
            setEnviando(false)
            console.log('Datos enviados exitosamente');
            localStorage.removeItem('formularioAlumbradoPublico');
            navigate('/AlumbradoPublico');
        } else {
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
            setEnviando(false)
        }
    };

    return (
        <div className='AlumbradoPublicoDetalle'>
            <div className='contenedor'>
                {loading ? (
                    <div className="CargandoPagina">
                        <CargandoDatos />
                    </div>
                ) : enviando ? (
                    <div className="cargandoPagina">
                        <CargandoDatos />
                        <p>... Enviando Datos ...</p>
                    </div>
                ) : (
                    <>
                        <div className='PaginaVolver'>
                            <Botones className='agregar' onClick={() => navigate('/AlumbradoPublico')}><FaArrowLeft /><Textos className='parrafo'>Volver</Textos></Botones>
                        </div>

                        <div className='Formulario'>
                            <div className='Preguntas'>
                                <Textos className='parrafo'>OT:</Textos>
                                <Entradas
                                    name='ot'
                                    placeholder='Ingrese la OT'
                                    value={formulario.ot}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='Preguntas'>
                                <Textos className='parrafo'>Descripcion:</Textos>
                                <Entradas
                                    name='descripcion'
                                    placeholder='Ingrese la descripcion de la actividad'
                                    value={formulario.descripcion}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className='Accion'>
                            <Botones className='guardar' onClick={guardarDatos}>Enviar</Botones>
                        </div>

                        <div className='Notificaciones'>
                            <ToastContainer />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AlumbradoPublicoDetalle;