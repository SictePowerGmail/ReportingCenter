import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './supervisionFormularioEnelIntegral.css'
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

const SupervisionFormularioEnelIntegral = () => {
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
        const dataLocal = localStorage.getItem('formularioEnelInspeccionIntegralHSE');
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

    const enviarFormularioEnelInspeccionIntegralHSE = async (event) => {

        event.preventDefault();
        const resultadoValidador = validarFormularioEnelInspeccionIntegralHSE(formularioEnelInspeccionIntegralHSE);
        if (resultadoValidador === false) { return }
        if (!ubicacion) { toast.error('Por favor dar permisos de ubicacion.'); return false }

        setEnviando(true)

        try {
            const fechaInicial = fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const fechaFinal = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const formularioEnelInspeccionIntegralHSEModificado = await subirTodasLasFotos(formularioEnelInspeccionIntegralHSE, fecha);

            const ncvalido = hayNCValido(formularioEnelInspeccionIntegralHSEModificado) === true ? "No Conforme" : "Conforme"

            const { id, ...formularioSinId } = formularioEnelInspeccionIntegralHSEModificado;
            const formularioConTiempos = {
                ...formularioSinId,
                fechaInicial,
                fechaFinal,
                ubicacion,
                inspeccion: ncvalido,
                formulario: "Enel Inspeccion Integral HSE",
                cedulaQuienInspecciona: cedulaUsuario,
                nombreQuienInspecciona: nombreUsuario,
            };

            const formularioNuevoSinFotos = eliminarDataEnFotos(formularioConTiempos)
            const formularioNuevoSerializado = serializarCamposComplejos(formularioNuevoSinFotos)

            const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/supervision/crearRegistroEnelInspeccionIntegralHse`, formularioNuevoSerializado);

            if (response2.status >= 200 && response2.status < 300) {
                setEnviando(false)
                console.log('Datos enviados exitosamente');
                localStorage.removeItem('formularioEnelInspeccionIntegralHSE');
                setMiembroEnProceso({});
                setFormularioEnelInspeccionIntegralHSE(estadoInicialFormularioEnelInspeccionIntegralHSE);
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

    const estadoInicialFormularioEnelInspeccionIntegralHSE = {
        tipoInspeccion: "",
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
        riesgos: {
            riesgos1: "",
            fotoRiesgos1Obligatoria: "",
            observacionRiesgos1: "",
            riesgos2: "",
            fotoRiesgos2Obligatoria: "",
            observacionRiesgos2: "",
            riesgos3: "",
            fotoRiesgos3: "",
            observacionRiesgos3: "",
            riesgos4: "",
            fotoRiesgos4Obligatoria: "",
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
        },
        senaYDemar: {
            senaYDemar1: "",
            fotoSenaYDemar1Obligatoria: "",
            observacionSenaYDemar1: "",
            senaYDemar2: "",
            fotoSenaYDemar2: "",
            observacionSenaYDemar2: "",
            senaYDemar3: "",
            fotoSenaYDemar3: "",
            observacionSenaYDemar3: "",
        },
        reglasOro: {
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
        },
        trabajoAlturas: {
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
            trabajoAlturas6: "",
            fotoTrabajoAlturas6: "",
            observacionTrabajoAlturas6: "",
            trabajoAlturas7: "",
            fotoTrabajoAlturas7: "",
            observacionTrabajoAlturas7: "",
        },
        espacioConfinado: {
            espacioConfinado1: "",
            fotoEspacioConfinado1: "",
            observacionEspacioConfinado1: "",
            espacioConfinado2: "",
            fotoEspacioConfinado2: "",
            observacionEspacioConfinado2: "",
            espacioConfinado3: "",
            fotoEspacioConfinado3: "",
            observacionEspacioConfinado3: "",
        },
        vehiculos: {
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
        },
        condicionesTrabajo: {
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
        },
        materiales: {
            materiales1: "",
            fotoMateriales1: "",
            observacionMateriales1: "",
            materiales2: "",
            fotoMateriales2: "",
            observacionMateriales2: "",
            materiales3: "",
            fotoMateriales3: "",
            observacionMateriales3: "",
        },
        primerosAuxilios: {
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
        },
        biomecanicos: {
            biomecanicos1: "",
            fotoBiomecanicos1: "",
            observacionBiomecanicos1: "",
            biomecanicos2: "",
            fotoBiomecanicos2: "",
            observacionBiomecanicos2: "",
            biomecanicos3: "",
            fotoBiomecanicos3: "",
            observacionBiomecanicos3: "",
        },
        quimicos: {
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
        },
        residuosNoPeligrosos: {
            residuosNoPeligrosos1: "",
            fotoResiduosNoPeligrosos1: "",
            observacionResiduosNoPeligrosos1: "",
            residuosNoPeligrosos2: "",
            fotoResiduosNoPeligrosos2: "",
            observacionResiduosNoPeligrosos2: "",
            residuosNoPeligrosos3: "",
            fotoResiduosNoPeligrosos3: "",
            observacionResiduosNoPeligrosos3: "",
        },
        residuosConstruccion: {
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
        },
        observacion: "",
        inspeccion: "",
    };

    const [formularioEnelInspeccionIntegralHSE, setFormularioEnelInspeccionIntegralHSE] = useState(() => {
        const datosGuardados = localStorage.getItem('formularioEnelInspeccionIntegralHSE');
        return datosGuardados ? JSON.parse(datosGuardados) : estadoInicialFormularioEnelInspeccionIntegralHSE;
    });

    const actualizarCampoEnelInspeccionIntegralHSE = async (campo, valor) => {
        const [nivel1, nivel2] = campo.split('.');

        if (Array.isArray(valor) && valor.length === 0) {
            setFormularioEnelInspeccionIntegralHSE((prev) => {
                const actualizado = { ...prev };
                actualizado[nivel1][nivel2] = "";
                localStorage.setItem(
                    "formularioEnelInspeccionIntegralHSE",
                    JSON.stringify(actualizado)
                );
                return actualizado;
            });
            return;
        }

        if (['C', 'NC', 'NA'].includes(valor) && nivel2) {
            setFormularioEnelInspeccionIntegralHSE(prev => {
                const actualizado = { ...prev };
                if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }

                if (valor !== 'NC') {
                    const base = nivel2.charAt(0).toUpperCase() + nivel2.slice(1);
                    const fotoKey = `foto${base}`;
                    const observacionKey = `observacion${base}`;

                    if (fotoKey in actualizado[nivel1]) actualizado[nivel1][fotoKey] = '';
                    if (observacionKey in actualizado[nivel1]) actualizado[nivel1][observacionKey] = '';
                }

                localStorage.setItem('formularioEnelInspeccionIntegralHSE', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (typeof valor === 'string') {
            setFormularioEnelInspeccionIntegralHSE(prev => {
                const actualizado = { ...prev };
                if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }
                localStorage.setItem('formularioEnelInspeccionIntegralHSE', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (valor[0].name && valor[0].data) {
            setFormularioEnelInspeccionIntegralHSE((prev) => {
                const actualizado = { ...prev };
                actualizado[nivel1][nivel2] = valor;
                localStorage.setItem(
                    "formularioEnelInspeccionIntegralHSE",
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
            observacionEpp: "",
        };
    });

    const actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE = async (campo, valor) => {

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
            key: "riesgos1",
            texto: "Se identifica todos los riesgos específicos de la actividad en el ARO, está debidamente firmado por todos los integrantes de la cuadrilla.",
            fotoKey: "fotoRiesgos1Obligatoria",
            observacionKey: "observacionRiesgos1",
            activarinput: true,
        },
        {
            key: "riesgos2",
            texto: "Permiso de trabajo aplicable a la actividad, debidamente firmado por todos los integrantes de la cuadrilla, definiendo roles y está autorizado.",
            fotoKey: "fotoRiesgos2Obligatoria",
            observacionKey: "observacionRiesgos2",
            activarinput: true,
        },
        {
            key: "riesgos3",
            texto: "Se identifican y aplican los procedimientos de trabajo acordes a la (s) actividad (es) a realizar.",
            fotoKey: "fotoRiesgos3",
            observacionKey: "observacionRiesgos3",
            activarinput: false,
        },
        {
            key: "riesgos4",
            texto: "Se diligencia el tablero operativo de manera correcta y se instala la respectiva valla de contrato.",
            fotoKey: "fotoRiesgos4Obligatoria",
            observacionKey: "observacionRiesgos4",
            activarinput: true,
        },
        {
            key: "riesgos5",
            texto: "Dispone de los planos o guías de las instalaciones subterráneas, cables, tuberías y otros artículos que interfieran y hay informes disponibles.",
            fotoKey: "fotoRiesgos5",
            observacionKey: "observacionRiesgos5",
            activarinput: false,
        },
        {
            key: "riesgos6",
            texto: "Los cables eléctricos subterráneos y aéreos están protegidos y las distancias de seguridad se respetan de acuerdo con el nivel de voltaje de la red.",
            fotoKey: "fotoRiesgos6",
            observacionKey: "observacionRiesgos6",
            activarinput: false,
        },
        {
            key: "riesgos7",
            texto: "Las condiciones climáticas son adecuadas para realizar las actividades planificadas.",
            fotoKey: "fotoRiesgos7",
            observacionKey: "observacionRiesgos7",
            activarinput: false,
        },
        {
            key: "riesgos8",
            texto: "La dotación, EPP, EPCC se utilizan de forma correcta.",
            fotoKey: "fotoRiesgos8",
            observacionKey: "observacionRiesgos8",
            activarinput: false,
        },
        {
            key: "riesgos9",
            texto: "Cuenta con tapete dieléctrico en buen estado y posee las pruebas de rigidez vigentes.",
            fotoKey: "fotoRiesgos9",
            observacionKey: "observacionRiesgos9",
            activarinput: false,
        },



        {
            key: "senaYDemar1",
            texto: "Protección completa de la zona de trabajo (conos, cintas, corrales).",
            fotoKey: "fotoSenaYDemar1Obligatoria",
            observacionKey: "observacionSenaYDemar1",
            activarinput: true,
        },
        {
            key: "senaYDemar2",
            texto: "Utiliza el PMT correspondiente.",
            fotoKey: "fotoSenaYDemar2",
            observacionKey: "observacionSenaYDemar2",
            activarinput: false,
        },
        {
            key: "senaYDemar3",
            texto: "Se encuentran delimitadas zonas de peligro (huecos zanjas, desniveles, barreno).",
            fotoKey: "fotoSenaYDemar3",
            observacionKey: "observacionSenaYDemar3",
            activarinput: false,
        },



        {
            key: "reglasOro1",
            texto: "Desconexión de la fuente de alimentación y corte efectivo.",
            fotoKey: "fotoReglasOro1",
            observacionKey: "observacionReglasOro1",
            activarinput: false,
        },
        {
            key: "reglasOro2",
            texto: "Bloqueo o condenación y señalización para evitar reconexiones.",
            fotoKey: "fotoReglasOro2",
            observacionKey: "observacionReglasOro2",
            activarinput: false,
        },
        {
            key: "reglasOro3",
            texto: "Verificación de ausencia de tensión.",
            fotoKey: "fotoReglasOro3",
            observacionKey: "observacionReglasOro3",
            activarinput: false,
        },
        {
            key: "reglasOro4",
            texto: "Cortocircuito y llevar a tierra (Puesta a tierra).",
            fotoKey: "fotoReglasOro4",
            observacionKey: "observacionReglasOro4",
            activarinput: false,
        },
        {
            key: "reglasOro5",
            texto: "Protección y señalización de la zona de trabajo (y del electrodo de puesta a tierra).",
            fotoKey: "fotoReglasOro5",
            observacionKey: "observacionReglasOro5",
            activarinput: false,
        },



        {
            key: "trabajoAlturas1",
            texto: "Los sistemas de acceso (escaleras, andamios) disponibles en el sitio son adecuados (completos, marcados, certificados).",
            fotoKey: "fotoTrabajoAlturas1",
            observacionKey: "observacionTrabajoAlturas1",
            activarinput: false,
        },
        {
            key: "trabajoAlturas2",
            texto: "Los sistemas de acceso (escaleras, andamios) están instalados correctamente y se utilizan adecuadamente.",
            fotoKey: "fotoTrabajoAlturas2",
            observacionKey: "observacionTrabajoAlturas2",
            activarinput: false,
        },
        {
            key: "trabajoAlturas3",
            texto: "Se utilizan sistemas de rescate para ascenso y descenso en escalera.",
            fotoKey: "fotoTrabajoAlturas3",
            observacionKey: "observacionTrabajoAlturas3",
            activarinput: false,
        },
        {
            key: "trabajoAlturas4",
            texto: "Las operaciones en altura y de bajada y subida de equipos/materiales se realizan con métodos seguros de protección contra caída de objetos (por ejemplo,cuerdas, polipastos, contenedores especiales, etc.).",
            fotoKey: "fotoTrabajoAlturas4",
            observacionKey: "observacionTrabajoAlturas4",
            activarinput: false,
        },
        {
            key: "trabajoAlturas5",
            texto: "El andamio está correctamente armado, está nivelado y se utiliza adecuadamente.",
            fotoKey: "fotoTrabajoAlturas5",
            observacionKey: "observacionTrabajoAlturas5",
            activarinput: false,
        },
        {
            key: "trabajoAlturas6",
            texto: "El andamio cuenta con las tarjetas de identificación VERDE, AMARILLO O ROJO según corresponda.",
            fotoKey: "fotoTrabajoAlturas6",
            observacionKey: "observacionTrabajoAlturas6",
            activarinput: false,
        },
        {
            key: "trabajoAlturas7",
            texto: "El análisis de la resistencia de la estructura y el sistema de anclaje (en caso de poste, techo, fachada, etc.) que soportan las escaleras o sobre los que se puede pasar se ha realizado positivamente de acuerdo con los procedimientos internos.",
            fotoKey: "fotoTrabajoAlturas7",
            observacionKey: "observacionTrabajoAlturas7",
            activarinput: false,
        },



        {
            key: "espacioConfinado1",
            texto: "Se realiza la mediciones atmosféricas necesarias y están debidamente registradas.",
            fotoKey: "fotoEspacioConfinado1",
            observacionKey: "observacionEspacioConfinado1",
            activarinput: false,
        },
        {
            key: "espacioConfinado2",
            texto: "Existe ventilación natural o se cuenta con un sistema de ventilación forzada (en caso de sitios con una  renovación del aire inadecuado).",
            fotoKey: "fotoEspacioConfinado2",
            observacionKey: "observacionEspacioConfinado2",
            activarinput: false,
        },
        {
            key: "espacioConfinado3",
            texto: "La comunicación correcta (es decir, se cuenta con un vigia al exterior del EC).",
            fotoKey: "fotoEspacioConfinado3",
            observacionKey: "observacionEspacioConfinado3",
            activarinput: false,
        },



        {
            key: "vehiculos1",
            texto: "Traslado del personal en vehículos en sitios autorizados y cumpliendo con las normas de transito local.",
            fotoKey: "fotoVehiculos1",
            observacionKey: "observacionVehiculos1",
            activarinput: false,
        },
        {
            key: "vehiculos2",
            texto: "Tiene   documentación   actualizada   (SOAT,  LICENCIA DE TRÁNSITO, LICENCIA DE CONDUCCIÓN, TECNOMECÁNICA Y SEGUROS CONTRACTUALES).",
            fotoKey: "fotoVehiculos2",
            observacionKey: "observacionVehiculos2",
            activarinput: false,
        },
        {
            key: "vehiculos3",
            texto: "El vehículo cuenta con equipo de carretera (Botiquín, Extintor, Tacos, Gato, Cruceta, triángulo y herramientas).",
            fotoKey: "fotoVehiculos3",
            observacionKey: "observacionVehiculos3",
            activarinput: false,
        },
        {
            key: "vehiculos4",
            texto: "El  vehículo con el cual se moviliza la cuadrilla evaluada, se encuentra en buen estado.",
            fotoKey: "fotoVehiculos4",
            observacionKey: "observacionVehiculos4",
            activarinput: false,
        },
        {
            key: "vehiculos5",
            texto: "El vehículo cuenta con inspección preoperacional.",
            fotoKey: "fotoVehiculos5",
            observacionKey: "observacionVehiculos5",
            activarinput: false,
        },
        {
            key: "vehiculos6",
            texto: "El vehículo utilizado para el izaje de cargas cuenta con pruebas vigentes (Izaje- Rigidez dieléctrica).",
            fotoKey: "fotoVehiculos6",
            observacionKey: "observacionVehiculos6",
            activarinput: false,
        },
        {
            key: "vehiculos7",
            texto: "El vehículo de izaje  utilizado  para la tarea  cuenta con aparejos en buen estado y certificados.",
            fotoKey: "fotoVehiculos7",
            observacionKey: "observacionVehiculos7",
            activarinput: false,
        },
        {
            key: "vehiculos8",
            texto: "Se realiza y documenta el plan de izaje  según la carga a levantar.",
            fotoKey: "fotoVehiculos8",
            observacionKey: "observacionVehiculos8",
            activarinput: false,
        },
        {
            key: "vehiculos9",
            texto: "Se evita el desplazamiento de cargas sobre personas o personas sobre la carga.",
            fotoKey: "fotoVehiculos9",
            observacionKey: "observacionVehiculos9",
            activarinput: false,
        },
        {
            key: "vehiculos10",
            texto: "Los estabilizadores de la máquina se utilizan correctamente y se respetan los diagramas de  carga.",
            fotoKey: "fotoVehiculos10",
            observacionKey: "observacionVehiculos10",
            activarinput: false,
        },



        {
            key: "trabajo1",
            texto: "Durante las etapas de la actividad se mantiene ordenado y aseado el lugar de trabajo.",
            fotoKey: "fotoTrabajo1",
            observacionKey: "observacionTrabajo1",
            activarinput: false,
        },
        {
            key: "trabajo2",
            texto: "Medios de comunicación existentes.",
            fotoKey: "fotoTrabajo2",
            observacionKey: "observacionTrabajo2",
            activarinput: false,
        },
        {
            key: "trabajo3",
            texto: "Colaboradores en condiciones físicas adecuadas. En caso de horas de trabajo prolongadas, los trabajadores toman descansos cortos a intervalos regulares.",
            fotoKey: "fotoTrabajo3",
            observacionKey: "observacionTrabajo3",
            activarinput: false,
        },
        {
            key: "trabajo4",
            texto: "El área cuenta con fuentes de iluminación adecuadas para las actividades que se realizan.",
            fotoKey: "fotoTrabajo4",
            observacionKey: "observacionTrabajo4",
            activarinput: false,
        },



        {
            key: "materiales1",
            texto: "Utiliza los materiales indicados.",
            fotoKey: "fotoMateriales1",
            observacionKey: "observacionMateriales1",
            activarinput: false,
        },
        {
            key: "materiales2",
            texto: "Utiliza  los  equipos  indicados  en  buen  estado  y  normalizados  (pértigas,  probador  ausencia  de tensión,  puesta a tierra BT-MT, Pinza voltiamperimétrica).",
            fotoKey: "fotoMateriales2",
            observacionKey: "observacionMateriales2",
            activarinput: false,
        },
        {
            key: "materiales3",
            texto: "Utiliza las herramientas indicadas según su diseño y están en buen estado.",
            fotoKey: "fotoMateriales3",
            observacionKey: "observacionMateriales3",
            activarinput: false,
        },



        {
            key: "primerosAuxilios1",
            texto: "En  el  lugar  de  trabajo  existe  extintor  adecuado  a  la  clase  de  fuego,  está presurizado, con etiquetas vigentes y legibles.",
            fotoKey: "fotoPrimerosAuxilios1",
            observacionKey: "observacionPrimerosAuxilios1",
            activarinput: false,
        },
        {
            key: "primerosAuxilios2",
            texto: "Posee botiquín de primeros auxilios en buen estado completo y vigente.",
            fotoKey: "fotoPrimerosAuxilios2",
            observacionKey: "observacionPrimerosAuxilios2",
            activarinput: false,
        },
        {
            key: "primerosAuxilios3",
            texto: "Los botiquines son de fácil acceso y cuentan con elementos necesarios para aplicar un primer auxilio.",
            fotoKey: "fotoPrimerosAuxilios3",
            observacionKey: "observacionPrimerosAuxilios3",
            activarinput: false,
        },
        {
            key: "primerosAuxilios4",
            texto: "Sabe o conoce como actuar en caso de emergencias, accidentes o incidentes de trabajo o emergencia ambiental.",
            fotoKey: "fotoPrimerosAuxilios4",
            observacionKey: "observacionPrimerosAuxilios4",
            activarinput: false,
        },
        {
            key: "primerosAuxilios5",
            texto: "Se pueden encontrar fácilmente áreas seguras en caso de emergencia.",
            fotoKey: "fotoPrimerosAuxilios5",
            observacionKey: "observacionPrimerosAuxilios5",
            activarinput: false,
        },



        {
            key: "biomecanicos1",
            texto: "Cumple   con   los    lineamientos     de   manejo,   manipulación    de   cargas   y  posturas   adecuadas.  (Calistenia-pausas activas).",
            fotoKey: "fotoBiomecanicos1",
            observacionKey: "observacionBiomecanicos1",
            activarinput: false,
        },
        {
            key: "biomecanicos2",
            texto: "Se cuenta con los elementos adecuados para el levantamiento de tapas y se realiza con mínimo 3 personas.",
            fotoKey: "fotoBiomecanicos2",
            observacionKey: "observacionBiomecanicos2",
            activarinput: false,
        },
        {
            key: "biomecanicos3",
            texto: "Uso ayudas mecánicas para la manipulación manual de cargas (por ejemplo, carretillas, estibadores, polipastos, etc.)",
            fotoKey: "fotoBiomecanicos3",
            observacionKey: "observacionBiomecanicos3",
            activarinput: false,
        },



        {
            key: "quimicos1",
            texto: "Se cuenta con las Fichas de Datos de Seguridad de los productos químicos.",
            fotoKey: "fotoQuimicos1",
            observacionKey: "observacionQuimicos1",
            activarinput: false,
        },
        {
            key: "quimicos2",
            texto: "Se cuenta con el kit completo para manejo de derrames de productos químicos.",
            fotoKey: "fotoQuimicos2",
            observacionKey: "observacionQuimicos2",
            activarinput: false,
        },
        {
            key: "quimicos3",
            texto: "Cuenta con rotulación (SGA) para los productos químicos.",
            fotoKey: "fotoQuimicos3",
            observacionKey: "observacionQuimicos3",
            activarinput: false,
        },
        {
            key: "quimicos4",
            texto: "Vehículos, maquinaria y equipos sin fuga de aceites, combustibles u otros fluidos hidráulicos.",
            fotoKey: "fotoQuimicos4",
            observacionKey: "observacionQuimicos4",
            activarinput: false,
        },
        {
            key: "quimicos5",
            texto: "Se recolectan, almacenan, rotulan y se transportan de forma segura los residuos peligrosos (envases químicos, residuos aceitosos, entre otros).",
            fotoKey: "fotoQuimicos5",
            observacionKey: "observacionQuimicos5",
            activarinput: false,
        },


        {
            key: "residuosNoPeligrosos1",
            texto: "Separación o clasificación adecuada de los residuos, según código de colores establecido.",
            fotoKey: "fotoResiduosNoPeligrosos1",
            observacionKey: "observacionResiduosNoPeligrosos1",
            activarinput: false,
        },
        {
            key: "residuosNoPeligrosos2",
            texto: "Se encuentra el vehículo en condiciones optimas de orden y aseo (limpio y ordenado).",
            fotoKey: "fotoResiduosNoPeligrosos2",
            observacionKey: "observacionResiduosNoPeligrosos2",
            activarinput: false,
        },
        {
            key: "residuosNoPeligrosos3",
            texto: "Se garantiza la limpieza de la zona de trabajo luego de la ejecución de la labor y la disposición final adecuada de los residuos.",
            fotoKey: "fotoResiduosNoPeligrosos3",
            observacionKey: "observacionResiduosNoPeligrosos3",
            activarinput: false,
        },



        {
            key: "residuosConstruccion1",
            texto: "Las actividades se llevan a cabo de conformidad con las autorizaciones obtenidas según la legislación local y en relación con los límites/requisitos ambientales específicos del sitio/obra (por ejemplo, PIN de RCD, licencias de intervención, emisiones, descargas de agua, ruido, etc.).",
            fotoKey: "fotoResiduosConstruccion1",
            observacionKey: "observacionResiduosConstruccion1",
            activarinput: false,
        },
        {
            key: "residuosConstruccion2",
            texto: "El almacenamiento temporal es adecuado, ubicado dentro de la zona de trabajo, no se obstruyen los senderos peatonales y/o vías.",
            fotoKey: "fotoResiduosConstruccion2",
            observacionKey: "observacionResiduosConstruccion2",
            activarinput: false,
        },
        {
            key: "residuosConstruccion3",
            texto: "Se  protegen las zonas verdes, sumideros y se controla el material particulado.",
            fotoKey: "fotoResiduosConstruccion3",
            observacionKey: "observacionResiduosConstruccion3",
            activarinput: false,
        },
        {
            key: "residuosConstruccion4",
            texto: "Las actividades se realizan de una forma que evite el riesgo de colapso o fallo de las estructuras/terrenos (por ejemplo, entibado).",
            fotoKey: "fotoResiduosConstruccion4",
            observacionKey: "observacionResiduosConstruccion4",
            activarinput: false,
        },
    ];

    const validarMiembroEnProceso = (miembro) => {
        if (!miembro.cedula) { toast.error('Por favor diligencie la cedula.'); return false }
        if (!miembro.nombre || miembro.nombre === 'Usuario no encontrado') { toast.error('Por favor ingrese un usuario valido.'); return false }
        if (!miembro.cargo || miembro.cargo === 'Cargo no encontrado') { toast.error('Por favor ingrese un usuario valido.'); return false }
        if (!miembro.arl) { toast.error('Por favor diligencie la arl.'); return false }
        if (!miembro.tarjetaDeVida) { toast.error('Por favor diligencie la tarjeta de vida.'); return false }
        if (!miembro.carneCliente) { toast.error('Por favor diligencie el carne cliente.'); return false }
        if (!miembro.carneSicte) { toast.error('Por favor diligencie el carne sicte.'); return false }
        if (!miembro.fotoDocumentos) { toast.error('Por favor ingrese la foto de los documentos.'); return false }
        if (!miembro.observacionDocumentos && (miembro.arl === 'NC' || miembro.tarjetaDeVida === 'NC' || miembro.carneCliente === 'NC' || miembro.carneSicte === 'NC')) { toast.error('Por favor diligencie la observacion de los documentos.'); return false }
        if (!miembro.eppCasco) { toast.error('Por favor diligencie el EPP - Casco.'); return false }
        if (!miembro.fotoEppCasco && miembro.eppCasco === 'NC') { toast.error('Por favor ingrese la foto del EPP - Casco.'); return false }
        if (!miembro.eppGuantes) { toast.error('Por favor diligencie el EPP - Guantes.'); return false }
        if (!miembro.fotoEppGuantes && miembro.eppGuantes === 'NC') { toast.error('Por favor ingrese la foto del EPP - Guantes.'); return false }
        if (!miembro.eppGuantesDielectricos) { toast.error('Por favor diligencie el EPP - Guantes Dielectricos.'); return false }
        if (!miembro.fotoEppGuantesDielectricos && miembro.eppGuantesDielectricos === 'NC') { toast.error('Por favor ingrese la foto del EPP - Guantes Dielectricos.'); return false }
        if (!miembro.eppProteccionFacialAntiArco) { toast.error('Por favor diligencie el EPP - Proteccion Facial Anti Arco.'); return false }
        if (!miembro.fotoEppProteccionFacialAntiArco && miembro.eppProteccionFacialAntiArco === 'NC') { toast.error('Por favor ingrese la foto del EPP - Proteccion Facial Anti Arco.'); return false }
        if (!miembro.eppEquiposContraCaidas) { toast.error('Por favor diligencie el EPP - Equipos Contra Caidas.'); return false }
        if (!miembro.fotoEppEquiposContraCaidas && miembro.eppEquiposContraCaidas === 'NC') { toast.error('Por favor ingrese la foto del EPP - Equipos Contra Caidas.'); return false }
        if (!miembro.eppOverolObraCivil) { toast.error('Por favor diligencie el EPP - Overol Obra Civil.'); return false }
        if (!miembro.fotoEppOverolObraCivil && miembro.eppOverolObraCivil === 'NC') { toast.error('Por favor ingrese la foto del EPP - Overol Obra Civil.'); return false }
        if (!miembro.eppOverolIgnifugo) { toast.error('Por favor diligencie el EPP - Overol Ignifugo.'); return false }
        if (!miembro.fotoEppOverolIgnifugo && miembro.eppOverolIgnifugo === 'NC') { toast.error('Por favor ingrese la foto del EPP - Overol Ignifugo.'); return false }
        if (!miembro.eppGafasDeSeguridad) { toast.error('Por favor diligencie el EPP - Gafas De Seguridad.'); return false }
        if (!miembro.fotoEppGafasDeSeguridad && miembro.eppGafasDeSeguridad === 'NC') { toast.error('Por favor ingrese la foto del EPP - Gafas De Seguridad.'); return false }
        if (!miembro.eppTapabocas) { toast.error('Por favor diligencie el EPP - Tapabocas.'); return false }
        if (!miembro.fotoEppTapabocas && miembro.eppTapabocas === 'NC') { toast.error('Por favor ingrese la foto del EPP - Tapabocas.'); return false }
        if (!miembro.eppBotas) { toast.error('Por favor diligencie el EPP - Botas.'); return false }
        if (!miembro.fotoEppBotas && miembro.eppBotas === 'NC') { toast.error('Por favor ingrese la foto del EPP - Botas.'); return false }
        if (!miembro.observacionEpp && (miembro.eppCasco === 'NC' || miembro.eppGuantes === 'NC' || miembro.eppGuantesDielectricos === 'NC' || miembro.eppProteccionFacialAntiArco === 'NC' || miembro.eppEquiposContraCaidas === 'NC' || miembro.eppOverolObraCivil === 'NC' || miembro.eppOverolIgnifugo === 'NC' || miembro.eppGafasDeSeguridad === 'NC' || miembro.eppTapabocas === 'NC' || miembro.eppBotas === 'NC')) { toast.error('Por favor diligencie la observacion de los epps.'); return false }
    }

    const validarFormularioEnelInspeccionIntegralHSE = (formulario) => {
        if (!formulario.tipoInspeccion) { toast.error('Por favor diligencie el tipo de inspeccion.'); return false }
        if (!cedulaUsuario) { toast.error('Por favor diligencie inicie sesion ya que no existe usuario.'); return false }
        if (!nombreUsuario) { toast.error('Por favor diligencie inicie sesion ya que no existe usuario.'); return false }
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
        if (!formulario.zona) { toast.error('Por favor diligencie la zona.'); return false }
        if (!formulario.trabajo) { toast.error('Por favor diligencie el trabajo a realizar.'); return false }
        if (!Array.isArray(formulario.cuadrilla)) { toast.error('Por favor diligencie al menos dos personas en la cuadrilla.'); return false }
        const personasConCedula = formulario.cuadrilla.filter(persona => persona.cedula && persona.cedula.trim() !== '');
        if (personasConCedula.length < 2) { toast.error('Debe haber al menos dos personas en la cuadrilla.'); return false }
        if (!formulario.riesgos.riesgos1 || !formulario.riesgos.riesgos2 || !formulario.riesgos.riesgos3 || !formulario.riesgos.riesgos4 || !formulario.riesgos.riesgos5 || !formulario.riesgos.riesgos6 || !formulario.riesgos.riesgos7 || !formulario.riesgos.riesgos8 || !formulario.riesgos.riesgos9) { toast.error('Por favor diligencie el capitulo 1 completo.'); return false }
        if ((!formulario.riesgos.fotoRiesgos1Obligatoria && formulario.riesgos.riesgos1 !== 'NA') || (!formulario.riesgos.fotoRiesgos2Obligatoria && formulario.riesgos.riesgos2 !== 'NA') || (!formulario.riesgos.fotoRiesgos4Obligatoria && formulario.riesgos.riesgos4 !== 'NA')) { toast.error('Por favor ingrese las fotos obligatorias en el capitulo 1.'); return false }
        if (!formulario.riesgos.observacionRiesgos1 && formulario.riesgos.riesgos1 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if (!formulario.riesgos.observacionRiesgos2 && formulario.riesgos.riesgos2 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.riesgos.observacionRiesgos3 || !formulario.riesgos.fotoRiesgos3) && formulario.riesgos.riesgos3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.riesgos.observacionRiesgos4 && formulario.riesgos.riesgos4 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.riesgos.observacionRiesgos5 || !formulario.riesgos.fotoRiesgos5) && formulario.riesgos.riesgos5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if ((!formulario.riesgos.observacionRiesgos6 || !formulario.riesgos.fotoRiesgos6) && formulario.riesgos.riesgos6 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 6.'); return false }
        if ((!formulario.riesgos.observacionRiesgos7 || !formulario.riesgos.fotoRiesgos7) && formulario.riesgos.riesgos7 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 7.'); return false }
        if ((!formulario.riesgos.observacionRiesgos8 || !formulario.riesgos.fotoRiesgos8) && formulario.riesgos.riesgos8 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 8.'); return false }
        if ((!formulario.riesgos.observacionRiesgos9 || !formulario.riesgos.fotoRiesgos9) && formulario.riesgos.riesgos9 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 1 cuando su respuesta es No Cumple en la pregunta 9.'); return false }
        if (!formulario.senaYDemar.senaYDemar1 || !formulario.senaYDemar.senaYDemar2 || !formulario.senaYDemar.senaYDemar3) { toast.error('Por favor diligencie el capitulo 2 completo.'); return false }
        if (!formulario.senaYDemar.fotoSenaYDemar1Obligatoria && formulario.senaYDemar.senaYDemar1 !== 'NA') { toast.error('Por favor ingrese las fotos obligatorias en el capitulo 2.'); return false }
        if (!formulario.senaYDemar.observacionSenaYDemar1 && formulario.senaYDemar.senaYDemar1 === 'NC') { toast.error('Por favor ingrese la observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.senaYDemar.observacionSenaYDemar2 || !formulario.senaYDemar.fotoSenaYDemar2) && formulario.senaYDemar.senaYDemar2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.senaYDemar.observacionSenaYDemar3 || !formulario.senaYDemar.fotoSenaYDemar3) && formulario.senaYDemar.senaYDemar3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 2 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.reglasOro.reglasOro1 || !formulario.reglasOro.reglasOro2 || !formulario.reglasOro.reglasOro3 || !formulario.reglasOro.reglasOro4 || !formulario.reglasOro.reglasOro5) { toast.error('Por favor diligencie el capitulo 3 completo.'); return false }
        if ((!formulario.reglasOro.observacionReglasOro1 || !formulario.reglasOro.fotoReglasOro1) && formulario.reglasOro.reglasOro1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.reglasOro.observacionReglasOro2 || !formulario.reglasOro.fotoReglasOro2) && formulario.reglasOro.reglasOro2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.reglasOro.observacionReglasOro3 || !formulario.reglasOro.fotoReglasOro3) && formulario.reglasOro.reglasOro3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.reglasOro.observacionReglasOro4 || !formulario.reglasOro.fotoReglasOro4) && formulario.reglasOro.reglasOro4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.reglasOro.observacionReglasOro5 || !formulario.reglasOro.fotoReglasOro5) && formulario.reglasOro.reglasOro5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 3 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if (!formulario.trabajoAlturas.trabajoAlturas1 || !formulario.trabajoAlturas.trabajoAlturas2 || !formulario.trabajoAlturas.trabajoAlturas3 || !formulario.trabajoAlturas.trabajoAlturas4 || !formulario.trabajoAlturas.trabajoAlturas5 || !formulario.trabajoAlturas.trabajoAlturas6 || !formulario.trabajoAlturas.trabajoAlturas7) { toast.error('Por favor diligencie el capitulo 4 completo.'); return false }
        if ((!formulario.trabajoAlturas.observacionTrabajoAlturas1 || !formulario.trabajoAlturas.fotoTrabajoAlturas1) && formulario.trabajoAlturas.trabajoAlturas1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.trabajoAlturas.observacionTrabajoAlturas2 || !formulario.trabajoAlturas.fotoTrabajoAlturas2) && formulario.trabajoAlturas.trabajoAlturas2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.trabajoAlturas.observacionTrabajoAlturas3 || !formulario.trabajoAlturas.fotoTrabajoAlturas3) && formulario.trabajoAlturas.trabajoAlturas3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.trabajoAlturas.observacionTrabajoAlturas4 || !formulario.trabajoAlturas.fotoTrabajoAlturas4) && formulario.trabajoAlturas.trabajoAlturas4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.trabajoAlturas.observacionTrabajoAlturas5 || !formulario.trabajoAlturas.fotoTrabajoAlturas5) && formulario.trabajoAlturas.trabajoAlturas5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if ((!formulario.trabajoAlturas.observacionTrabajoAlturas6 || !formulario.trabajoAlturas.fotoTrabajoAlturas6) && formulario.trabajoAlturas.trabajoAlturas6 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 6.'); return false }
        if ((!formulario.trabajoAlturas.observacionTrabajoAlturas7 || !formulario.trabajoAlturas.fotoTrabajoAlturas7) && formulario.trabajoAlturas.trabajoAlturas7 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 4 cuando su respuesta es No Cumple en la pregunta 7.'); return false }
        if (!formulario.espacioConfinado.espacioConfinado1 || !formulario.espacioConfinado.espacioConfinado2 || !formulario.espacioConfinado.espacioConfinado3) { toast.error('Por favor diligencie el capitulo 5 completo.'); return false }
        if ((!formulario.espacioConfinado.observacionEspacioConfinado1 || !formulario.espacioConfinado.fotoEspacioConfinado1) && formulario.espacioConfinado.espacioConfinado1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 5 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.espacioConfinado.observacionEspacioConfinado2 || !formulario.espacioConfinado.fotoEspacioConfinado2) && formulario.espacioConfinado.espacioConfinado2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 5 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.espacioConfinado.observacionEspacioConfinado3 || !formulario.espacioConfinado.fotoEspacioConfinado3) && formulario.espacioConfinado.espacioConfinado3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 5 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.vehiculos.vehiculos1 || !formulario.vehiculos.vehiculos2 || !formulario.vehiculos.vehiculos3 || !formulario.vehiculos.vehiculos4 || !formulario.vehiculos.vehiculos5 || !formulario.vehiculos.vehiculos6 || !formulario.vehiculos.vehiculos7 || !formulario.vehiculos.vehiculos8 || !formulario.vehiculos.vehiculos9 || !formulario.vehiculos.vehiculos10) { toast.error('Por favor diligencie el capitulo 6 completo.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos1 || !formulario.vehiculos.fotoVehiculos1) && formulario.vehiculos.vehiculos1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos2 || !formulario.vehiculos.fotoVehiculos2) && formulario.vehiculos.vehiculos2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos3 || !formulario.vehiculos.fotoVehiculos3) && formulario.vehiculos.vehiculos3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos4 || !formulario.vehiculos.fotoVehiculos4) && formulario.vehiculos.vehiculos4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos5 || !formulario.vehiculos.fotoVehiculos5) && formulario.vehiculos.vehiculos5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos6 || !formulario.vehiculos.fotoVehiculos6) && formulario.vehiculos.vehiculos6 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 6.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos7 || !formulario.vehiculos.fotoVehiculos7) && formulario.vehiculos.vehiculos7 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 7.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos8 || !formulario.vehiculos.fotoVehiculos8) && formulario.vehiculos.vehiculos8 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 8.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos9 || !formulario.vehiculos.fotoVehiculos9) && formulario.vehiculos.vehiculos9 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 9.'); return false }
        if ((!formulario.vehiculos.observacionVehiculos10 || !formulario.vehiculos.fotoVehiculos10) && formulario.vehiculos.vehiculos10 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 6 cuando su respuesta es No Cumple en la pregunta 10.'); return false }
        if (!formulario.condicionesTrabajo.trabajo1 || !formulario.condicionesTrabajo.trabajo2 || !formulario.condicionesTrabajo.trabajo3) { toast.error('Por favor diligencie el capitulo 7 completo.'); return false }
        if ((!formulario.condicionesTrabajo.observacionTrabajo1 || !formulario.condicionesTrabajo.fotoTrabajo1) && formulario.condicionesTrabajo.trabajo1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 7 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.condicionesTrabajo.observacionTrabajo2 || !formulario.condicionesTrabajo.fotoTrabajo2) && formulario.condicionesTrabajo.trabajo2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 7 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.condicionesTrabajo.observacionTrabajo3 || !formulario.condicionesTrabajo.fotoTrabajo3) && formulario.condicionesTrabajo.trabajo3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 7 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.condicionesTrabajo.observacionTrabajo4 || !formulario.condicionesTrabajo.fotoTrabajo4) && formulario.condicionesTrabajo.trabajo4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 7 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if (!formulario.materiales.materiales1 || !formulario.materiales.materiales2 || !formulario.materiales.materiales3) { toast.error('Por favor diligencie el capitulo 8 completo.'); return false }
        if ((!formulario.materiales.observacionMateriales1 || !formulario.materiales.fotoMateriales1) && formulario.materiales.materiales1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 8 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.materiales.observacionMateriales2 || !formulario.materiales.fotoMateriales2) && formulario.materiales.materiales2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 8 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.materiales.observacionMateriales3 || !formulario.materiales.fotoMateriales3) && formulario.materiales.materiales3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 8 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.primerosAuxilios.primerosAuxilios1 || !formulario.primerosAuxilios.primerosAuxilios2 || !formulario.primerosAuxilios.primerosAuxilios3 || !formulario.primerosAuxilios.primerosAuxilios4 || !formulario.primerosAuxilios.primerosAuxilios5) { toast.error('Por favor diligencie el capitulo 9 completo.'); return false }
        if ((!formulario.primerosAuxilios.observacionPrimerosAuxilios1 || !formulario.primerosAuxilios.fotoPrimerosAuxilios1) && formulario.primerosAuxilios.primerosAuxilios1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 9 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.primerosAuxilios.observacionPrimerosAuxilios2 || !formulario.primerosAuxilios.fotoPrimerosAuxilios2) && formulario.primerosAuxilios.primerosAuxilios2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 9 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.primerosAuxilios.observacionPrimerosAuxilios3 || !formulario.primerosAuxilios.fotoPrimerosAuxilios3) && formulario.primerosAuxilios.primerosAuxilios3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 9 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.primerosAuxilios.observacionPrimerosAuxilios4 || !formulario.primerosAuxilios.fotoPrimerosAuxilios4) && formulario.primerosAuxilios.primerosAuxilios4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 9 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.primerosAuxilios.observacionPrimerosAuxilios5 || !formulario.primerosAuxilios.fotoPrimerosAuxilios5) && formulario.primerosAuxilios.primerosAuxilios5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 9 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if (!formulario.biomecanicos.biomecanicos1 || !formulario.biomecanicos.biomecanicos2 || !formulario.biomecanicos.biomecanicos3) { toast.error('Por favor diligencie el capitulo 10 completo.'); return false }
        if ((!formulario.biomecanicos.observacionBiomecanicos1 || !formulario.biomecanicos.fotoBiomecanicos1) && formulario.biomecanicos.biomecanicos1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 10 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.biomecanicos.observacionBiomecanicos2 || !formulario.biomecanicos.fotoBiomecanicos2) && formulario.biomecanicos.biomecanicos2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 10 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.biomecanicos.observacionBiomecanicos3 || !formulario.biomecanicos.fotoBiomecanicos3) && formulario.biomecanicos.biomecanicos3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 10 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.quimicos.quimicos1 || !formulario.quimicos.quimicos2 || !formulario.quimicos.quimicos3 || !formulario.quimicos.quimicos4 || !formulario.quimicos.quimicos5) { toast.error('Por favor diligencie el capitulo 11 completo.'); return false }
        if ((!formulario.quimicos.observacionQuimicos1 || !formulario.quimicos.fotoQuimicos1) && formulario.quimicos.quimicos1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 11 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.quimicos.observacionQuimicos2 || !formulario.quimicos.fotoQuimicos2) && formulario.quimicos.quimicos2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 11 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.quimicos.observacionQuimicos3 || !formulario.quimicos.fotoQuimicos3) && formulario.quimicos.quimicos3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 11 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.quimicos.observacionQuimicos4 || !formulario.quimicos.fotoQuimicos4) && formulario.quimicos.quimicos4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 11 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if ((!formulario.quimicos.observacionQuimicos5 || !formulario.quimicos.fotoQuimicos5) && formulario.quimicos.quimicos5 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 11 cuando su respuesta es No Cumple en la pregunta 5.'); return false }
        if (!formulario.residuosNoPeligrosos.residuosNoPeligrosos1 || !formulario.residuosNoPeligrosos.residuosNoPeligrosos2 || !formulario.residuosNoPeligrosos.residuosNoPeligrosos3) { toast.error('Por favor diligencie el capitulo 12 completo.'); return false }
        if ((!formulario.residuosNoPeligrosos.observacionResiduosNoPeligrosos1 || !formulario.residuosNoPeligrosos.fotoResiduosNoPeligrosos1) && formulario.residuosNoPeligrosos.residuosNoPeligrosos1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 12 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.residuosNoPeligrosos.observacionResiduosNoPeligrosos2 || !formulario.residuosNoPeligrosos.fotoResiduosNoPeligrosos2) && formulario.residuosNoPeligrosos.residuosNoPeligrosos2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 12 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.residuosNoPeligrosos.observacionResiduosNoPeligrosos3 || !formulario.residuosNoPeligrosos.fotoResiduosNoPeligrosos3) && formulario.residuosNoPeligrosos.residuosNoPeligrosos3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 12 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if (!formulario.residuosConstruccion.residuosConstruccion1 || !formulario.residuosConstruccion.residuosConstruccion2 || !formulario.residuosConstruccion.residuosConstruccion3 || !formulario.residuosConstruccion.residuosConstruccion4) { toast.error('Por favor diligencie el capitulo 13 completo.'); return false }
        if ((!formulario.residuosConstruccion.observacionResiduosConstruccion1 || !formulario.residuosConstruccion.fotoResiduosConstruccion1) && formulario.residuosConstruccion.residuosConstruccion1 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 13 cuando su respuesta es No Cumple en la pregunta 1.'); return false }
        if ((!formulario.residuosConstruccion.observacionResiduosConstruccion2 || !formulario.residuosConstruccion.fotoResiduosConstruccion2) && formulario.residuosConstruccion.residuosConstruccion2 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 13 cuando su respuesta es No Cumple en la pregunta 2.'); return false }
        if ((!formulario.residuosConstruccion.observacionResiduosConstruccion3 || !formulario.residuosConstruccion.fotoResiduosConstruccion3) && formulario.residuosConstruccion.residuosConstruccion3 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 13 cuando su respuesta es No Cumple en la pregunta 3.'); return false }
        if ((!formulario.residuosConstruccion.observacionResiduosConstruccion4 || !formulario.residuosConstruccion.fotoResiduosConstruccion4) && formulario.residuosConstruccion.residuosConstruccion4 === 'NC') { toast.error('Por favor ingrese la foto y observacion correspondiente en el capitulo 13 cuando su respuesta es No Cumple en la pregunta 4.'); return false }
        if (!formulario.observacion) { toast.error('Por favor diligencie la observacion general.'); return false }
    }

    return (
        <div className="SupervisionFormularioEnelIntegral">
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
                        <Textos className='titulo'>Enel - Inspeccion Integral HSE</Textos>
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
                            <Selectores value={formularioEnelInspeccionIntegralHSE.tipoInspeccion} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('tipoInspeccion', e.target.value)}
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
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese el nombre del Proyecto" value={formularioEnelInspeccionIntegralHSE.nombreProyecto} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('nombreProyecto', e.target.value)} />
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
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la direccion" value={formularioEnelInspeccionIntegralHSE.direccion}
                                onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('direccion', e.target.value)} />
                        </div>
                    </div>

                    <div className='campo ciudad'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Ciudad:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la ciudad" value={formularioEnelInspeccionIntegralHSE.ciudad} onChange={(e) => {
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
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese el nombre del Proyecto" value={formularioEnelInspeccionIntegralHSE.opOt} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('opOt', e.target.value)} />
                        </div>
                    </div>

                    <div className='campo supervisor'>
                        <i className="fas fa-users-cog"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Supervisor técnico encargado:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la cedula del supervisor tecnico" value={formularioEnelInspeccionIntegralHSE.cedulaSupervisorTecnico} onChange={(e) => {
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
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la cedula del lider de cuadrilla" value={formularioEnelInspeccionIntegralHSE.cedulaLiderEncargado} onChange={(e) => {
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
                            <Selectores disabled={modo === "editar"} value={formularioEnelInspeccionIntegralHSE.proceso} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('proceso', e.target.value)}
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
                                disabled={modo === "editar"}
                            />
                        </div>
                    </div>

                    <div className='campo zona'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Zona:</Textos>
                            <Selectores disabled={modo === "editar"} value={formularioEnelInspeccionIntegralHSE.zona} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('zona', e.target.value)}
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
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese el trabajo a realizar" value={formularioEnelInspeccionIntegralHSE.trabajo} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('trabajo', e.target.value)} />
                        </div>
                    </div>

                    <div className='campo cuadrilla'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Datos Cuadrilla:</Textos>
                            <div className='botonAgregar'>
                                <Botones disabled={modo === "editar"} className='agregar' onClick={() => {
                                    setAccionModalTabla("crear");
                                    const existe = (formularioEnelInspeccionIntegralHSE.cuadrilla || []).some(m => m.cedula === miembroEnProceso.cedula);
                                    if (existe) {
                                        setMiembroEnProceso({});
                                    }
                                    setMostrarModal(true);
                                }}>Agregar</Botones>
                            </div>
                        </div>
                    </div>

                    <div className='Tabla'>
                        <Tablas columnas={columnas} datos={formularioEnelInspeccionIntegralHSE.cuadrilla} filasPorPagina={5}
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
                                    <Textos className='subtitulo encabezado'>1. Datos Personales:</Textos>
                                    <div className='entradaDatos'>
                                        <Textos className='subtitulo'>Cedula:</Textos>
                                        <Entradas type="text" placeholder="Cédula" value={miembroEnProceso.cedula || ""}
                                            onChange={(e) => {
                                                const valor = e.target.value;
                                                const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                                actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('cedula', valor);
                                                actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('nombre', registroEncontrado ? registroEncontrado.nombre : 'Usuario no encontrado');
                                                actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('cargo', registroEncontrado ? registroEncontrado.cargo : 'Cargo no encontrado');
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
                                    <Textos className='subtitulo encabezado'>2. Documentos:</Textos>
                                    <div className='entradaDatos'>
                                        <Textos className='subtitulo'>ARL:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('arl', 'C')} className={miembroEnProceso.arl === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('arl', 'NC')} className={miembroEnProceso.arl === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos'>
                                        <Textos className='subtitulo'>Tarjeta de vida:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('tarjetaDeVida', 'C')} className={miembroEnProceso.tarjetaDeVida === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('tarjetaDeVida', 'NC')} className={miembroEnProceso.tarjetaDeVida === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos'>
                                        <Textos className='subtitulo'>Carné Cliente:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('carneCliente', 'C')} className={miembroEnProceso.carneCliente === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('carneCliente', 'NC')} className={miembroEnProceso.carneCliente === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos'>
                                        <Textos className='subtitulo'>Carné Sicte:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('carneSicte', 'C')} className={miembroEnProceso.carneSicte === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('carneSicte', 'NC')} className={miembroEnProceso.carneSicte === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Ingrese la foto de los documentos:</Textos>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} fotoKey={'fotoDocumentos'} foto={miembroEnProceso.fotoDocumentos} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className={`entradaDatos vertical observacion' ${miembroEnProceso.arl !== 'NC' && miembroEnProceso.tarjetaDeVida !== 'NC' && miembroEnProceso.carneCliente !== 'NC' && miembroEnProceso.carneSicte !== 'NC' ? 'ocultar' : ''}`}>
                                        <Textos className='subtitulo'>Observaciones:</Textos>
                                        <div className='opciones'>
                                            <AreaTextos disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} type="text" placeholder="Agregue las observacion pertinentes" value={miembroEnProceso.observacionDocumentos} onChange={(e) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('observacionDocumentos', e.target.value)} rows={4} />
                                        </div>
                                    </div>
                                    <Textos className='subtitulo encabezado'>3. Dotacion EPP y EPCC:</Textos>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza casco de seguridad TIPO II con barbuquejo en buen estado.">Casco:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppCasco', 'C')} className={miembroEnProceso.eppCasco === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppCasco', 'NC')} className={miembroEnProceso.eppCasco === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppCasco', 'NA')} className={miembroEnProceso.eppCasco === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppCasco !== 'NC'} fotoKey={'fotoEppCasco'} foto={miembroEnProceso.fotoEppCasco} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza guantes de seguridad  de acuerdo a la labor ejecutada según corresponda y están en buen estado.">Guantes:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppGuantes', 'C')} className={miembroEnProceso.eppGuantes === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppGuantes', 'NC')} className={miembroEnProceso.eppGuantes === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppGuantes', 'NA')} className={miembroEnProceso.eppGuantes === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppGuantes !== 'NC'} fotoKey={'fotoEppGuantes'} foto={miembroEnProceso.fotoEppGuantes} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza  guantes  de  seguridad  dieléctricos,  clase 0, 2 o 4 según  corresponda,  en  buen estado y osee las pruebas de rigidez vigentes.">Guantes Dielectricos:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppGuantesDielectricos', 'C')} className={miembroEnProceso.eppGuantesDielectricos === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppGuantesDielectricos', 'NC')} className={miembroEnProceso.eppGuantesDielectricos === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppGuantesDielectricos', 'NA')} className={miembroEnProceso.eppGuantesDielectricos === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppGuantesDielectricos !== 'NC'} fotoKey={'fotoEppGuantesDielectricos'} foto={miembroEnProceso.fotoEppGuantesDielectricos} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza protección facial anti-arco y está en buen estado (visor Arc Flash - Balaclava ignifuga)">Proteccion Facil Anti Arco:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppProteccionFacialAntiArco', 'C')} className={miembroEnProceso.eppProteccionFacialAntiArco === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppProteccionFacialAntiArco', 'NC')} className={miembroEnProceso.eppProteccionFacialAntiArco === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppProteccionFacialAntiArco', 'NA')} className={miembroEnProceso.eppProteccionFacialAntiArco === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppProteccionFacialAntiArco !== 'NC'} fotoKey={'fotoEppProteccionFacialAntiArco'} foto={miembroEnProceso.fotoEppProteccionFacialAntiArco} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza sistema contra caídas de altura completo, en buen estado.">Equipos Contra Caidas:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppEquiposContraCaidas', 'C')} className={miembroEnProceso.eppEquiposContraCaidas === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppEquiposContraCaidas', 'NC')} className={miembroEnProceso.eppEquiposContraCaidas === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppEquiposContraCaidas', 'NA')} className={miembroEnProceso.eppEquiposContraCaidas === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppEquiposContraCaidas !== 'NC'} fotoKey={'fotoEppEquiposContraCaidas'} foto={miembroEnProceso.fotoEppEquiposContraCaidas} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza ropa de trabajo adecuada para la tarea, en buen estado y normalizada">Overol Obra Civil:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppOverolObraCivil', 'C')} className={miembroEnProceso.eppOverolObraCivil === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppOverolObraCivil', 'NC')} className={miembroEnProceso.eppOverolObraCivil === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppOverolObraCivil', 'NA')} className={miembroEnProceso.eppOverolObraCivil === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppOverolObraCivil !== 'NC'} fotoKey={'fotoEppOverolObraCivil'} foto={miembroEnProceso.fotoEppOverolObraCivil} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza  overol ignífugo está en buen estado.">Overol Ignifugo:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppOverolIgnifugo', 'C')} className={miembroEnProceso.eppOverolIgnifugo === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppOverolIgnifugo', 'NC')} className={miembroEnProceso.eppOverolIgnifugo === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppOverolIgnifugo', 'NA')} className={miembroEnProceso.eppOverolIgnifugo === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppOverolIgnifugo !== 'NC'} fotoKey={'fotoEppOverolIgnifugo'} foto={miembroEnProceso.fotoEppOverolIgnifugo} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza protector ocular (gafas) según la actividad y está en buen estado.">Gafas de Seguridad:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppGafasDeSeguridad', 'C')} className={miembroEnProceso.eppGafasDeSeguridad === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppGafasDeSeguridad', 'NC')} className={miembroEnProceso.eppGafasDeSeguridad === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppGafasDeSeguridad', 'NA')} className={miembroEnProceso.eppGafasDeSeguridad === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppGafasDeSeguridad !== 'NC'} fotoKey={'fotoEppGafasDeSeguridad'} foto={miembroEnProceso.fotoEppGafasDeSeguridad} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza protección respiratoria en buen estado.">Tapabocas:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppTapabocas', 'C')} className={miembroEnProceso.eppTapabocas === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppTapabocas', 'NC')} className={miembroEnProceso.eppTapabocas === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppTapabocas', 'NA')} className={miembroEnProceso.eppTapabocas === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppTapabocas !== 'NC'} fotoKey={'fotoEppTapabocas'} foto={miembroEnProceso.fotoEppTapabocas} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo' title="Utiliza calzado de seguridad según corresponda y está en buen estado.">Botas:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppBotas', 'C')} className={miembroEnProceso.eppBotas === 'C' ? 'formulario selected' : ''}>C</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppBotas', 'NC')} className={miembroEnProceso.eppBotas === 'NC' ? 'formulario selected' : ''}>NC</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('eppBotas', 'NA')} className={miembroEnProceso.eppBotas === 'NA' ? 'formulario selected' : ''}>NA</Botones>
                                        </div>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} ocultarDiv={miembroEnProceso.eppBotas !== 'NC'} fotoKey={'fotoEppBotas'} foto={miembroEnProceso.fotoEppBotas} onChange={(fotoKey, data) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE(fotoKey, data)} capture={formularioEnelInspeccionIntegralHSE.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className={`entradaDatos vertical observacion' ${miembroEnProceso.eppCasco !== 'NC' && miembroEnProceso.eppGuantes !== 'NC' && miembroEnProceso.eppGuantesDielectricos !== 'NC' && miembroEnProceso.eppProteccionFacialAntiArco !== 'NC'
                                        && miembroEnProceso.eppEquiposContraCaidas !== 'NC' && miembroEnProceso.eppOverolObraCivil !== 'NC' && miembroEnProceso.eppOverolIgnifugo !== 'NC' && miembroEnProceso.eppGafasDeSeguridad !== 'NC' && miembroEnProceso.eppTapabocas !== 'NC' && miembroEnProceso.eppBotas !== 'NC' ? 'ocultar' : ''}`}>
                                        <Textos className='subtitulo'>Observaciones:</Textos>
                                        <div className='opciones'>
                                            <AreaTextos disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} type="text" placeholder="Agregue las observacion pertinentes" value={miembroEnProceso.observacionEpp} onChange={(e) => actualizarCampoMiembroACuadrillaEnelInspeccionIntegralHSE('observacionEpp', e.target.value)} rows={4} />
                                        </div>
                                    </div>
                                    <div className={`modal-acciones ${accionModalTabla !== "leer" ? 'visible' : 'oculto'}`}>
                                        <Botones className={`guardar ${accionModalTabla === "crear" ? 'visible' : 'oculto'}`} onClick={() => {
                                            const existe = (formularioEnelInspeccionIntegralHSE.cuadrilla || []).some(m => m.cedula === miembroEnProceso.cedula);
                                            if (existe) {
                                                toast.error('La cédula ya está en la cuadrilla.');
                                                return
                                            }

                                            const resultadoValidador = validarMiembroEnProceso(miembroEnProceso);

                                            if (resultadoValidador === false) {
                                                return
                                            }

                                            setFormularioEnelInspeccionIntegralHSE(prev => {
                                                const actualizado = { ...prev, cuadrilla: [...(prev.cuadrilla || []), miembroEnProceso] };
                                                localStorage.setItem('formularioEnelInspeccionIntegralHSE', JSON.stringify(actualizado));
                                                return actualizado;
                                            });
                                            toast.success('Integrante creado exitosamente.');
                                            localStorage.removeItem('miembroEnProceso');
                                            setMostrarModal(false);
                                            setMiembroEnProceso({})
                                        }}>Crear</Botones>
                                        <Botones className={`guardar ${accionModalTabla === "editar" ? 'visible' : 'oculto'}`} onClick={() => {
                                            const existe = (formularioEnelInspeccionIntegralHSE.cuadrilla || []).map(m => m.cedula === miembroEnProceso.cedula ? miembroEnProceso : m);

                                            setFormularioEnelInspeccionIntegralHSE(prev => {
                                                const actualizado = { ...prev, cuadrilla: existe };
                                                localStorage.setItem('formularioEnelInspeccionIntegralHSE', JSON.stringify(actualizado));
                                                return actualizado;
                                            });
                                            toast.success('Integrante editado exitosamente.');
                                            localStorage.removeItem('miembroEnProceso');
                                            setMostrarModal(false);
                                            setMiembroEnProceso({})
                                        }}>Editar</Botones>
                                        <Botones className={`eliminar ${accionModalTabla === "eliminar" ? 'visible' : 'oculto'}`} onClick={() => {
                                            const nuevaCuadrilla = (formularioEnelInspeccionIntegralHSE.cuadrilla || []).filter(m => m.cedula !== miembroEnProceso.cedula);

                                            setFormularioEnelInspeccionIntegralHSE(prev => {
                                                const actualizado = { ...prev, cuadrilla: nuevaCuadrilla };
                                                localStorage.setItem('formularioEnelInspeccionIntegralHSE', JSON.stringify(actualizado));
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
                            <Textos className='subtitulo prin'>1. Identificacion de riesgos (Actividades previas al trabajo)</Textos>
                            {preguntas.slice(0, 9).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="riesgos"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>2. Señalizacion y demarcacion</Textos>
                            {preguntas.slice(9, 12).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="senaYDemar"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>3. Las 5 Reglas de oro (Zona segura y zona de trabajo)</Textos>
                            {preguntas.slice(12, 17).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="reglasOro"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>4. Trabajo en alturas</Textos>
                            {preguntas.slice(17, 24).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="trabajoAlturas"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>5. Espacio confinado (EC)</Textos>
                            {preguntas.slice(24, 27).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="espacioConfinado"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>6. Condición de vehiculos (Pesado, Livianos)</Textos>
                            {preguntas.slice(27, 37).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="vehiculos"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>7. Condiciones de trabajo</Textos>
                            {preguntas.slice(37, 41).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="condicionesTrabajo"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>8. Materiales, equipos y herramientas</Textos>
                            {preguntas.slice(41, 44).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="materiales"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>9. Primeros auxilios y plan de emergencias</Textos>
                            {preguntas.slice(44, 49).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="primerosAuxilios"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>10. Aspectos biomecánicos</Textos>
                            {preguntas.slice(49, 52).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="biomecanicos"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>11. Manejo de productos químicos y derivados</Textos>
                            {preguntas.slice(52, 57).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="quimicos"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>12. Manejo de residuos no peligrosos</Textos>
                            {preguntas.slice(57, 60).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="residuosNoPeligrosos"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo'>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>13. Residuos de construcción y demolición - cobertura vegetal</Textos>
                            {preguntas.slice(60, 64).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="residuosConstruccion"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelInspeccionIntegralHSE}
                                    onChange={actualizarCampoEnelInspeccionIntegralHSE}
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
                            <AreaTextos disabled={modo === "editar"} type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelInspeccionIntegralHSE.observacion} onChange={(e) => actualizarCampoEnelInspeccionIntegralHSE('observacion', e.target.value)} rows={4} />
                        </div>
                    </div>

                    <div className='enviar'>
                        <Botones disabled={modo === "editar"} className="eliminar" onClick={() => {
                            localStorage.removeItem('formularioEnelInspeccionIntegralHSE');
                            setMiembroEnProceso({})
                            setFormularioEnelInspeccionIntegralHSE(estadoInicialFormularioEnelInspeccionIntegralHSE);
                        }}>Borrar formulario</Botones>
                        <Botones disabled={modo === "editar"} type="submit" id='Enviar' className="guardar" onClick={enviarFormularioEnelInspeccionIntegralHSE}>Enviar</Botones>
                    </div>
                </form>
            )}

            <div className='Notificaciones'>
                <ToastContainer />
            </div>
        </div >
    );
};

export default SupervisionFormularioEnelIntegral;