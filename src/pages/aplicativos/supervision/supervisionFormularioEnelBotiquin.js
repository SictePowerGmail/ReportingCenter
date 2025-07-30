import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './supervisionFormularioEnelBotiquin.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import axios from 'axios';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import { FaArrowLeft } from 'react-icons/fa'
import Botones from '../../../components/botones/botones';
import Selectores from '../../../components/selectores/selectores';
import Textos from '../../../components/textos/textos';
import Entradas from '../../../components/entradas/entradas';
import AreaTextos from '../../../components/areaTextos/areaTextos';
import Tablas from '../../../components/tablas/tablas';
import Imagenes from '../../../components/imagenes/imagenes';
import { OpcionesFotoObservaciones } from './OpcionesFotoObservaciones';
import Cookies from 'js-cookie';

const SupervisionFormularioEnelBotiquin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [datosPlanta, setDatosPlanta] = useState('');
    const [datosCiudades, setDatosCiudades] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [fecha, setFecha] = useState('');
    const nombreUsuario = Cookies.get('userNombre');
    const cedulaUsuario = Cookies.get('userCedula');
    const [ubicacion, setUbicacion] = useState({ latitude: null, longitude: null });
    const mapRef = useRef(null);
    const locationRef = useRef(null);
    const [enviando, setEnviando] = useState(false);
    const [imagenAmpliada, setImagenAmpliada] = useState(null);
    const [accionModalTabla, setAccionModalTabla] = useState('crear');
    const location = useLocation();
    const { modo } = location.state || {};

    const inicializarMapa = (latitude, longitude) => {
        if (mapRef.current === null) {
            mapRef.current = L.map('map2').setView([latitude, longitude], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);

            const awesomeMarker = L.AwesomeMarkers.icon({
                icon: 'car',
                prefix: 'fa',
                markerColor: 'blue',
                iconColor: 'white'
            });

            L.marker([latitude, longitude], { icon: awesomeMarker }).addTo(mapRef.current).openPopup();

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
    };


    const cargarGeolocalizacion = () => {
        const dataLocal = localStorage.getItem('formularioEnelBotiquin');
        let coordenadasGuardadas = null;

        if (dataLocal) {
            try {
                const data = JSON.parse(dataLocal);
                if (data.ubicacion && typeof data.ubicacion.latitude === 'number' && typeof data.ubicacion.longitude === 'number') {
                    coordenadasGuardadas = {
                        latitude: data.ubicacion.latitude,
                        longitude: data.ubicacion.longitude
                    };
                }
            } catch (error) {
                console.warn("Error al parsear localStorage:", error);
            }
        }

        if (coordenadasGuardadas) {
            inicializarMapa(coordenadasGuardadas.latitude, coordenadasGuardadas.longitude);
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setUbicacion({ latitude, longitude });
                        inicializarMapa(latitude, longitude);
                    },
                    (error) => {
                        console.log("Error al obtener geolocalización:", error);
                    }
                );
            } else {
                toast.error('La geolocalización no está soportada por este navegador.');
            }
        }
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

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`;
    };

    function eliminarDataEnFotos(obj) {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;

            const valor = obj[key];
            if (key.startsWith('foto') && Array.isArray(valor)) {
                for (let i = 0; i < valor.length; i++) {
                    if (valor[i] && typeof valor[i] === 'object' && 'data' in valor[i]) {
                        delete valor[i].data;
                    }
                }
            }

            else if (typeof valor === 'object' && valor !== null) {
                eliminarDataEnFotos(valor);
            }
        }
        return obj;
    }

    function serializarCamposComplejos(data) {
        const resultado = {};

        for (const key in data) {
            const valor = data[key];

            if (valor && typeof valor === 'object') {
                resultado[key] = JSON.stringify(valor);
            } else {
                resultado[key] = valor;
            }
        }

        return resultado;
    }

    function base64ToFile(base64String, filename) {
        const arr = base64String.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    }

    const hayNCValido = (obj) => {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;

            const valor = obj[key];

            if (typeof valor === 'object' && valor !== null) {
                if (hayNCValido(valor)) return true;
            }

            else if (
                typeof valor === 'string' &&
                valor === 'NC' &&
                !key.toLowerCase().startsWith('foto') &&
                !key.toLowerCase().startsWith('observacion')
            ) {
                return true;
            }
        }

        return false;
    };

    const subirTodasLasFotos = async (obj, fecha, ruta = []) => {
        const formattedDate = formatDate(fecha);

        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;

            const valor = obj[key];
            const path = [...ruta, key];

            if (Array.isArray(valor) && key.startsWith("foto")) {
                for (let i = 0; i < valor.length; i++) {
                    const imagen = valor[i];
                    if (imagen && imagen.data && imagen.name) {
                        const nombreFinal = `${formattedDate}_${imagen.name}`;
                        const file = base64ToFile(imagen.data, nombreFinal);

                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('filename', nombreFinal);

                        try {
                            await axios.post(
                                `${process.env.REACT_APP_API_URL}/supervision/cargarImagen`,
                                formData,
                                { headers: { 'Content-Type': 'multipart/form-data' } }
                            );

                            imagen.name = nombreFinal;
                            valor[i] = imagen;

                        } catch (error) {
                            console.error(`Error subiendo ${key}[${i}]`, error);
                        }
                    }
                }

                continue;
            }

            if (typeof valor === 'object' && valor !== null) {
                await subirTodasLasFotos(valor, fecha, path);
            }
        }

        const limpiarClavesDuplicadas = (obj) => {
            for (const key in obj) {
                const valor = obj[key];

                if (typeof valor === 'object' && valor !== null) {
                    if (key in valor) {
                        console.warn(`🧹 Eliminando clave duplicada: ${key}.${key}`);
                        delete valor[key];
                    }

                    limpiarClavesDuplicadas(valor);
                }
            }
        };

        limpiarClavesDuplicadas(obj);
        return obj;
    };

    const enviarFormularioEnelBotiquin = async (event) => {

        event.preventDefault();
        const resultadoValidador = validarFormularioEnelBotiquin(formularioEnelBotiquin);
        if (resultadoValidador === false) { return }
        if (!ubicacion) { toast.error('Por favor dar permisos de ubicacion.'); return false }

        setEnviando(true)

        try {
            const fechaInicial = fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const fechaFinal = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const formularioEnelBotiquinModificado = await subirTodasLasFotos(formularioEnelBotiquin, fecha);

            const ncvalido = hayNCValido(formularioEnelBotiquinModificado) === true ? "No Conforme" : "Conforme"

            const { id, ...formularioSinId } = formularioEnelBotiquinModificado;
            const formularioConTiempos = {
                ...formularioSinId,
                fechaInicial,
                fechaFinal,
                ubicacion,
                inspeccion: ncvalido,
                formulario: "Enel Inspeccion Botiquin",
                cedulaQuienInspecciona: cedulaUsuario,
                nombreQuienInspecciona: nombreUsuario,
            };

            const formularioNuevoSinFotos = eliminarDataEnFotos(formularioConTiempos)
            const formularioNuevoSerializado = serializarCamposComplejos(formularioNuevoSinFotos)
            const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/supervision/crearRegistrosEnelInspeccionBotiquin`, formularioNuevoSerializado);

            if (response2.status >= 200 && response2.status < 300) {
                setEnviando(false)
                console.log('Datos enviados exitosamente');
                localStorage.removeItem('formularioEnelBotiquin');
                setFormularioEnelBotiquin(estadoInicialFormularioEnelBotiquin);
                navigate('/SupervisionPrincipal', { state: { estadoNotificacion: true } });
            } else {
                toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
                setEnviando(false)
            }

        } catch (error) {
            console.error('Error al subir el archivo o enviar los datos:', error);
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
            setEnviando(false)
        }
    };

    const estadoInicialFormularioEnelBotiquin = {
        tipoInspeccion: "",
        clasificacion: "",
        cedulaQuienInspecciona: "",
        nombreQuienInspecciona: "",
        nombreProyecto: "",
        cedulaResponsableBotiquin: "",
        nombreResponsableBotiquin: "",
        proceso: "",
        zona: "",
        placa: "",
        sede: "",
        bioseguridad: {
            bioseguridad1: "",
            fechaBioseguridad1: "",
            cantidadEstimadaBioseguridad1: "",
            cantidadBioseguridad1: "",
            fotoBioseguridad1: "",
            observacionBioseguridad1: "",
            bioseguridad2: "",
            fechaBioseguridad2: "",
            cantidadEstimadaBioseguridad2: "",
            cantidadBioseguridad2: "",
            fotoBioseguridad2: "",
            observacionBioseguridad2: "",
            bioseguridad3: "",
            fechaBioseguridad3: "",
            cantidadEstimadaBioseguridad3: "",
            cantidadBioseguridad3: "",
            fotoBioseguridad3: "",
            observacionBioseguridad3: "",
            bioseguridad4: "",
            fechaBioseguridad4: "",
            cantidadEstimadaBioseguridad4: "",
            cantidadBioseguridad4: "",
            fotoBioseguridad4: "",
            observacionBioseguridad4: "",
            bioseguridad5: "",
            fechaBioseguridad5: "",
            cantidadEstimadaBioseguridad5: "",
            cantidadBioseguridad5: "",
            fotoBioseguridad5: "",
            observacionBioseguridad5: "",
        },
        inmovilizacion: {
            inmovilizacion1: "",
            fechaInmovilizacion1: "",
            cantidadEstimadaInmovilizacion1: "",
            cantidadInmovilizacion1: "",
            fotoInmovilizacion1: "",
            observacionInmovilizacion1: "",
            inmovilizacion2: "",
            fechaInmovilizacion2: "",
            cantidadEstimadaInmovilizacion2: "",
            cantidadInmovilizacion2: "",
            fotoInmovilizacion2: "",
            observacionInmovilizacion2: "",
            inmovilizacion3: "",
            fechaInmovilizacion3: "",
            cantidadEstimadaInmovilizacion3: "",
            cantidadInmovilizacion3: "",
            fotoInmovilizacion3: "",
            observacionInmovilizacion3: "",
            inmovilizacion4: "",
            fechaInmovilizacion4: "",
            cantidadEstimadaInmovilizacion4: "",
            cantidadInmovilizacion4: "",
            fotoInmovilizacion4: "",
            observacionInmovilizacion4: "",
            inmovilizacion5: "",
            fechaInmovilizacion5: "",
            cantidadEstimadaInmovilizacion5: "",
            cantidadInmovilizacion5: "",
            fotoInmovilizacion5: "",
            observacionInmovilizacion5: "",
            inmovilizacion6: "",
            fechaInmovilizacion6: "",
            cantidadEstimadaInmovilizacion6: "",
            cantidadInmovilizacion6: "",
            fotoInmovilizacion6: "",
            observacionInmovilizacion6: "",
            inmovilizacion7: "",
            fechaInmovilizacion7: "",
            cantidadEstimadaInmovilizacion7: "",
            cantidadInmovilizacion7: "",
            fotoInmovilizacion7: "",
            observacionInmovilizacion7: "",
            inmovilizacion8: "",
            fechaInmovilizacion8: "",
            cantidadEstimadaInmovilizacion8: "",
            cantidadInmovilizacion8: "",
            fotoInmovilizacion8: "",
            observacionInmovilizacion8: "",
            inmovilizacion9: "",
            fechaInmovilizacion9: "",
            cantidadEstimadaInmovilizacion9: "",
            cantidadInmovilizacion9: "",
            fotoInmovilizacion9: "",
            observacionInmovilizacion9: "",
            inmovilizacion10: "",
            fechaInmovilizacion10: "",
            cantidadEstimadaInmovilizacion10: "",
            cantidadInmovilizacion10: "",
            fotoInmovilizacion10: "",
            observacionInmovilizacion10: "",
            inmovilizacion11: "",
            fechaInmovilizacion11: "",
            cantidadEstimadaInmovilizacion11: "",
            cantidadInmovilizacion11: "",
            fotoInmovilizacion11: "",
            observacionInmovilizacion11: "",
            inmovilizacion12: "",
            fechaInmovilizacion12: "",
            cantidadEstimadaInmovilizacion12: "",
            cantidadInmovilizacion12: "",
            fotoInmovilizacion12: "",
            observacionInmovilizacion12: "",
            inmovilizacion13: "",
            fechaInmovilizacion13: "",
            cantidadEstimadaInmovilizacion13: "",
            cantidadInmovilizacion13: "",
            fotoInmovilizacion13: "",
            observacionInmovilizacion13: "",
            inmovilizacion14: "",
            fechaInmovilizacion14: "",
            cantidadEstimadaInmovilizacion14: "",
            cantidadInmovilizacion14: "",
            fotoInmovilizacion14: "",
            observacionInmovilizacion14: "",
            inmovilizacion15: "",
            fechaInmovilizacion15: "",
            cantidadEstimadaInmovilizacion15: "",
            cantidadInmovilizacion15: "",
            fotoInmovilizacion15: "",
            observacionInmovilizacion15: "",
            inmovilizacion16: "",
            fechaInmovilizacion16: "",
            cantidadEstimadaInmovilizacion16: "",
            cantidadInmovilizacion16: "",
            fotoInmovilizacion16: "",
            observacionInmovilizacion16: "",
        },
        antisepticos: {
            antisepticos1: "",
            fechaAntisepticos1: "",
            cantidadEstimadaAntisepticos1: "",
            cantidadAntisepticos1: "",
            fotoAntisepticos1: "",
            observacionAntisepticos1: "",
            antisepticos2: "",
            fechaAntisepticos2: "",
            cantidadEstimadaAntisepticos2: "",
            cantidadAntisepticos2: "",
            fotoAntisepticos2: "",
            observacionAntisepticos2: "",
        },
        instrumental: {
            instrumental1: "",
            fechaInstrumental1: "",
            cantidadEstimadaInstrumental1: "",
            cantidadInstrumental1: "",
            fotoInstrumental1: "",
            observacionInstrumental1: "",
            instrumental2: "",
            fechaInstrumental2: "",
            cantidadEstimadaInstrumental2: "",
            cantidadInstrumental2: "",
            fotoInstrumental2: "",
            observacionInstrumental2: "",
            instrumental3: "",
            fechaInstrumental3: "",
            cantidadEstimadaInstrumental3: "",
            cantidadInstrumental3: "",
            fotoInstrumental3: "",
            observacionInstrumental3: "",
            instrumental4: "",
            fechaInstrumental4: "",
            cantidadEstimadaInstrumental4: "",
            cantidadInstrumental4: "",
            fotoInstrumental4: "",
            observacionInstrumental4: "",
            instrumental5: "",
            fechaInstrumental5: "",
            cantidadEstimadaInstrumental5: "",
            cantidadInstrumental5: "",
            fotoInstrumental5: "",
            observacionInstrumental5: "",
            instrumental6: "",
            fechaInstrumental6: "",
            cantidadEstimadaInstrumental6: "",
            cantidadInstrumental6: "",
            fotoInstrumental6: "",
            observacionInstrumental6: "",
            instrumental7: "",
            fechaInstrumental7: "",
            cantidadEstimadaInstrumental7: "",
            cantidadInstrumental7: "",
            fotoInstrumental7: "",
            observacionInstrumental7: "",
            instrumental8: "",
            fechaInstrumental8: "",
            cantidadEstimadaInstrumental8: "",
            cantidadInstrumental8: "",
            fotoInstrumental8: "",
            observacionInstrumental8: "",
            instrumental9: "",
            fechaInstrumental9: "",
            cantidadEstimadaInstrumental9: "",
            cantidadInstrumental9: "",
            fotoInstrumental9: "",
            observacionInstrumental9: "",
            instrumental10: "",
            fechaInstrumental10: "",
            cantidadEstimadaInstrumental10: "",
            cantidadInstrumental10: "",
            fotoInstrumental10: "",
            observacionInstrumental10: "",
            instrumental11: "",
            fechaInstrumental11: "",
            cantidadEstimadaInstrumental11: "",
            cantidadInstrumental11: "",
            fotoInstrumental11: "",
            observacionInstrumental11: "",
        },
        observacion: "",
        fotoObservacion: "",
        inspeccion: "",
    };

    const [formularioEnelBotiquin, setFormularioEnelBotiquin] = useState(() => {
        const datosGuardados = localStorage.getItem('formularioEnelBotiquin');
        return datosGuardados ? JSON.parse(datosGuardados) : estadoInicialFormularioEnelBotiquin;
    });

    const actualizarCampoEnelBotiquin = async (campo, valor) => {
        const [nivel1, nivel2] = campo.split('.');

        if (Array.isArray(valor) && valor.length === 0) {
            setFormularioEnelBotiquin((prev) => {
                const actualizado = { ...prev };
                actualizado[nivel1][nivel2] = "";
                localStorage.setItem(
                    "formularioEnelBotiquin",
                    JSON.stringify(actualizado)
                );
                return actualizado;
            });
            return;
        }

        if (['C', 'NC', 'NA'].includes(valor) && nivel2) {
            setFormularioEnelBotiquin(prev => {
                const actualizado = { ...prev };
                if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }

                if (valor !== 'NC') {
                    const base = nivel2.charAt(0).toUpperCase() + nivel2.slice(1);
                    const fotoKey = `foto${base}`;
                    const observacionKey = `observacion${base}`;

                    if (fotoKey in actualizado[nivel1]) actualizado[nivel1][fotoKey] = '';
                    if (observacionKey in actualizado[nivel1]) actualizado[nivel1][observacionKey] = '';
                }

                localStorage.setItem('formularioEnelBotiquin', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (typeof valor === 'string') {
            setFormularioEnelBotiquin(prev => {
                const actualizado = { ...prev };
                if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }
                localStorage.setItem('formularioEnelBotiquin', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (valor[0].name && valor[0].data) {
            setFormularioEnelBotiquin((prev) => {
                const actualizado = { ...prev };
                if (nivel2 !== undefined) {
                    actualizado[nivel1][nivel2] = valor;
                } else {
                    actualizado[nivel1] = valor;
                }
                localStorage.setItem(
                    "formularioEnelBotiquin",
                    JSON.stringify(actualizado)
                );
                return actualizado;
            });
            return;
        }
    };

    useEffect(() => {
        setFecha(new Date());

        if (nombreUsuario === undefined) {
            window.location.href = '/ReportingCenter#/Login?tipo=supervision';
        }

        cargarDatosCiudades();
        cargarDatosPlanta();
    }, []);

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

    const preguntas = [
        {
            key: "bioseguridad1",
            texto: "Guantes desechables ( látex o nitrilo)",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/guantes_desechables_drddt1.jpg',
            fechaVencimientoKey: "fechaBioseguridad1",
            cantidadEstimadaKey: "cantidadEstimadaBioseguridad1",
            cantidadExistenteKey: "cantidadBioseguridad1",
            fotoKey: "fotoBioseguridad1",
            observacionKey: "observacionBioseguridad1",
            activarinput: false,
        },
        {
            key: "bioseguridad2",
            texto: "Tapabocas",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/tapabocas_l7cvun.png',
            fechaVencimientoKey: "fechaBioseguridad2",
            cantidadEstimadaKey: "cantidadEstimadaBioseguridad2",
            cantidadExistenteKey: "cantidadBioseguridad2",
            fotoKey: "fotoBioseguridad2",
            observacionKey: "observacionBioseguridad2",
            activarinput: false,
        },
        {
            key: "bioseguridad3",
            texto: "Monogafas",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/monogafas_bn2ewm.jpg',
            fechaVencimientoKey: "fechaBioseguridad3",
            cantidadEstimadaKey: "cantidadEstimadaBioseguridad3",
            cantidadExistenteKey: "cantidadBioseguridad3",
            fotoKey: "fotoBioseguridad3",
            observacionKey: "observacionBioseguridad3",
            activarinput: false,
        },
        {
            key: "bioseguridad4",
            texto: "Mascarilla barrera para RCP",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/mascarilla_barrera_rcp_n8lx9l.jpg',
            fechaVencimientoKey: "fechaBioseguridad4",
            cantidadEstimadaKey: "cantidadEstimadaBioseguridad4",
            cantidadExistenteKey: "cantidadBioseguridad4",
            fotoKey: "fotoBioseguridad4",
            observacionKey: "observacionBioseguridad4",
            activarinput: false,
        },
        {
            key: "bioseguridad5",
            texto: "Bolsas para Desperdicios ( rojas )",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/bolsas_para_desperdicios_b64ss7.jpg',
            fechaVencimientoKey: "fechaBioseguridad5",
            cantidadEstimadaKey: "cantidadEstimadaBioseguridad5",
            cantidadExistenteKey: "cantidadBioseguridad5",
            fotoKey: "fotoBioseguridad5",
            observacionKey: "observacionBioseguridad5",
            activarinput: false,
        },

        {
            key: "inmovilizacion1",
            texto: "Aplicadores",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/aplicadores_xl7xhk.jpg',
            fechaVencimientoKey: "fechaInmovilizacion1",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion1",
            cantidadExistenteKey: "cantidadInmovilizacion1",
            fotoKey: "fotoInmovilizacion1",
            observacionKey: "observacionInmovilizacion1",
            activarinput: false,
        },
        {
            key: "inmovilizacion2",
            texto: "Apósito estéril",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/aposito_esteril_rziwof.png',
            fechaVencimientoKey: "fechaInmovilizacion2",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion2",
            cantidadExistenteKey: "cantidadInmovilizacion2",
            fotoKey: "fotoInmovilizacion2",
            observacionKey: "observacionInmovilizacion2",
            activarinput: false,
        },
        {
            key: "inmovilizacion3",
            texto: "Compresas",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/compresas_vzy16p.webp',
            fechaVencimientoKey: "fechaInmovilizacion3",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion3",
            cantidadExistenteKey: "cantidadInmovilizacion3",
            fotoKey: "fotoInmovilizacion3",
            observacionKey: "observacionInmovilizacion3",
            activarinput: false,
        },
        {
            key: "inmovilizacion4",
            texto: "Bajalenguas",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/bajalenguas_koeizy.png',
            fechaVencimientoKey: "fechaInmovilizacion4",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion4",
            cantidadExistenteKey: "cantidadInmovilizacion4",
            fotoKey: "fotoInmovilizacion4",
            observacionKey: "observacionInmovilizacion4",
            activarinput: false,
        },
        {
            key: "inmovilizacion5",
            texto: "Curitas",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/curitas_vvbpwy.jpg',
            fechaVencimientoKey: "fechaInmovilizacion5",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion5",
            cantidadExistenteKey: "cantidadInmovilizacion5",
            fotoKey: "fotoInmovilizacion5",
            observacionKey: "observacionInmovilizacion5",
            activarinput: false,
        },
        {
            key: "inmovilizacion6",
            texto: "Inmovilizador Cervical Graduable",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/inmovilizador_cervical_lqxqsp.jpg',
            fechaVencimientoKey: "fechaInmovilizacion6",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion6",
            cantidadExistenteKey: "cantidadInmovilizacion6",
            fotoKey: "fotoInmovilizacion6",
            observacionKey: "observacionInmovilizacion6",
            activarinput: false,
        },
        {
            key: "inmovilizacion7",
            texto: "Esparadrapo",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/esparadrapo_mwjjnb.webp',
            fechaVencimientoKey: "fechaInmovilizacion7",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion7",
            cantidadExistenteKey: "cantidadInmovilizacion7",
            fotoKey: "fotoInmovilizacion7",
            observacionKey: "observacionInmovilizacion7",
            activarinput: false,
        },
        {
            key: "inmovilizacion8",
            texto: "Gasas Estériles de 7,5x 7,5",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/gasas_esteriles_czvd2y.jpg',
            fechaVencimientoKey: "fechaInmovilizacion8",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion8",
            cantidadExistenteKey: "cantidadInmovilizacion8",
            fotoKey: "fotoInmovilizacion8",
            observacionKey: "observacionInmovilizacion8",
            activarinput: false,
        },
        {
            key: "inmovilizacion9",
            texto: "Kit de inmovilizadores de extremidades superiores e inferiores",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/kit_de_inmovilizadores_tzwep4.webp',
            fechaVencimientoKey: "fechaInmovilizacion9",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion9",
            cantidadExistenteKey: "cantidadInmovilizacion9",
            fotoKey: "fotoInmovilizacion9",
            observacionKey: "observacionInmovilizacion9",
            activarinput: false,
        },
        {
            key: "inmovilizacion10",
            texto: "Cinta adhesiva(microporo)",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/cinta_adhesiva_ron9xo.webp',
            fechaVencimientoKey: "fechaInmovilizacion10",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion10",
            cantidadExistenteKey: "cantidadInmovilizacion10",
            fotoKey: "fotoInmovilizacion10",
            observacionKey: "observacionInmovilizacion10",
            activarinput: false,
        },
        {
            key: "inmovilizacion11",
            texto: "Agua estéril , suero fisiológico o solución salina normal ( 250 ML)",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/agua_esteril_m5mw3j.webp',
            fechaVencimientoKey: "fechaInmovilizacion11",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion11",
            cantidadExistenteKey: "cantidadInmovilizacion11",
            fotoKey: "fotoInmovilizacion11",
            observacionKey: "observacionInmovilizacion11",
            activarinput: false,
        },
        {
            key: "inmovilizacion12",
            texto: "Vendaje triangular ",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/vendaje_triangular_egikms.webp',
            fechaVencimientoKey: "fechaInmovilizacion12",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion12",
            cantidadExistenteKey: "cantidadInmovilizacion12",
            fotoKey: "fotoInmovilizacion12",
            observacionKey: "observacionInmovilizacion12",
            activarinput: false,
        },
        {
            key: "inmovilizacion13",
            texto: "Vendaje Elástico 2x5",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/vendaje_elastico_2x5_bckkgn.webp',
            fechaVencimientoKey: "fechaInmovilizacion13",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion13",
            cantidadExistenteKey: "cantidadInmovilizacion13",
            fotoKey: "fotoInmovilizacion13",
            observacionKey: "observacionInmovilizacion13",
            activarinput: false,
        },
        {
            key: "inmovilizacion14",
            texto: "Vendaje Elástico 3x5",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/vendaje_elastico_3x5_n1zi7p.webp',
            fechaVencimientoKey: "fechaInmovilizacion14",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion14",
            cantidadExistenteKey: "cantidadInmovilizacion14",
            fotoKey: "fotoInmovilizacion14",
            observacionKey: "observacionInmovilizacion14",
            activarinput: false,
        },
        {
            key: "inmovilizacion15",
            texto: "Vendaje Elástico 5x5",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/vendaje_elastico_5x5_lqd7ph.webp',
            fechaVencimientoKey: "fechaInmovilizacion15",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion15",
            cantidadExistenteKey: "cantidadInmovilizacion15",
            fotoKey: "fotoInmovilizacion15",
            observacionKey: "observacionInmovilizacion15",
            activarinput: false,
        },
        {
            key: "inmovilizacion16",
            texto: "Oclusores Oculares",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/oclusores_oculares_sf54xj.jpg',
            fechaVencimientoKey: "fechaInmovilizacion16",
            cantidadEstimadaKey: "cantidadEstimadaInmovilizacion16",
            cantidadExistenteKey: "cantidadInmovilizacion16",
            fotoKey: "fotoInmovilizacion16",
            observacionKey: "observacionInmovilizacion16",
            activarinput: false,
        },

        {
            key: "antisepticos1",
            texto: "Jabón Antiséptico (Clorhexidina)",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/jabon_antiseptico_p3xvfj.jpg',
            fechaVencimientoKey: "fechaAntisepticos1",
            cantidadEstimadaKey: "cantidadEstimadaAntisepticos1",
            cantidadExistenteKey: "cantidadAntisepticos1",
            fotoKey: "fotoAntisepticos1",
            observacionKey: "observacionAntisepticos1",
            activarinput: false,
        },
        {
            key: "antisepticos2",
            texto: "Solución Antiséptica (Clorhexidina)",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/solucion_antiseptico_ekmttm.jpg',
            fechaVencimientoKey: "fechaAntisepticos2",
            cantidadEstimadaKey: "cantidadEstimadaAntisepticos2",
            cantidadExistenteKey: "cantidadAntisepticos2",
            fotoKey: "fotoAntisepticos2",
            observacionKey: "observacionAntisepticos2",
            activarinput: false,
        },

        {
            key: "instrumental1",
            texto: "Termómetro",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/termometro_hycjvl.png',
            fechaVencimientoKey: "fechaInstrumental1",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental1",
            cantidadExistenteKey: "cantidadInstrumental1",
            fotoKey: "fotoInstrumental1",
            observacionKey: "observacionInstrumental1",
            activarinput: false,
        },
        {
            key: "instrumental2",
            texto: "Tijeras para trauma",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/tijeras_ugejh2.jpg',
            fechaVencimientoKey: "fechaInstrumental2",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental2",
            cantidadExistenteKey: "cantidadInstrumental2",
            fotoKey: "fotoInstrumental2",
            observacionKey: "observacionInstrumental2",
            activarinput: false,
        },
        {
            key: "instrumental3",
            texto: "Bolsa cierre hermetico",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/bolsa_hermetica_yskglv.webp',
            fechaVencimientoKey: "fechaInstrumental3",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental3",
            cantidadExistenteKey: "cantidadInstrumental3",
            fotoKey: "fotoInstrumental3",
            observacionKey: "observacionInstrumental3",
            activarinput: false,
        },
        {
            key: "instrumental4",
            texto: "Linterna pequeña con pilas",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/linterna_peque%C3%B1a_con_pilas_vxdo43.webp',
            fechaVencimientoKey: "fechaInstrumental4",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental4",
            cantidadExistenteKey: "cantidadInstrumental4",
            fotoKey: "fotoInstrumental4",
            observacionKey: "observacionInstrumental4",
            activarinput: false,
        },
        {
            key: "instrumental5",
            texto: "Pilas de repuesto",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/pilas_de_repuesto_ssfveh.jpg',
            fechaVencimientoKey: "fechaInstrumental5",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental5",
            cantidadExistenteKey: "cantidadInstrumental5",
            fotoKey: "fotoInstrumental5",
            observacionKey: "observacionInstrumental5",
            activarinput: false,
        },
        {
            key: "instrumental6",
            texto: "Manual de Primeros auxilios",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/manual_de_primeros_auxilios_j9vlgm.jpg',
            fechaVencimientoKey: "fechaInstrumental6",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental6",
            cantidadExistenteKey: "cantidadInstrumental6",
            fotoKey: "fotoInstrumental6",
            observacionKey: "observacionInstrumental6",
            activarinput: false,
        },
        {
            key: "instrumental7",
            texto: "Cuadernillo para Notas",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/cuadernillo_para_notas_tsxa6f.jpg',
            fechaVencimientoKey: "fechaInstrumental7",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental7",
            cantidadExistenteKey: "cantidadInstrumental7",
            fotoKey: "fotoInstrumental7",
            observacionKey: "observacionInstrumental7",
            activarinput: false,
        },
        {
            key: "instrumental8",
            texto: "Esfero",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/espero_xyxldk.jpg',
            fechaVencimientoKey: "fechaInstrumental8",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental8",
            cantidadExistenteKey: "cantidadInstrumental8",
            fotoKey: "fotoInstrumental8",
            observacionKey: "observacionInstrumental8",
            activarinput: false,
        },
        {
            key: "instrumental9",
            texto: "Pito",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/pito_a1ejls.jpg',
            fechaVencimientoKey: "fechaInstrumental9",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental9",
            cantidadExistenteKey: "cantidadInstrumental9",
            fotoKey: "fotoInstrumental9",
            observacionKey: "observacionInstrumental9",
            activarinput: false,
        },
        {
            key: "instrumental10",
            texto: "Cepillo pequeño",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/cepillo_peque%C3%B1o_rs3o6r.jpg',
            fechaVencimientoKey: "fechaInstrumental10",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental10",
            cantidadExistenteKey: "cantidadInstrumental10",
            fotoKey: "fotoInstrumental10",
            observacionKey: "observacionInstrumental10",
            activarinput: false,
        },
        {
            key: "instrumental11",
            texto: "Botiquín fijo, caja o Maletín",
            imagenKey: 'https://res.cloudinary.com/dcozwbcpi/image/upload/botiquin_ajiu8f.jpg',
            fechaVencimientoKey: "fechaInstrumental11",
            cantidadEstimadaKey: "cantidadEstimadaInstrumental11",
            cantidadExistenteKey: "cantidadInstrumental11",
            fotoKey: "fotoInstrumental11",
            observacionKey: "observacionInstrumental11",
            activarinput: false,
        },
    ];

    const validarFormularioEnelBotiquin = (formulario) => {
        if (!formulario.tipoInspeccion) { toast.error('Por favor diligencie el tipo de inspeccion.'); return false }
        if (!formulario.clasificacion) { toast.error('Por favor diligencie la clasificacion.'); return false }
        if (!cedulaUsuario) { toast.error('Por favor diligencie inicie sesion ya que no existe usuario.'); return false }
        if (!nombreUsuario) { toast.error('Por favor diligencie inicie sesion ya que no existe usuario.'); return false }
        if (!formulario.nombreProyecto) { toast.error('Por favor diligencie el nombre del proyecto.'); return false }
        if (!formulario.cedulaResponsableBotiquin) { toast.error('Por favor diligencie la cedula del responsable del botiquin.'); return false }
        if (!formulario.nombreResponsableBotiquin || formulario.nombreResponsableBotiquin === 'Usuario no encontrado') { toast.error('Por favor ingrese un usuario valido para el responsable del botiquin.'); return false }
        if (!formulario.proceso) { toast.error('Por favor diligencie el proceso.'); return false }
        if (!formulario.zona) { toast.error('Por favor diligencie la zona.'); return false }
        if (!formulario.placa && formulario.zona === 'Movil') { toast.error('Por favor diligencie la placa.'); return false }
        if (!formulario.sede && formulario.zona === 'Bodega') { toast.error('Por favor diligencie la sede.'); return false }

        if (!formulario.bioseguridad.fechaBioseguridad1 && formulario.bioseguridad.bioseguridad1 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 1 en el capitulo 1.'); return false }
        if (!formulario.bioseguridad.cantidadBioseguridad1 && formulario.bioseguridad.bioseguridad1 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 1 en el capitulo 1.'); return false }
        if ((!formulario.bioseguridad.observacionBioseguridad1 || !formulario.bioseguridad.fotoBioseguridad1) && formulario.bioseguridad.bioseguridad1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if (!formulario.bioseguridad.fechaBioseguridad2 && formulario.bioseguridad.bioseguridad2 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 2 en el capitulo 1.'); return false }
        if (!formulario.bioseguridad.cantidadBioseguridad2 && formulario.bioseguridad.bioseguridad2 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 2 en el capitulo 1.'); return false }
        if ((!formulario.bioseguridad.observacionBioseguridad2 || !formulario.bioseguridad.fotoBioseguridad2) && formulario.bioseguridad.bioseguridad2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if (!formulario.bioseguridad.fechaBioseguridad3 && formulario.bioseguridad.bioseguridad3 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 3 en el capitulo 1.'); return false }
        if (!formulario.bioseguridad.cantidadBioseguridad3 && formulario.bioseguridad.bioseguridad3 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 3 en el capitulo 1.'); return false }
        if ((!formulario.bioseguridad.observacionBioseguridad3 || !formulario.bioseguridad.fotoBioseguridad3) && formulario.bioseguridad.bioseguridad3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.bioseguridad.fechaBioseguridad4 && formulario.bioseguridad.bioseguridad4 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 4 en el capitulo 1.'); return false }
        if (!formulario.bioseguridad.cantidadBioseguridad4 && formulario.bioseguridad.bioseguridad4 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 4 en el capitulo 1.'); return false }
        if ((!formulario.bioseguridad.observacionBioseguridad4 || !formulario.bioseguridad.fotoBioseguridad4) && formulario.bioseguridad.bioseguridad4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if (!formulario.bioseguridad.fechaBioseguridad5 && formulario.bioseguridad.bioseguridad5 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 5 en el capitulo 1.'); return false }
        if (!formulario.bioseguridad.cantidadBioseguridad5 && formulario.bioseguridad.bioseguridad5 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 5 en el capitulo 1.'); return false }
        if ((!formulario.bioseguridad.observacionBioseguridad5 || !formulario.bioseguridad.fotoBioseguridad5) && formulario.bioseguridad.bioseguridad5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 5.'); return false }

        if (!formulario.inmovilizacion.fechaInmovilizacion1 && formulario.inmovilizacion.inmovilizacion1 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 1 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion1 && formulario.inmovilizacion.inmovilizacion1 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 1 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion1 || !formulario.inmovilizacion.fotoInmovilizacion1) && formulario.inmovilizacion.inmovilizacion1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion2 && formulario.inmovilizacion.inmovilizacion2 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 2 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion2 && formulario.inmovilizacion.inmovilizacion2 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 2 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion2 || !formulario.inmovilizacion.fotoInmovilizacion2) && formulario.inmovilizacion.inmovilizacion2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion3 && formulario.inmovilizacion.inmovilizacion3 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 3 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion3 && formulario.inmovilizacion.inmovilizacion3 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 3 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion3 || !formulario.inmovilizacion.fotoInmovilizacion3) && formulario.inmovilizacion.inmovilizacion3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion4 && formulario.inmovilizacion.inmovilizacion4 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 4 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion4 && formulario.inmovilizacion.inmovilizacion4 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 4 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion4 || !formulario.inmovilizacion.fotoInmovilizacion4) && formulario.inmovilizacion.inmovilizacion4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion5 && formulario.inmovilizacion.inmovilizacion5 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 5 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion5 && formulario.inmovilizacion.inmovilizacion5 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 5 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion5 || !formulario.inmovilizacion.fotoInmovilizacion5) && formulario.inmovilizacion.inmovilizacion5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion6 && formulario.inmovilizacion.inmovilizacion6 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 6 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion6 && formulario.inmovilizacion.inmovilizacion6 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 6 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion6 || !formulario.inmovilizacion.fotoInmovilizacion6) && formulario.inmovilizacion.inmovilizacion6 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 6.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion7 && formulario.inmovilizacion.inmovilizacion7 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 7 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion7 && formulario.inmovilizacion.inmovilizacion7 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 7 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion7 || !formulario.inmovilizacion.fotoInmovilizacion7) && formulario.inmovilizacion.inmovilizacion7 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 7.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion8 && formulario.inmovilizacion.inmovilizacion8 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 8 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion8 && formulario.inmovilizacion.inmovilizacion8 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 8 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion8 || !formulario.inmovilizacion.fotoInmovilizacion8) && formulario.inmovilizacion.inmovilizacion8 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 8.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion9 && formulario.inmovilizacion.inmovilizacion9 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 9 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion9 && formulario.inmovilizacion.inmovilizacion9 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 9 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion9 || !formulario.inmovilizacion.fotoInmovilizacion9) && formulario.inmovilizacion.inmovilizacion9 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 9.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion10 && formulario.inmovilizacion.inmovilizacion10 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 10 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion10 && formulario.inmovilizacion.inmovilizacion10 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 10 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion10 || !formulario.inmovilizacion.fotoInmovilizacion10) && formulario.inmovilizacion.inmovilizacion10 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 10.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion11 && formulario.inmovilizacion.inmovilizacion11 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 11 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion11 && formulario.inmovilizacion.inmovilizacion11 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 11 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion11 || !formulario.inmovilizacion.fotoInmovilizacion11) && formulario.inmovilizacion.inmovilizacion11 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 11.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion12 && formulario.inmovilizacion.inmovilizacion12 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 12 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion12 && formulario.inmovilizacion.inmovilizacion12 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 12 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion12 || !formulario.inmovilizacion.fotoInmovilizacion12) && formulario.inmovilizacion.inmovilizacion12 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 12.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion13 && formulario.inmovilizacion.inmovilizacion13 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 13 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion13 && formulario.inmovilizacion.inmovilizacion13 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 13 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion13 || !formulario.inmovilizacion.fotoInmovilizacion13) && formulario.inmovilizacion.inmovilizacion13 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 13.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion14 && formulario.inmovilizacion.inmovilizacion14 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 14 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion14 && formulario.inmovilizacion.inmovilizacion14 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 14 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion14 || !formulario.inmovilizacion.fotoInmovilizacion14) && formulario.inmovilizacion.inmovilizacion14 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 14.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion15 && formulario.inmovilizacion.inmovilizacion15 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 15 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion15 && formulario.inmovilizacion.inmovilizacion15 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 15 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion15 || !formulario.inmovilizacion.fotoInmovilizacion15) && formulario.inmovilizacion.inmovilizacion15 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 15.'); return false }
        if (!formulario.inmovilizacion.fechaInmovilizacion16 && formulario.inmovilizacion.inmovilizacion16 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 16 en el capitulo 2.'); return false }
        if (!formulario.inmovilizacion.cantidadInmovilizacion16 && formulario.inmovilizacion.inmovilizacion16 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 16 en el capitulo 2.'); return false }
        if ((!formulario.inmovilizacion.observacionInmovilizacion16 || !formulario.inmovilizacion.fotoInmovilizacion16) && formulario.inmovilizacion.inmovilizacion16 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 16.'); return false }

        if (!formulario.antisepticos.fechaAntisepticos1 && formulario.antisepticos.antisepticos1 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 1 en el capitulo 3.'); return false }
        if (!formulario.antisepticos.cantidadAntisepticos1 && formulario.antisepticos.antisepticos1 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 1 en el capitulo 3.'); return false }
        if ((!formulario.antisepticos.observacionAntisepticos1 || !formulario.antisepticos.fotoAntisepticos1) && formulario.antisepticos.antisepticos1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if (!formulario.antisepticos.fechaAntisepticos2 && formulario.antisepticos.antisepticos2 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 2 en el capitulo 3.'); return false }
        if (!formulario.antisepticos.cantidadAntisepticos2 && formulario.antisepticos.antisepticos2 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 2 en el capitulo 3.'); return false }
        if ((!formulario.antisepticos.observacionAntisepticos2 || !formulario.antisepticos.fotoAntisepticos2) && formulario.antisepticos.antisepticos2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 2.'); return false }

        if (!formulario.instrumental.fechaInstrumental1 && formulario.instrumental.instrumental1 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 1 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental1 && formulario.instrumental.instrumental1 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 1 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental1 || !formulario.instrumental.fotoInstrumental1) && formulario.instrumental.instrumental1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if (!formulario.instrumental.fechaInstrumental2 && formulario.instrumental.instrumental2 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 2 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental2 && formulario.instrumental.instrumental2 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 2 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental2 || !formulario.instrumental.fotoInstrumental2) && formulario.instrumental.instrumental2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if (!formulario.instrumental.fechaInstrumental3 && formulario.instrumental.instrumental3 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 3 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental3 && formulario.instrumental.instrumental3 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 3 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental3 || !formulario.instrumental.fotoInstrumental3) && formulario.instrumental.instrumental3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.instrumental.fechaInstrumental4 && formulario.instrumental.instrumental4 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 4 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental4 && formulario.instrumental.instrumental4 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 4 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental4 || !formulario.instrumental.fotoInstrumental4) && formulario.instrumental.instrumental4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if (!formulario.instrumental.fechaInstrumental5 && formulario.instrumental.instrumental5 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 5 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental5 && formulario.instrumental.instrumental5 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 5 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental5 || !formulario.instrumental.fotoInstrumental5) && formulario.instrumental.instrumental5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if (!formulario.instrumental.fechaInstrumental6 && formulario.instrumental.instrumental6 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 6 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental6 && formulario.instrumental.instrumental6 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 6 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental6 || !formulario.instrumental.fotoInstrumental6) && formulario.instrumental.instrumental6 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 6.'); return false }
        if (!formulario.instrumental.fechaInstrumental7 && formulario.instrumental.instrumental7 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 7 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental7 && formulario.instrumental.instrumental7 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 7 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental7 || !formulario.instrumental.fotoInstrumental7) && formulario.instrumental.instrumental7 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 7.'); return false }
        if (!formulario.instrumental.fechaInstrumental8 && formulario.instrumental.instrumental8 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 8 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental8 && formulario.instrumental.instrumental8 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 8 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental8 || !formulario.instrumental.fotoInstrumental8) && formulario.instrumental.instrumental8 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 8.'); return false }
        if (!formulario.instrumental.fechaInstrumental9 && formulario.instrumental.instrumental9 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 9 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental9 && formulario.instrumental.instrumental9 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 9 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental9 || !formulario.instrumental.fotoInstrumental9) && formulario.instrumental.instrumental9 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 9.'); return false }
        if (!formulario.instrumental.fechaInstrumental10 && formulario.instrumental.instrumental10 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 10 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental10 && formulario.instrumental.instrumental10 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 10 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental10 || !formulario.instrumental.fotoInstrumental10) && formulario.instrumental.instrumental10 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 10.'); return false }
        if (!formulario.instrumental.fechaInstrumental11 && formulario.instrumental.instrumental11 === 'C') { toast.error('Por favor diligencie la fecha de vencimiento de la pregunta 11 en el capitulo 4.'); return false }
        if (!formulario.instrumental.cantidadInstrumental11 && formulario.instrumental.instrumental11 === 'C') { toast.error('Por favor diligencie la cantidad de la pregunta 11 en el capitulo 4.'); return false }
        if ((!formulario.instrumental.observacionInstrumental11 || !formulario.instrumental.fotoInstrumental11) && formulario.instrumental.instrumental11 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 11.'); return false }

        if (!formulario.observacion) { toast.error('Por favor diligencie la observacion general.'); return false }
        if (!formulario.fotoObservacion) { toast.error('Por favor diligencie la foto de la observacion general.'); return false }
    }

    const cantidadEstimadaPorClasificacion = {
        bioseguridad: {
            cantidadEstimadaBioseguridad1: {
                'Fijo / Portatil': "4",
                'Vehicular / Carros Tipo 1': "2",
                'Vehicular / Cuadrillas Tipo 2': "3",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaBioseguridad2: {
                'Fijo / Portatil': "4",
                'Vehicular / Carros Tipo 1': "2",
                'Vehicular / Cuadrillas Tipo 2': "3",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaBioseguridad3: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "0",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaBioseguridad4: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "0",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaBioseguridad5: {
                'Fijo / Portatil': "4",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "2",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
        },
        inmovilizacion: {
            cantidadEstimadaInmovilizacion1: {
                'Fijo / Portatil': "20",
                'Vehicular / Carros Tipo 1': "10",
                'Vehicular / Cuadrillas Tipo 2': "10",
                'Moto Tipo 3': "5",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion2: {
                'Fijo / Portatil': "6",
                'Vehicular / Carros Tipo 1': "2",
                'Vehicular / Cuadrillas Tipo 2': "5",
                'Moto Tipo 3': "2",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion3: {
                'Fijo / Portatil': "3",
                'Vehicular / Carros Tipo 1': "2",
                'Vehicular / Cuadrillas Tipo 2': "2",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion4: {
                'Fijo / Portatil': "20",
                'Vehicular / Carros Tipo 1': "20",
                'Vehicular / Cuadrillas Tipo 2': "20",
                'Moto Tipo 3': "5",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion5: {
                'Fijo / Portatil': "40",
                'Vehicular / Carros Tipo 1': "10",
                'Vehicular / Cuadrillas Tipo 2': "30",
                'Moto Tipo 3': "5",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion6: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "0",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion7: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion8: {
                'Fijo / Portatil': "15",
                'Vehicular / Carros Tipo 1': "5",
                'Vehicular / Cuadrillas Tipo 2': "10",
                'Moto Tipo 3': "5",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion9: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "0",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion10: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion11: {
                'Fijo / Portatil': "2",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "2",
                'Moto Tipo 3': "2",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion12: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion13: {
                'Fijo / Portatil': "2",
                'Vehicular / Carros Tipo 1': "0",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "0",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion14: {
                'Fijo / Portatil': "2",
                'Vehicular / Carros Tipo 1': "2",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion15: {
                'Fijo / Portatil': "2",
                'Vehicular / Carros Tipo 1': "0",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "0",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInmovilizacion16: {
                'Fijo / Portatil': "4",
                'Vehicular / Carros Tipo 1': "2",
                'Vehicular / Cuadrillas Tipo 2': "2",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
        },
        antisepticos: {
            cantidadEstimadaAntisepticos1: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaAntisepticos2: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "0",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
        },
        instrumental: {
            cantidadEstimadaInstrumental1: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "0",
                'Vehicular / Cuadrillas Tipo 2': "0",
                'Moto Tipo 3': "0",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental2: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental3: {
                'Fijo / Portatil': "4",
                'Vehicular / Carros Tipo 1': "2",
                'Vehicular / Cuadrillas Tipo 2': "4",
                'Moto Tipo 3': "2",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental4: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental5: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental6: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental7: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental8: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental9: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental10: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "0",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "0",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
            cantidadEstimadaInstrumental11: {
                'Fijo / Portatil': "1",
                'Vehicular / Carros Tipo 1': "1",
                'Vehicular / Cuadrillas Tipo 2': "1",
                'Moto Tipo 3': "1",
                'Vehicular / Cuadrillas Tipo 3': "",
            },
        }
    };

    return (
        <div className="SupervisionFormularioEnelBotiquin">
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
                    <div className='PaginaVolver'>
                        <Botones className='agregar' onClick={() => navigate('/SupervisionPrincipal')}><FaArrowLeft /><Textos className='parrafo'>Volver</Textos></Botones>
                    </div>

                    <div className='titulo3'>
                        <Textos className='titulo'>Enel - Inspección de Botiquin</Textos>
                    </div>

                    <div className='campo fecha'>
                        <i className="fas fa-calendar-alt"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Fecha inspeccion, hora inicio:</Textos>
                            <Textos className='parrafo'>{fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Textos>
                        </div>
                    </div>

                    <div className='campo'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Tipo de Inspeccion:</Textos>
                            <Selectores value={formularioEnelBotiquin.tipoInspeccion} onChange={(e) => actualizarCampoEnelBotiquin('tipoInspeccion', e.target.value)}
                                options={[
                                    { value: 'Presencial', label: 'Presencial' },
                                    { value: 'Virtual', label: 'Virtual' },
                                ]} className="primary"
                                disabled={modo === "editar"}
                            ></Selectores>
                        </div>
                    </div>

                    <div className='campo'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Clasificacion:</Textos>
                            <Selectores value={formularioEnelBotiquin.clasificacion}
                                onChange={(e) => {
                                    actualizarCampoEnelBotiquin('clasificacion', e.target.value)

                                    Object.entries(cantidadEstimadaPorClasificacion).forEach(([categoria, campos]) => {
                                        Object.entries(campos).forEach(([nombreCampo, valoresPorClasificacion]) => {
                                            const nuevoValor = valoresPorClasificacion[e.target.value] ?? "";
                                            const keyFinal = `${categoria}.${nombreCampo}`;
                                            actualizarCampoEnelBotiquin(keyFinal, nuevoValor);
                                        });
                                    });
                                }}
                                options={[
                                    { value: 'Fijo / Portatil', label: 'Fijo / Portatil' },
                                    { value: 'Vehicular / Carros Tipo 1', label: 'Vehicular / Carros Tipo 1' },
                                    { value: 'Vehicular / Cuadrillas Tipo 2', label: 'Vehicular / Cuadrillas Tipo 2' },
                                    { value: 'Vehicular / Cuadrillas Tipo 3', label: 'Vehicular / Cuadrillas Tipo 3' },
                                    { value: 'Moto Tipo 3', label: 'Moto Tipo 3' },
                                ]} className="primary"
                                disabled={modo === "editar"}
                            ></Selectores>
                        </div>
                    </div>

                    <div className='campo supervisor'>
                        <i className="fas fa-users-cog"></i>
                        <div className='entradaDatos'>
                            <Textos disabled className='subtitulo'>Nombre de quien inspecciona:</Textos>
                            <Entradas disabled type="text" placeholder="Ingrese la cedula de quien inspecciona" value={cedulaUsuario} />
                            <Entradas type="text" placeholder="Nombre" value={nombreUsuario} disabled={true} />
                        </div>
                    </div>

                    <div className='campo nombreProyecto'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Nombre del proyecto:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese el nombre del Proyecto" value={formularioEnelBotiquin.nombreProyecto} onChange={(e) => actualizarCampoEnelBotiquin('nombreProyecto', e.target.value)} />
                        </div>
                    </div>

                    <div className='campo ubicacion'>
                        <div className='contenedor'>
                            <i className="fas fa-map-marker-alt"></i>
                            <Textos className='subtitulo'>Ubicación:</Textos>
                        </div>
                    </div>

                    <div id="map2"></div>

                    <div className='campo lider'>
                        <i className="fas fa-users-cog"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Responsable del Botiquin:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la cedula del lider de cuadrilla" value={formularioEnelBotiquin.cedulaResponsableBotiquin} onChange={(e) => {
                                const valor = e.target.value;
                                actualizarCampoEnelBotiquin('cedulaResponsableBotiquin', valor);
                                const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                if (registroEncontrado) {
                                    actualizarCampoEnelBotiquin('nombreResponsableBotiquin', registroEncontrado.nombre);
                                } else {
                                    actualizarCampoEnelBotiquin('nombreResponsableBotiquin', 'Usuario no encontrado');
                                }
                            }} />
                            <Entradas type="text" placeholder="Nombre" value={formularioEnelBotiquin.nombreResponsableBotiquin} disabled={true} />
                        </div>
                    </div>

                    <div className='campo proceso'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Proceso:</Textos>
                            <Selectores disabled={modo === "editar"} value={formularioEnelBotiquin.proceso} onChange={(e) => actualizarCampoEnelBotiquin('proceso', e.target.value)}
                                options={[
                                    { value: 'Obra civil', label: 'Obra civil' },
                                    { value: 'Obra electrica', label: 'Obra electrica' },
                                    { value: 'B2C', label: 'B2C' },
                                ]} className="primary">
                            </Selectores>
                        </div>
                    </div>

                    <div className={`campo zona ${formularioEnelBotiquin.zona === '' ? 'vacio' : ''}`}>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Zona:</Textos>
                            <Selectores disabled={modo === "editar"} value={formularioEnelBotiquin.zona} onChange={(e) => actualizarCampoEnelBotiquin('zona', e.target.value)}
                                options={[
                                    { value: 'Bodega', label: 'Bodega' },
                                    { value: 'Movil', label: 'Movil' },
                                ]} className="primary">
                            </Selectores>
                        </div>
                    </div>

                    {formularioEnelBotiquin.zona === 'Movil' &&
                        <div className='campo placa'>
                            <i className="fas fa-id-card"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Placa vehículo:</Textos>
                                <Entradas
                                    type="text"
                                    placeholder="Placa movil (Ejemplo: ABC123, ABC12A)"
                                    value={formularioEnelBotiquin.placa}
                                    onChange={(e) => {
                                        const newValue = e.target.value.toUpperCase();
                                        if (/^[A-Z]{0,3}[0-9]{0,2}[0-9A-Z]{0,1}$/.test(newValue)) {
                                            actualizarCampoEnelBotiquin('placa', newValue);
                                        }
                                    }}
                                    pattern="[A-Za-z]{3}[0-9]{2}[0-9A-Za-z]{1}"
                                    maxLength={6}
                                    title="Debe ser en formato de 3 letras seguidas de 3 números (Ejemplo: ABC123)"
                                    disabled={modo === "editar"}
                                />
                            </div>
                        </div>
                    }

                    {formularioEnelBotiquin.zona === 'Bodega' &&
                        <div className='campo sede'>
                            <i className="fas fa-id-card"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Sede:</Textos>
                                <Entradas
                                    type="text"
                                    placeholder="Sede"
                                    value={formularioEnelBotiquin.sede}
                                    onChange={(e) => {
                                        actualizarCampoEnelBotiquin('sede', e.target.value);
                                    }}
                                    disabled={modo === "editar"}
                                />
                            </div>
                        </div>
                    }

                    {imagenAmpliada && (
                        <div className='imagenAmpliada' onClick={() => setImagenAmpliada(null)}>
                            <img
                                src={imagenAmpliada}
                                alt="Imagen"
                            />
                        </div>
                    )}

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>1. Elementos de Bioseguridad</Textos>
                            {preguntas.slice(0, 5).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="bioseguridad"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelBotiquin}
                                    onChange={actualizarCampoEnelBotiquin}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                    imagenBool={true}
                                    imagenKey={preg.imagenKey}
                                    fechaVencimientoBool={true}
                                    fechaVencimientoKey={preg.fechaVencimientoKey}
                                    cantidadEstimadaBool={true}
                                    cantidadEstimadaKey={preg.cantidadEstimadaKey}
                                    cantidadExistenteBool={true}
                                    cantidadExistenteKey={preg.cantidadExistenteKey}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>2. Elementos de Curacion e Inmovilizacion</Textos>
                            {preguntas.slice(5, 21).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="inmovilizacion"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelBotiquin}
                                    onChange={actualizarCampoEnelBotiquin}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                    imagenBool={true}
                                    imagenKey={preg.imagenKey}
                                    fechaVencimientoBool={true}
                                    fechaVencimientoKey={preg.fechaVencimientoKey}
                                    cantidadEstimadaBool={true}
                                    cantidadEstimadaKey={preg.cantidadEstimadaKey}
                                    cantidadExistenteBool={true}
                                    cantidadExistenteKey={preg.cantidadExistenteKey}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>3. Antisepticos</Textos>
                            {preguntas.slice(21, 23).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="antisepticos"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelBotiquin}
                                    onChange={actualizarCampoEnelBotiquin}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                    imagenBool={true}
                                    imagenKey={preg.imagenKey}
                                    fechaVencimientoBool={true}
                                    fechaVencimientoKey={preg.fechaVencimientoKey}
                                    cantidadEstimadaBool={true}
                                    cantidadEstimadaKey={preg.cantidadEstimadaKey}
                                    cantidadExistenteBool={true}
                                    cantidadExistenteKey={preg.cantidadExistenteKey}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>4. Instrumental y Otros Elementos</Textos>
                            {preguntas.slice(23, 34).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="instrumental"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelBotiquin}
                                    onChange={actualizarCampoEnelBotiquin}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                    imagenBool={true}
                                    imagenKey={preg.imagenKey}
                                    fechaVencimientoBool={true}
                                    fechaVencimientoKey={preg.fechaVencimientoKey}
                                    cantidadEstimadaBool={true}
                                    cantidadEstimadaKey={preg.cantidadEstimadaKey}
                                    cantidadExistenteBool={true}
                                    cantidadExistenteKey={preg.cantidadExistenteKey}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo observacion'>
                        <i className="fas fa-comment"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Observaciones:</Textos>
                            <AreaTextos disabled={modo === "editar"} type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelBotiquin.observacion} onChange={(e) => actualizarCampoEnelBotiquin('observacion', e.target.value)} rows={4} />
                            <Textos className='subtitulo'>Imagen general:</Textos>
                            <Imagenes disableInput={modo === "editar"} fotoKey={'fotoObservacion'} foto={formularioEnelBotiquin.fotoObservacion} onChange={(fotoKey, data) => actualizarCampoEnelBotiquin(`${fotoKey}`, data)} capture={formularioEnelBotiquin.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} ></Imagenes>
                        </div>
                    </div>

                    <div className='enviar'>
                        <Botones disabled={modo === "editar"} className="eliminar" onClick={() => {
                            localStorage.removeItem('formularioEnelBotiquin');
                            setFormularioEnelBotiquin(estadoInicialFormularioEnelBotiquin);
                        }}>Borrar formulario</Botones>
                        <Botones disabled={modo === "editar"} type="submit" id='Enviar' className="guardar" onClick={enviarFormularioEnelBotiquin}>Enviar</Botones>
                    </div>
                </form>
            )}

            <div className='Notificaciones'>
                <ToastContainer />
            </div>
        </div >
    );
};

export default SupervisionFormularioEnelBotiquin;