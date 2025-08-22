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
import { OpcionesFotoObservaciones } from './opcionesFotoObservaciones';
import Cookies from 'js-cookie';
import Interruptor from '../../../components/interruptor/interruptor';
import _ from "lodash";

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
        const dataLocal = localStorage.getItem('formularioEnelElementosEmergencia');
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
                (valor === 'No' || valor === 'Malo' || valor === 'Regular') &&
                !key.toLowerCase().startsWith('foto') &&
                !key.toLowerCase().startsWith('observacion')
            ) {
                return true;
            }
        }

        return false;
    };

    const hayNCValidoSegundoFiltro = (obj, solucion) => {
        let hayPendiente = false;

        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;

            const valor = obj[key];

            if (typeof valor === 'object' && valor !== null) {
                if (hayNCValidoSegundoFiltro(valor, solucion?.[key])) {
                    hayPendiente = true;
                }
            } else if (
                typeof valor === 'string' &&
                valor === 'NC' &&
                !key.toLowerCase().startsWith('foto') &&
                !key.toLowerCase().startsWith('observacion')
            ) {
                const fotoKey = `foto${key.charAt(0).toUpperCase()}${key.slice(1)}`;
                const obsKey = `observacion${key.charAt(0).toUpperCase()}${key.slice(1)}`;

                const fotoSol = solucion?.[fotoKey] || "";
                const obsSol = solucion?.[obsKey] || "";

                const solucionada =
                    (
                        (typeof fotoSol === "string" && fotoSol.trim() !== "") ||
                        (Array.isArray(fotoSol) && fotoSol.length > 0)
                    ) ||
                    (
                        (typeof obsSol === "string" && obsSol.trim() !== "")
                    );

                if (!solucionada) {
                    hayPendiente = true;
                }
            }
        }

        return hayPendiente;
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

    const enviarFormularioEnelElementosEmergencia = async (event) => {
        event.preventDefault();

        if (modo === "editar") {
            const resultadoValidador = validarSolucion(formularioEnelElementosEmergencia.solucion)
            if (resultadoValidador === false) { return }
        } else {
            const resultadoValidador = validarFormularioEnelElementosEmergencia(formularioEnelElementosEmergencia);
            if (resultadoValidador === false) { return }
            if (!ubicacion) { toast.error('Por favor dar permisos de ubicacion.'); return false }
        }

        setEnviando(true)

        try {
            let response2;
            if (modo === "editar") {
                const formularioEnelElementosEmergenciaModificado = await subirTodasLasFotos(formularioEnelElementosEmergencia.solucion, fecha);
                const ncvalido = hayNCValidoSegundoFiltro(formularioEnelElementosEmergencia, formularioEnelElementosEmergencia.solucion) === true ? "No Conforme" : "Conforme"
                const id = parseInt(formularioEnelElementosEmergencia.id.replace(/\D/g, ""), 10);
                const formularioNuevoSinFotos = eliminarDataEnFotos(formularioEnelElementosEmergenciaModificado)

                const data = {
                    id: id,
                    solucion: formularioNuevoSinFotos,
                    inspeccionFinal: ncvalido,
                };

                response2 = await axios.post(`${process.env.REACT_APP_API_URL}/supervision/solucionRegistroEnelInspeccionElementosEmergencia`, data);

            } else {
                const fechaInicial = fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const fechaFinal = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

                const formularioEnelElementosEmergenciaModificado = await subirTodasLasFotos(formularioEnelElementosEmergencia, fecha);

                const ncvalido = hayNCValido(formularioEnelElementosEmergenciaModificado) === true ? "No Conforme" : "Conforme"

                const { id, ...formularioSinId } = formularioEnelElementosEmergenciaModificado;
                const formularioConTiempos = {
                    ...formularioSinId,
                    fechaInicial,
                    fechaFinal,
                    ubicacion,
                    inspeccion: ncvalido,
                    inspeccionFinal: ncvalido,
                    formulario: "Enel Inspeccion Equipos y Elementos de Emergencia",
                    cedulaQuienInspecciona: cedulaUsuario,
                    nombreQuienInspecciona: nombreUsuario,
                };

                const formularioNuevoSinFotos = eliminarDataEnFotos(formularioConTiempos)
                const formularioNuevoSerializado = serializarCamposComplejos(formularioNuevoSinFotos)
                response2 = await axios.post(`${process.env.REACT_APP_API_URL}/supervision/crearRegistrosEnelInspeccionElementosEmergencia`, formularioNuevoSerializado);
            }

            if (response2.status >= 200 && response2.status < 300) {
                setEnviando(false)
                console.log('Datos enviados exitosamente');
                localStorage.removeItem('formularioEnelElementosEmergencia');
                setFormularioEnelElementosEmergencia(estadoInicialFormularioEnelElementosEmergencia);
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

    const estadoInicialFormularioEnelElementosEmergencia = {
        tipoInspeccion: "",
        cedulaQuienInspecciona: "",
        nombreQuienInspecciona: "",
        ciudad: "",
        centroTrabajo: "",
        noContrato: "",
        cedulaResponsableCuadrilla: "",
        nombreResponsableCuadrilla: "",
        proceso: "",
        extintores: [],
        controlDerrames: {
            controlDerrames1: "",
            cantidadControlDerrames1: "",
            observacionControlDerrames1: "",
            controlDerrames2: "",
            cantidadControlDerrames2: "",
            observacionControlDerrames2: "",
            controlDerrames3: "",
            cantidadControlDerrames3: "",
            observacionControlDerrames3: "",
            controlDerrames4: "",
            cantidadControlDerrames4: "",
            observacionControlDerrames4: "",
            controlDerrames5: "",
            cantidadControlDerrames5: "",
            observacionControlDerrames5: "",
            controlDerrames6: "",
            cantidadControlDerrames6: "",
            observacionControlDerrames6: "",
            controlDerrames7: "",
            cantidadControlDerrames7: "",
            observacionControlDerrames7: "",
            controlDerrames8: "",
            cantidadControlDerrames8: "",
            observacionControlDerrames8: "",
            controlDerrames9: "",
            cantidadControlDerrames9: "",
            observacionControlDerrames9: "",
            controlDerrames10: "",
            cantidadControlDerrames10: "",
            observacionControlDerrames10: "",
            controlDerrames11: "",
            cantidadControlDerrames11: "",
            observacionControlDerrames11: "",
            controlDerrames12: "",
            cantidadControlDerrames12: "",
            observacionControlDerrames12: "",
            controlDerrames13: "",
            cantidadControlDerrames13: "",
            observacionControlDerrames13: "",
            controlDerrames14: "",
            cantidadControlDerrames14: "",
            observacionControlDerrames14: "",
            controlDerrames15: "",
            cantidadControlDerrames15: "",
            observacionControlDerrames15: "",
            controlDerrames16: "",
            cantidadControlDerrames16: "",
            observacionControlDerrames16: "",
            controlDerrames17: "",
            cantidadControlDerrames17: "",
            observacionControlDerrames17: "",
            controlDerrames18: "",
            cantidadControlDerrames18: "",
            observacionControlDerrames18: "",
            controlDerrames19: "",
            cantidadControlDerrames19: "",
            observacionControlDerrames19: "",
            controlDerrames20: "",
            cantidadControlDerrames20: "",
            observacionControlDerrames20: "",
            fotoControlDerrames: "",
        },
        elementosEmergencia: {
            elementosEmergencia1: "",
            fotoElementosEmergencia1: "",
            observacionElementosEmergencia1: "",
            elementosEmergencia2: "",
            fotoElementosEmergencia2: "",
            observacionElementosEmergencia2: "",
            elementosEmergencia3: "",
            fotoElementosEmergencia3: "",
            observacionElementosEmergencia3: "",
            elementosEmergencia4: "",
            fotoElementosEmergencia4: "",
            observacionElementosEmergencia4: "",
            elementosEmergencia5: "",
            fotoElementosEmergencia5: "",
            observacionElementosEmergencia5: "",
            elementosEmergencia6: "",
            fotoElementosEmergencia6: "",
            observacionElementosEmergencia6: "",
            elementosEmergencia7: "",
            fotoElementosEmergencia7: "",
            observacionElementosEmergencia7: "",
            elementosEmergencia8: "",
            fotoElementosEmergencia8: "",
            observacionElementosEmergencia8: "",
            elementosEmergencia9: "",
            fotoElementosEmergencia9: "",
            observacionElementosEmergencia9: "",
            elementosEmergencia10: "",
            fotoElementosEmergencia10: "",
            observacionElementosEmergencia10: "",
            elementosEmergencia11: "",
            fotoElementosEmergencia11: "",
            observacionElementosEmergencia11: "",
            elementosEmergencia12: "",
            fotoElementosEmergencia12: "",
            observacionElementosEmergencia12: "",
            elementosEmergencia13: "",
            fotoElementosEmergencia13: "",
            observacionElementosEmergencia13: "",
        },
        observacion: "",
        inspeccion: "",
        solucion: {
            controlDerrames: {
                observacionControlDerrames1: "",
                observacionControlDerrames2: "",
                observacionControlDerrames3: "",
                observacionControlDerrames4: "",
                observacionControlDerrames5: "",
                observacionControlDerrames6: "",
                observacionControlDerrames7: "",
                observacionControlDerrames8: "",
                observacionControlDerrames9: "",
                observacionControlDerrames10: "",
                observacionControlDerrames11: "",
                observacionControlDerrames12: "",
                observacionControlDerrames13: "",
                observacionControlDerrames14: "",
                observacionControlDerrames15: "",
                observacionControlDerrames16: "",
                observacionControlDerrames17: "",
                observacionControlDerrames18: "",
                observacionControlDerrames19: "",
                observacionControlDerrames20: "",
                fotoControlDerrames: "",
            },
            elementosEmergencia: {
                fotoElementosEmergencia1: "",
                observacionElementosEmergencia1: "",
                fotoElementosEmergencia2: "",
                observacionElementosEmergencia2: "",
                fotoElementosEmergencia3: "",
                observacionElementosEmergencia3: "",
                fotoElementosEmergencia4: "",
                observacionElementosEmergencia4: "",
                fotoElementosEmergencia5: "",
                observacionElementosEmergencia5: "",
                fotoElementosEmergencia6: "",
                observacionElementosEmergencia6: "",
                fotoElementosEmergencia7: "",
                observacionElementosEmergencia7: "",
                fotoElementosEmergencia8: "",
                observacionElementosEmergencia8: "",
                fotoElementosEmergencia9: "",
                observacionElementosEmergencia9: "",
                fotoElementosEmergencia10: "",
                observacionElementosEmergencia10: "",
                fotoElementosEmergencia11: "",
                observacionElementosEmergencia11: "",
                fotoElementosEmergencia12: "",
                observacionElementosEmergencia12: "",
                fotoElementosEmergencia13: "",
                observacionElementosEmergencia13: "",
            },
        }
    };

    const [formularioEnelElementosEmergencia, setFormularioEnelElementosEmergencia] = useState(() => {
        const datosGuardados = localStorage.getItem('formularioEnelElementosEmergencia');
        return datosGuardados ? JSON.parse(datosGuardados) : estadoInicialFormularioEnelElementosEmergencia;
    });

    const actualizarCampoEnelElementosEmergencia = async (campo, valor) => {
        const [nivel1, nivel2, nivel3] = campo.split('.');

        if (Array.isArray(valor) && valor.length === 0) {
            setFormularioEnelElementosEmergencia((prev) => {
                const actualizado = { ...prev };
                if (nivel3) { actualizado[nivel1][nivel2][nivel3] = ""; } else if (nivel2) { actualizado[nivel1][nivel2] = ""; } else { actualizado[nivel1] = ""; }
                localStorage.setItem(
                    "formularioEnelElementosEmergencia",
                    JSON.stringify(actualizado)
                );
                return actualizado;
            });
            return;
        }

        if (['C', 'NC', 'NA'].includes(valor) && nivel2) {
            setFormularioEnelElementosEmergencia(prev => {
                const actualizado = { ...prev };
                if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }

                if (valor !== 'NC') {
                    const base = nivel2.charAt(0).toUpperCase() + nivel2.slice(1);
                    const fotoKey = `foto${base}`;
                    const observacionKey = `observacion${base}`;

                    if (fotoKey in actualizado[nivel1]) actualizado[nivel1][fotoKey] = '';
                    if (observacionKey in actualizado[nivel1]) actualizado[nivel1][observacionKey] = '';
                }

                localStorage.setItem('formularioEnelElementosEmergencia', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (typeof valor === 'string') {
            setFormularioEnelElementosEmergencia(prev => {
                const actualizado = { ...prev };
                if (nivel3) { actualizado[nivel1][nivel2][nivel3] = valor; } else if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }
                localStorage.setItem('formularioEnelElementosEmergencia', JSON.stringify(actualizado));
                return actualizado;
            });
            return;
        }

        if (valor[0].name && valor[0].data) {
            setFormularioEnelElementosEmergencia((prev) => {
                const actualizado = { ...prev };
                if (nivel3) { actualizado[nivel1][nivel2][nivel3] = valor; } else if (nivel2) { actualizado[nivel1][nivel2] = valor; } else { actualizado[nivel1] = valor; }
                localStorage.setItem(
                    "formularioEnelElementosEmergencia",
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
            key: "controlDerrames1",
            texto: "Paños oleofílicos",
            cantidadExistenteKey: "cantidadControlDerrames1",
            observacionKey: "observacionControlDerrames1",
            activarinput: false,
        },
        {
            key: "controlDerrames2",
            texto: "Almohada oleofílica",
            cantidadExistenteKey: "cantidadControlDerrames2",
            observacionKey: "observacionControlDerrames2",
            activarinput: false,
        },
        {
            key: "controlDerrames3",
            texto: "Barrera oleofílica",
            cantidadExistenteKey: "cantidadControlDerrames3",
            observacionKey: "observacionControlDerrames3",
            activarinput: false,
        },
        {
            key: "controlDerrames4",
            texto: "Material absorbente",
            cantidadExistenteKey: "cantidadControlDerrames4",
            observacionKey: "observacionControlDerrames4",
            activarinput: false,
        },
        {
            key: "controlDerrames5",
            texto: "Cinta de señalización de seguridad",
            cantidadExistenteKey: "cantidadControlDerrames5",
            observacionKey: "observacionControlDerrames5",
            activarinput: false,
        },
        {
            key: "controlDerrames6",
            texto: "Bolsas industriales color rojo",
            cantidadExistenteKey: "cantidadControlDerrames6",
            observacionKey: "observacionControlDerrames6",
            activarinput: false,
        },
        {
            key: "controlDerrames7",
            texto: "Pala y/o recogedor plástico",
            cantidadExistenteKey: "cantidadControlDerrames7",
            observacionKey: "observacionControlDerrames7",
            activarinput: false,
        },
        {
            key: "controlDerrames8",
            texto: "Desengrasante",
            cantidadExistenteKey: "cantidadControlDerrames8",
            observacionKey: "observacionControlDerrames8",
            activarinput: false,
        },
        {
            key: "controlDerrames9",
            texto: "Ficha de datos de seguridad del desengrasante",
            cantidadExistenteKey: "cantidadControlDerrames9",
            observacionKey: "observacionControlDerrames9",
            activarinput: false,
        },
        {
            key: "controlDerrames10",
            texto: "Guantes de nitrilo, gafas de seguridad y protección respiratoria con filtro",
            cantidadExistenteKey: "cantidadControlDerrames10",
            observacionKey: "observacionControlDerrames10",
            activarinput: false,
        },
        {
            key: "controlDerrames11",
            texto: "Chaleco reflectivo",
            cantidadExistenteKey: "cantidadControlDerrames11",
            observacionKey: "observacionControlDerrames11",
            activarinput: false,
        },
        {
            key: "controlDerrames12",
            texto: "Calajanes en madera",
            cantidadExistenteKey: "cantidadControlDerrames12",
            observacionKey: "observacionControlDerrames12",
            activarinput: false,
        },
        {
            key: "controlDerrames13",
            texto: "Masilla epóxica",
            cantidadExistenteKey: "cantidadControlDerrames13",
            observacionKey: "observacionControlDerrames13",
            activarinput: false,
        },
        {
            key: "controlDerrames14",
            texto: "Amarres plásticos y/o manila",
            cantidadExistenteKey: "cantidadControlDerrames14",
            observacionKey: "observacionControlDerrames14",
            activarinput: false,
        },
        {
            key: "controlDerrames15",
            texto: "Martillo de goma",
            cantidadExistenteKey: "cantidadControlDerrames15",
            observacionKey: "observacionControlDerrames15",
            activarinput: false,
        },
        {
            key: "controlDerrames16",
            texto: "Instructivo de uso",
            cantidadExistenteKey: "cantidadControlDerrames16",
            observacionKey: "observacionControlDerrames16",
            activarinput: false,
        },
        {
            key: "controlDerrames17",
            texto: "Linterna",
            cantidadExistenteKey: "cantidadControlDerrames17",
            observacionKey: "observacionControlDerrames17",
            activarinput: false,
        },
        {
            key: "controlDerrames18",
            texto: "Maleta y/o contenedor para almacenamiento de los elementos kit para control de derrames",
            cantidadExistenteKey: "cantidadControlDerrames18",
            observacionKey: "observacionControlDerrames18",
            activarinput: false,
        },
        {
            key: "controlDerrames19",
            texto: "Señalización del sitio de almacenamiento del kit control de derrames",
            cantidadExistenteKey: "cantidadControlDerrames19",
            observacionKey: "observacionControlDerrames19",
            activarinput: false,
        },
        {
            key: "controlDerrames20",
            texto: "Otros ¿cuáles?",
            cantidadExistenteKey: "cantidadControlDerrames20",
            observacionKey: "observacionControlDerrames20",
            activarinput: false,
        },

        {
            key: "elementosEmergencia1",
            texto: "Los extintores se encuentran señalizados",
            fotoKey: "fotoElementosEmergencia1",
            observacionKey: "observacionElementosEmergencia1",
            activarinput: false,
        },
        {
            key: "elementosEmergencia2",
            texto: "Los extintores se encuentra al alcance de todos fuera de obstaculos",
            fotoKey: "fotoElementosEmergencia2",
            observacionKey: "observacionElementosEmergencia2",
            activarinput: false,
        },
        {
            key: "elementosEmergencia3",
            texto: "Los Botiquines se encuentran señalizados",
            fotoKey: "fotoElementosEmergencia3",
            observacionKey: "observacionElementosEmergencia3",
            activarinput: false,
        },
        {
            key: "elementosEmergencia4",
            texto: "Los Botiquines se encuentra al alcance de todos fuera de obstaculos",
            fotoKey: "fotoElementosEmergencia4",
            observacionKey: "observacionElementosEmergencia4",
            activarinput: false,
        },
        {
            key: "elementosEmergencia5",
            texto: "El kit para control de derrames se encuentra señalizado, al alcance y fuera de obstáculos",
            fotoKey: "fotoElementosEmergencia5",
            observacionKey: "observacionElementosEmergencia5",
            activarinput: false,
        },
        {
            key: "elementosEmergencia6",
            texto: "Se cuenta con pito de emergencia",
            fotoKey: "fotoElementosEmergencia6",
            observacionKey: "observacionElementosEmergencia6",
            activarinput: false,
        },
        {
            key: "elementosEmergencia7",
            texto: "Se encuentra señalizado  el lugar(res) donde se encuentra(n) el (los) pito o alarma de emergencia",
            fotoKey: "fotoElementosEmergencia7",
            observacionKey: "observacionElementosEmergencia7",
            activarinput: false,
        },
        {
            key: "elementosEmergencia8",
            texto: "El pito o alarma se encuentra ubicado en lugares fuera de obstaculos",
            fotoKey: "fotoElementosEmergencia8",
            observacionKey: "observacionElementosEmergencia8",
            activarinput: false,
        },
        {
            key: "elementosEmergencia9",
            texto: "Se cuenta con camilla",
            fotoKey: "fotoElementosEmergencia9",
            observacionKey: "observacionElementosEmergencia9",
            activarinput: false,
        },
        {
            key: "elementosEmergencia10",
            texto: "Se encuentra señalizado el (los) lugar(res) donde se encuentra(n) la (las) camillas",
            fotoKey: "fotoElementosEmergencia10",
            observacionKey: "observacionElementosEmergencia10",
            activarinput: false,
        },
        {
            key: "elementosEmergencia11",
            texto: "La (s) camilla (s) se encuentra (n) ubicada (s) en (un) lugar (es) fuera de obstáculos",
            fotoKey: "fotoElementosEmergencia11",
            observacionKey: "observacionElementosEmergencia11",
            activarinput: false,
        },
        {
            key: "elementosEmergencia12",
            texto: "Se encuentra señalizada la ruta de evacuación y salidas de emergencia",
            fotoKey: "fotoElementosEmergencia12",
            observacionKey: "observacionElementosEmergencia12",
            activarinput: false,
        },
        {
            key: "elementosEmergencia13",
            texto: "Se encuentra fuera de obstáculos la ruta de evacuación y la salida de emergencia",
            fotoKey: "fotoElementosEmergencia13",
            observacionKey: "observacionElementosEmergencia13",
            activarinput: false,
        },
        {
            solucion: {
                controlDerrames: [
                    {
                        key: "controlDerrames1",
                        observacionKey: "observacionControlDerrames1",
                    },
                    {
                        key: "controlDerrames2",
                        observacionKey: "observacionControlDerrames2",
                    },
                    {
                        key: "controlDerrames3",
                        observacionKey: "observacionControlDerrames3",
                    },
                    {
                        key: "controlDerrames4",
                        observacionKey: "observacionControlDerrames4",
                    },
                    {
                        key: "controlDerrames5",
                        observacionKey: "observacionControlDerrames5",
                    },
                    {
                        key: "controlDerrames6",
                        observacionKey: "observacionControlDerrames6",
                    },
                    {
                        key: "controlDerrames7",
                        observacionKey: "observacionControlDerrames7",
                    },
                    {
                        key: "controlDerrames8",
                        observacionKey: "observacionControlDerrames8",
                    },
                    {
                        key: "controlDerrames9",
                        observacionKey: "observacionControlDerrames9",
                    },
                    {
                        key: "controlDerrames10",
                        observacionKey: "observacionControlDerrames10",
                    },
                    {
                        key: "controlDerrames11",
                        observacionKey: "observacionControlDerrames11",
                    },
                    {
                        key: "controlDerrames12",
                        observacionKey: "observacionControlDerrames12",
                    },
                    {
                        key: "controlDerrames13",
                        observacionKey: "observacionControlDerrames13",
                    },
                    {
                        key: "controlDerrames14",
                        observacionKey: "observacionControlDerrames14",
                    },
                    {
                        key: "controlDerrames15",
                        observacionKey: "observacionControlDerrames15",
                    },
                    {
                        key: "controlDerrames16",
                        observacionKey: "observacionControlDerrames16",
                    },
                    {
                        key: "controlDerrames17",
                        observacionKey: "observacionControlDerrames17",
                    },
                    {
                        key: "controlDerrames18",
                        observacionKey: "observacionControlDerrames18",
                    },
                    {
                        key: "controlDerrames19",
                        observacionKey: "observacionControlDerrames19",
                    },
                    {
                        key: "controlDerrames20",
                        observacionKey: "observacionControlDerrames20",
                    },
                ],
                elementosEmergencia: [
                    {
                        key: "elementosEmergencia1",
                        fotoKey: "fotoElementosEmergencia1",
                        observacionKey: "observacionElementosEmergencia1",
                    },
                    {
                        key: "elementosEmergencia2",
                        fotoKey: "fotoElementosEmergencia2",
                        observacionKey: "observacionElementosEmergencia2",
                    },
                    {
                        key: "elementosEmergencia3",
                        fotoKey: "fotoElementosEmergencia3",
                        observacionKey: "observacionElementosEmergencia3",
                    },
                    {
                        key: "elementosEmergencia4",
                        fotoKey: "fotoElementosEmergencia4",
                        observacionKey: "observacionElementosEmergencia4",
                    },
                    {
                        key: "elementosEmergencia5",
                        fotoKey: "fotoElementosEmergencia5",
                        observacionKey: "observacionElementosEmergencia5",
                    },
                    {
                        key: "elementosEmergencia6",
                        fotoKey: "fotoElementosEmergencia6",
                        observacionKey: "observacionElementosEmergencia6",
                    },
                    {
                        key: "elementosEmergencia7",
                        fotoKey: "fotoElementosEmergencia7",
                        observacionKey: "observacionElementosEmergencia7",
                    },
                    {
                        key: "elementosEmergencia8",
                        fotoKey: "fotoElementosEmergencia8",
                        observacionKey: "observacionElementosEmergencia8",
                    },
                    {
                        key: "elementosEmergencia9",
                        fotoKey: "fotoElementosEmergencia9",
                        observacionKey: "observacionElementosEmergencia9",
                    },
                    {
                        key: "elementosEmergencia10",
                        fotoKey: "fotoElementosEmergencia10",
                        observacionKey: "observacionElementosEmergencia10",
                    },
                    {
                        key: "elementosEmergencia11",
                        fotoKey: "fotoElementosEmergencia11",
                        observacionKey: "observacionElementosEmergencia11",
                    },
                    {
                        key: "elementosEmergencia12",
                        fotoKey: "fotoElementosEmergencia12",
                        observacionKey: "observacionElementosEmergencia12",
                    },
                    {
                        key: "elementosEmergencia13",
                        fotoKey: "fotoElementosEmergencia13",
                        observacionKey: "observacionElementosEmergencia13",
                    },
                ],
            }
        }
    ];

    const validarFormularioEnelElementosEmergencia = (formulario) => {
        if (!formulario.tipoInspeccion) { toast.error('Por favor diligencie el tipo de inspeccion.'); return false }
        if (!cedulaUsuario) { toast.error('Por favor diligencie inicie sesion ya que no existe usuario.'); return false }
        if (!nombreUsuario) { toast.error('Por favor diligencie inicie sesion ya que no existe usuario.'); return false }
        if (!formulario.ciudad) { toast.error('Por favor diligencie la ciudad.'); return false }
        if (!formulario.centroTrabajo) { toast.error('Por favor diligencie el centro de trabajo.'); return false }
        if (!formulario.noContrato) { toast.error('Por favor diligencie el numero de contrato.'); return false }
        if (!formulario.cedulaResponsableCuadrilla) { toast.error('Por favor diligencie la cedula del cuadrillero.'); return false }
        if (!formulario.nombreResponsableCuadrilla || formulario.nombreResponsableCuadrilla === 'Usuario no encontrado') { toast.error('Por favor ingrese un usuario valido para el responsable del cuadrillero.'); return false }
        if (!formulario.proceso) { toast.error('Por favor diligencie el proceso.'); return false }
        if (mostrarPreguntasExtintores === true && !Array.isArray(formulario.extintores)) { toast.error('Por favor diligencie el formulario de extintores.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames1) { toast.error('Por favor diligencie el estado de la pregunta 1 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames1) { toast.error('Por favor diligencie la cantidad de la pregunta 1 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames1 && (formulario.controlDerrames.controlDerrames1 === 'Malo' || formulario.controlDerrames.controlDerrames1 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 1 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames2) { toast.error('Por favor diligencie el estado de la pregunta 2 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames2) { toast.error('Por favor diligencie la cantidad de la pregunta 2 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames2 && (formulario.controlDerrames.controlDerrames2 === 'Malo' || formulario.controlDerrames.controlDerrames2 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 2 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames3) { toast.error('Por favor diligencie el estado de la pregunta 3 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames3) { toast.error('Por favor diligencie la cantidad de la pregunta 3 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames3 && (formulario.controlDerrames.controlDerrames3 === 'Malo' || formulario.controlDerrames.controlDerrames3 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 3 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames4) { toast.error('Por favor diligencie el estado de la pregunta 4 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames4) { toast.error('Por favor diligencie la cantidad de la pregunta 4 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames4 && (formulario.controlDerrames.controlDerrames4 === 'Malo' || formulario.controlDerrames.controlDerrames4 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 4 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames5) { toast.error('Por favor diligencie el estado de la pregunta 5 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames5) { toast.error('Por favor diligencie la cantidad de la pregunta 5 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames5 && (formulario.controlDerrames.controlDerrames5 === 'Malo' || formulario.controlDerrames.controlDerrames5 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 5 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames6) { toast.error('Por favor diligencie el estado de la pregunta 6 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames6) { toast.error('Por favor diligencie la cantidad de la pregunta 6 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames6 && (formulario.controlDerrames.controlDerrames6 === 'Malo' || formulario.controlDerrames.controlDerrames6 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 6 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames7) { toast.error('Por favor diligencie el estado de la pregunta 7 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames7) { toast.error('Por favor diligencie la cantidad de la pregunta 7 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames7 && (formulario.controlDerrames.controlDerrames7 === 'Malo' || formulario.controlDerrames.controlDerrames7 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 7 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames8) { toast.error('Por favor diligencie el estado de la pregunta 8 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames8) { toast.error('Por favor diligencie la cantidad de la pregunta 8 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames8 && (formulario.controlDerrames.controlDerrames8 === 'Malo' || formulario.controlDerrames.controlDerrames8 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 8 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames9) { toast.error('Por favor diligencie el estado de la pregunta 9 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames9) { toast.error('Por favor diligencie la cantidad de la pregunta 9 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames9 && (formulario.controlDerrames.controlDerrames9 === 'Malo' || formulario.controlDerrames.controlDerrames9 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 9 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames10) { toast.error('Por favor diligencie el estado de la pregunta 10 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames10) { toast.error('Por favor diligencie la cantidad de la pregunta 10 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames10 && (formulario.controlDerrames.controlDerrames10 === 'Malo' || formulario.controlDerrames.controlDerrames10 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 10 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames11) { toast.error('Por favor diligencie el estado de la pregunta 11 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames11) { toast.error('Por favor diligencie la cantidad de la pregunta 11 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames11 && (formulario.controlDerrames.controlDerrames11 === 'Malo' || formulario.controlDerrames.controlDerrames11 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 11 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames12) { toast.error('Por favor diligencie el estado de la pregunta 12 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames12) { toast.error('Por favor diligencie la cantidad de la pregunta 12 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames12 && (formulario.controlDerrames.controlDerrames12 === 'Malo' || formulario.controlDerrames.controlDerrames12 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 12 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames13) { toast.error('Por favor diligencie el estado de la pregunta 13 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames13) { toast.error('Por favor diligencie la cantidad de la pregunta 13 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames13 && (formulario.controlDerrames.controlDerrames13 === 'Malo' || formulario.controlDerrames.controlDerrames13 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 13 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames14) { toast.error('Por favor diligencie el estado de la pregunta 14 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames14) { toast.error('Por favor diligencie la cantidad de la pregunta 14 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames14 && (formulario.controlDerrames.controlDerrames14 === 'Malo' || formulario.controlDerrames.controlDerrames14 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 14 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames15) { toast.error('Por favor diligencie el estado de la pregunta 15 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames15) { toast.error('Por favor diligencie la cantidad de la pregunta 15 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames15 && (formulario.controlDerrames.controlDerrames15 === 'Malo' || formulario.controlDerrames.controlDerrames15 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 15 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames16) { toast.error('Por favor diligencie el estado de la pregunta 16 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames16) { toast.error('Por favor diligencie la cantidad de la pregunta 16 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames16 && (formulario.controlDerrames.controlDerrames16 === 'Malo' || formulario.controlDerrames.controlDerrames16 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 16 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames17) { toast.error('Por favor diligencie el estado de la pregunta 17 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames17) { toast.error('Por favor diligencie la cantidad de la pregunta 17 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames17 && (formulario.controlDerrames.controlDerrames17 === 'Malo' || formulario.controlDerrames.controlDerrames17 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 17 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames18) { toast.error('Por favor diligencie el estado de la pregunta 18 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames18) { toast.error('Por favor diligencie la cantidad de la pregunta 18 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames18 && (formulario.controlDerrames.controlDerrames18 === 'Malo' || formulario.controlDerrames.controlDerrames18 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 18 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames19) { toast.error('Por favor diligencie el estado de la pregunta 19 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames19) { toast.error('Por favor diligencie la cantidad de la pregunta 19 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames19 && (formulario.controlDerrames.controlDerrames19 === 'Malo' || formulario.controlDerrames.controlDerrames19 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 19 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.controlDerrames20) { toast.error('Por favor diligencie el estado de la pregunta 20 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.cantidadControlDerrames20) { toast.error('Por favor diligencie la cantidad de la pregunta 20 del capitulo 2.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.observacionControlDerrames20 && (formulario.controlDerrames.controlDerrames20 === 'Malo' || formulario.controlDerrames.controlDerrames20 === 'Regular')) { toast.error('Por favor diligencie la observacion de la pregunta 20 del capitulo 2 cuando su respuesta es Malo o Regular.'); return false }
        if (mostrarPreguntasDerrames === true && !formulario.controlDerrames.fotoControlDerrames) { toast.error('Por favor agregue la(s) imagenes pertinentes al capitulo 2.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia1 || !formulario.elementosEmergencia.fotoElementosEmergencia1) && formulario.elementosEmergencia.elementosEmergencia1 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 1.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia2 || !formulario.elementosEmergencia.fotoElementosEmergencia2) && formulario.elementosEmergencia.elementosEmergencia2 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 2.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia3 || !formulario.elementosEmergencia.fotoElementosEmergencia3) && formulario.elementosEmergencia.elementosEmergencia3 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 3.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia4 || !formulario.elementosEmergencia.fotoElementosEmergencia4) && formulario.elementosEmergencia.elementosEmergencia4 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 4.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia5 || !formulario.elementosEmergencia.fotoElementosEmergencia5) && formulario.elementosEmergencia.elementosEmergencia5 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 5.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia6 || !formulario.elementosEmergencia.fotoElementosEmergencia6) && formulario.elementosEmergencia.elementosEmergencia6 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 6.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia7 || !formulario.elementosEmergencia.fotoElementosEmergencia7) && formulario.elementosEmergencia.elementosEmergencia7 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 7.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia8 || !formulario.elementosEmergencia.fotoElementosEmergencia8) && formulario.elementosEmergencia.elementosEmergencia8 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 8.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia9 || !formulario.elementosEmergencia.fotoElementosEmergencia9) && formulario.elementosEmergencia.elementosEmergencia9 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 9.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia10 || !formulario.elementosEmergencia.fotoElementosEmergencia10) && formulario.elementosEmergencia.elementosEmergencia10 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 10.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia11 || !formulario.elementosEmergencia.fotoElementosEmergencia11) && formulario.elementosEmergencia.elementosEmergencia11 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 11.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia12 || !formulario.elementosEmergencia.fotoElementosEmergencia12) && formulario.elementosEmergencia.elementosEmergencia12 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 12.'); return false }
        if (mostrarPreguntasEmergencia === true && (!formulario.elementosEmergencia.observacionElementosEmergencia13 || !formulario.elementosEmergencia.fotoElementosEmergencia13) && formulario.elementosEmergencia.elementosEmergencia13 === 'No') { toast.error('Por favor ingrese la foto y observacion correspondiente al capitulo 3 cuando su respuesta es No en la pregunta 13.'); return false }
        if (!formulario.observacion) { toast.error('Por favor diligencie la observacion general.'); return false }
    }

    const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [miembroEnProceso, setMiembroEnProceso] = useState(() => {
        const guardado = localStorage.getItem('miembroEnProceso');
        return guardado ? JSON.parse(guardado) : {
            ubicacion: "",
            agenteExtintor: "",
            tipo: "",
            cilindro: "",
            pasador: "",
            selloSeguridad: "",
            manometro: "",
            manguera: "",
            etiqueta: "",
            fechaUltimaCarga: "",
            fechaProximaRecarga: "",
            fotoExtintor: "",
            observacion: "",
        };
    });

    const actualizarCampoMiembro = async (campo, valor) => {

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

    const validarMiembroEnProceso = (miembro) => {
        if (!miembro.ubicacion) { toast.error('Por favor diligencie la ubicacion.'); return false }
        if (!miembro.agenteExtintor) { toast.error('Por favor ingrese el agente extintor.'); return false }
        if (!miembro.tipo) { toast.error('Por favor ingrese el tipo.'); return false }
        if (!miembro.cilindro) { toast.error('Por favor ingrese el cilindro.'); return false }
        if (!miembro.pasador) { toast.error('Por favor ingrese el pasador.'); return false }
        if (!miembro.selloSeguridad) { toast.error('Por favor ingrese el sello de seguridad.'); return false }
        if (!miembro.manometro) { toast.error('Por favor ingrese el manometro.'); return false }
        if (!miembro.manguera) { toast.error('Por favor ingrese la manguera.'); return false }
        if (!miembro.etiqueta) { toast.error('Por favor ingrese la etiqueta de identificacion.'); return false }
        if (!miembro.fechaUltimaCarga) { toast.error('Por favor ingrese la fecha de ultima carga.'); return false }
        if (!miembro.fechaProximaRecarga) { toast.error('Por favor ingrese la fecha de proxima recarga.'); return false }
        if (!miembro.fotoExtintor) { toast.error('Por favor ingrese la foto del extintor.'); return false }

        if (!miembro.observacion && (miembro.cilindro === 'No' || miembro.pasador === 'No' || miembro.selloSeguridad === 'No' || miembro.manometro === 'No' || miembro.etiqueta === 'No' || miembro.manguera === 'No')) { toast.error('Por favor diligencie la observacion.'); return false }
    }

    const columnas = [
        { header: 'Ubicacion', key: 'ubicacion' },
        { header: 'Agente Extintor', key: 'agenteExtintor' },
        { header: 'Fecha Ultima Carga', key: 'fechaUltimaCarga' },
    ];

    const [mostrarPreguntasExtintores, setMostrarPreguntasExtintores] = useState(true);
    const [mostrarPreguntasDerrames, setMostrarPreguntasDerrames] = useState(true);
    const [mostrarPreguntasEmergencia, setMostrarPreguntasEmergencia] = useState(true);

    const solucionInicial = useRef(_.cloneDeep(formularioEnelElementosEmergencia.solucion));
    const [hayCambiosEnSolucion, setHayCambiosEnSolucion] = useState(false);

    useEffect(() => {
        const cambio = !_.isEqual(solucionInicial.current, formularioEnelElementosEmergencia.solucion);
        setHayCambiosEnSolucion(cambio);
    }, [formularioEnelElementosEmergencia]);

    const validarSolucion = (solucion) => {
        for (const categoria in solucion) {
            const campos = solucion[categoria];

            for (const key in campos) {
                if (key.startsWith("foto")) {
                    const fotoKey = key;
                    const obsKey = key.replace("foto", "observacion").replace("Obligatoria", "");

                    const valorFoto = campos[fotoKey];
                    const valorObs = campos[obsKey];

                    if ((valorFoto && !valorObs) || (!valorFoto && valorObs)) {
                        toast.error(`Falta completar campos en la solución al hallazgo encontrado`);
                        return false;
                    }
                }
            }
        }
        return true;
    };

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
                        <Textos className='titulo'>ENEL - Inspección a Equipos y Elementos de Emergencia</Textos>
                    </div>

                    <div className='campo fecha'>
                        <i className="fas fa-calendar-alt"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Fecha inspeccion, hora inicio:</Textos>
                            <Textos className='parrafo'>{modo === "editar" ? formularioEnelElementosEmergencia.fechaFinal : fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Textos>
                        </div>
                    </div>

                    <div className='campo'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Tipo de Inspeccion:</Textos>
                            <Selectores value={formularioEnelElementosEmergencia.tipoInspeccion} onChange={(e) => actualizarCampoEnelElementosEmergencia('tipoInspeccion', e.target.value)}
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
                            <Entradas disabled type="text" placeholder="Ingrese la cedula de quien inspecciona" value={modo === "editar" ? formularioEnelElementosEmergencia.cedulaQuienInspecciona : cedulaUsuario} />
                            <Entradas type="text" placeholder="Nombre" value={modo === "editar" ? formularioEnelElementosEmergencia.nombreQuienInspecciona : nombreUsuario} disabled={true} />
                        </div>
                    </div>

                    <div className='campo ciudad'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Ciudad:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la ciudad" value={formularioEnelElementosEmergencia.ciudad} onChange={(e) => {
                                const valor = e.target.value;
                                actualizarCampoEnelElementosEmergencia('ciudad', valor);

                                const coincidencias = datosCiudades.filter(ciudad =>
                                    ciudad.key.toLowerCase().includes(valor.toLowerCase())
                                );
                                setCiudadesFiltradas(coincidencias);
                            }} />
                        </div>

                        {formularioEnelElementosEmergencia.ciudad && ciudadesFiltradas.length > 0 && (
                            <ul className="sugerencias-ciudad">
                                {ciudadesFiltradas.slice(0, 10).map((ciudad, index) => (
                                    <li
                                        key={ciudad.key}
                                        onClick={() => {
                                            actualizarCampoEnelElementosEmergencia('ciudad', ciudad.key);
                                            setCiudadesFiltradas([]);
                                        }}
                                    >
                                        {ciudad.key}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className='campo nombreProyecto'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Centro de Trabajo:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese el centro de trabajo" value={formularioEnelElementosEmergencia.centroTrabajo} onChange={(e) => actualizarCampoEnelElementosEmergencia('centroTrabajo', e.target.value)} />
                        </div>
                    </div>

                    <div className='campo contrato'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>No. de contrato:</Textos>
                            <Selectores value={formularioEnelElementosEmergencia.noContrato} onChange={(e) => actualizarCampoEnelElementosEmergencia('noContrato', e.target.value)}
                                options={[
                                    { value: 'JA10123037/JA10123045', label: 'JA10123037 / JA10123045' },
                                    { value: 'JA10123400', label: 'JA10123400' },
                                    { value: 'JA10176840', label: 'JA10176840' },
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

                    <div className='campo lider'>
                        <i className="fas fa-users-cog"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Responsable de la Cuadrilla:</Textos>
                            <Entradas disabled={modo === "editar"} type="text" placeholder="Ingrese la cedula del lider de cuadrilla" value={formularioEnelElementosEmergencia.cedulaResponsableCuadrilla} onChange={(e) => {
                                const valor = e.target.value;
                                actualizarCampoEnelElementosEmergencia('cedulaResponsableCuadrilla', valor);
                                const registroEncontrado = datosPlanta.find(item => item.nit === valor);
                                if (registroEncontrado) {
                                    actualizarCampoEnelElementosEmergencia('nombreResponsableCuadrilla', registroEncontrado.nombre);
                                } else {
                                    actualizarCampoEnelElementosEmergencia('nombreResponsableCuadrilla', 'Usuario no encontrado');
                                }
                            }} />
                            <Entradas type="text" placeholder="Nombre" value={formularioEnelElementosEmergencia.nombreResponsableCuadrilla} disabled={true} />
                        </div>
                    </div>

                    <div className='campo proceso'>
                        <i className="fas fa-tools"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Proceso:</Textos>
                            <Selectores disabled={modo === "editar"} value={formularioEnelElementosEmergencia.proceso} onChange={(e) => actualizarCampoEnelElementosEmergencia('proceso', e.target.value)}
                                options={[
                                    { value: 'Obra civil', label: 'Obra civil' },
                                    { value: 'Obra electrica', label: 'Obra electrica' },
                                    { value: 'B2C', label: 'B2C' },
                                ]} className="primary">
                            </Selectores>
                        </div>
                    </div>

                    {imagenAmpliada && (
                        <div className='imagenAmpliada' onClick={() => setImagenAmpliada(null)}>
                            <img
                                src={imagenAmpliada}
                                alt="Imagen"
                            />
                        </div>
                    )}

                    <div className='preguntaInterruptor'>
                        <Interruptor
                            disabled={modo === "leer" || accionModalTabla === "eliminar"}
                            checked={mostrarPreguntasExtintores}
                            onChange={() => setMostrarPreguntasExtintores(!mostrarPreguntasExtintores)}
                            pregunta={'¿Preguntas de Extintores?'}
                        ></Interruptor>
                    </div>

                    <div className={`campo ${mostrarPreguntasExtintores ? '' : 'ocultar'}`}>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>1. Extintores (En cuanto a su estado)</Textos>
                            <div className='botonAgregar'>
                                <Botones disabled={modo === "editar"} className='agregar' onClick={() => {
                                    setAccionModalTabla("crear");
                                    const existe = (formularioEnelElementosEmergencia.extintores || []).some(m => m.ubicacion === miembroEnProceso.ubicacion);
                                    if (existe) {
                                        setMiembroEnProceso({});
                                    }
                                    setMostrarModal(true);
                                }}>Agregar</Botones>
                            </div>

                            <div className={`Tabla ${mostrarPreguntasExtintores ? '' : 'ocultar'}`}>
                                <Tablas columnas={columnas} datos={formularioEnelElementosEmergencia.extintores} filasPorPagina={5}
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
                        </div>
                    </div>

                    {mostrarModal && (
                        <>
                            <div className="modal-overlay" onClick={() => setMostrarModal(false)}></div>
                            <div className="modal-cuadrilla">
                                <div className="modal-contenido">
                                    <Textos className='titulo'>{accionModalTabla === 'crear' ? 'Agregar' : accionModalTabla === 'editar' ? 'Editar' : accionModalTabla === 'leer' ? 'Leer' : accionModalTabla === 'eliminar' ? 'Eliminar' : ''} Extintor</Textos>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Ubicacion:</Textos>
                                        <div className='opciones'>
                                            <Entradas type="text" placeholder="Ubicacion" value={miembroEnProceso.ubicacion || ""}
                                                onChange={(e) => {
                                                    const valor = e.target.value;
                                                    actualizarCampoMiembro('ubicacion', valor);
                                                }}
                                                disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"}
                                            />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Agente Extintor:</Textos>
                                        <div className='opciones'>
                                            <Entradas type="text" placeholder="Agente Extintor" value={miembroEnProceso.agenteExtintor || ""}
                                                onChange={(e) => {
                                                    const valor = e.target.value;
                                                    actualizarCampoMiembro('agenteExtintor', valor);
                                                }}
                                                disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"}
                                            />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Tipo:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('tipo', 'S')} className={miembroEnProceso.tipo === 'S' ? 'formulario selected' : ''}>S</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('tipo', 'P')} className={miembroEnProceso.tipo === 'P' ? 'formulario selected' : ''}>P</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Cilindro:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('cilindro', 'Si')} className={miembroEnProceso.cilindro === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('cilindro', 'No')} className={miembroEnProceso.cilindro === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Pasador:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('pasador', 'Si')} className={miembroEnProceso.pasador === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('pasador', 'No')} className={miembroEnProceso.pasador === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Sello de Seguridad:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('selloSeguridad', 'Si')} className={miembroEnProceso.selloSeguridad === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('selloSeguridad', 'No')} className={miembroEnProceso.selloSeguridad === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Manómetro / Condición de Carga:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('manometro', 'Si')} className={miembroEnProceso.manometro === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('manometro', 'No')} className={miembroEnProceso.manometro === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Manguera, Boquilla y/o Corneta:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('manguera', 'Si')} className={miembroEnProceso.manguera === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('manguera', 'No')} className={miembroEnProceso.manguera === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Etiqueta de Identificación:</Textos>
                                        <div className='opciones'>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('etiqueta', 'Si')} className={miembroEnProceso.etiqueta === 'Si' ? 'formulario selected' : ''}>Si</Botones>
                                            <Botones disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} onClick={() => actualizarCampoMiembro('etiqueta', 'No')} className={miembroEnProceso.etiqueta === 'No' ? 'formulario selected' : ''}>No</Botones>
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Fecha Ultima Carga:</Textos>
                                        <div className='opciones'>
                                            <Entradas type="date" placeholder="Fecha Ultima Carga" value={miembroEnProceso.fechaUltimaCarga || ""}
                                                onChange={(e) => {
                                                    const valor = e.target.value;
                                                    actualizarCampoMiembro('fechaUltimaCarga', valor);
                                                }}
                                                disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"}
                                            />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Fecha Proxima Recarga:</Textos>
                                        <div className='opciones'>
                                            <Entradas type="date" placeholder="Fecha Proxima Recarga" value={miembroEnProceso.fechaProximaRecarga || ""}
                                                min={miembroEnProceso.fechaUltimaCarga ? new Date(new Date(miembroEnProceso.fechaUltimaCarga).getTime()).toISOString().split("T")[0] : ""}
                                                onChange={(e) => {
                                                    const valor = e.target.value;
                                                    actualizarCampoMiembro('fechaProximaRecarga', valor);
                                                }}
                                                disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"}
                                            />
                                        </div>
                                    </div>
                                    <div className='entradaDatos vertical'>
                                        <Textos className='subtitulo'>Imagen(es)</Textos>
                                        <div className='opciones'>
                                            <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} fotoKey={'fotoExtintor'} foto={miembroEnProceso.fotoExtintor} onChange={(fotoKey, data) => actualizarCampoMiembro('fotoExtintor', data)} capture={formularioEnelElementosEmergencia.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                        </div>
                                    </div>
                                    <div className={`entradaDatos vertical observacion' ${miembroEnProceso.cilindro === 'No' || miembroEnProceso.pasador === 'No' || miembroEnProceso.selloSeguridad === 'No' || miembroEnProceso.manometro === 'No' || miembroEnProceso.manguera === 'No' || miembroEnProceso.etiqueta === 'No' ? '' : 'ocultar'}`}>
                                        <Textos className='subtitulo'>Observaciones:</Textos>
                                        <div className='opciones'>
                                            <AreaTextos disabled={accionModalTabla === "eliminar" || accionModalTabla === "leer"} type="text" placeholder="Agregue las observacion pertinentes" value={miembroEnProceso.observacion} onChange={(e) => actualizarCampoMiembro('observacion', e.target.value)} rows={4} />
                                        </div>
                                    </div>
                                    <div className={`modal-acciones ${accionModalTabla !== "leer" ? 'visible' : 'oculto'}`}>
                                        <Botones className={`guardar ${accionModalTabla === "crear" ? 'visible' : 'oculto'}`} onClick={() => {
                                            const existe = (formularioEnelElementosEmergencia.extintores || []).some(m => m.ubicacion === miembroEnProceso.ubicacion);
                                            if (existe) {
                                                toast.error('La cédula ya está en la cuadrilla.');
                                                return
                                            }

                                            const resultadoValidador = validarMiembroEnProceso(miembroEnProceso);

                                            if (resultadoValidador === false) {
                                                return
                                            }

                                            setFormularioEnelElementosEmergencia(prev => {
                                                const actualizado = { ...prev, extintores: [...(prev.extintores || []), miembroEnProceso] };
                                                localStorage.setItem('formularioEnelElementosEmergencia', JSON.stringify(actualizado));
                                                return actualizado;
                                            });
                                            toast.success('Integrante creado exitosamente.');
                                            localStorage.removeItem('miembroEnProceso');
                                            setMostrarModal(false);
                                            setMiembroEnProceso({})
                                        }}>Crear</Botones>
                                        <Botones className={`guardar ${accionModalTabla === "editar" ? 'visible' : 'oculto'}`} onClick={() => {
                                            const existe = (formularioEnelElementosEmergencia.extintores || []).map(m => m.ubicacion === miembroEnProceso.ubicacion ? miembroEnProceso : m);

                                            setFormularioEnelElementosEmergencia(prev => {
                                                const actualizado = { ...prev, extintores: existe };
                                                localStorage.setItem('formularioEnelElementosEmergencia', JSON.stringify(actualizado));
                                                return actualizado;
                                            });
                                            toast.success('Integrante editado exitosamente.');
                                            localStorage.removeItem('miembroEnProceso');
                                            setMostrarModal(false);
                                            setMiembroEnProceso({})
                                        }}>Editar</Botones>
                                        <Botones className={`eliminar ${accionModalTabla === "eliminar" ? 'visible' : 'oculto'}`} onClick={() => {
                                            const nuevoExtintor = (formularioEnelElementosEmergencia.extintores || []).filter(m => m.ubicacion !== miembroEnProceso.ubicacion);

                                            setFormularioEnelElementosEmergencia(prev => {
                                                const actualizado = { ...prev, extintores: nuevoExtintor };
                                                localStorage.setItem('formularioEnelElementosEmergencia', JSON.stringify(actualizado));
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

                    <div className='preguntaInterruptor'>
                        <Interruptor
                            disabled={modo === "leer" || accionModalTabla === "eliminar"}
                            checked={mostrarPreguntasDerrames}
                            onChange={() => setMostrarPreguntasDerrames(!mostrarPreguntasDerrames)}
                            pregunta={'¿Preguntas de Kit para Control de Derrames?'}
                        ></Interruptor>
                    </div>

                    <div className={`campo ${mostrarPreguntasDerrames ? '' : 'ocultar'}`}>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>2. Kit para Control de Derrames</Textos>
                            {preguntas.slice(0, 20).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="controlDerrames"
                                    keyBase={preg.key}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelElementosEmergencia}
                                    onChange={actualizarCampoEnelElementosEmergencia}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                    cantidadExistenteBool={true}
                                    cantidadExistenteKey={preg.cantidadExistenteKey}
                                    tituloOpcionesBotones={'Estado'}
                                    opcionesBotones={["Bueno", "Malo", "Regular"]}
                                    keySolucion="solucion"
                                    fotoKeySolucion={preg.fotoKey}
                                    observacionKeySolucion={preg.observacionKey}
                                />
                            ))}
                            <div className='cartas'>
                                <Textos className='subtitulo sub'>Imagen(es)</Textos>
                                <div className='opciones'>
                                    <Imagenes disableInput={accionModalTabla === "eliminar" || accionModalTabla === "leer"} fotoKey={'fotoControlDerrames'} foto={formularioEnelElementosEmergencia.controlDerrames.fotoControlDerrames} onChange={(fotoKey, data) => actualizarCampoEnelElementosEmergencia(`controlDerrames.fotoControlDerrames`, data)} capture={formularioEnelElementosEmergencia.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagenAmpliada(data)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='preguntaInterruptor'>
                        <Interruptor
                            disabled={modo === "leer" || accionModalTabla === "eliminar"}
                            checked={mostrarPreguntasEmergencia}
                            onChange={() => setMostrarPreguntasEmergencia(!mostrarPreguntasEmergencia)}
                            pregunta={'¿Preguntas de Elementos de Emergencia?'}
                        ></Interruptor>
                    </div>

                    <div className={`campo ${mostrarPreguntasEmergencia ? '' : 'ocultar'}`}>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo prin'>3. Aspectos Generales a Verificar de los Elementos de Emergencia</Textos>
                            {preguntas.slice(21, 34).map((preg) => (
                                <OpcionesFotoObservaciones
                                    key={preg.key}
                                    texto={preg.texto}
                                    keyPrin="elementosEmergencia"
                                    keyBase={preg.key}
                                    fotoKey={preg.fotoKey}
                                    observacionKey={preg.observacionKey}
                                    activarinput={preg.activarinput}
                                    data={formularioEnelElementosEmergencia}
                                    onChange={actualizarCampoEnelElementosEmergencia}
                                    setImagen={setImagenAmpliada}
                                    disabled={modo === "editar"}
                                    tituloOpcionesBotones={'Verificacion'}
                                    opcionesBotones={["Si", "No"]}
                                    keySolucion="solucion"
                                    fotoKeySolucion={preg.fotoKey}
                                    observacionKeySolucion={preg.observacionKey}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='campo observacion'>
                        <i className="fas fa-comment"></i>
                        <div className='entradaDatos'>
                            <Textos className='subtitulo'>Observaciones:</Textos>
                            <AreaTextos disabled={modo === "editar"} type="text" placeholder="Agregue las observacion pertinentes" value={formularioEnelElementosEmergencia.observacion} onChange={(e) => actualizarCampoEnelElementosEmergencia('observacion', e.target.value)} rows={4} />
                        </div>
                    </div>

                    <div className='enviar'>
                        <Botones disabled={modo === "editar"} className="eliminar" onClick={() => {
                            localStorage.removeItem('formularioEnelElementosEmergencia');
                            setFormularioEnelElementosEmergencia(estadoInicialFormularioEnelElementosEmergencia);
                        }}>Borrar formulario</Botones>
                        <Botones disabled={modo === "editar" && hayCambiosEnSolucion === false} type="submit" id='Enviar' className="guardar" onClick={enviarFormularioEnelElementosEmergencia}>{hayCambiosEnSolucion ? 'Actualizar' : 'Enviar'}</Botones>
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