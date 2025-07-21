import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './supervisionFormularioEnelElementosEmergencia.css'
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

const SupervisionFormularioEnelElementosEmergencia = () => {
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
        const dataLocal = localStorage.getItem('formularioEnelAmbiental');
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

    const enviarFormularioEnelAmbiental = async (event) => {

        event.preventDefault();
        const resultadoValidador = validarFormularioEnelAmbiental(formularioEnelAmbiental);
        if (resultadoValidador === false) { return }
        if (!ubicacion) { toast.error('Por favor dar permisos de ubicacion.'); return false }

        setEnviando(true)

        try {
            const fechaInicial = fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const fechaFinal = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const formularioEnelAmbientalModificado = await subirTodasLasFotos(formularioEnelAmbiental, fecha);

            const ncvalido = hayNCValido(formularioEnelAmbientalModificado) === true ? "No Conforme" : "Conforme"

            const { id, ...formularioSinId } = formularioEnelAmbientalModificado;
            const formularioConTiempos = {
                ...formularioSinId,
                fechaInicial,
                fechaFinal,
                ubicacion,
                inspeccion: ncvalido,
                formulario: "Enel Inspeccion de Gestion Ambiental para Areas Operativas",
                cedulaQuienInspecciona: cedulaUsuario,
                nombreQuienInspecciona: nombreUsuario,
            };

            const formularioNuevoSinFotos = eliminarDataEnFotos(formularioConTiempos)
            const formularioNuevoSerializado = serializarCamposComplejos(formularioNuevoSinFotos)

            const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/supervision/crearRegistrosEnelInspeccionAmbiental`, formularioNuevoSerializado);

            if (response2.status >= 200 && response2.status < 300) {
                setEnviando(false)
                console.log('Datos enviados exitosamente');
                localStorage.removeItem('formularioEnelAmbiental');
                setMiembroEnProceso({});
                setFormularioEnelAmbiental(estadoInicialFormularioEnelAmbiental);
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

    const estadoInicialFormularioEnelAmbiental = {
        tipoInspeccion: "",
        cedulaQuienInspecciona: "",
        nombreQuienInspecciona: "",
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
        cuadrilla: [],
        socioAmbiental: {
            socioAmbiental1: "",
            fotoSocioAmbiental1: "",
            observacionSocioAmbiental1: "",
        },
        materialesConstruccion: {
            materialesConstruccion1: "",
            fotoMaterialesConstruccion1: "",
            observacionMaterialesConstruccion1: "",
            materialesConstruccion2: "",
            fotoMaterialesConstruccion2: "",
            observacionMaterialesConstruccion2: "",
            materialesConstruccion3: "",
            fotoMaterialesConstruccion3: "",
            observacionMaterialesConstruccion3: "",
            materialesConstruccion4: "",
            fotoMaterialesConstruccion4: "",
            observacionMaterialesConstruccion4: "",
        },
        rcd: {
            rcd1: "",
            fotoRcd1: "",
            observacionRcd1: "",
            rcd2: "",
            fotoRcd2: "",
            observacionRcd2: "",
            rcd3: "",
            fotoRcd3: "",
            observacionRcd3: "",
            rcd4: "",
            fotoRcd4: "",
            observacionRcd4: "",
            rcd5: "",
            fotoRcd5: "",
            observacionRcd5: "",
            rcd6: "",
            fotoRcd6: "",
            observacionRcd6: "",
            rcd7: "",
            fotoRcd7: "",
            observacionRcd7: "",
        },
        residuosSolidos: {
            residuosSolidos1: "",
            fotoResiduosSolidos1: "",
            observacionResiduosSolidos1: "",
            residuosSolidos2: "",
            fotoResiduosSolidos2: "",
            observacionResiduosSolidos2: "",
            residuosSolidos3: "",
            fotoResiduosSolidos3: "",
            observacionResiduosSolidos3: "",
            residuosSolidos4: "",
            fotoResiduosSolidos4: "",
            observacionResiduosSolidos4: "",
            residuosSolidos5: "",
            fotoResiduosSolidos5: "",
            observacionResiduosSolidos5: "",
            residuosSolidos6: "",
            fotoResiduosSolidos6: "",
            observacionResiduosSolidos6: "",
            residuosSolidos7: "",
            fotoResiduosSolidos7: "",
            observacionResiduosSolidos7: "",
            residuosSolidos8: "",
            fotoResiduosSolidos8: "",
            observacionResiduosSolidos8: "",
            residuosSolidos9: "",
            fotoResiduosSolidos9: "",
            observacionResiduosSolidos9: "",
            residuosSolidos10: "",
            fotoResiduosSolidos10: "",
            observacionResiduosSolidos10: "",
            residuosSolidos11: "",
            fotoResiduosSolidos11: "",
            observacionResiduosSolidos11: "",
            residuosSolidos12: "",
            fotoResiduosSolidos12: "",
            observacionResiduosSolidos12: "",
        },
        aceites: {
            aceites1: "",
            fotoAceites1: "",
            observacionAceites1: "",
            aceites2: "",
            fotoAceites2: "",
            observacionAceites2: "",
            aceites3: "",
            fotoAceites3: "",
            observacionAceites3: "",
            aceites4: "",
            fotoAceites4: "",
            observacionAceites4: "",
            aceites5: "",
            fotoAceites5: "",
            observacionAceites5: "",
        },
        vertimientos: {
            vertimientos1: "",
            fotoVertimientos1: "",
            observacionVertimientos1: "",
            vertimientos2: "",
            fotoVertimientos2: "",
            observacionVertimientos2: "",
            vertimientos3: "",
            fotoVertimientos3: "",
            observacionVertimientos3: "",
        },
        atmosfericas: {
            atmosfericas1: "",
            fotoAtmosfericas1: "",
            observacionAtmosfericas1: "",
            atmosfericas2: "",
            fotoAtmosfericas2: "",
            observacionAtmosfericas2: "",
        },
        seguridadIndustrial: {
            seguridadIndustrial1: "",
            fotoSeguridadIndustrial1: "",
            observacionSeguridadIndustrial1: "",
            seguridadIndustrial2: "",
            fotoSeguridadIndustrial2: "",
            observacionSeguridadIndustrial2: "",
            seguridadIndustrial3: "",
            fotoSeguridadIndustrial3: "",
            observacionSeguridadIndustrial3: "",
            seguridadIndustrial4: "",
            fotoSeguridadIndustrial4: "",
            observacionSeguridadIndustrial4: "",
            seguridadIndustrial5: "",
            fotoSeguridadIndustrial5: "",
            observacionSeguridadIndustrial5: "",
            seguridadIndustrial6: "",
            fotoSeguridadIndustrial6: "",
            observacionSeguridadIndustrial6: "",
        },
        observacion: "",
        inspeccion: "",
    };

    const [formularioEnelAmbiental, setFormularioEnelAmbiental] = useState(() => {
        const datosGuardados = localStorage.getItem('formularioEnelAmbiental');
        return datosGuardados ? JSON.parse(datosGuardados) : estadoInicialFormularioEnelAmbiental;
    });

    const actualizarCampoEnelAmbiental = async (campo, valor) => {
        const [nivel1, nivel2] = campo.split('.');

        if (Array.isArray(valor) && valor.length === 0) {
            setFormularioEnelAmbiental((prev) => {
                const actualizado = { ...prev };
                actualizado[nivel1][nivel2] = "";
                localStorage.setItem(
                    "formularioEnelAmbiental",
                    JSON.stringify(actualizado)
                );
                return actualizado;
            });
            return;
        }

        if (['C', 'NC', 'NA'].includes(valor) && nivel2) {
            setFormularioEnelAmbiental(prev => {
                const actualizado = { ...prev };
                if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }

                if (valor !== 'NC') {
                    const base = nivel2.charAt(0).toUpperCase() + nivel2.slice(1);
                    const fotoKey = `foto${base}`;
                    const observacionKey = `observacion${base}`;

                    if (fotoKey in actualizado[nivel1]) actualizado[nivel1][fotoKey] = '';
                    if (observacionKey in actualizado[nivel1]) actualizado[nivel1][observacionKey] = '';
                }

                localStorage.setItem('formularioEnelAmbiental', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (typeof valor === 'string') {
            setFormularioEnelAmbiental(prev => {
                const actualizado = { ...prev };
                if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }
                localStorage.setItem('formularioEnelAmbiental', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (valor[0].name && valor[0].data) {
            setFormularioEnelAmbiental((prev) => {
                const actualizado = { ...prev };
                actualizado[nivel1][nivel2] = valor;
                localStorage.setItem(
                    "formularioEnelAmbiental",
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

    const actualizarCampoMiembroACuadrillaEnelAmbiental = async (campo, valor) => {

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
            key: "socioAmbiental1",
            texto: "¿Se realizó socialización del alcance, duración y actividades a realizar con las partes interesadas previo al inicio de la obra?",
            fotoKey: "fotoSocioAmbiental1",
            observacionKey: "observacionSocioAmbiental1",
            activarinput: false,
        },

        {
            key: "materialesConstruccion1",
            texto: "¿Si es necesario dejarlos por mas tiempo, se encuentran cubiertos apropiadamente?",
            fotoKey: "fotoMaterialesConstruccion1",
            observacionKey: "observacionMaterialesConstruccion1",
            activarinput: true,
        },
        {
            key: "materialesConstruccion2",
            texto: "¿Están alejados de alcantarillas, sumideros, canales?",
            fotoKey: "fotoMaterialesConstruccion2",
            observacionKey: "observacionMaterialesConstruccion2",
            activarinput: false,
        },
        {
            key: "materialesConstruccion3",
            texto: "¿Las zonas verdes  se encuentran libres de almacenamiento de materiales de construcción o están protegidas?",
            fotoKey: "fotoMaterialesConstruccion3",
            observacionKey: "observacionMaterialesConstruccion3",
            activarinput: false,
        },
        {
            key: "materialesConstruccion4",
            texto: "¿De ser necesario almacenar cerca a alcantarillas, sumideros y/o canales, estos están protegidos para evitar arrastre de material a la red de alcantarillado?",
            fotoKey: "fotoMaterialesConstruccion4",
            observacionKey: "observacionMaterialesConstruccion4",
            activarinput: false,
        },

        {
            key: "rcd1",
            texto: "¿En volúmenes pequeños (menor o igual a 6 m3) son entregados a la empresa de aseo de la localidad o se llevan a un almacenamiento temporal?",
            fotoKey: "fotoRcd1",
            observacionKey: "observacionRcd1",
            activarinput: true,
        },
        {
            key: "rcd2",
            texto: "¿En volúmenes grandes (mayor a 7 m3)  son entregados a un gestor a avalado por la autoridad ambiental competente?",
            fotoKey: "fotoRcd2",
            observacionKey: "observacionRcd2",
            activarinput: false,
        },
        {
            key: "rcd3",
            texto: "¿Se conservan las remisiones del transporte donde se indiquen los datos del transportador y el gestor?",
            fotoKey: "fotoRcd3",
            observacionKey: "observacionRcd3",
            activarinput: false,
        },
        {
            key: "rcd4",
            texto: "¿Se dejan en la vía pública por menos de 24 horas?",
            fotoKey: "fotoRcd4",
            observacionKey: "observacionRcd4",
            activarinput: false,
        },
        {
            key: "rcd5",
            texto: "¿Si es necesario dejarlos por mas tiempo, se encuentran cubiertos apropiadamente?",
            fotoKey: "fotoRcd5",
            observacionKey: "observacionRcd5",
            activarinput: false,
        },
        {
            key: "rcd6",
            texto: "¿La ronda hidráulica de cuerpos de agua, alcantarillas y/o sumideros se encuentran libres de almacenamiento temporal de RCD?",
            fotoKey: "fotoRcd6",
            observacionKey: "observacionRcd6",
            activarinput: true,
        },
        {
            key: "rcd7",
            texto: "¿Los andenes y senderos peatonales se encuentran libres de almacenamiento temporal de RCD?",
            fotoKey: "fotoRcd7",
            observacionKey: "observacionRcd7",
            activarinput: true,
        },

        {
            key: "residuosSolidos1",
            texto: "¿Se realiza limpieza general del frente de obra una vez termina la jornada diaria?",
            fotoKey: "fotoResiduosSolidos1",
            observacionKey: "observacionResiduosSolidos1",
            activarinput: false,
        },
        {
            key: "residuosSolidos2",
            texto: "¿Existen recipientes adecuados para una debida separación en la fuente de residuos sólidos que se generan en la obra (puntos ecológicos)?",
            fotoKey: "fotoResiduosSolidos2",
            observacionKey: "observacionResiduosSolidos2",
            activarinput: true,
        },
        {
            key: "residuosSolidos3",
            texto: "¿Son suficientes los recipientes para los residuos sólidos que se generan en la obra, están bien ubicados y señalizados?",
            fotoKey: "fotoResiduosSolidos3",
            observacionKey: "observacionResiduosSolidos3",
            activarinput: false,
        },
        {
            key: "residuosSolidos4",
            texto: "¿Se realiza separación en la fuente de los residuos sólidos que se generan en la obra de acuerdo al código de colores establecido en el PGIR?",
            fotoKey: "fotoResiduosSolidos4",
            observacionKey: "observacionResiduosSolidos4",
            activarinput: false,
        },
        {
            key: "residuosSolidos5",
            texto: "¿El centro de acopio temporal de los residuos sólidos que se generan en la obra se encuentra señalizados y está organizado según el tipo de residuo?",
            fotoKey: "fotoResiduosSolidos5",
            observacionKey: "observacionResiduosSolidos5",
            activarinput: false,
        },
        {
            key: "residuosSolidos6",
            texto: "¿El centro de acopio está ubicado en un sitio de fácil acceso para el transporte y para la atención de situaciones de emergencia?¿Está sobre un terreno estable y nivelado?",
            fotoKey: "fotoResiduosSolidos6",
            observacionKey: "observacionResiduosSolidos6",
            activarinput: false,
        },
        {
            key: "residuosSolidos7",
            texto: "¿El centro de acopio temporal está alejado de fuentes de acceso y salida de agua y de posibles fuentes externas de peligro, como subestaciones de energía y posibles fuentes de ignición?",
            fotoKey: "fotoResiduosSolidos7",
            observacionKey: "observacionResiduosSolidos7",
            activarinput: false,
        },
        {
            key: "residuosSolidos8",
            texto: "¿El centro de acopio temporal cuenta con iluminación adecuada?",
            fotoKey: "fotoResiduosSolidos8",
            observacionKey: "observacionResiduosSolidos8",
            activarinput: false,
        },
        {
            key: "residuosSolidos9",
            texto: "¿El centro de acopio temporal cuenta con ventilación natural o forzada que evite la acumulación de gases?",
            fotoKey: "fotoResiduosSolidos9",
            observacionKey: "observacionResiduosSolidos9",
            activarinput: false,
        },
        {
            key: "residuosSolidos10",
            texto: "¿Los Residuos Peligrosos (RESPEL) que se generan en la obra se almacenan conforme a la matriz de incompatibilidad, se encuentran etiquetados y se lleva un control de éstos?",
            fotoKey: "fotoResiduosSolidos10",
            observacionKey: "observacionResiduosSolidos10",
            activarinput: false,
        },
        {
            key: "residuosSolidos11",
            texto: "¿Se cuenta con un kit de control de derrames y un extintor con capacidad mínima de 20 lbs para atención de contigencias como derrames o incendios que se generan en la obra?",
            fotoKey: "fotoResiduosSolidos11",
            observacionKey: "observacionResiduosSolidos11",
            activarinput: false,
        },
        {
            key: "residuosSolidos12",
            texto: "¿Se han realizado capacitaciones, sensibilizaciones y/o comunicaciones frente a la temática de gestión integral de residuos?",
            fotoKey: "fotoResiduosSolidos12",
            observacionKey: "observacionResiduosSolidos12",
            activarinput: false,
        },

        {
            key: "aceites1",
            texto: "¿Los aceites nuevos y usados que se generan en la obra se almacenan en recipientes apropiados?",
            fotoKey: "fotoAceites1",
            observacionKey: "observacionAceites1",
            activarinput: true,
        },
        {
            key: "aceites2",
            texto: "¿Los aceites usados y residuos aceitosos que se generan en la obra se entregan a un gestor autorizado para el tratamiento de estos?",
            fotoKey: "fotoAceites2",
            observacionKey: "observacionAceites2",
            activarinput: false,
        },
        {
            key: "aceites3",
            texto: "¿Los residuos aceitosos que se generan en la obra, son almacenados separadamente de los demás residuos?",
            fotoKey: "fotoAceites3",
            observacionKey: "observacionAceites3",
            activarinput: false,
        },
        {
            key: "aceites4",
            texto: "¿Los residuos aceitosos que se generan en la obra son entregados a un gestor autorizado?",
            fotoKey: "fotoAceites4",
            observacionKey: "observacionAceites4",
            activarinput: false,
        },
        {
            key: "aceites5",
            texto: "¿ Se cuentan con los elementos necesarios para atender un derrame accidental de combustible o aceite.?",
            fotoKey: "fotoAceites5",
            observacionKey: "observacionAceites5",
            activarinput: false,
        },

        {
            key: "vertimientos1",
            texto: "¿Todo vertimiento generado por la obra se gestiona conforme a sus caracteristicas?",
            fotoKey: "fotoVertimientos1",
            observacionKey: "observacionVertimientos1",
            activarinput: false,
        },
        {
            key: "vertimientos2",
            texto: "En caso de contar con baños portátiles ¿se realizan la limpieza y desinfección de los mismos y se guardan las remisiones respectivas?",
            fotoKey: "fotoVertimientos2",
            observacionKey: "observacionVertimientos2",
            activarinput: false,
        },
        {
            key: "vertimientos3",
            texto: "¿Se evita el vertimiento de aguas residuales no domésticas, sustancias químicas y/o residuos líquidos  peligrosos  al alcantarillado, sumideros o cuerpos de agua?",
            fotoKey: "fotoVertimientos3",
            observacionKey: "observacionVertimientos3",
            activarinput: false,
        },

        {
            key: "atmosfericas1",
            texto: "¿En todo caso se evita la quema de residuos sólidos generados en la obra?",
            fotoKey: "fotoAtmosfericas1",
            observacionKey: "observacionAtmosfericas1",
            activarinput: false,
        },
        {
            key: "atmosfericas2",
            texto: "¿La maquinaria y vehículos utilizados en la obra se encuentran en condiciones óptimas de mantenimiento (Revisión técnico mecánica vigente y/o mantenimientos al día)?",
            fotoKey: "fotoAtmosfericas2",
            observacionKey: "observacionAtmosfericas2",
            activarinput: false,
        },

        {
            key: "seguridadIndustrial1",
            texto: "¿La obra cuenta con los avisos preventivos, reglamentarios e informativos requeridos.?",
            fotoKey: "fotoSeguridadIndustrial1",
            observacionKey: "observacionSeguridadIndustrial1",
            activarinput: true,
        },
        {
            key: "seguridadIndustrial2",
            texto: "¿Las instalaciones temporales permanecen debidamente señalizadas?",
            fotoKey: "fotoSeguridadIndustrial2",
            observacionKey: "observacionSeguridadIndustrial2",
            activarinput: false,
        },
        {
            key: "seguridadIndustrial3",
            texto: "¿Todas las sustancias químicas y residuos peligrosos manejados en la sitio de trabajo cuentan con su respectiva ficha de datos de seguridad y estas se mantienen en lugares visibles?",
            fotoKey: "fotoSeguridadIndustrial3",
            observacionKey: "observacionSeguridadIndustrial3",
            activarinput: false,
        },
        {
            key: "seguridadIndustrial4",
            texto: "¿Todos los trabajadores cuentan y portan los EPP (Elementos de Protección Personal) ?",
            fotoKey: "fotoSeguridadIndustrial4",
            observacionKey: "observacionSeguridadIndustrial4",
            activarinput: true,
        },
        {
            key: "seguridadIndustrial5",
            texto: "¿Se cuenta con un botiquín de primeros auxilios en caso de presentarse un evento emergencia?",
            fotoKey: "fotoSeguridadIndustrial5",
            observacionKey: "observacionSeguridadIndustrial5",
            activarinput: false,
        },
        {
            key: "seguridadIndustrial6",
            texto: "¿Se cuenta con una adecuada iluminación cuando se adelanten trabajos en horario nocturno?",
            fotoKey: "fotoSeguridadIndustrial6",
            observacionKey: "observacionSeguridadIndustrial6",
            activarinput: false,
        },
    ];

    const validarMiembroEnProceso = (miembro) => {
        if (!miembro.cedula) { toast.error('Por favor diligencie la cedula.'); return false }
        if (!miembro.nombre || miembro.nombre === 'Usuario no encontrado') { toast.error('Por favor ingrese un usuario valido.'); return false }
        if (!miembro.cargo || miembro.cargo === 'Cargo no encontrado') { toast.error('Por favor ingrese un usuario valido.'); return false }
    }

    const validarFormularioEnelAmbiental = (formulario) => {
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

        if (!formulario.socioAmbiental.socioAmbiental1) { toast.error('Por favor diligencie el capitulo 1 completo.'); return false }
        if ((!formulario.socioAmbiental.observacionSocioAmbiental1 || !formulario.socioAmbiental.fotoSocioAmbiental1) && formulario.socioAmbiental.socioAmbiental1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 1.'); return false }

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

    return (
        <div className="SupervisionFormularioEnelElementosEmergencia">
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
                        <Textos className='titulo'>Enel - Inspección a Equipos y Elementos de Emergencia</Textos>
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
                            <Selectores value={formularioEnelAmbiental.tipoInspeccion} onChange={(e) => actualizarCampoEnelAmbiental('tipoInspeccion', e.target.value)}
                                options={[
                                    { value: 'Presencial', label: 'Presencial' },
                                    { value: 'Virtual', label: 'Virtual' },
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
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese el nombre del Proyecto" value={formularioEnelAmbiental.nombreProyecto} onChange={(e) => actualizarCampoEnelAmbiental('nombreProyecto', e.target.value)} />
                        </div>
                    </div>

                    <div className='campo contrato'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>No. de contrato:</Textos>
                            <Selectores value={formularioEnelAmbiental.noContrato} onChange={(e) => actualizarCampoEnelAmbiental('noContrato', e.target.value)}
                                options={[
                                    { value: 'JA10123037/JA10123045', label: 'JA10123037 / JA10123045' },
                                    { value: 'JA10123400', label: 'JA10123400' },
                                ]} className="primary"
                                disabled={modo === "editar"}
                            ></Selectores>
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
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la direccion" value={formularioEnelAmbiental.direccion}
                                onChange={(e) => actualizarCampoEnelAmbiental('direccion', e.target.value)} />
                        </div>
                    </div>

                    <div className='campo ciudad'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Ciudad:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la ciudad" value={formularioEnelAmbiental.ciudad} onChange={(e) => {
                                const valor = e.target.value;
                                actualizarCampoEnelAmbiental('ciudad', valor);

                                const coincidencias = datosCiudades.filter(ciudad =>
                                    ciudad.key.toLowerCase().includes(valor.toLowerCase())
                                );
                                setCiudadesFiltradas(coincidencias);
                            }} />
                        </div>

                        {formularioEnelAmbiental.ciudad && ciudadesFiltradas.length > 0 && (
                            <ul className="sugerencias-ciudad">
                                {ciudadesFiltradas.slice(0, 10).map((ciudad, index) => (
                                    <li
                                        key={ciudad.key}
                                        onClick={() => {
                                            actualizarCampoEnelAmbiental('ciudad', ciudad.key);
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
                            <Textos className='subtitulo'>No. de OP/OT:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese el nombre del Proyecto" value={formularioEnelAmbiental.opOt} onChange={(e) => actualizarCampoEnelAmbiental('opOt', e.target.value)} />
                        </div>
                    </div>

                    <div className='campo supervisor'>
                        <i className="fas fa-users-cog"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Supervisor:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la cedula del supervisor tecnico" value={formularioEnelAmbiental.cedulaSupervisorTecnico} onChange={(e) => {
                                const valor = e.target.value;
                                actualizarCampoEnelAmbiental('cedulaSupervisorTecnico', valor);
                                const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                if (registroEncontrado) {
                                    actualizarCampoEnelAmbiental('nombreSupervisorTecnico', registroEncontrado.nombre);
                                } else {
                                    actualizarCampoEnelAmbiental('nombreSupervisorTecnico', 'Usuario no encontrado');
                                }
                            }} />
                            <Entradas type="text" placeholder="Nombre" value={formularioEnelAmbiental.nombreSupervisorTecnico} disabled={true} />
                        </div>
                    </div>

                    <div className='campo lider'>
                        <i className="fas fa-users-cog"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Líder de cuadrilla:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la cedula del lider de cuadrilla" value={formularioEnelAmbiental.cedulaLiderEncargado} onChange={(e) => {
                                const valor = e.target.value;
                                actualizarCampoEnelAmbiental('cedulaLiderEncargado', valor);
                                const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                if (registroEncontrado) {
                                    actualizarCampoEnelAmbiental('nombreLiderEncargado', registroEncontrado.nombre);
                                } else {
                                    actualizarCampoEnelAmbiental('nombreLiderEncargado', 'Usuario no encontrado');
                                }
                            }} />
                            <Entradas type="text" placeholder="Nombre" value={formularioEnelAmbiental.nombreLiderEncargado} disabled={true} />
                        </div>
                    </div>

                    <div className='campo proceso'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Proceso:</Textos>
                            <Selectores disabled={modo === "editar"} value={formularioEnelAmbiental.proceso} onChange={(e) => actualizarCampoEnelAmbiental('proceso', e.target.value)}
                                options={[
                                    { value: 'Civil', label: 'Civil' },
                                    { value: 'Electrico', label: 'Electrico' },
                                    { value: 'Electrico - Civil', label: 'Electrico - Civil' },
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
                                value={formularioEnelAmbiental.placa}
                                onChange={(e) => {
                                    const newValue = e.target.value.toUpperCase();
                                    if (/^[A-Z]{0,3}[0-9]{0,2}[0-9A-Z]{0,1}$/.test(newValue)) {
                                        actualizarCampoEnelAmbiental('placa', newValue);
                                    }
                                }}
                                pattern="[A-Za-z]{3}[0-9]{2}[0-9A-Za-z]{1}"
                                maxLength={6}
                                title="Debe ser en formato de 3 letras seguidas de 3 números (Ejemplo: ABC123)"
                                disabled={modo === "editar"}
                            />
                        </div>
                    </div>

                    <div className='campo cuadrilla'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Datos Cuadrilla:</Textos>
                            <div className='botonAgregar'>
                                <Botones disabled={modo === "editar"} className='agregar' onClick={() => {
                                    setAccionModalTabla("crear");
                                    setMiembroEnProceso({})
                                    setMostrarModal(true);
                                }}>Agregar</Botones>
                            </div>
                        </div>
                    </div>

                    <div className='Tabla'>
                        <Tablas columnas={columnas} datos={formularioEnelAmbiental.cuadrilla} filasPorPagina={5}
                            leer={true} editar={modo === "editar" ? false : true} eliminar={modo === "editar" ? false : true}
                            onLeer={(fila) => {
                                setAccionModalTabla("leer");
                                setMostrarModal(true);
                                setMiembroEnProceso(fila);
                            }}
                            onEditar={(fila) => {
                                setAccionModalTabla("editar");
                                setMostrarModal(true);
                                setMiembroEnProceso(fila);
                            }}
                            onEliminar={(fila) => {
                                setAccionModalTabla("eliminar");
                                setMostrarModal(true);
                                setMiembroEnProceso(fila);
                            }} />
                    </div>

                    {mostrarModal && (
                        <>
                            <div className="modal-overlay" onClick={() => setMostrarModal(false)}></div>
                            <div className="modal-cuadrilla">
                                <div className="modal-contenido">
                                    <Textos className='titulo'>{accionModalTabla === 'crear' ? 'Agregar' : accionModalTabla === 'editar' ? 'Editar' : accionModalTabla === 'leer' ? 'Leer' : accionModalTabla === 'eliminar' ? 'Eliminar' : ''} Integrante</Textos>
                                    <Textos className='subtitulo encabezado'>Datos Personales:</Textos>
                                    <div className='entradaDatos'>
                                        <Textos className='subtitulo'>Cedula:</Textos>
                                        <Entradas type="text" placeholder="Cédula" value={miembroEnProceso.cedula || ""}
                                            onChange={(e) => {
                                                const valor = e.target.value;
                                                const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                                actualizarCampoMiembroACuadrillaEnelAmbiental('cedula', valor);
                                                actualizarCampoMiembroACuadrillaEnelAmbiental('nombre', registroEncontrado ? registroEncontrado.nombre : 'Usuario no encontrado');
                                                actualizarCampoMiembroACuadrillaEnelAmbiental('cargo', registroEncontrado ? registroEncontrado.cargo : 'Cargo no encontrado');
                                            }}
                                            disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"}
                                        />
                                    </div>
                                    <div className='entradaDatos'>
                                        <Textos className='subtitulo'>Nombre:</Textos>
                                        <Entradas type="text" placeholder="Nombre" value={miembroEnProceso.nombre} disabled={true} />
                                    </div>
                                    <div className='entradaDatos'>
                                        <Textos className='subtitulo'>Cargo:</Textos>
                                        <Entradas type="text" placeholder="Cargo" value={miembroEnProceso.cargo} disabled={true} />
                                    </div>
                                    <div className={`modal-acciones ${accionModalTabla !== "leer" ? 'visible' : 'oculto'}`}>
                                        <Botones className={`guardar ${accionModalTabla === "crear" ? 'visible' : 'oculto'}`} onClick={() => {
                                            const existe = (formularioEnelAmbiental.cuadrilla || []).some(m => m.cedula === miembroEnProceso.cedula);
                                            if (existe) {
                                                toast.error('La cédula ya está en la cuadrilla.');
                                                return
                                            }

                                            const resultadoValidador = validarMiembroEnProceso(miembroEnProceso);

                                            if (resultadoValidador === false) {
                                                return
                                            }

                                            setFormularioEnelAmbiental(prev => {
                                                const actualizado = { ...prev, cuadrilla: [...(prev.cuadrilla || []), miembroEnProceso] };
                                                localStorage.setItem('formularioEnelAmbiental', JSON.stringify(actualizado));
                                                return actualizado;
                                            });
                                            toast.success('Integrante creado exitosamente.');
                                            localStorage.removeItem('miembroEnProceso');
                                            setMostrarModal(false);
                                            setMiembroEnProceso({})
                                        }}>Crear</Botones>
                                        <Botones className={`guardar ${accionModalTabla === "editar" ? 'visible' : 'oculto'}`} onClick={() => {
                                            const existe = (formularioEnelAmbiental.cuadrilla || []).map(m => m.cedula === miembroEnProceso.cedula ? miembroEnProceso : m);

                                            setFormularioEnelAmbiental(prev => {
                                                const actualizado = { ...prev, cuadrilla: existe };
                                                localStorage.setItem('formularioEnelAmbiental', JSON.stringify(actualizado));
                                                return actualizado;
                                            });
                                            toast.success('Integrante editado exitosamente.');
                                            localStorage.removeItem('miembroEnProceso');
                                            setMostrarModal(false);
                                            setMiembroEnProceso({})
                                        }}>Editar</Botones>
                                        <Botones className={`eliminar ${accionModalTabla === "eliminar" ? 'visible' : 'oculto'}`} onClick={() => {
                                            const nuevaCuadrilla = (formularioEnelAmbiental.cuadrilla || []).filter(m => m.cedula !== miembroEnProceso.cedula);

                                            setFormularioEnelAmbiental(prev => {
                                                const actualizado = { ...prev, cuadrilla: nuevaCuadrilla };
                                                localStorage.setItem('formularioEnelAmbiental', JSON.stringify(actualizado));
                                                return actualizado;
                                            });
                                            toast.success('Integrante eliminado exitosamente.');
                                            localStorage.removeItem('miembroEnProceso');
                                            setMostrarModal(false);
                                            setMiembroEnProceso({})
                                        }}>Eliminar</Botones>
                                        <Botones onClick={() => setMostrarModal(false)}>Cancelar</Botones>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

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
                            <Textos className='subtitulo prin'>1. En relación con la gestión socio-ambiental</Textos>
                            {preguntas.slice(0, 1).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="socioAmbiental"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelAmbiental}
                                    onChange={actualizarCampoEnelAmbiental}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>2. En relación con los materiales de construcción (arena, gravilla, cemento)</Textos>
                            {preguntas.slice(1, 5).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="materialesConstruccion"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelAmbiental}
                                    onChange={actualizarCampoEnelAmbiental}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>3. En relación a los RCD (Residuos de Construcción y Demolición)</Textos>
                            {preguntas.slice(5, 12).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="rcd"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelAmbiental}
                                    onChange={actualizarCampoEnelAmbiental}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>4. En relación a los residuos sólidos</Textos>
                            {preguntas.slice(12, 24).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="residuosSolidos"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelAmbiental}
                                    onChange={actualizarCampoEnelAmbiental}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>5. En relación con los aceites y los residuos aceitosos</Textos>
                            {preguntas.slice(24, 29).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="aceites"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelAmbiental}
                                    onChange={actualizarCampoEnelAmbiental}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>6. En relación con los vertimientos</Textos>
                            {preguntas.slice(29, 32).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="vertimientos"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelAmbiental}
                                    onChange={actualizarCampoEnelAmbiental}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>7. En relación con las emisiones atmosféricas</Textos>
                            {preguntas.slice(32, 34).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="atmosfericas"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelAmbiental}
                                    onChange={actualizarCampoEnelAmbiental}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>8. En relación al aislamiento de la obra, señalización y seguridad industrial</Textos>
                            {preguntas.slice(34, 40).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="seguridadIndustrial"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelAmbiental}
                                    onChange={actualizarCampoEnelAmbiental}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo observacion'>
                        <i className="fas fa-comment"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Observaciones:</Textos>
                            <AreaTextos disabled={modo === "editar"} type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelAmbiental.observacion} onChange={(e) => actualizarCampoEnelAmbiental('observacion', e.target.value)} rows={4} />
                        </div>
                    </div>

                    <div className='enviar'>
                        <Botones disabled={modo === "editar"} className="eliminar" onClick={() => {
                            localStorage.removeItem('formularioEnelAmbiental');
                            setMiembroEnProceso({})
                            setFormularioEnelAmbiental(estadoInicialFormularioEnelAmbiental);
                        }}>Borrar formulario</Botones>
                        <Botones disabled={modo === "editar"} type="submit" id='Enviar' className="guardar" onClick={enviarFormularioEnelAmbiental}>Enviar</Botones>
                    </div>
                </form>
            )}

            <div className='Notificaciones'>
                <ToastContainer />
            </div>
        </div >
    );
};

export default SupervisionFormularioEnelElementosEmergencia;