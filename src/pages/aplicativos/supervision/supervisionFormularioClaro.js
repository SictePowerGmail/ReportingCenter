import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './supervisionFormularioClaro.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import axios from 'axios';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from 'react-icons/fa'
import { ThreeDots } from 'react-loader-spinner';
import Botones from '../../../components/botones/botones';
import Selectores from '../../../components/selectores/selectores';
import Textos from '../../../components/textos/textos';
import Entradas from '../../../components/entradas/entradas';
import AreaTextos from '../../../components/areaTextos/areaTextos';
import Tablas from '../../../components/tablas/tablas';
import Imagenes from '../../../components/imagenes/imagenes';
import { OpcionesFotoObservaciones } from './OpcionesFotoObservaciones';
import Cookies from 'js-cookie';
import CargandoDatos from '../../../components/cargandoDatos/cargandoDatos';

const SupervisionFormularioClaro = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [datosPlanta, setDatosPlanta] = useState('');
    const [datosCiudades, setDatosCiudades] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [fecha, setFecha] = useState('');
    const role = useState(Cookies.get('userRole'));
    const nombreUsuario = Cookies.get('userNombre');
    const cedulaUsuario = Cookies.get('userCedula');
    const [ubicacion, setUbicacion] = useState({ latitude: null, longitude: null });
    const mapRef = useRef(null);
    const locationRef = useRef(null);
    const [foto, setFoto] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [listaPlacasRegistradas, setListaPlacasRegistradas] = useState([]);
    const [imagenAmpliada, setImagenAmpliada] = useState(null);
    const [accionModalTabla, setAccionModalTabla] = useState('crear');

    const cargarGeolocalizacion = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUbicacion({ latitude, longitude });

                    if (mapRef.current === null) {

                        mapRef.current = L.map('map1').setView([latitude, longitude], 16);

                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(mapRef.current);

                        const awesomeMarker = L.AwesomeMarkers.icon({
                            icon: 'car',   // nombre del icono de Font Awesome
                            prefix: 'fa',     // prefijo para el icono de Font Awesome (normalmente 'fa')
                            markerColor: 'blue',  // color del marcador
                            iconColor: 'white'    // color del icono
                        });

                        L.marker([latitude, longitude], { icon: awesomeMarker }).addTo(mapRef.current)
                            .openPopup();

                        locationRef.current = [latitude, longitude];

                        const locationButton = L.control({ position: 'bottomright' });

                        locationButton.onAdd = function () {
                            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
                            div.style.backgroundColor = 'white';
                            div.style.width = '40px';
                            div.style.height = '40px';
                            div.style.borderRadius = '50%';
                            div.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
                            div.style.cursor = 'pointer';
                            div.style.textAlign = 'center';
                            div.style.lineHeight = '45px';
                            div.innerHTML = '<i class="fa fa-location-arrow" style="font-size: 20px; color: black;"></i>';

                            div.onclick = function () {
                                if (locationRef.current) {
                                    mapRef.current.setView(locationRef.current, 16);
                                }
                            };

                            return div;
                        };
                        locationButton.addTo(mapRef.current);

                    } else {
                        mapRef.current.setView([latitude, longitude], 16);
                        locationRef.current = [latitude, longitude];
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
        } else {
            toast.error('Geolocation is not supported by this browser.');
        }
    }

    const cargarRegistrosSupervision = async (event) => {
        axios.get(`${process.env.REACT_APP_API_URL}/supervision/registrosFechaPlaca`)
            .then(response => {
                const data = response.data;

                const todayStart = moment().startOf('day');
                const todayEnd = moment().endOf('day');

                const filteredData = data.filter(item => {
                    const fechaItem = moment(item.fecha, 'YYYY-MM-DD HH:mm');
                    return fechaItem.isBetween(todayStart, todayEnd, null, '[]');
                });

                const uniquePlacas = Array.from(new Set(filteredData.map(item => item.placa)));

                setListaPlacasRegistradas(uniquePlacas);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    const cargarDatosCiudades = () => {
        fetch(`${process.env.REACT_APP_API_URL}/supervision/ciudades`)
            .then(response => response.json())
            .then(data => {
                const dataConLlave = data.map(ciudad => ({
                    ...ciudad,
                    key: `${ciudad.nombre} - Departamento: ${ciudad.departamento} - Codigo: ${ciudad.codigo_municipio}`
                }));
                setDatosCiudades(dataConLlave)
                setLoading(false);
            })
            .catch(error => console.log('Error al cargar los datos: ' + error.message));
    };

    const cargarDatosPlanta = () => {
        fetch(`${process.env.REACT_APP_API_URL}/supervision/plantaEnLineaCedulaNombre`)
            .then(response => response.json())
            .then(data => {
                setDatosPlanta(data);
                cargarGeolocalizacion();
                setLoading(false);
            })
            .catch(error => console.log('Error al cargar los datos: ' + error.message));
    };

    const clickCapture = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    // Crear un canvas para redimensionar la imagen
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    // Especificar las nuevas dimensiones de la imagen
                    const MAX_WIDTH = 800; // Puedes ajustar el ancho según tu necesidad
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;

                    // Dibujar la imagen en el canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Convertir el canvas a blob
                    canvas.toBlob((blob) => {
                        const resizedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });

                        // Asignar la imagen redimensionada
                        setFoto(resizedFile);
                    }, file.type);
                };
            };

            reader.readAsDataURL(file);
        }
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}-${minutes}`;
    };

    const formatDate2 = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const enviarFormularioClaroSupervisionOperativa = async (event) => {

        event.preventDefault();

        if (nombreUsuario === 'Nombre' || !nombreUsuario) {
            toast.error('Por favor agrega la cedula del supervisor', { className: 'toast-error' });
            return;
        }

        if (nombreUsuario === 'Usuario no encontrado') {
            toast.error('Por favor valide la cedula del supervisor', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.placa) {
            toast.error('Por favor agrega la placa de la movil', { className: 'toast-error' });
            return;
        } else if (!/^[A-Z]{3}[0-9]{2}[0-9A-Z]{1}$/.test(formularioClaroSupervisionOperativa.placa)) {
            toast.error('La placa debe estar en el formato ABC123 o ABC12A', { className: 'toast-error' });
            return;
        } else if (listaPlacasRegistradas.includes(formularioClaroSupervisionOperativa.placa)) {
            toast.error('La placa ya fue registrada el dia de hoy', { className: 'toast-error' });
            return;
        }

        if (formularioClaroSupervisionOperativa.nombreCuadrilla === 'Nombre' || formularioClaroSupervisionOperativa.nombreCuadrilla === '') {
            toast.error('Por favor agrega la cedula del lider de la cuadrilla', { className: 'toast-error' });
            return;
        }

        if (formularioClaroSupervisionOperativa.nombreCuadrilla === 'Usuario no encontrado') {
            toast.error('Por favor valide la cedula del lider de la cuadrilla', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.ot) {
            toast.error('Por favor agrega una OT', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaEPP) {
            toast.error('Por favor responda la primera pregunta', { className: 'toast-error' });
            return;
        }
        else if (formularioClaroSupervisionOperativa.respuestaEPP === 'no' && (!formularioClaroSupervisionOperativa.comentarioEPP || formularioClaroSupervisionOperativa.comentarioEPP.trim().length === 0)) {
            toast.error('Por favor justifique la primera pregunta', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaAlturas) {
            toast.error('Por favor responda la segunda pregunta', { className: 'toast-error' });
            return;
        }
        else if (formularioClaroSupervisionOperativa.respuestaAlturas === 'no' && (!formularioClaroSupervisionOperativa.comentarioAlturas || formularioClaroSupervisionOperativa.comentarioAlturas.trim().length === 0)) {
            toast.error('Por favor justifique la segunda pregunta', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaATS) {
            toast.error('Por favor responda la tercera pregunta', { className: 'toast-error' });
            return;
        }
        else if (formularioClaroSupervisionOperativa.respuestaATS === 'no' && (!formularioClaroSupervisionOperativa.comentarioATS || formularioClaroSupervisionOperativa.comentarioATS.trim().length === 0)) {
            toast.error('Por favor justifique la tercera pregunta', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaEmpalmes) {
            toast.error('Por favor responda la cuarta pregunta', { className: 'toast-error' });
            return;
        }
        else if (!formularioClaroSupervisionOperativa.comentarioEmpalmes || formularioClaroSupervisionOperativa.comentarioEmpalmes.trim().length === 0) {
            toast.error('Por favor justifique la cuarta pregunta', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaPreoperacional) {
            toast.error('Por favor responda la quinta pregunta', { className: 'toast-error' });
            return;
        }
        else if (formularioClaroSupervisionOperativa.respuestaPreoperacional === 'no' && (!formularioClaroSupervisionOperativa.comentarioPreoperacional || formularioClaroSupervisionOperativa.comentarioPreoperacional.trim().length === 0)) {
            toast.error('Por favor justifique la quinta pregunta', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaVehiculo) {
            toast.error('Por favor responda la sexta pregunta', { className: 'toast-error' });
            return;
        }
        else if (formularioClaroSupervisionOperativa.respuestaVehiculo !== '5' && (!formularioClaroSupervisionOperativa.comentarioVehiculo || formularioClaroSupervisionOperativa.comentarioVehiculo.trim().length === 0)) {
            toast.error('Por favor justifique la sexta pregunta', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaEmpalmadora) {
            toast.error('Por favor responda la septima pregunta - Empalmadora', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaOTDR) {
            toast.error('Por favor responda la septima pregunta - OTDR', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaCortadora) {
            toast.error('Por favor responda la septima pregunta - Cortadora', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaPinza) {
            toast.error('Por favor responda la septima pregunta - Pinza', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaOPM) {
            toast.error('Por favor responda la septima pregunta - OPM', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaONEXPERT) {
            toast.error('Por favor responda la septima pregunta - ONEXPERT', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaMedidorConductancia) {
            toast.error('Por favor responda la septima pregunta - Medidor de Conductancia', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.respuestaMedidorFugas) {
            toast.error('Por favor responda la septima pregunta - Medidor de Fugas', { className: 'toast-error' });
            return;
        }

        if (!formularioClaroSupervisionOperativa.observacion) {
            toast.error('Por favor agrega una Observacion', { className: 'toast-error' });
            return;
        }

        if (!foto) {
            toast.error('Por favor agrega una foto', { className: 'toast-error' });
            return;
        }

        if (!ubicacion.latitude || !ubicacion.longitude) {
            toast.error('Por favor dar permisos para acceder a la ubicacion', { className: 'toast-error' });
            return;
        }

        setEnviando(true)

        const formattedDate = formatDate(fecha);
        const formattedDate2 = formatDate2(fecha);
        const formData = new FormData();
        const fotoNombre = `${formattedDate}_${foto.name}`
        formData.append('file', foto);
        formData.append("filename", fotoNombre);

        try {
            const response1 = await axios.post(`${process.env.REACT_APP_API_URL}/supervision/cargarImagen`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/supervision/crearRegistro`, {
                fecha: formattedDate2,
                nombre: nombreUsuario,
                placa: formularioClaroSupervisionOperativa.placa,
                cedula_cuadrilla: formularioClaroSupervisionOperativa.cedulaCuadrilla,
                nombre_cuadrilla: formularioClaroSupervisionOperativa.nombreCuadrilla,
                ot: formularioClaroSupervisionOperativa.ot,
                epp: formularioClaroSupervisionOperativa.respuestaEPP,
                epp_comentario: formularioClaroSupervisionOperativa.comentarioEPP,
                alturas: formularioClaroSupervisionOperativa.respuestaAlturas,
                alturas_comentario: formularioClaroSupervisionOperativa.comentarioAlturas,
                ats: formularioClaroSupervisionOperativa.respuestaATS,
                ats_comentario: formularioClaroSupervisionOperativa.comentarioATS,
                empalmes: formularioClaroSupervisionOperativa.respuestaEmpalmes,
                empalmes_comentario: formularioClaroSupervisionOperativa.comentarioEmpalmes,
                preoperacional: formularioClaroSupervisionOperativa.respuestaPreoperacional,
                preoperacional_comentario: formularioClaroSupervisionOperativa.comentarioPreoperacional,
                vehiculo: formularioClaroSupervisionOperativa.respuestaVehiculo,
                vehiculo_comentario: formularioClaroSupervisionOperativa.comentarioVehiculo,
                empalmadora: formularioClaroSupervisionOperativa.respuestaEmpalmadora,
                otdr: formularioClaroSupervisionOperativa.respuestaOTDR,
                cortadora: formularioClaroSupervisionOperativa.respuestaCortadora,
                pinza: formularioClaroSupervisionOperativa.respuestaPinza,
                opm: formularioClaroSupervisionOperativa.respuestaOPM,
                onexpert: formularioClaroSupervisionOperativa.respuestaONEXPERT,
                medidor_conductancia: formularioClaroSupervisionOperativa.respuestaMedidorConductancia,
                medidor_fugas: formularioClaroSupervisionOperativa.respuestaMedidorFugas,
                observacion: formularioClaroSupervisionOperativa.observacion,
                foto_nombre: fotoNombre,
                latitud: ubicacion.latitude,
                longitud: ubicacion.longitude
            });

            if (response1.status >= 200 && response1.status < 300 && response2.status >= 200 && response2.status < 300) {
                localStorage.removeItem('formularioClaroSupervisionOperativa');
                setEnviando(false)
                console.log('Datos enviados exitosamente');
                navigate('/SupervisionPrincipal', { state: { estadoNotificacion: true } });
            } else {
                setEnviando(false)
                toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
            }

        } catch (error) {
            setEnviando(false)
            console.error('Error al subir el archivo o enviar los datos:', error);
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
        }
    };

    const [formularioClaroSupervisionOperativa, setFormularioClaroSupervisionOperativa] = useState(() => {
        const datosGuardados = localStorage.getItem('formularioClaroSupervisionOperativa');
        return datosGuardados ? JSON.parse(datosGuardados) : {
            placa: "",
            cedulaCuadrilla: "",
            nombreCuadrilla: "",
            ot: "",
            respuestaEPP: "",
            comentarioEPP: "",
            respuestaAlturas: "",
            comentarioAlturas: "",
            respuestaATS: "",
            comentarioATS: "",
            respuestaEmpalmes: "",
            comentarioEmpalmes: "",
            respuestaPreoperacional: "",
            comentarioPreoperacional: "",
            respuestaVehiculo: "",
            comentarioVehiculo: "",
            respuestaEmpalmadora: "",
            respuestaOTDR: "",
            respuestaCortadora: "",
            respuestaPinza: "",
            respuestaOPM: "",
            respuestaONEXPERT: "",
            respuestaMedidorConductancia: "",
            respuestaMedidorFugas: "",
            observacion: "",
        };
    });

    const actualizarCampoClaroSupervisionOperativa = (campo, valor) => {
        setFormularioClaroSupervisionOperativa(prev => ({ ...prev, [campo]: valor }));
    };

    useEffect(() => {
        localStorage.setItem('formularioClaroSupervisionOperativa', JSON.stringify(formularioClaroSupervisionOperativa));
    }, [formularioClaroSupervisionOperativa]);

    useEffect(() => {
        setFecha(new Date());

        if (nombreUsuario === undefined) {
            window.location.href = '/ReportingCenter#/Login?tipo=supervision';
        }

        cargarRegistrosSupervision();
        cargarDatosCiudades();
        cargarDatosPlanta();
    }, []);

    return (
        <div className="supervisionFormularioClaro">
            {loading ? (
                <CargandoDatos text={'Cargando Datos'} />
            ) : enviando ? (
                <CargandoDatos text={'Enviando Datos'} />
            ) : (
                <form className='formulario'>
                    <div className='PaginaVolver'>
                        <Botones className='agregar' onClick={() => navigate('/SupervisionPrincipal')}><FaArrowLeft /><Textos className='parrafo'>Volver</Textos></Botones>
                    </div>

                    <div className='titulo3'>
                        <Textos className='titulo'>{selectedOption}</Textos>
                    </div>
                    <div className='campo fecha'>
                        <i className="fas fa-calendar-alt"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Fecha:</Textos>
                            <Textos className='parrafo'>{fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Textos>
                        </div>
                    </div>

                    <div className='campo supervisor'>
                        <i className="fas fa-user-cog"></i>
                        <div className="entradaDatos">
                            <Textos className='subtitulo'>Supervisor:</Textos>
                            <Entradas type="text" placeholder={!nombreUsuario ? "Nombre" : nombreUsuario} disabled={true} />
                        </div>
                    </div>

                    <div className='campo placa'>
                        <i className="fas fa-id-card"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Ingrese la placa de la movil:</Textos>
                            <Entradas
                                type="text"
                                placeholder="Placa movil (Ejemplo: ABC123, ABC12A)"
                                value={formularioClaroSupervisionOperativa.placa}
                                onChange={(e) => {
                                    const newValue = e.target.value.toUpperCase();
                                    if (/^[A-Z]{0,3}[0-9]{0,2}[0-9A-Z]{0,1}$/.test(newValue)) {
                                        actualizarCampoClaroSupervisionOperativa('placa', newValue);
                                    }
                                }}
                                pattern="[A-Za-z]{3}[0-9]{2}[0-9A-Za-z]{1}"
                                maxLength={6}
                                title="Debe ser en formato de 3 letras seguidas de 3 números (Ejemplo: ABC123)"
                            />
                        </div>
                    </div>

                    <div className='campo liderCuadrilla'>
                        <i className="fas fa-users-cog"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Ingrese el lider de la cuadrilla:</Textos>
                            <Entradas type="text" placeholder="Cedula" value={formularioClaroSupervisionOperativa.cedulaCuadrilla} onChange={(e) => {
                                const valor = e.target.value;
                                actualizarCampoClaroSupervisionOperativa('cedulaCuadrilla', valor);
                                const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                if (registroEncontrado) {
                                    actualizarCampoClaroSupervisionOperativa('nombreCuadrilla', registroEncontrado.nombre);
                                } else {
                                    actualizarCampoClaroSupervisionOperativa('nombreCuadrilla', 'Usuario no encontrado');
                                }
                            }} />
                            <Entradas type="text" placeholder="Nombre" value={formularioClaroSupervisionOperativa.nombreCuadrilla} disabled={true} />
                        </div>
                    </div>

                    <div className='campo ot'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Ingrese la OT / UUID:</Textos>
                            <Entradas type="text" placeholder="OT / UUID" value={formularioClaroSupervisionOperativa.ot} onChange={(e) => actualizarCampoClaroSupervisionOperativa('ot', e.target.value)} />
                        </div>
                    </div>

                    <div className='campo epp'>
                        <i className="fas fa-bullhorn"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>1. ¿Tienen todos los EPP?</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEPP', 'si')} className={formularioClaroSupervisionOperativa.respuestaEPP === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEPP', 'no')} className={formularioClaroSupervisionOperativa.respuestaEPP === 'no' ? 'formulario selected' : ''}>No</Botones>
                            </div>
                            <div className="opciones">
                                <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaEPP === 'si' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioEPP}
                                    onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioEPP', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaEPP !== 'no'} />
                            </div>
                        </div>
                    </div>

                    <div className='campo alturas'>
                        <i className="fas fa-bullhorn"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>2. ¿Todos estan certificados en alturas?</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaAlturas', 'si')} className={formularioClaroSupervisionOperativa.respuestaAlturas === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaAlturas', 'no')} className={formularioClaroSupervisionOperativa.respuestaAlturas === 'no' ? 'formulario selected' : ''}>No</Botones>
                            </div>
                            <div className="opciones">
                                <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaAlturas === 'si' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioAlturas}
                                    onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioAlturas', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaAlturas !== 'no'} />
                            </div>
                        </div>
                    </div>

                    <div className='campo ats'>
                        <i className="fas fa-bullhorn"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>3. ¿Se diligencio el ATS?</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaATS', 'si')} className={formularioClaroSupervisionOperativa.respuestaATS === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaATS', 'no')} className={formularioClaroSupervisionOperativa.respuestaATS === 'no' ? 'formulario selected' : ''}>No</Botones>
                            </div>
                            <div className="opciones">
                                <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaATS === 'si' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioATS}
                                    onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioATS', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaATS !== 'no'} />
                            </div>
                        </div>
                    </div>

                    <div className='campo empalmes'>
                        <i className="fas fa-bullhorn"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>4. ¿Se realizo reporte de empalmes en WFM?</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmes', 'si')} className={formularioClaroSupervisionOperativa.respuestaEmpalmes === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmes', 'no')} className={formularioClaroSupervisionOperativa.respuestaEmpalmes === 'no' ? 'formulario selected' : ''}>No</Botones>
                            </div>
                            <div className="opciones">
                                <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaEmpalmes === 'si' ? "¿Cuantos?" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioEmpalmes}
                                    onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioEmpalmes', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className='campo preoperacional'>
                        <i className="fas fa-bullhorn"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>5. ¿Se realizo preoperacional?</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPreoperacional', 'si')} className={formularioClaroSupervisionOperativa.respuestaPreoperacional === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPreoperacional', 'no')} className={formularioClaroSupervisionOperativa.respuestaPreoperacional === 'no' ? 'formulario selected' : ''}>No</Botones>
                            </div>
                            <div className="opciones">
                                <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaPreoperacional === 'si' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioPreoperacional}
                                    onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioPreoperacional', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaPreoperacional !== 'no'} />
                            </div>
                        </div>
                    </div>

                    <div className='campo vehiculo'>
                        <i className="fas fa-bullhorn"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>6. Estado del vehiculo:</Textos>
                            <div className='opciones vehiculo'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '1')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '1' ? 'formulario selected' : ''}>1</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '2')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '2' ? 'formulario selected' : ''}>2</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '3')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '3' ? 'formulario selected' : ''}>3</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '4')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '4' ? 'formulario selected' : ''}>4</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '5')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '5' ? 'formulario selected' : ''}>5</Botones>
                            </div>
                            <div className="opciones vehiculo">
                                <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaVehiculo === '5' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioVehiculo}
                                    onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioVehiculo', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaVehiculo === '5'} />
                            </div>
                        </div>
                    </div>

                    <div className='campo equipos'>
                        <i className="fas fa-bullhorn"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>7. Equipos especializados:</Textos>
                            <Textos className='subtitulo sub'>Empalmadora</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmadora', 'Si')} className={formularioClaroSupervisionOperativa.respuestaEmpalmadora === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmadora', 'No')} className={formularioClaroSupervisionOperativa.respuestaEmpalmadora === 'No' ? 'formulario selected' : ''}>No</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmadora', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaEmpalmadora === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                            </div>
                            <Textos className='subtitulo sub'>OTDR</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOTDR', 'Si')} className={formularioClaroSupervisionOperativa.respuestaOTDR === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOTDR', 'No')} className={formularioClaroSupervisionOperativa.respuestaOTDR === 'No' ? 'formulario selected' : ''}>No</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOTDR', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaOTDR === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                            </div>
                            <Textos className='subtitulo sub'>Cortadora</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaCortadora', 'Si')} className={formularioClaroSupervisionOperativa.respuestaCortadora === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaCortadora', 'No')} className={formularioClaroSupervisionOperativa.respuestaCortadora === 'No' ? 'formulario selected' : ''}>No</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaCortadora', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaCortadora === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                            </div>
                            <Textos className='subtitulo sub'>Pinza de Trafico</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPinza', 'Si')} className={formularioClaroSupervisionOperativa.respuestaPinza === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPinza', 'No')} className={formularioClaroSupervisionOperativa.respuestaPinza === 'No' ? 'formulario selected' : ''}>No</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPinza', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaPinza === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                            </div>
                            <Textos className='subtitulo sub'>OPM</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOPM', 'Si')} className={formularioClaroSupervisionOperativa.respuestaOPM === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOPM', 'No')} className={formularioClaroSupervisionOperativa.respuestaOPM === 'No' ? 'formulario selected' : ''}>No</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOPM', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaOPM === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                            </div>
                            <Textos className='subtitulo sub'>ONEXPERT</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaONEXPERT', 'Si')} className={formularioClaroSupervisionOperativa.respuestaONEXPERT === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaONEXPERT', 'No')} className={formularioClaroSupervisionOperativa.respuestaONEXPERT === 'No' ? 'formulario selected' : ''}>No</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaONEXPERT', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaONEXPERT === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                            </div>
                            <Textos className='subtitulo sub'>Medidor de Conductancia</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorConductancia', 'Si')} className={formularioClaroSupervisionOperativa.respuestaMedidorConductancia === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorConductancia', 'No')} className={formularioClaroSupervisionOperativa.respuestaMedidorConductancia === 'No' ? 'formulario selected' : ''}>No</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorConductancia', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaMedidorConductancia === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                            </div>
                            <Textos className='subtitulo sub'>Medidor de Fugas</Textos>
                            <div className='opciones'>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorFugas', 'Si')} className={formularioClaroSupervisionOperativa.respuestaMedidorFugas === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorFugas', 'No')} className={formularioClaroSupervisionOperativa.respuestaMedidorFugas === 'No' ? 'formulario selected' : ''}>No</Botones>
                                <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorFugas', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaMedidorFugas === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                            </div>
                        </div>
                    </div>

                    <div className='campo observacion'>
                        <i className="fas fa-comment"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>8. Observaciones:</Textos>
                            <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioClaroSupervisionOperativa.observacion} onChange={(e) => actualizarCampoClaroSupervisionOperativa('observacion', e.target.value)} rows={4} />
                        </div>
                    </div>

                    <div className='campo foto'>
                        <i className="fas fa-camera"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>9. Tomar foto de la cuadrilla:</Textos>
                            <Entradas
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={clickCapture}
                                style={{ display: 'none' }}
                                id="fotoInput"
                            />
                            <label htmlFor="fotoInput" className="foto-label">
                                {foto ? foto.name : 'Dar click aqui para tomar foto'}
                            </label>
                        </div>
                    </div>

                    <div className='campo ubicacion'>
                        <div className='contenedor'>
                            <i className="fas fa-map-marker-alt"></i>
                            <Textos className='subtitulo'>Ubicación del usuario:</Textos>
                        </div>
                        <div id="map1" style={{ width: '100%', height: '270px' }}></div>
                    </div>

                    <div className='enviar'>
                        <Botones id='Enviar' className='agregar' onClick={enviarFormularioClaroSupervisionOperativa}>Enviar</Botones>
                    </div>
                </form>
            )}

            <div className='Notificaciones'>
                <ToastContainer />
            </div>
        </div >
    );
};

export default SupervisionFormularioClaro;