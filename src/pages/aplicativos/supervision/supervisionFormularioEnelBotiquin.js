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
                formulario: "Enel Inspeccion de Gestion Botiquin para Areas Operativas",
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
                setMiembroEnProceso({});
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
                actualizado[nivel1][nivel2] = valor;
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

    const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);

    const columnas = [
        { header: 'No. ID', key: 'cedula' },
        { header: 'Nombres y Apellidos', key: 'nombre' },
        { header: 'Cargo', key: 'cargo' },
    ];

    const [mostrarModal, setMostrarModal] = useState(false);

    const [miembroEnProceso, setMiembroEnProceso] = useState(() => {
        const guardado = localStorage.getItem('miembroEnProceso');
        return guardado ? JSON.parse(guardado) : {
            cedula: "",
            nombre: "",
            cargo: "",
        };
    });

    const actualizarCampoMiembroACuadrillaEnelBotiquin = async (campo, valor) => {

        if (Array.isArray(valor) && valor.length === 0) {
            setMiembroEnProceso((prev) => {
                const actualizado = { ...prev };
                actualizado[campo] = "";
                localStorage.setItem(
                    "miembroEnProceso",
                    JSON.stringify(actualizado)
                );
                return actualizado;
            });
            return;
        }

        if (['C', 'NC', 'NA'].includes(valor)) {
            setMiembroEnProceso(prev => {
                const actualizado = { ...prev, [campo]: valor };

                if (valor !== 'NC') {
                    const base = campo.charAt(0).toUpperCase() + campo.slice(1);
                    const fotoKey = `foto${base}`;

                    if (fotoKey in actualizado) actualizado[fotoKey] = '';
                }

                localStorage.setItem('miembroEnProceso', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (typeof valor === 'string') {
            setMiembroEnProceso(prev => {
                const actualizado = { ...prev, [campo]: valor };
                localStorage.setItem('miembroEnProceso', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (valor[0].name && valor[0].data) {
            setMiembroEnProceso((prev) => {
                const actualizado = { ...prev };
                actualizado[campo] = valor;
                localStorage.setItem(
                    "miembroEnProceso",
                    JSON.stringify(actualizado)
                );
                return actualizado;
            });
            return;
        }
    };

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

    const preguntas = [
        {
            key: "bioseguridad1",
            texto: "Guantes desechables ( látex o nitrilo)",
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
        if (!formulario.nombreProyecto) { toast.error('Por favor diligencie el nombre del proyecto.'); return false }
        if (!formulario.noContrato) { toast.error('Por favor diligencie el numero de contrato.'); return false }
        if (!formulario.direccion) { toast.error('Por favor diligencie la direccion.'); return false }
        if (!formulario.ciudad) { toast.error('Por favor diligencie la ciudad.'); return false }
        if (!formulario.opOt) { toast.error('Por favor diligencie la OP/OT.'); return false }
        if (!formulario.cedulaSupervisorTecnico) { toast.error('Por favor diligencie la cedula del tecnico.'); return false }
        if (!formulario.nombreSupervisorTecnico || formulario.nombreSupervisorTecnico === 'Usuario no encontrado') { toast.error('Por favor ingrese un usuario valido para el campo de tecnico.'); return false }
        if (!formulario.cedulaLiderEncargado) { toast.error('Por favor diligencie la cedula del lider.'); return false }
        if (!formulario.nombreLiderEncargado || formulario.nombreLiderEncargado === 'Usuario no encontrado') { toast.error('Por favor ingrese un usuario valido para el campo de lider.'); return false }
        if (!formulario.proceso) { toast.error('Por favor diligencie el proceso.'); return false }
        if (!formulario.placa) { toast.error('Por favor diligencie la placa del vehiculo.'); return false }
        if (!Array.isArray(formulario.cuadrilla)) { toast.error('Por favor diligencie al menos dos personas en la cuadrilla.'); return false }
        const personasConCedula = formulario.cuadrilla.filter(persona => persona.cedula && persona.cedula.trim() !== '');
        if (personasConCedula.length < 2) { toast.error('Debe haber al menos dos personas en la cuadrilla.'); return false }

        if (!formulario.socioBotiquin.socioBotiquin1) { toast.error('Por favor diligencie el capitulo 1 completo.'); return false }
        if ((!formulario.socioBotiquin.observacionSocioBotiquin1 || !formulario.socioBotiquin.fotoSocioBotiquin1) && formulario.socioBotiquin.socioBotiquin1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 1.'); return false }

        if (!formulario.materialesConstruccion.materialesConstruccion1 || !formulario.materialesConstruccion.materialesConstruccion2 || !formulario.materialesConstruccion.materialesConstruccion3 || !formulario.materialesConstruccion.materialesConstruccion4) { toast.error('Por favor diligencie el capitulo 2 completo.'); return false }
        if ((!formulario.materialesConstruccion.fotoMaterialesConstruccion1 && formulario.materialesConstruccion.materialesConstruccion1 !== 'NA')) { toast.error('Por favor ingrese las fotos obligatorias en el capitulo 2.'); return false }
        if (!formulario.materialesConstruccion.observacionMaterialesConstruccion1 && formulario.materialesConstruccion.materialesConstruccion1 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.materialesConstruccion.observacionMaterialesConstruccion2 || !formulario.materialesConstruccion.fotoMaterialesConstruccion2) && formulario.materialesConstruccion.materialesConstruccion2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.materialesConstruccion.observacionmaterialesConstruccion3 || !formulario.materialesConstruccion.fotoMaterialesConstruccion3) && formulario.materialesConstruccion.materialesConstruccion3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.materialesConstruccion.observacionMaterialesConstruccion4 || !formulario.materialesConstruccion.fotoMaterialesConstruccion4) && formulario.materialesConstruccion.materialesConstruccion4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 4.'); return false }

        if (!formulario.rcd.rcd1 || !formulario.rcd.rcd2 || !formulario.rcd.rcd3 || !formulario.rcd.rcd4 || !formulario.rcd.rcd5 || !formulario.rcd.rcd6 || !formulario.rcd.rcd7) { toast.error('Por favor diligencie el capitulo 3 completo.'); return false }
        if ((!formulario.rcd.fotoRcd1 && formulario.rcd.rcd1 !== 'NA') || (!formulario.rcd.fotoRcd6 && formulario.rcd.rcd6 !== 'NA') || (!formulario.rcd.fotoRcd7 && formulario.rcd.rcd7 !== 'NA')) { toast.error('Por favor ingrese las fotos obligatorias en el capitulo 3.'); return false }
        if (!formulario.rcd.observacionRcd1 && formulario.rcd.rcd1 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.rcd.observacionRcd2 || !formulario.rcd.fotoRcd2) && formulario.rcd.rcd2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.rcd.observacionRcd3 || !formulario.rcd.fotoRcd3) && formulario.rcd.rcd3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.rcd.observacionRcd4 || !formulario.rcd.fotoRcd4) && formulario.rcd.rcd4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.rcd.observacionRcd5 || !formulario.rcd.fotoRcd5) && formulario.rcd.rcd5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if (!formulario.rcd.observacionRcd6 && formulario.rcd.rcd6 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 6.'); return false }
        if (!formulario.rcd.observacionRcd7 && formulario.rcd.rcd7 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 7.'); return false }

        if (!formulario.residuosSolidos.residuosSolidos1 || !formulario.residuosSolidos.residuosSolidos2 || !formulario.residuosSolidos.residuosSolidos3 || !formulario.residuosSolidos.residuosSolidos4 || !formulario.residuosSolidos.residuosSolidos5 || !formulario.residuosSolidos.residuosSolidos6 || !formulario.residuosSolidos.residuosSolidos7 || !formulario.residuosSolidos.residuosSolidos8 || !formulario.residuosSolidos.residuosSolidos9 || !formulario.residuosSolidos.residuosSolidos10 || !formulario.residuosSolidos.residuosSolidos11 || !formulario.residuosSolidos.residuosSolidos12) { toast.error('Por favor diligencie el capitulo 4 completo.'); return false }
        if ((!formulario.residuosSolidos.fotoResiduosSolidos2 && formulario.residuosSolidos.residuosSolidos2 !== 'NA')) { toast.error('Por favor ingrese las fotos obligatorias en el capitulo 4.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos1 || !formulario.residuosSolidos.fotoResiduosSolidos1) && formulario.residuosSolidos.residuosSolidos1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if (!formulario.residuosSolidos.observacionResiduosSolidos2 && formulario.residuosSolidos.residuosSolidos2 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos3 || !formulario.residuosSolidos.fotoResiduosSolidos3) && formulario.residuosSolidos.residuosSolidos3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos4 || !formulario.residuosSolidos.fotoResiduosSolidos4) && formulario.residuosSolidos.residuosSolidos4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos5 || !formulario.residuosSolidos.fotoResiduosSolidos5) && formulario.residuosSolidos.residuosSolidos5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos6 || !formulario.residuosSolidos.fotoResiduosSolidos6) && formulario.residuosSolidos.residuosSolidos6 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 6.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos7 || !formulario.residuosSolidos.fotoResiduosSolidos7) && formulario.residuosSolidos.residuosSolidos7 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 7.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos8 || !formulario.residuosSolidos.fotoResiduosSolidos8) && formulario.residuosSolidos.residuosSolidos8 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 8.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos9 || !formulario.residuosSolidos.fotoResiduosSolidos9) && formulario.residuosSolidos.residuosSolidos9 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 9.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos10 || !formulario.residuosSolidos.fotoResiduosSolidos10) && formulario.residuosSolidos.residuosSolidos10 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 10.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos11 || !formulario.residuosSolidos.fotoResiduosSolidos11) && formulario.residuosSolidos.residuosSolidos11 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 11.'); return false }
        if ((!formulario.residuosSolidos.observacionResiduosSolidos12 || !formulario.residuosSolidos.fotoResiduosSolidos12) && formulario.residuosSolidos.residuosSolidos12 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 12.'); return false }

        if (!formulario.aceites.aceites1 || !formulario.aceites.aceites2 || !formulario.aceites.aceites3 || !formulario.aceites.aceites4 || !formulario.aceites.aceites5) { toast.error('Por favor diligencie el capitulo 5 completo.'); return false }
        if ((!formulario.aceites.fotoAceites1 && formulario.aceites.aceites1 !== 'NA')) { toast.error('Por favor ingrese las fotos obligatorias en el capitulo 5.'); return false }
        if (!formulario.aceites.observacionAceites1 && formulario.aceites.aceites1 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 5 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.aceites.observacionAceites2 || !formulario.aceites.fotoAceites2) && formulario.aceites.aceites2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 5 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.aceites.observacionAceites3 || !formulario.aceites.fotoAceites3) && formulario.aceites.aceites3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 5 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.aceites.observacionAceites4 || !formulario.aceites.fotoAceites4) && formulario.aceites.aceites4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 5 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.aceites.observacionAceites5 || !formulario.aceites.fotoAceites5) && formulario.aceites.aceites5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 5 cuando su respuesta es No Cumple en la pregunta 5.'); return false }

        if (!formulario.vertimientos.vertimientos1 || !formulario.vertimientos.vertimientos2 || !formulario.vertimientos.vertimientos3) { toast.error('Por favor diligencie el capitulo 6 completo.'); return false }
        if ((!formulario.vertimientos.observacionVertimientos1 || !formulario.vertimientos.fotoVertimientos1) && formulario.vertimientos.vertimientos1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.vertimientos.observacionVertimientos2 || !formulario.vertimientos.fotoVertimientos2) && formulario.vertimientos.vertimientos2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.vertimientos.observacionVertimientos3 || !formulario.vertimientos.fotoVertimientos3) && formulario.vertimientos.vertimientos3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 3.'); return false }

        if (!formulario.atmosfericas.atmosfericas1 || !formulario.atmosfericas.atmosfericas2) { toast.error('Por favor diligencie el capitulo 7 completo.'); return false }
        if ((!formulario.atmosfericas.observacionAtmosfericas1 || !formulario.atmosfericas.fotoAtmosfericas1) && formulario.atmosfericas.atmosfericas1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 7 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.atmosfericas.observacionAtmosfericas2 || !formulario.atmosfericas.fotoAtmosfericas2) && formulario.atmosfericas.atmosfericas2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 7 cuando su respuesta es No Cumple en la pregunta 2.'); return false }

        if (!formulario.seguridadIndustrial.seguridadIndustrial1 || !formulario.seguridadIndustrial.seguridadIndustrial2 || !formulario.seguridadIndustrial.seguridadIndustrial3 || !formulario.seguridadIndustrial.seguridadIndustrial4 || !formulario.seguridadIndustrial.seguridadIndustrial5 || !formulario.seguridadIndustrial.seguridadIndustrial6) { toast.error('Por favor diligencie el capitulo 8 completo.'); return false }
        if ((!formulario.seguridadIndustrial.fotoSeguridadIndustrial1 && formulario.seguridadIndustrial.seguridadIndustrial1 !== 'NA') || (!formulario.seguridadIndustrial.fotoSeguridadIndustrial4 && formulario.seguridadIndustrial.seguridadIndustrial4 !== 'NA')) { toast.error('Por favor ingrese las fotos obligatorias en el capitulo 8.'); return false }
        if (!formulario.seguridadIndustrial.observacionSeguridadIndustrial1 && formulario.seguridadIndustrial.seguridadIndustrial1 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 8 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.seguridadIndustrial.observacionSeguridadIndustrial2 || !formulario.atmosfericas.fotoSeguridadIndustrial2) && formulario.atmosfericas.seguridadIndustrial2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 8 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.seguridadIndustrial.observacionSeguridadIndustrial3 || !formulario.atmosfericas.fotoSeguridadIndustrial3) && formulario.atmosfericas.seguridadIndustrial3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 8 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.seguridadIndustrial.observacionSeguridadIndustrial4 && formulario.seguridadIndustrial.seguridadIndustrial4 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 8 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.seguridadIndustrial.observacionSeguridadIndustrial5 || !formulario.atmosfericas.fotoSeguridadIndustrial5) && formulario.atmosfericas.seguridadIndustrial5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 8 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if ((!formulario.seguridadIndustrial.observacionSeguridadIndustrial6 || !formulario.atmosfericas.fotoSeguridadIndustrial6) && formulario.atmosfericas.seguridadIndustrial6 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 8 cuando su respuesta es No Cumple en la pregunta 6.'); return false }

        if (!formulario.observacion) { toast.error('Por favor diligencie la observacion general.'); return false }
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
                                    { value: 'Civil', label: 'Civil' },
                                    { value: 'Electrico', label: 'Electrico' },
                                    { value: 'Electrico - Civil', label: 'Electrico - Civil' },
                                ]} className="primary">
                            </Selectores>
                        </div>
                    </div>

                    <div className='campo zona'>
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
                        <div className='campo placa'>
                            <i className="fas fa-id-card"></i>
                            <div className='entradaDatos'>
                                <Textos className='subtitulo'>Sede:</Textos>
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
                        </div>
                    </div>

                    <div className='enviar'>
                        <Botones disabled={modo === "editar"} className="eliminar" onClick={() => {
                            localStorage.removeItem('formularioEnelBotiquin');
                            setMiembroEnProceso({})
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