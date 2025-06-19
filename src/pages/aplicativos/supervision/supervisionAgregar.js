import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './supervisionAgregar.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import axios from 'axios';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import Botones from '../../../components/botones/botones';
import Selectores from '../../../components/selectores/selectores';
import Textos from '../../../components/textos/textos';
import Entradas from '../../../components/entradas/entradas';
import AreaTextos from '../../../components/areaTextos/areaTextos';
import Tablas from '../../../components/tablas/tablas';
import Cookies from 'js-cookie';

const SupervisionAgregar = () => {
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

    const cargarGeolocalizacion = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUbicacion({ latitude, longitude });

                    if (mapRef.current === null) {

                        mapRef.current = L.map('map1').setView([latitude, longitude], 16);
                        mapRef.current = L.map('map2').setView([latitude, longitude], 16);

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
            await axios.post(`${process.env.REACT_APP_API_URL}/supervision/cargarImagen`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            await axios.post(`${process.env.REACT_APP_API_URL}/supervision/crearRegistro`, {
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

            Cookies.remove('formularioClaroSupervisionOperativa');

            setEnviando(false)
            console.log('Datos enviados exitosamente');
            navigate('/SupervisionPrincipal', { state: { estadoNotificacion: true } });

        } catch (error) {
            console.error('Error al subir el archivo o enviar los datos:', error);
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
        }
    };

    const [formularioClaroSupervisionOperativa, setFormularioClaroSupervisionOperativa] = useState(() => {
        const datosGuardados = Cookies.get('formularioClaroSupervisionOperativa');
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
        Cookies.set('formularioClaroSupervisionOperativa', JSON.stringify(formularioClaroSupervisionOperativa));
    }, [formularioClaroSupervisionOperativa]);

    const enviarFormularioEnelInspeccionIntegralHSE = async (event) => {

        event.preventDefault();

        setEnviando(true)

        try {
            console.log("Fecha Inicial: " + fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }))
            console.log(formularioEnelInspeccionIntegralHSE)
            console.log("Fecha Final: " + new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            console.log(ubicacion)

            setEnviando(false)

        } catch (error) {
            console.error('Error al subir el archivo o enviar los datos:', error);
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
        }
    };

    const estadoInicialFormularioEnelInspeccionIntegralHSE = {
        nombreProyecto: "",
        noContrato: "",
        direccion: "",
        ciudad: "",
        opOt: "",
        cedulaSupervisorTecnico: "",
        nombreSupervisorTecnico: "",
        cedulaLiderEncargado: "",
        nombreLiderEncargado: "",
        proceso: "",
        placa: "",
        zona: "",
        trabajo: "",
        cuadrilla: [],
        riesgos1: "",
        fotoRiesgos1: "",
        riesgos2: "",
        fotoRiesgos2: "",
        riesgos3: "",
        fotoRiesgos3: "",
        riesgos4: "",
        fotoRiesgos4: "",
        riesgos5: "",
        fotoRiesgos5: "",
        riesgos6: "",
        fotoRiesgos6: "",
        riesgos7: "",
        fotoRiesgos7: "",
        riesgos8: "",
        fotoRiesgos8: "",
        riesgos9: "",
        fotoRiesgos9: "",
    };

    const [formularioEnelInspeccionIntegralHSE, setFormularioEnelInspeccionIntegralHSE] = useState(() => {
        const datosGuardados = Cookies.get('formularioEnelInspeccionIntegralHSE');
        return datosGuardados ? JSON.parse(datosGuardados) : estadoInicialFormularioEnelInspeccionIntegralHSE;
    });

    const actualizarCampoEnelInspeccionIntegralHSE = (campo, valor) => {
        setFormularioEnelInspeccionIntegralHSE(prev => {
            const actualizado = { ...prev, [campo]: valor };
            Cookies.set('formularioEnelInspeccionIntegralHSE', JSON.stringify(actualizado));
            return actualizado;
        });
    };

    useEffect(() => {
        setFecha(new Date());

        if (nombreUsuario === undefined) {
            window.location.href = '/ReportingCenter#/Login?tipo=supervision';
        }

        cargarRegistrosSupervision();
        cargarDatosCiudades();
        cargarDatosPlanta();
    }, []);

    const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);

    const columnas = [
        { header: 'No. ID', key: 'cedula' },
        { header: 'Nombres y Apellidos', key: 'nombre' },
        { header: 'Cargo', key: 'cargo' },
    ];

    const [mostrarModal, setMostrarModal] = useState(false);

    const agregarMiembroACuadrillaEnelInspeccionIntegralHSE = (miembro) => {
        const existe = (formularioEnelInspeccionIntegralHSE.cuadrilla || []).some(m => m.cedula === miembro.cedula);
        if (existe) {
            toast.warning('La cédula ya está en la cuadrilla.');
            return
        }

        setFormularioEnelInspeccionIntegralHSE(prev => {
            const actualizado = { ...prev, cuadrilla: [...(prev.cuadrilla || []), miembro] };
            Cookies.set('formularioEnelInspeccionIntegralHSE', JSON.stringify(actualizado));
            return actualizado;
        });

        Cookies.remove('miembroEnProceso');
        setMostrarModal(false);
        setMiembroEnProceso({})
    };

    const [miembroEnProceso, setMiembroEnProceso] = useState(() => {
        const guardado = Cookies.get('miembroEnProceso');
        return guardado ? JSON.parse(guardado) : {
            cedula: "",
            nombre: "",
            cargo: "",
            arl: "",
            tarjetaDeVida: "",
            carneCliente: "",
            carneSicte: "",
            fotoDocumentos: "",
            eppCasco: "",
            fotoEppCasco: "",
            eppGuantes: "",
            fotoEppGuantes: "",
            eppGuantesDielectricos: "",
            fotoEppGuantesDielectricos: "",
            eppProteccionFacialAntiArco: "",
            fotoEppProteccionFacialAntiArco: "",
            eppEquiposContraCaidas: "",
            fotoEppEquiposContraCaidas: "",
            eppOverolObraCivil: "",
            fotoEppOverolObraCivil: "",
            eppOverolIgnifugo: "",
            fotoEppOverolIgnifugo: "",
            eppGafasDeSeguridad: "",
            fotoEppGafasDeSeguridad: "",
            eppTapabocas: "",
            fotoEppTapabocas: "",
            eppBotas: "",
            fotoEppBotas: "",
        };
    });

    useEffect(() => {
        Cookies.set('miembroEnProceso', JSON.stringify(miembroEnProceso));
    }, [miembroEnProceso]);

    return (
        <div className="supervision-agregar">
            <div className={`titulo2 ${selectedOption === '' ? 'visible' : ''}`}>
                <Textos className='subtitulo'>Por favor elija el tipo de formulario a diligenciar</Textos>
            </div>
            <div className={`selectores ${selectedOption === '' ? 'visible' : ''}`}>
                <Selectores value={selectedOption} onChange={(e) => { setSelectedOption(e.target.value) }}
                    options={[
                        { value: 'CLARO - Supervision Operativa', label: 'CLARO - Supervision Operativa' },
                        { value: 'ENEL - Inspeccion Integral HSE', label: 'ENEL - Inspeccion Integral HSE' },
                    ]} className="primary">
                </Selectores>
            </div>

            <div className={`form ${selectedOption === 'CLARO - Supervision Operativa' ? 'visible' : ''}`}>
                {loading ? (
                    <div className="cargandoPagina">
                        <ThreeDots
                            type="ThreeDots"
                            color="#0B1A46"
                            height={200}
                            width={200}
                        />
                        <p>... Cargando Datos ...</p>
                    </div>
                ) : enviando ? (
                    <div className="cargandoPagina">
                        <ThreeDots
                            type="ThreeDots"
                            color="#0B1A46"
                            height={200}
                            width={200}
                        />
                        <p>... Enviando Datos ...</p>
                    </div>
                ) : (
                    <form className='formulario'>
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
                                <div className='botones'>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEPP', 'si')} className={formularioClaroSupervisionOperativa.respuestaEPP === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEPP', 'no')} className={formularioClaroSupervisionOperativa.respuestaEPP === 'no' ? 'formulario selected' : ''}>No</Botones>
                                    </div>
                                    <div className="comentario">
                                        <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaEPP === 'si' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioEPP}
                                            onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioEPP', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaEPP !== 'no'} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='campo alturas'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>2. ¿Todos estan certificados en alturas?</Textos>
                                <div className='botones'>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaAlturas', 'si')} className={formularioClaroSupervisionOperativa.respuestaAlturas === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaAlturas', 'no')} className={formularioClaroSupervisionOperativa.respuestaAlturas === 'no' ? 'formulario selected' : ''}>No</Botones>
                                    </div>
                                    <div className="comentario">
                                        <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaAlturas === 'si' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioAlturas}
                                            onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioAlturas', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaAlturas !== 'no'} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='campo ats'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>3. ¿Se diligencio el ATS?</Textos>
                                <div className='botones'>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaATS', 'si')} className={formularioClaroSupervisionOperativa.respuestaATS === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaATS', 'no')} className={formularioClaroSupervisionOperativa.respuestaATS === 'no' ? 'formulario selected' : ''}>No</Botones>
                                    </div>
                                    <div className="comentario">
                                        <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaATS === 'si' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioATS}
                                            onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioATS', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaATS !== 'no'} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='campo empalmes'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>4. ¿Se realizo reporte de empalmes en WFM?</Textos>
                                <div className='botones'>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmes', 'si')} className={formularioClaroSupervisionOperativa.respuestaEmpalmes === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmes', 'no')} className={formularioClaroSupervisionOperativa.respuestaEmpalmes === 'no' ? 'formulario selected' : ''}>No</Botones>
                                    </div>
                                    <div className="comentario">
                                        <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaEmpalmes === 'si' ? "¿Cuantos?" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioEmpalmes}
                                            onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioEmpalmes', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='campo preoperacional'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>5. ¿Se realizo preoperacional?</Textos>
                                <div className='botones'>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPreoperacional', 'si')} className={formularioClaroSupervisionOperativa.respuestaPreoperacional === 'si' ? 'formulario selected' : ''}>Sí</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPreoperacional', 'no')} className={formularioClaroSupervisionOperativa.respuestaPreoperacional === 'no' ? 'formulario selected' : ''}>No</Botones>
                                    </div>
                                    <div className="comentario">
                                        <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaPreoperacional === 'si' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioPreoperacional}
                                            onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioPreoperacional', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaPreoperacional !== 'no'} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='campo vehiculo'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>6. Estado del vehiculo:</Textos>
                                <div className='botones'>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '1')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '1' ? 'formulario selected' : ''}>1</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '2')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '2' ? 'formulario selected' : ''}>2</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '3')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '3' ? 'formulario selected' : ''}>3</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '4')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '4' ? 'formulario selected' : ''}>4</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaVehiculo', '5')} className={formularioClaroSupervisionOperativa.respuestaVehiculo === '5' ? 'formulario selected' : ''}>5</Botones>
                                    </div>
                                </div>
                                <div className="comentario">
                                    <Entradas type="text" placeholder={formularioClaroSupervisionOperativa.respuestaVehiculo === '5' ? "" : "¿Por qué?"} value={formularioClaroSupervisionOperativa.comentarioVehiculo}
                                        onChange={(e) => actualizarCampoClaroSupervisionOperativa('comentarioVehiculo', e.target.value)} disabled={formularioClaroSupervisionOperativa.respuestaVehiculo === '5'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo equipos'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>7. Equipos especializados:</Textos>
                                <div className='botones'>
                                    <div className='subtitulos'>
                                        <Textos className='subtitulo'>Empalmadora</Textos>
                                    </div>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmadora', 'Si')} className={formularioClaroSupervisionOperativa.respuestaEmpalmadora === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmadora', 'No')} className={formularioClaroSupervisionOperativa.respuestaEmpalmadora === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaEmpalmadora', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaEmpalmadora === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                                    </div>
                                </div>
                                <div className='botones'>
                                    <div className='subtitulos'>
                                        <Textos className='subtitulo'>OTDR</Textos>
                                    </div>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOTDR', 'Si')} className={formularioClaroSupervisionOperativa.respuestaOTDR === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOTDR', 'No')} className={formularioClaroSupervisionOperativa.respuestaOTDR === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOTDR', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaOTDR === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                                    </div>
                                </div>
                                <div className='botones'>
                                    <div className='subtitulos'>
                                        <Textos className='subtitulo'>Cortadora</Textos>
                                    </div>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaCortadora', 'Si')} className={formularioClaroSupervisionOperativa.respuestaCortadora === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaCortadora', 'No')} className={formularioClaroSupervisionOperativa.respuestaCortadora === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaCortadora', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaCortadora === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                                    </div>
                                </div>
                                <div className='botones'>
                                    <div className='subtitulos'>
                                        <Textos className='subtitulo'>Pinza de Trafico</Textos>
                                    </div>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPinza', 'Si')} className={formularioClaroSupervisionOperativa.respuestaPinza === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPinza', 'No')} className={formularioClaroSupervisionOperativa.respuestaPinza === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaPinza', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaPinza === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                                    </div>
                                </div>
                                <div className='botones'>
                                    <div className='subtitulos'>
                                        <Textos className='subtitulo'>OPM</Textos>
                                    </div>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOPM', 'Si')} className={formularioClaroSupervisionOperativa.respuestaOPM === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOPM', 'No')} className={formularioClaroSupervisionOperativa.respuestaOPM === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaOPM', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaOPM === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                                    </div>
                                </div>
                                <div className='botones'>
                                    <div className='subtitulos'>
                                        <Textos className='subtitulo'>ONEXPERT</Textos>
                                    </div>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaONEXPERT', 'Si')} className={formularioClaroSupervisionOperativa.respuestaONEXPERT === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaONEXPERT', 'No')} className={formularioClaroSupervisionOperativa.respuestaONEXPERT === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaONEXPERT', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaONEXPERT === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                                    </div>
                                </div>
                                <div className='botones'>
                                    <div className='subtitulos'>
                                        <Textos className='subtitulo'>Medidor de Conductancia</Textos>
                                    </div>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorConductancia', 'Si')} className={formularioClaroSupervisionOperativa.respuestaMedidorConductancia === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorConductancia', 'No')} className={formularioClaroSupervisionOperativa.respuestaMedidorConductancia === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorConductancia', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaMedidorConductancia === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                                    </div>
                                </div>
                                <div className='botones'>
                                    <div className='subtitulos'>
                                        <Textos className='subtitulo'>Medidor de Fugas</Textos>
                                    </div>
                                    <div className='opciones'>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorFugas', 'Si')} className={formularioClaroSupervisionOperativa.respuestaMedidorFugas === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorFugas', 'No')} className={formularioClaroSupervisionOperativa.respuestaMedidorFugas === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        <Botones onClick={() => actualizarCampoClaroSupervisionOperativa('respuestaMedidorFugas', 'N/A')} className={formularioClaroSupervisionOperativa.respuestaMedidorFugas === 'N/A' ? 'formulario selected' : ''}>N/A</Botones>
                                    </div>
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

                        <div className='enviar' onClick={enviarFormularioClaroSupervisionOperativa}>
                            <button type="submit" id='Enviar' className="btn btn-primary">Enviar</button>
                        </div>
                    </form>
                )}
            </div>

            <div className={`form ${selectedOption === 'ENEL - Inspeccion Integral HSE' ? 'visible' : ''}`}>
                {loading ? (
                    <div className="cargandoPagina">
                        <ThreeDots
                            type="ThreeDots"
                            color="#0B1A46"
                            height={200}
                            width={200}
                        />
                        <p>... Cargando Datos ...</p>
                    </div>
                ) : enviando ? (
                    <div className="cargandoPagina">
                        <ThreeDots
                            type="ThreeDots"
                            color="#0B1A46"
                            height={200}
                            width={200}
                        />
                        <p>... Enviando Datos ...</p>
                    </div>
                ) : (
                    <form className='formulario'>
                        <div className='titulo3'>
                            <Textos className='titulo'>{selectedOption}</Textos>
                        </div>
                        <div className='campo fecha'>
                            <i className="fas fa-calendar-alt"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Fecha inspeccion, hora inicio:</Textos>
                                <Textos className='parrafo'>{fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Textos>
                            </div>
                        </div>

                        <div className='campo nombreProyecto'>
                            <i className="fas fa-tools"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Nombre del proyecto:</Textos>
                                <Entradas type="text" placeholder="Ingrese el nombre del Proyecto" value={formularioEnelInspeccionIntegralHSE.nombreProyecto} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('nombreProyecto', e.target.value)} />
                            </div>
                        </div>

                        <div className='campo contrato'>
                            <i className="fas fa-tools"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>No. de contrato:</Textos>
                                <Selectores value={formularioEnelInspeccionIntegralHSE.noContrato} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('noContrato', e.target.value)}
                                    options={[
                                        { value: 'JA10123037/JA10123045', label: 'JA10123037 / JA10123045' },
                                        { value: 'JA10123400', label: 'JA10123400' },
                                    ]} className="primary">
                                </Selectores>
                            </div>
                        </div>

                        <div className='campo ubicacion'>
                            <div className='contenedor'>
                                <i className="fas fa-map-marker-alt"></i>
                                <Textos className='subtitulo'>Ubicación:</Textos>
                            </div>
                            <div id="map2"></div>
                        </div>

                        <div className='campo direccion'>
                            <i className="fas fa-tools"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Direccion:</Textos>
                                <Entradas type="text" placeholder="Ingrese la direccion" value={formularioEnelInspeccionIntegralHSE.direccion}
                                    onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('direccion', e.target.value)} />
                            </div>
                        </div>

                        <div className='campo ciudad'>
                            <i className="fas fa-tools"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Ciudad:</Textos>
                                <Entradas type="text" placeholder="Ingrese la ciudad" value={formularioEnelInspeccionIntegralHSE.ciudad} onChange={(e) => {
                                    const valor = e.target.value;
                                    actualizarCampoEnelInspeccionIntegralHSE('ciudad', valor);

                                    const coincidencias = datosCiudades.filter(ciudad =>
                                        ciudad.key.toLowerCase().includes(valor.toLowerCase())
                                    );
                                    setCiudadesFiltradas(coincidencias);
                                }} />
                            </div>

                            {formularioEnelInspeccionIntegralHSE.ciudad && ciudadesFiltradas.length > 0 && (
                                <ul className="sugerencias-ciudad">
                                    {ciudadesFiltradas.slice(0, 10).map((ciudad, index) => (
                                        <li
                                            key={ciudad.key}
                                            onClick={() => {
                                                actualizarCampoEnelInspeccionIntegralHSE('ciudad', ciudad.key);
                                                setCiudadesFiltradas([]);
                                            }}
                                        >
                                            {ciudad.key}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className='campo opOt'>
                            <i className="fas fa-tools"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>OP/OT:</Textos>
                                <Entradas type="text" placeholder="Ingrese el nombre del Proyecto" value={formularioEnelInspeccionIntegralHSE.opOt} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('opOt', e.target.value)} />
                            </div>
                        </div>

                        <div className='campo supervisor'>
                            <i className="fas fa-users-cog"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Supervisor técnico encargado:</Textos>
                                <Entradas type="text" placeholder="Ingrese la cedula del supervisor tecnico" value={formularioEnelInspeccionIntegralHSE.cedulaSupervisorTecnico} onChange={(e) => {
                                    const valor = e.target.value;
                                    actualizarCampoEnelInspeccionIntegralHSE('cedulaSupervisorTecnico', valor);
                                    const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                    if (registroEncontrado) {
                                        actualizarCampoEnelInspeccionIntegralHSE('nombreSupervisorTecnico', registroEncontrado.nombre);
                                    } else {
                                        actualizarCampoEnelInspeccionIntegralHSE('nombreSupervisorTecnico', 'Usuario no encontrado');
                                    }
                                }} />
                                <Entradas type="text" placeholder="Nombre" value={formularioEnelInspeccionIntegralHSE.nombreSupervisorTecnico} disabled={true} />
                            </div>
                        </div>

                        <div className='campo lider'>
                            <i className="fas fa-users-cog"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Líder/Encargado de cuadrilla:</Textos>
                                <Entradas type="text" placeholder="Ingrese la cedula del lider de cuadrilla" value={formularioEnelInspeccionIntegralHSE.cedulaLiderEncargado} onChange={(e) => {
                                    const valor = e.target.value;
                                    actualizarCampoEnelInspeccionIntegralHSE('cedulaLiderEncargado', valor);
                                    const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                    if (registroEncontrado) {
                                        actualizarCampoEnelInspeccionIntegralHSE('nombreLiderEncargado', registroEncontrado.nombre);
                                    } else {
                                        actualizarCampoEnelInspeccionIntegralHSE('nombreLiderEncargado', 'Usuario no encontrado');
                                    }
                                }} />
                                <Entradas type="text" placeholder="Nombre" value={formularioEnelInspeccionIntegralHSE.nombreLiderEncargado} disabled={true} />
                            </div>
                        </div>

                        <div className='campo proceso'>
                            <i className="fas fa-tools"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Proceso:</Textos>
                                <Selectores value={formularioEnelInspeccionIntegralHSE.proceso} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('proceso', e.target.value)}
                                    options={[
                                        { value: 'Obra civil', label: 'Obra civil' },
                                        { value: 'Obra electrica', label: 'Obra electrica' },
                                        { value: 'B2C', label: 'B2C' },
                                    ]} className="primary">
                                </Selectores>
                            </div>
                        </div>

                        <div className='campo placa'>
                            <i className="fas fa-id-card"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Placa vehículo:</Textos>
                                <Entradas
                                    type="text"
                                    placeholder="Placa movil (Ejemplo: ABC123, ABC12A)"
                                    value={formularioEnelInspeccionIntegralHSE.placa}
                                    onChange={(e) => {
                                        const newValue = e.target.value.toUpperCase();
                                        if (/^[A-Z]{0,3}[0-9]{0,2}[0-9A-Z]{0,1}$/.test(newValue)) {
                                            actualizarCampoEnelInspeccionIntegralHSE('placa', newValue);
                                        }
                                    }}
                                    pattern="[A-Za-z]{3}[0-9]{2}[0-9A-Za-z]{1}"
                                    maxLength={6}
                                    title="Debe ser en formato de 3 letras seguidas de 3 números (Ejemplo: ABC123)"
                                />
                            </div>
                        </div>

                        <div className='campo zona'>
                            <i className="fas fa-tools"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Zona:</Textos>
                                <Selectores value={formularioEnelInspeccionIntegralHSE.zona} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('zona', e.target.value)}
                                    options={[
                                        { value: 'Urbana', label: 'Urbana' },
                                        { value: 'Rural', label: 'Rural' },
                                    ]} className="primary">
                                </Selectores>
                            </div>
                        </div>

                        <div className='campo trabajo'>
                            <i className="fas fa-tools"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Trabajo a realizar:</Textos>
                                <Entradas type="text" placeholder="Ingrese el trabajo a realizar" value={formularioEnelInspeccionIntegralHSE.trabajo} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('trabajo', e.target.value)} />
                            </div>
                        </div>

                        <div className='campo cuadrilla'>
                            <i className="fas fa-tools"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Datos Cuadrilla:</Textos>
                                <div className='botonAgregar'>
                                    <Botones className='agregar' onClick={() => setMostrarModal(true)}>Agregar</Botones>
                                </div>
                            </div>
                        </div>

                        <div className='Tabla'>
                            <Tablas columnas={columnas} datos={formularioEnelInspeccionIntegralHSE.cuadrilla} filasPorPagina={5} />
                        </div>

                        {mostrarModal && (
                            <>
                                <div className="modal-overlay" onClick={() => setMostrarModal(false)}></div>
                                <div className="modal-cuadrilla">
                                    <div className="modal-contenido">
                                        <Textos className='titulo'>Agregar Integrante</Textos>
                                        <Textos className='subtitulo encabezado'>1. Datos Personales:</Textos>
                                        <div className='entradaDatos'>
                                            <Textos className='subtitulo'>Cedula:</Textos>
                                            <Entradas type="text" placeholder="Cédula" value={miembroEnProceso.cedula || ""} onChange={(e) => {
                                                const valor = e.target.value;
                                                const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                                setMiembroEnProceso(prev => ({
                                                    ...prev,
                                                    cedula: valor,
                                                    nombre: registroEncontrado ? registroEncontrado.nombre : 'Usuario no encontrado',
                                                    cargo: registroEncontrado ? registroEncontrado.cargo : 'Cargo no encontrado',
                                                }));
                                            }} />
                                        </div>
                                        <div className='entradaDatos'>
                                            <Textos className='subtitulo'>Nombre:</Textos>
                                            <Entradas type="text" placeholder="Nombre" value={miembroEnProceso.nombre} disabled={true} />
                                        </div>
                                        <div className='entradaDatos'>
                                            <Textos className='subtitulo'>Cargo:</Textos>
                                            <Entradas type="text" placeholder="Cargo" value={miembroEnProceso.cargo} disabled={true} />
                                        </div>
                                        <Textos className='subtitulo encabezado'>2. Documentos:</Textos>
                                        <div className='entradaDatos'>
                                            <Textos className='subtitulo'>ARL:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, arl: 'C' }))} className={miembroEnProceso.arl === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, arl: 'NC' }))} className={miembroEnProceso.arl === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            </div>
                                        </div>
                                        <div className='entradaDatos'>
                                            <Textos className='subtitulo'>Tarjeta de vida:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, tarjetaDeVida: 'C' }))} className={miembroEnProceso.tarjetaDeVida === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, tarjetaDeVida: 'NC' }))} className={miembroEnProceso.tarjetaDeVida === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            </div>
                                        </div>
                                        <div className='entradaDatos'>
                                            <Textos className='subtitulo'>Carné Cliente:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, carneCliente: 'C' }))} className={miembroEnProceso.carneCliente === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, carneCliente: 'NC' }))} className={miembroEnProceso.carneCliente === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            </div>
                                        </div>
                                        <div className='entradaDatos'>
                                            <Textos className='subtitulo'>Carné Sicte:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, carneSicte: 'C' }))} className={miembroEnProceso.carneSicte === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, carneSicte: 'NC' }))} className={miembroEnProceso.carneSicte === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo'>Ingrese la foto de los documentos:</Textos>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoDocumentos: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <Textos className='subtitulo encabezado'>3. Dotacion EPP y EPCC:</Textos>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza casco de seguridad TIPO II con barbuquejo en buen estado.">Casco:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppCasco: 'C' }))} className={miembroEnProceso.eppCasco === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppCasco: 'NC' }))} className={miembroEnProceso.eppCasco === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppCasco: 'NA' }))} className={miembroEnProceso.eppCasco === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppCasco !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppCasco: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza guantes de seguridad  de acuerdo a la labor ejecutada según corresponda y están en buen estado.">Guantes:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppGuantes: 'C' }))} className={miembroEnProceso.eppGuantes === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppGuantes: 'NC' }))} className={miembroEnProceso.eppGuantes === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppGuantes: 'NA' }))} className={miembroEnProceso.eppGuantes === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppGuantes !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppGuantes: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza  guantes  de  seguridad  dieléctricos,  clase 0, 2 o 4 según  corresponda,  en  buen estado y osee las pruebas de rigidez vigentes.">Guantes Dielectricos:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppGuantesDielectricos: 'C' }))} className={miembroEnProceso.eppGuantesDielectricos === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppGuantesDielectricos: 'NC' }))} className={miembroEnProceso.eppGuantesDielectricos === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppGuantesDielectricos: 'NA' }))} className={miembroEnProceso.eppGuantesDielectricos === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppGuantesDielectricos !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppGuantesDielectricos: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza protección facial anti-arco y está en buen estado (visor Arc Flash - Balaclava ignifuga)">Proteccion Facil Anti Arco:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppProteccionFacialAntiArco: 'C' }))} className={miembroEnProceso.eppProteccionFacialAntiArco === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppProteccionFacialAntiArco: 'NC' }))} className={miembroEnProceso.eppProteccionFacialAntiArco === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppProteccionFacialAntiArco: 'NA' }))} className={miembroEnProceso.eppProteccionFacialAntiArco === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppProteccionFacialAntiArco !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppProteccionFacialAntiArco: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza sistema contra caídas de altura completo, en buen estado.">Equipos Contra Caidas:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppEquiposContraCaidas: 'C' }))} className={miembroEnProceso.eppEquiposContraCaidas === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppEquiposContraCaidas: 'NC' }))} className={miembroEnProceso.eppEquiposContraCaidas === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppEquiposContraCaidas: 'NA' }))} className={miembroEnProceso.eppEquiposContraCaidas === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppEquiposContraCaidas !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppEquiposContraCaidas: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza ropa de trabajo adecuada para la tarea, en buen estado y normalizada">Overol Obra Civil:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppOverolObraCivil: 'C' }))} className={miembroEnProceso.eppOverolObraCivil === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppOverolObraCivil: 'NC' }))} className={miembroEnProceso.eppOverolObraCivil === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppOverolObraCivil: 'NA' }))} className={miembroEnProceso.eppOverolObraCivil === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppOverolObraCivil !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppOverolObraCivil: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza  overol ignífugo está en buen estado.">Overol Ignifugo:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppOverolIgnifugo: 'C' }))} className={miembroEnProceso.eppOverolIgnifugo === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppOverolIgnifugo: 'NC' }))} className={miembroEnProceso.eppOverolIgnifugo === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppOverolIgnifugo: 'NA' }))} className={miembroEnProceso.eppOverolIgnifugo === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppOverolIgnifugo !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppOverolIgnifugo: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza protector ocular (gafas) según la actividad y está en buen estado.">Gafas de Seguridad:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppGafasDeSeguridad: 'C' }))} className={miembroEnProceso.eppGafasDeSeguridad === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppGafasDeSeguridad: 'NC' }))} className={miembroEnProceso.eppGafasDeSeguridad === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppGafasDeSeguridad: 'NA' }))} className={miembroEnProceso.eppGafasDeSeguridad === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppGafasDeSeguridad !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppGafasDeSeguridad: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza protección respiratoria en buen estado.">Tapabocas:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppTapabocas: 'C' }))} className={miembroEnProceso.eppTapabocas === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppTapabocas: 'NC' }))} className={miembroEnProceso.eppTapabocas === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppTapabocas: 'NA' }))} className={miembroEnProceso.eppTapabocas === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppTapabocas !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppTapabocas: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className='entradaDatos vertical'>
                                            <Textos className='subtitulo' title="Utiliza calzado de seguridad según corresponda y está en buen estado.">Botas:</Textos>
                                            <div className='opciones'>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppBotas: 'C' }))} className={miembroEnProceso.eppBotas === 'C' ? 'formulario selected' : ''}>C</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppBotas: 'NC' }))} className={miembroEnProceso.eppBotas === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                                <Botones onClick={() => setMiembroEnProceso(prev => ({ ...prev, eppBotas: 'NA' }))} className={miembroEnProceso.eppBotas === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                            </div>
                                            <div className='opciones'>
                                                <Entradas
                                                    type="file"
                                                    className="form-control image"
                                                    accept="image/*"
                                                    disabled={miembroEnProceso.eppBotas !== 'NC'}
                                                    onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, fotoEppBotas: e.target.files[0] }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-acciones">
                                            <Botones className='guardar' onClick={() => {
                                                agregarMiembroACuadrillaEnelInspeccionIntegralHSE(miembroEnProceso);
                                            }}>Guardar</Botones>
                                            <Botones onClick={() => setMostrarModal(false)}>Cancelar</Botones>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className='campo'>
                            <Textos className='subtitulo'>1.</Textos>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>Identificacion de riesgos (Actividades previas al trabajo):</Textos>
                                <Textos className='subtitulo sub'>Se identifica todos los riesgos específicos de la actividad en el ARO, está debidamente firmado por todos los integrantes de la cuadrilla.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos1', 'C')} className={formularioEnelInspeccionIntegralHSE.riesgos1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos1', 'NC')} className={formularioEnelInspeccionIntegralHSE.riesgos1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos1', 'NA')} className={formularioEnelInspeccionIntegralHSE.riesgos1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoRiesgos1', e.target.files[0])}
                                    />
                                </div>

                                <Textos className='subtitulo sub'>Permiso de trabajo aplicable a la actividad, debidamente firmado por todos los integrantes de la cuadrilla, definiendo roles y está autorizado.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos2', 'C')} className={formularioEnelInspeccionIntegralHSE.riesgos2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos2', 'NC')} className={formularioEnelInspeccionIntegralHSE.riesgos2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos2', 'NA')} className={formularioEnelInspeccionIntegralHSE.riesgos2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoRiesgos2', e.target.files[0])}
                                    />
                                </div>

                                <Textos className='subtitulo sub'>Se identifican y aplican los procedimientos de trabajo acordes a la (s) actividad (es) a realizar.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos3', 'C')} className={formularioEnelInspeccionIntegralHSE.riesgos3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos3', 'NC')} className={formularioEnelInspeccionIntegralHSE.riesgos3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos3', 'NA')} className={formularioEnelInspeccionIntegralHSE.riesgos3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoRiesgos3', e.target.files[0])}
                                    />
                                </div>

                                <Textos className='subtitulo sub'>Se diligencia el tablero operativo de manera correcta y se instala la respectiva valla de contrato.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos4', 'C')} className={formularioEnelInspeccionIntegralHSE.riesgos4 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos4', 'NC')} className={formularioEnelInspeccionIntegralHSE.riesgos4 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos4', 'NA')} className={formularioEnelInspeccionIntegralHSE.riesgos4 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoRiesgos4', e.target.files[0])}
                                    />
                                </div>

                                <Textos className='subtitulo sub'>Dispone de los planos o guías de las instalaciones subterráneas, cables, tuberías y otros artículos que interfieran y hay informes disponibles.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos5', 'C')} className={formularioEnelInspeccionIntegralHSE.riesgos5 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos5', 'NC')} className={formularioEnelInspeccionIntegralHSE.riesgos5 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos5', 'NA')} className={formularioEnelInspeccionIntegralHSE.riesgos5 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos5 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoRiesgos5', e.target.files[0])}
                                    />
                                </div>

                                <Textos className='subtitulo sub'>Los cables eléctricos subterráneos y aéreos están protegidos y las distancias de seguridad se respetan de acuerdo con el nivel de voltaje de la red.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos6', 'C')} className={formularioEnelInspeccionIntegralHSE.riesgos6 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos6', 'NC')} className={formularioEnelInspeccionIntegralHSE.riesgos6 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos6', 'NA')} className={formularioEnelInspeccionIntegralHSE.riesgos6 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos6 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoRiesgos6', e.target.files[0])}
                                    />
                                </div>

                                <Textos className='subtitulo sub'>Las condiciones climáticas son adecuadas para realizar las actividades planificadas.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos7', 'C')} className={formularioEnelInspeccionIntegralHSE.riesgos7 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos7', 'NC')} className={formularioEnelInspeccionIntegralHSE.riesgos7 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos7', 'NA')} className={formularioEnelInspeccionIntegralHSE.riesgos7 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos7 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoRiesgos7', e.target.files[0])}
                                    />
                                </div>

                                <Textos className='subtitulo sub'>La dotación, EPP, EPCC se utilizan de forma correcta.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos8', 'C')} className={formularioEnelInspeccionIntegralHSE.riesgos8 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos8', 'NC')} className={formularioEnelInspeccionIntegralHSE.riesgos8 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos8', 'NA')} className={formularioEnelInspeccionIntegralHSE.riesgos8 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos8 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoRiesgos8', e.target.files[0])}
                                    />
                                </div>

                                <Textos className='subtitulo sub'>Cuenta con tapete dieléctrico en buen estado y posee las pruebas de rigidez vigentes.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos9', 'C')} className={formularioEnelInspeccionIntegralHSE.riesgos9 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos9', 'NC')} className={formularioEnelInspeccionIntegralHSE.riesgos9 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('riesgos9', 'NA')} className={formularioEnelInspeccionIntegralHSE.riesgos9 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos9 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoRiesgos9', e.target.files[0])}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='enviar'>
                            <Botones className="eliminar" onClick={() => {
                                Cookies.remove('formularioEnelInspeccionIntegralHSE');
                                setMiembroEnProceso({})
                                setFormularioEnelInspeccionIntegralHSE(estadoInicialFormularioEnelInspeccionIntegralHSE);
                            }}>Borrar formulario</Botones>
                            <Botones type="submit" id='Enviar' className="guardar" onClick={enviarFormularioEnelInspeccionIntegralHSE}>Enviar</Botones>
                        </div>
                    </form>
                )}
            </div>

            <div className='Notificaciones'>
                <ToastContainer />
            </div>
        </div >
    );
};

export default SupervisionAgregar;