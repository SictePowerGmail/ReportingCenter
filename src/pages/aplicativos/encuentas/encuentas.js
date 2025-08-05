import React, { useState, useEffect, useRef } from 'react';
import './encuentas.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'
import CargandoDatos from '../../../components/cargandoDatos/cargandoDatos';
import Textos from '../../../components/textos/textos';
import Entradas from '../../../components/entradas/entradas';
import Botones from '../../../components/botones/botones';
import Selectores from '../../../components/selectores/selectores';

const Encuentas = () => {
    const navigate = useNavigate();
    const [key, setKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [imagenes, setImagenes] = useState('');
    const [encuesta, setEncuesta] = useState(() => {
        const guardado = localStorage.getItem('encuesta');
        return guardado ? JSON.parse(guardado) : {
            nombreCompleto: "",
            correo: "",
            segmento: "",
            imagen: "",
        };
    });

    const cargarDatos = async (usuario) => {
        try {
            setLoading(true)
            const responseImagenes = await axios.get(`${process.env.REACT_APP_API_URL}/imagenes/encuestas`);
            const data = responseImagenes.data;
            setImagenes(data)
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

    const opciones = Array.isArray(imagenes)
        ? Array.from(
            new Map(
                imagenes.map((img) => {
                    const value = img.display_name.split('_')[0];
                    const label = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                    return [value, { value, label }];
                })
            ).values()
        )
        : [];

    const imagenesFiltradas = Array.isArray(imagenes)
        ? imagenes.filter((img) => {
            const segmento = img.display_name.split('_')[0];
            return encuesta.segmento ? segmento === encuesta.segmento : true;
        })
        : [];

    const fecha = obtenerFechaFormateada();
    const nombreEncuesta = "Cometas 2025"

    const actualizarEncuesta = async (campo, valor) => {
        const [nivel1, nivel2] = campo.split('.');

        if (typeof valor === 'string') {
            setEncuesta(prev => {
                const actualizado = { ...prev };
                if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }
                localStorage.setItem('encuesta', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }
    };

    const validarEncuesta = (encuenta) => {
        if (!encuenta.nombreCompleto) { toast.error('Por favor diligencie el nombre completo.'); return false }
        if (!encuenta.correo) { toast.error('Por favor diligencie el correo.'); return false }
        if (!encuenta.segmento) { toast.error('Por favor seleccione el segmento.'); return false }
        if (!encuenta.imagen) { toast.error('Por favor seleccione una imagen.'); return false }
    }

    const enviarEncuesta = async (event) => {

        event.preventDefault();
        const resultadoValidador = validarEncuesta(encuesta);
        if (resultadoValidador === false) { return }

        setEnviando(true)

        try {
            const encuestaCompleta = {
                ...encuesta,
                fecha,
                nombreEncuesta,
            };

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/encuestas/crearRegistroCometas`, encuestaCompleta);

            if (response.status >= 200 && response.status < 300) {
                setEnviando(false)
                console.log('Datos enviados exitosamente');
                localStorage.removeItem('encuesta');
                toast.success('Encuesta enviada exitosamente.', { className: 'toast-success' });
                setEncuesta('');
            } else {
                toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
                setEnviando(false)
            }

        } catch (error) {
            setEnviando(false);
            const mensaje = error.response?.data?.error || 'Error al enviar los datos.';
            console.error('Error al enviar:', mensaje);
            toast.error(mensaje, { className: 'toast-error' });
        }
    };

    return (
        <div className="Encuentas" key={key}>
            {loading ? (
                <CargandoDatos text={'Cargando Datos'} />
            ) : enviando ? (
                <CargandoDatos text={'Enviando Datos'} />
            ) : (
                <>
                    <div className='PaginaVolver'>
                        <Botones className='agregar' onClick={() => navigate('/SupervisionPrincipal')}><FaArrowLeft /><Textos className='parrafo'>Volver</Textos></Botones>
                    </div>

                    <div className='campo'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Fecha</Textos>
                            <Entradas
                                value={fecha}
                                disabled
                            ></Entradas>
                        </div>
                    </div>

                    <div className='campo'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Nombre Completo</Textos>
                            <Entradas
                                placeholder='Por favor diligencie el nombre'
                                required
                                onChange={(e) => actualizarEncuesta('nombreCompleto', e.target.value)}
                                value={encuesta.nombreCompleto}
                            ></Entradas>
                        </div>
                    </div>

                    <div className='campo'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Correo</Textos>
                            <Entradas
                                type="email"
                                placeholder='Por favor diligencie el correo'
                                required
                                pattern="[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+"
                                title="Debe contener un @ y un dominio válido"
                                onChange={(e) => actualizarEncuesta('correo', e.target.value)}
                                value={encuesta.correo}
                            ></Entradas>
                        </div>
                    </div>

                    <div className='campo'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Encuesta</Textos>
                            <Entradas
                                value={nombreEncuesta}
                                disabled
                            ></Entradas>
                        </div>
                    </div>

                    <div className='campo'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Segmento:</Textos>
                            <Selectores
                                value={encuesta.segmento}
                                onChange={(e) => {
                                    actualizarEncuesta('segmento', e.target.value);
                                }}
                                className="primary"
                                options={opciones}
                            ></Selectores>
                        </div>
                    </div>

                    <div className='campo'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Opciones:</Textos>
                            <div className="galeria">
                                {imagenesFiltradas.map((img) => (
                                    <div key={img.public_id} className={`card ${encuesta.imagen === img.public_id.substring(0, img.display_name.lastIndexOf('_')) ? 'seleccionada' : ''}`}
                                        onClick={() => {
                                            actualizarEncuesta('imagen', img.display_name.substring(0, img.display_name.lastIndexOf('_')));
                                        }}>
                                        <div className='imagenes'>
                                            <img src={img.secure_url} alt={img.display_name} />
                                        </div>
                                        <div className='nombre'>
                                            <p>{img.display_name.substring(0, img.display_name.lastIndexOf('_'))}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='botones'>
                            <div>
                                <Botones className="eliminar" onClick={() => {
                                    localStorage.removeItem('encuesta');
                                    setEncuesta('');
                                    setKey(prev => prev + 1);
                                }}>Borrar Encuestas</Botones>
                            </div>
                            <div>
                                <Botones className='agregar' type="submit" onClick={enviarEncuesta}>Enviar Encuesta</Botones>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className='Notificaciones'>
                <ToastContainer />
            </div>
        </div>
    );
};

export default Encuentas;