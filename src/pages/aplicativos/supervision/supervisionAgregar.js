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

            localStorage.removeItem('formularioClaroSupervisionOperativa');

            setEnviando(false)
            console.log('Datos enviados exitosamente');
            navigate('/SupervisionPrincipal', { state: { estadoNotificacion: true } });

        } catch (error) {
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
        observacionRiesgos1: "",
        riesgos2: "",
        fotoRiesgos2: "",
        observacionRiesgos2: "",
        riesgos3: "",
        fotoRiesgos3: "",
        observacionRiesgos3: "",
        riesgos4: "",
        fotoRiesgos4: "",
        observacionRiesgos4: "",
        riesgos5: "",
        fotoRiesgos5: "",
        observacionRiesgos5: "",
        riesgos6: "",
        fotoRiesgos6: "",
        observacionRiesgos6: "",
        riesgos7: "",
        fotoRiesgos7: "",
        observacionRiesgos7: "",
        riesgos8: "",
        fotoRiesgos8: "",
        observacionRiesgos8: "",
        riesgos9: "",
        fotoRiesgos9: "",
        observacionRiesgos9: "",
        senaYDemar1: "",
        fotoSenaYDemar1: "",
        observacionSenaYDemar1: "",
        senaYDemar2: "",
        fotoSenaYDemar2: "",
        observacionSenaYDemar2: "",
        senaYDemar3: "",
        fotoSenaYDemar3: "",
        observacionSenaYDemar3: "",
        reglasOro1: "",
        fotoReglasOro1: "",
        observacionReglasOro1: "",
        reglasOro2: "",
        fotoReglasOro2: "",
        observacionReglasOro2: "",
        reglasOro3: "",
        fotoReglasOro3: "",
        observacionReglasOro3: "",
        reglasOro4: "",
        fotoReglasOro4: "",
        observacionReglasOro4: "",
        reglasOro5: "",
        fotoReglasOro5: "",
        observacionReglasOro5: "",
        trabajoAlturas1: "",
        fotoTrabajoAlturas1: "",
        observacionTrabajoAlturas1: "",
        trabajoAlturas2: "",
        fotoTrabajoAlturas2: "",
        observacionTrabajoAlturas2: "",
        trabajoAlturas3: "",
        fotoTrabajoAlturas3: "",
        observacionTrabajoAlturas3: "",
        trabajoAlturas4: "",
        fotoTrabajoAlturas4: "",
        observacionTrabajoAlturas4: "",
        trabajoAlturas5: "",
        fotoTrabajoAlturas5: "",
        observacionTrabajoAlturas5: "",
        espacioConfinado1: "",
        fotoEspacioConfinado1: "",
        observacionEspacioConfinado1: "",
        espacioConfinado2: "",
        fotoEspacioConfinado2: "",
        observacionEspacioConfinado2: "",
        espacioConfinado3: "",
        fotoEspacioConfinado3: "",
        observacionEspacioConfinado3: "",
        vehiculos1: "",
        fotoVehiculos1: "",
        observacionVehiculos1: "",
        vehiculos2: "",
        fotoVehiculos2: "",
        observacionVehiculos2: "",
        vehiculos3: "",
        fotoVehiculos3: "",
        observacionVehiculos3: "",
        vehiculos4: "",
        fotoVehiculos4: "",
        observacionVehiculos4: "",
        vehiculos5: "",
        fotoVehiculos5: "",
        observacionVehiculos5: "",
        vehiculos6: "",
        fotoVehiculos6: "",
        observacionVehiculos6: "",
        vehiculos7: "",
        fotoVehiculos7: "",
        observacionVehiculos7: "",
        vehiculos8: "",
        fotoVehiculos8: "",
        observacionVehiculos8: "",
        vehiculos9: "",
        fotoVehiculos9: "",
        observacionVehiculos9: "",
        vehiculos10: "",
        fotoVehiculos10: "",
        observacionVehiculos10: "",
        trabajo1: "",
        fotoTrabajo1: "",
        observacionTrabajo1: "",
        trabajo2: "",
        fotoTrabajo2: "",
        observacionTrabajo2: "",
        trabajo3: "",
        fotoTrabajo3: "",
        observacionTrabajo3: "",
        trabajo4: "",
        fotoTrabajo4: "",
        observacionTrabajo4: "",
        materiales1: "",
        fotoMateriales1: "",
        observacionMateriales1: "",
        materiales2: "",
        fotoMateriales2: "",
        observacionMateriales2: "",
        materiales3: "",
        fotoMateriales3: "",
        observacionMateriales3: "",
        primerosAuxilios1: "",
        fotoPrimerosAuxilios1: "",
        observacionPrimerosAuxilios1: "",
        primerosAuxilios2: "",
        fotoPrimerosAuxilios2: "",
        observacionPrimerosAuxilios2: "",
        primerosAuxilios3: "",
        fotoPrimerosAuxilios3: "",
        observacionPrimerosAuxilios3: "",
        primerosAuxilios4: "",
        fotoPrimerosAuxilios4: "",
        observacionPrimerosAuxilios4: "",
        primerosAuxilios5: "",
        fotoPrimerosAuxilios5: "",
        observacionPrimerosAuxilios5: "",
        biomecanicos1: "",
        fotoBiomecanicos1: "",
        observacionBiomecanicos1: "",
        biomecanicos2: "",
        fotoBiomecanicos2: "",
        observacionBiomecanicos2: "",
        biomecanicos3: "",
        fotoBiomecanicos3: "",
        observacionBiomecanicos3: "",
        quimicos1: "",
        fotoQuimicos1: "",
        observacionQuimicos1: "",
        quimicos2: "",
        fotoQuimicos2: "",
        observacionQuimicos2: "",
        quimicos3: "",
        fotoQuimicos3: "",
        observacionQuimicos3: "",
        quimicos4: "",
        fotoQuimicos4: "",
        observacionQuimicos4: "",
        quimicos5: "",
        fotoQuimicos5: "",
        observacionQuimicos5: "",
        residuosNoPeligrosos1: "",
        fotoResiduosNoPeligrosos1: "",
        observacionResiduosNoPeligrosos1: "",
        residuosNoPeligrosos2: "",
        fotoResiduosNoPeligrosos2: "",
        observacionResiduosNoPeligrosos2: "",
        residuosNoPeligrosos3: "",
        fotoResiduosNoPeligrosos3: "",
        observacionResiduosNoPeligrosos3: "",
        residuosConstruccion1: "",
        fotoResiduosConstruccion1: "",
        observacionResiduosConstruccion1: "",
        residuosConstruccion2: "",
        fotoResiduosConstruccion2: "",
        observacionResiduosConstruccion2: "",
        residuosConstruccion3: "",
        fotoResiduosConstruccion3: "",
        observacionResiduosConstruccion3: "",
        residuosConstruccion4: "",
        fotoResiduosConstruccion4: "",
        observacionResiduosConstruccion4: "",
        observacion: "",
    };

    const [formularioEnelInspeccionIntegralHSE, setFormularioEnelInspeccionIntegralHSE] = useState(() => {
        const datosGuardados = localStorage.getItem('formularioEnelInspeccionIntegralHSE');
        return datosGuardados ? JSON.parse(datosGuardados) : estadoInicialFormularioEnelInspeccionIntegralHSE;
    });

    const actualizarCampoEnelInspeccionIntegralHSE = (campo, valor) => {
        setFormularioEnelInspeccionIntegralHSE(prev => {
            const actualizado = { ...prev, [campo]: valor };
            localStorage.setItem('formularioEnelInspeccionIntegralHSE', JSON.stringify(actualizado));
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
            localStorage.setItem('formularioEnelInspeccionIntegralHSE', JSON.stringify(actualizado));
            return actualizado;
        });

        localStorage.removeItem('miembroEnProceso');
        setMostrarModal(false);
        setMiembroEnProceso({})
    };

    const [miembroEnProceso, setMiembroEnProceso] = useState(() => {
        const guardado = localStorage.getItem('miembroEnProceso');
        return guardado ? JSON.parse(guardado) : {
            cedula: "",
            nombre: "",
            cargo: "",
            arl: "",
            tarjetaDeVida: "",
            carneCliente: "",
            carneSicte: "",
            fotoDocumentos: "",
            observacionDocumentos: "",
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
        localStorage.setItem('miembroEnProceso', JSON.stringify(miembroEnProceso));
    }, [miembroEnProceso]);

    const elementos = document.querySelectorAll('.prin');

    elementos.forEach(el => {
        const sentinel = document.createElement('div');
        el.parentNode.insertBefore(sentinel, el);

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) {
                el.classList.add('is-sticky');
            } else {
                el.classList.remove('is-sticky');
            }
        }, { rootMargin: '-1px 0px 0px 0px' });

        observer.observe(sentinel);
    });

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
                        </div>

                        <div id="map2"></div>

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
                                        <div className={`entradaDatos vertical observacion' ${miembroEnProceso.arl !== 'NC' && miembroEnProceso.tarjetaDeVida !== 'NC' && miembroEnProceso.carneCliente !== 'NC' && miembroEnProceso.carneSicte !== 'NC' ? 'ocultar' : ''}`}>
                                            <Textos className='subtitulo'>Observaciones:</Textos>
                                            <div className='opciones'>
                                                <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={miembroEnProceso.observacionDocumentos} onChange={(e) => setMiembroEnProceso(prev => ({ ...prev, observacionDocumentos: e.target.value }))} rows={4} />
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
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>1. Identificacion de riesgos (Actividades previas al trabajo):</Textos>
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
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionRiesgos1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionRiesgos1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos1 !== 'NC'} />
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
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionRiesgos2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionRiesgos2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos2 !== 'NC'} />
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
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionRiesgos3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionRiesgos3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos3 !== 'NC'} />
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
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionRiesgos4} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionRiesgos4', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos4 !== 'NC'} />
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
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionRiesgos5} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionRiesgos5', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos5 !== 'NC'} />
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
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionRiesgos6} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionRiesgos6', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos6 !== 'NC'} />
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
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionRiesgos7} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionRiesgos7', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos7 !== 'NC'} />
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
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionRiesgos8} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionRiesgos8', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos8 !== 'NC'} />
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
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionRiesgos9} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionRiesgos9', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.riesgos9 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>2. Señalizacion y demarcacion:</Textos>
                                <Textos className='subtitulo sub'>Protección completa de la zona de trabajo (conos, cintas, corrales).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('senaYDemar1', 'C')} className={formularioEnelInspeccionIntegralHSE.senaYDemar1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('senaYDemar1', 'NC')} className={formularioEnelInspeccionIntegralHSE.senaYDemar1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('senaYDemar1', 'NA')} className={formularioEnelInspeccionIntegralHSE.senaYDemar1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoSenaYDemar1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionSenaYDemar1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionSenaYDemar1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.senaYDemar1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Utiliza el PMT correspondiente.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('senaYDemar2', 'C')} className={formularioEnelInspeccionIntegralHSE.senaYDemar2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('senaYDemar2', 'NC')} className={formularioEnelInspeccionIntegralHSE.senaYDemar2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('senaYDemar2', 'NA')} className={formularioEnelInspeccionIntegralHSE.senaYDemar2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.senaYDemar2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoSenaYDemar2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionSenaYDemar2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionSenaYDemar2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.senaYDemar2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se encuentran delimitadas zonas de peligro (huecos zanjas, desniveles, barreno).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('senaYDemar3', 'C')} className={formularioEnelInspeccionIntegralHSE.senaYDemar3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('senaYDemar3', 'NC')} className={formularioEnelInspeccionIntegralHSE.senaYDemar3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('senaYDemar3', 'NA')} className={formularioEnelInspeccionIntegralHSE.senaYDemar3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.senaYDemar3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoSenaYDemar3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionSenaYDemar3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionSenaYDemar3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.senaYDemar3 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>3. Las 5 Reglas de oro (Zona segura y zona de trabajo):</Textos>
                                <Textos className='subtitulo sub'>Desconexión de la fuente de alimentación y corte efectivo.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro1', 'C')} className={formularioEnelInspeccionIntegralHSE.reglasOro1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro1', 'NC')} className={formularioEnelInspeccionIntegralHSE.reglasOro1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro1', 'NA')} className={formularioEnelInspeccionIntegralHSE.reglasOro1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoReglasOro1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionReglasOro1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionReglasOro1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Bloqueo o condenación y señalización para evitar reconexiones.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro2', 'C')} className={formularioEnelInspeccionIntegralHSE.reglasOro2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro2', 'NC')} className={formularioEnelInspeccionIntegralHSE.reglasOro2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro2', 'NA')} className={formularioEnelInspeccionIntegralHSE.reglasOro2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoReglasOro2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionReglasOro2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionReglasOro2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Verificación de ausencia de tensión.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro3', 'C')} className={formularioEnelInspeccionIntegralHSE.reglasOro3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro3', 'NC')} className={formularioEnelInspeccionIntegralHSE.reglasOro3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro3', 'NA')} className={formularioEnelInspeccionIntegralHSE.reglasOro3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoReglasOro3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionReglasOro3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionReglasOro3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro3 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Cortocircuito y llevar a tierra (Puesta a tierra).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro4', 'C')} className={formularioEnelInspeccionIntegralHSE.reglasOro4 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro4', 'NC')} className={formularioEnelInspeccionIntegralHSE.reglasOro4 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro4', 'NA')} className={formularioEnelInspeccionIntegralHSE.reglasOro4 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro4 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoReglasOro4', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionReglasOro4} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionReglasOro4', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro4 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Protección y señalización de la zona de trabajo (y del electrodo de puesta a tierra).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro5', 'C')} className={formularioEnelInspeccionIntegralHSE.reglasOro5 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro5', 'NC')} className={formularioEnelInspeccionIntegralHSE.reglasOro5 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('reglasOro5', 'NA')} className={formularioEnelInspeccionIntegralHSE.reglasOro5 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro5 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoReglasOro5', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionReglasOro5} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionReglasOro5', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.reglasOro5 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>4. Trabajo en alturas:</Textos>
                                <Textos className='subtitulo sub'>Los sistemas de acceso (escaleras, andamios) disponibles en el sitio son adecuados (completos, marcados, certificados).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas1', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas1', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas1', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajoAlturas1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajoAlturas1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajoAlturas1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Los sistemas de acceso (escaleras, andamios) están instalados correctamente y se utilizan adecuadamente.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas2', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas2', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas2', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajoAlturas2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajoAlturas2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajoAlturas2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se utilizan sistemas de rescate para ascenso y descenso en escalera.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas3', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas3', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas3', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajoAlturas3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajoAlturas3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajoAlturas3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas3 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Las operaciones en altura y de bajada y subida de equipos/materiales se realizan con métodos seguros de protección contra caída de objetos (por ejemplo,cuerdas, polipastos, contenedores especiales, etc.).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas4', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas4 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas4', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas4 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas4', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas4 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas4 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajoAlturas4', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajoAlturas4} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajoAlturas4', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas4 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El andamio está correctamente armado, está nivelado y se utiliza adecuadamente.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas5', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas5 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas5', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas5 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas5', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas5 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas5 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajoAlturas5', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajoAlturas5} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajoAlturas5', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas5 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El andamio cuenta con las tarjetas de identificación VERDE, AMARILLO O ROJO según corresponda.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas6', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas6 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas6', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas6 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas6', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas6 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas6 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajoAlturas6', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajoAlturas6} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajoAlturas6', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas6 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El análisis de la resistencia de la estructura y el sistema de anclaje (en caso de poste, techo, fachada, etc.) que soportan las escaleras o sobre los que se puede pasar se ha realizado positivamente de acuerdo con los procedimientos internos.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas7', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas7 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas7', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas7 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajoAlturas7', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajoAlturas7 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas7 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajoAlturas7', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajoAlturas7} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajoAlturas7', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajoAlturas7 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>5. Espacio confinado (EC):</Textos>
                                <Textos className='subtitulo sub'>Se realiza la mediciones atmosféricas necesarias y están debidamente registradas.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('espacioConfinado1', 'C')} className={formularioEnelInspeccionIntegralHSE.espacioConfinado1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('espacioConfinado1', 'NC')} className={formularioEnelInspeccionIntegralHSE.espacioConfinado1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('espacioConfinado1', 'NA')} className={formularioEnelInspeccionIntegralHSE.espacioConfinado1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.espacioConfinado1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoEspacioConfinado1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionEspacioConfinado1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionEspacioConfinado1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.espacioConfinado1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Existe ventilación natural o se cuenta con un sistema de ventilación forzada (en caso de sitios con una  renovación del aire inadecuado).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('espacioConfinado2', 'C')} className={formularioEnelInspeccionIntegralHSE.espacioConfinado2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('espacioConfinado2', 'NC')} className={formularioEnelInspeccionIntegralHSE.espacioConfinado2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('espacioConfinado2', 'NA')} className={formularioEnelInspeccionIntegralHSE.espacioConfinado2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.espacioConfinado2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoEspacioConfinado2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionEspacioConfinado2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionEspacioConfinado2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.espacioConfinado2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>La comunicación correcta (es decir, se cuenta con un vigia al exterior del EC).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('espacioConfinado3', 'C')} className={formularioEnelInspeccionIntegralHSE.espacioConfinado3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('espacioConfinado3', 'NC')} className={formularioEnelInspeccionIntegralHSE.espacioConfinado3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('espacioConfinado3', 'NA')} className={formularioEnelInspeccionIntegralHSE.espacioConfinado3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.espacioConfinado3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoEspacioConfinado3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionEspacioConfinado3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionEspacioConfinado3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.espacioConfinado3 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>6. Condición de vehiculos (Pesado, Livianos):</Textos>
                                <Textos className='subtitulo sub'>Traslado del personal en vehículos en sitios autorizados y cumpliendo con las normas de transito local.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos1', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos1', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos1', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Tiene   documentación   actualizada   (SOAT,  LICENCIA DE TRÁNSITO, LICENCIA DE CONDUCCIÓN, TECNOMECÁNICA Y SEGUROS CONTRACTUALES).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos2', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos2', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos2', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El vehículo cuenta con equipo de carretera (Botiquín, Extintor, Tacos, Gato, Cruceta, triángulo y herramientas).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos3', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos3', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos3', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos3 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El  vehículo con el cual se moviliza la cuadrilla evaluada, se encuentra en buen estado.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos4', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos4 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos4', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos4 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos4', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos4 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos4 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos4', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos4} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos4', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos4 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El vehículo cuenta con inspección preoperacional.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos5', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos5 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos5', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos5 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos5', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos5 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos5 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos5', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos5} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos5', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos5 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El vehículo utilizado para el izaje de cargas cuenta con pruebas vigentes (Izaje- Rigidez dieléctrica).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos6', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos6 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos6', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos6 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos6', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos6 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos6 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos6', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos6} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos6', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos6 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El vehículo de izaje  utilizado  para la tarea  cuenta con aparejos en buen estado y certificados.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos7', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos7 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos7', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos7 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos7', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos7 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos7 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos7', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos7} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos7', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos7 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se realiza y documenta el plan de izaje  según la carga a levantar.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos8', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos8 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos8', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos8 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos8', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos8 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos8 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos8', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos8} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos8', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos8 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se evita el desplazamiento de cargas sobre personas o personas sobre la carga.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos9', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos9 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos9', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos9 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos9', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos9 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos9 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos9', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos9} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos9', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos9 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Los estabilizadores de la máquina se utilizan correctamente y se respetan los diagramas de  carga.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos10', 'C')} className={formularioEnelInspeccionIntegralHSE.vehiculos10 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos10', 'NC')} className={formularioEnelInspeccionIntegralHSE.vehiculos10 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('vehiculos10', 'NA')} className={formularioEnelInspeccionIntegralHSE.vehiculos10 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos10 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoVehiculos10', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionVehiculos10} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionVehiculos10', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.vehiculos10 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>7. Condiciones de trabajo:</Textos>
                                <Textos className='subtitulo sub'>Durante las etapas de la actividad se mantiene ordenado y aseado el lugar de trabajo.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo1', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajo1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo1', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajo1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo1', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajo1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajo1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajo1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajo1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajo1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajo1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Medios de comunicación existentes.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo2', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajo2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo2', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajo2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo2', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajo2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajo2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajo2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajo2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajo2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajo2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Colaboradores en condiciones físicas adecuadas. En caso de horas de trabajo prolongadas, los trabajadores toman descansos cortos a intervalos regulares.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo3', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajo3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo3', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajo3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo3', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajo3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajo3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajo3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajo3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajo3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajo3 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El área cuenta con fuentes de iluminación adecuadas para las actividades que se realizan.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo4', 'C')} className={formularioEnelInspeccionIntegralHSE.trabajo4 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo4', 'NC')} className={formularioEnelInspeccionIntegralHSE.trabajo4 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('trabajo4', 'NA')} className={formularioEnelInspeccionIntegralHSE.trabajo4 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajo4 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoTrabajo4', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionTrabajo4} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionTrabajo4', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.trabajo4 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>8. Materiales, equipos y herramientas:</Textos>
                                <Textos className='subtitulo sub'>Utiliza los materiales indicados.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('materiales1', 'C')} className={formularioEnelInspeccionIntegralHSE.materiales1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('materiales1', 'NC')} className={formularioEnelInspeccionIntegralHSE.materiales1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('materiales1', 'NA')} className={formularioEnelInspeccionIntegralHSE.materiales1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.materiales1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoMateriales1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionMateriales1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionMateriales1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.materiales1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Utiliza  los  equipos  indicados  en  buen  estado  y  normalizados  (pértigas,  probador  ausencia  de tensión,  puesta a tierra BT-MT, Pinza voltiamperimétrica).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('materiales2', 'C')} className={formularioEnelInspeccionIntegralHSE.materiales2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('materiales2', 'NC')} className={formularioEnelInspeccionIntegralHSE.materiales2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('materiales2', 'NA')} className={formularioEnelInspeccionIntegralHSE.materiales2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.materiales2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoMateriales2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionMateriales2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionMateriales2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.materiales2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Utiliza las herramientas indicadas según su diseño y están en buen estado.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('materiales3', 'C')} className={formularioEnelInspeccionIntegralHSE.materiales3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('materiales3', 'NC')} className={formularioEnelInspeccionIntegralHSE.materiales3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('materiales3', 'NA')} className={formularioEnelInspeccionIntegralHSE.materiales3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.materiales3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoMateriales3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionMateriales3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionMateriales3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.materiales3 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>9. Primeros auxilios y plan de emergencias:</Textos>
                                <Textos className='subtitulo sub'>En  el  lugar  de  trabajo  existe  extintor  adecuado  a  la  clase  de  fuego,  está presurizado, con etiquetas vigentes y legibles.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios1', 'C')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios1', 'NC')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios1', 'NA')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoPrimerosAuxilios1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionPrimerosAuxilios1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionPrimerosAuxilios1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Posee botiquín de primeros auxilios en buen estado completo y vigente.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios2', 'C')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios2', 'NC')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios2', 'NA')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoPrimerosAuxilios2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionPrimerosAuxilios2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionPrimerosAuxilios2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Los botiquines son de fácil acceso y cuentan con elementos necesarios para aplicar un primer auxilio.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios3', 'C')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios3', 'NC')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios3', 'NA')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoPrimerosAuxilios3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionPrimerosAuxilios3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionPrimerosAuxilios3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios3 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Sabe o conoce como actuar en caso de emergencias, accidentes o incidentes de trabajo o emergencia ambiental.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios4', 'C')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios4 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios4', 'NC')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios4 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios4', 'NA')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios4 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios4 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoPrimerosAuxilios4', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionPrimerosAuxilios4} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionPrimerosAuxilios4', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios4 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se pueden encontrar fácilmente áreas seguras en caso de emergencia.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios5', 'C')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios5 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios5', 'NC')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios5 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('primerosAuxilios5', 'NA')} className={formularioEnelInspeccionIntegralHSE.primerosAuxilios5 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios5 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoPrimerosAuxilios5', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionPrimerosAuxilios5} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionPrimerosAuxilios5', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.primerosAuxilios5 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>10. Aspectos biomecánicos:</Textos>
                                <Textos className='subtitulo sub'>Cumple   con   los    lineamientos     de   manejo,   manipulación    de   cargas   y  posturas   adecuadas.  (Calistenia-pausas activas).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('biomecanicos1', 'C')} className={formularioEnelInspeccionIntegralHSE.biomecanicos1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('biomecanicos1', 'NC')} className={formularioEnelInspeccionIntegralHSE.biomecanicos1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('biomecanicos1', 'NA')} className={formularioEnelInspeccionIntegralHSE.biomecanicos1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.biomecanicos1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoBiomecanicos1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionBiomecanicos1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionBiomecanicos1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.biomecanicos1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se cuenta con los elementos adecuados para el levantamiento de tapas y se realiza con mínimo 3 personas.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('biomecanicos2', 'C')} className={formularioEnelInspeccionIntegralHSE.biomecanicos2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('biomecanicos2', 'NC')} className={formularioEnelInspeccionIntegralHSE.biomecanicos2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('biomecanicos2', 'NA')} className={formularioEnelInspeccionIntegralHSE.biomecanicos2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.biomecanicos2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoBiomecanicos2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionBiomecanicos2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionBiomecanicos2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.biomecanicos2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Uso ayudas mecánicas para la manipulación manual de cargas (por ejemplo, carretillas, estibadores, polipastos, etc.)</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('biomecanicos3', 'C')} className={formularioEnelInspeccionIntegralHSE.biomecanicos3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('biomecanicos3', 'NC')} className={formularioEnelInspeccionIntegralHSE.biomecanicos3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('biomecanicos3', 'NA')} className={formularioEnelInspeccionIntegralHSE.biomecanicos3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.biomecanicos3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoBiomecanicos3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionBiomecanicos3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionBiomecanicos3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.biomecanicos3 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>11. Manejo de productos químicos y derivados:</Textos>
                                <Textos className='subtitulo sub'>Se cuenta con las Fichas de Datos de Seguridad de los productos químicos.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos1', 'C')} className={formularioEnelInspeccionIntegralHSE.quimicos1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos1', 'NC')} className={formularioEnelInspeccionIntegralHSE.quimicos1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos1', 'NA')} className={formularioEnelInspeccionIntegralHSE.quimicos1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoQuimicos1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionQuimicos1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionQuimicos1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se cuenta con el kit completo para manejo de derrames de productos químicos.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos2', 'C')} className={formularioEnelInspeccionIntegralHSE.quimicos2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos2', 'NC')} className={formularioEnelInspeccionIntegralHSE.quimicos2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos2', 'NA')} className={formularioEnelInspeccionIntegralHSE.quimicos2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoQuimicos2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionQuimicos2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionQuimicos2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Cuenta con rotulación (SGA) para los productos químicos.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos3', 'C')} className={formularioEnelInspeccionIntegralHSE.quimicos3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos3', 'NC')} className={formularioEnelInspeccionIntegralHSE.quimicos3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos3', 'NA')} className={formularioEnelInspeccionIntegralHSE.quimicos3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoQuimicos3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionQuimicos3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionQuimicos3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos3 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Vehículos, maquinaria y equipos sin fuga de aceites, combustibles u otros fluidos hidráulicos.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos4', 'C')} className={formularioEnelInspeccionIntegralHSE.quimicos4 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos4', 'NC')} className={formularioEnelInspeccionIntegralHSE.quimicos4 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos4', 'NA')} className={formularioEnelInspeccionIntegralHSE.quimicos4 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos4 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoQuimicos4', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionQuimicos4} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionQuimicos4', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos4 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se recolectan, almacenan, rotulan y se transportan de forma segura los residuos peligrosos (envases químicos, residuos aceitosos, entre otros).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos5', 'C')} className={formularioEnelInspeccionIntegralHSE.quimicos5 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos5', 'NC')} className={formularioEnelInspeccionIntegralHSE.quimicos5 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('quimicos5', 'NA')} className={formularioEnelInspeccionIntegralHSE.quimicos5 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos5 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoQuimicos5', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionQuimicos5} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionQuimicos5', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.quimicos5 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>12. Manejo de residuos no peligrosos:</Textos>
                                <Textos className='subtitulo sub'>Separación o clasificación adecuada de los residuos, según código de colores establecido.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosNoPeligrosos1', 'C')} className={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosNoPeligrosos1', 'NC')} className={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosNoPeligrosos1', 'NA')} className={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoResiduosNoPeligrosos1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionResiduosNoPeligrosos1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionResiduosNoPeligrosos1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se encuentra el vehículo en condiciones optimas de orden y aseo (limpio y ordenado).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosNoPeligrosos2', 'C')} className={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosNoPeligrosos2', 'NC')} className={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosNoPeligrosos2', 'NA')} className={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoResiduosNoPeligrosos2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionResiduosNoPeligrosos2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionResiduosNoPeligrosos2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se garantiza la limpieza de la zona de trabajo luego de la ejecución de la labor y la disposición final adecuada de los residuos.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosNoPeligrosos3', 'C')} className={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosNoPeligrosos3', 'NC')} className={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosNoPeligrosos3', 'NA')} className={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoResiduosNoPeligrosos3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionResiduosNoPeligrosos3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionResiduosNoPeligrosos3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosNoPeligrosos3 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo'>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo prin'>13. Residuos de construcción y demolición - cobertura vegetal:</Textos>
                                <Textos className='subtitulo sub'>Las actividades se llevan a cabo de conformidad con las autorizaciones obtenidas según la legislación local y en relación con los límites/requisitos ambientales específicos del sitio/obra (por ejemplo, PIN de RCD, licencias de intervención, emisiones, descargas de agua, ruido, etc.).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion1', 'C')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion1 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion1', 'NC')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion1 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion1', 'NA')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion1 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosConstruccion1 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoResiduosConstruccion1', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionResiduosConstruccion1} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionResiduosConstruccion1', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosConstruccion1 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>El almacenamiento temporal es adecuado, ubicado dentro de la zona de trabajo, no se obstruyen los senderos peatonales y/o vías.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion2', 'C')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion2 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion2', 'NC')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion2 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion2', 'NA')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion2 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosConstruccion2 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoResiduosConstruccion2', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionResiduosConstruccion2} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionResiduosConstruccion2', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosConstruccion2 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Se  protegen las zonas verdes, sumideros y se controla el material particulado.</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion3', 'C')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion3 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion3', 'NC')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion3 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion3', 'NA')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion3 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosConstruccion3 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoResiduosConstruccion3', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionResiduosConstruccion3} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionResiduosConstruccion3', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosConstruccion3 !== 'NC'} />
                                </div>

                                <Textos className='subtitulo sub'>Las actividades se realizan de una forma que evite el riesgo de colapso o fallo de las estructuras/terrenos (por ejemplo, entibado).</Textos>
                                <div className='opciones'>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion4', 'C')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion4 === 'C' ? 'formulario selected' : ''}>C</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion4', 'NC')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion4 === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                    <Botones onClick={() => actualizarCampoEnelInspeccionIntegralHSE('residuosConstruccion4', 'NA')} className={formularioEnelInspeccionIntegralHSE.residuosConstruccion4 === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                </div>
                                <div className='opciones'>
                                    <Entradas
                                        type="file"
                                        className="form-control image"
                                        accept="image/*"
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosConstruccion4 !== 'NC'}
                                        onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('fotoResiduosConstruccion4', e.target.files[0])}
                                    />
                                </div>
                                <div className='opciones'>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacionResiduosConstruccion4} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacionResiduosConstruccion4', e.target.value)} rows={4}
                                        disabled={formularioEnelInspeccionIntegralHSE.residuosConstruccion4 !== 'NC'} />
                                </div>
                            </div>
                        </div>

                        <div className='campo observacion'>
                            <i className="fas fa-comment"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Observaciones:</Textos>
                                <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacion} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacion', e.target.value)} rows={4} />
                            </div>
                        </div>

                        <div className='enviar'>
                            <Botones className="eliminar" onClick={() => {
                                localStorage.removeItem('formularioEnelInspeccionIntegralHSE');
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