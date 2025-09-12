import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './gestionOts.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import L from 'leaflet';
import Cookies from 'js-cookie';
import CargandoDatos from '../../../components/cargandoDatos/cargandoDatos';
import Botones from '../../../components/botones/botones';
import Textos from '../../../components/textos/textos';
import Entradas from '../../../components/entradas/entradas';
import Selectores from '../../../components/selectores/selectores';
import AreaTextos from '../../../components/areaTextos/areaTextos';
import * as XLSX from 'xlsx';

const GestionOts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { estadoNotificacion } = location.state || {};
    const role = Cookies.get('userRole');
    const nombre = Cookies.get('userNombre');
    const mapRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [data, setData] = useState('');
    const [dataDisponible, setDataDisponible] = useState('');
    const [dataInvalida, setDataInvalida] = useState('');
    const [info, setInfo] = useState({});
    const [infoVisible, setInfoVisible] = useState(false);
    const contenidoRef = useRef(null);
    const [fechaProgramacion, setFechaProgramacion] = useState('');
    const [tipoMovil, setTipoMovil] = useState('');
    const [cuadrilla, setCuadrilla] = useState('');
    const [observacion, setObservacion] = useState('');
    const [turnoAsignado, setTurnoAsignado] = useState('');
    const [selectedMarkers, setSelectedMarkers] = useState([]);
    const [infoVisibleVarios, setInfoVisibleVarios] = useState(false);
    const allMarkersRef = useRef([]);
    const [moviles, setMoviles] = useState('');

    const mostrarInfoEnPanel = (data) => {
        setInfo(data);
        setFechaProgramacion('');
        setTipoMovil('');
        setTurnoAsignado('');
        setCuadrilla('');
        setObservacion('');
        setInfoVisible(true);
    };

    const cargarRegistros = async (event) => {
        setLoading(true);

        try {
            const responseRegistros = await axios.get(`${process.env.REACT_APP_API_URL}/gestionOts/registros`);
            const data = responseRegistros.data;
            const coordenadasInvalidas = data.filter(
                item => !item.x || !item.y || isNaN(item.x) || isNaN(item.y)
            );
            setDataInvalida(coordenadasInvalidas);
            const coordenadasValidas = data
                .filter(item => item.x && item.y && !isNaN(item.x) && !isNaN(item.y))

            setLoading(false);
            setData(coordenadasValidas);
            const dataDisponible = coordenadasValidas
                .filter(item => item.estado_actual === 'DISPONIBLE_PROGRAMAR')
            setDataDisponible(dataDisponible);

            const responseCuadrillas = await axios.get(`${process.env.REACT_APP_API_URL}/gestionOts/cuadrillasEnelAlumbradoPublico`);
            setMoviles(responseCuadrillas.data);

        } catch (error) {
            console.error("Error al obtener datos:", error);
        } finally {
            setLoading(false);
        }

    }

    let infoFiltrada = "";
    function aplicarFiltros() {
        const valorTexto = filtroTexto.trim().toLowerCase() || "";
        const valorCiudad = filtroCiudad.trim() || "";
        const startDate = filtroFechaInicio || "";
        const valorCuadrilla = filtroCuadrilla.trim() || "";
        const valorEstado = filtroAsignacion.trim() || "";
        const valorEstadoActualOT = filtroEstadoActualOT.trim() || "";
        const valorTurno = filtroTurno.trim() || "";
        const valorSeleccionMultiple = seleccionMultiple;
        const valorOrdenes = filtroOrdenes;
        const valorLote = filtroLote;

        infoFiltrada = data.filter(item => {
            const pasaTexto = valorTexto === "" || Object.values(item).some(value =>
                String(value).toLowerCase().includes(valorTexto)
            );

            const pasaCiudad = valorCiudad === "" || String(item.proyecto).toLowerCase() === valorCiudad.toLowerCase();

            let historicoArray = [];
            try {
                historicoArray = JSON.parse(item.historico);
            } catch (e) {
                console.warn("No se pudo parsear el histórico:", e);
            }
            const pasaFecha = startDate === "" || (Array.isArray(historicoArray) && historicoArray.some(h => h.fechaProgramacion && h.fechaProgramacion === startDate));

            const pasaCuadrilla = valorCuadrilla === "" || String(item.historico).toLowerCase().includes(`a la movil ${valorCuadrilla.toLowerCase()}`) ||
                String(item.historico).toLowerCase().includes(`a la cuadrilla ${valorCuadrilla.toLowerCase()}`);

            const pasaEstado = valorEstado === "Asignado" ? item.cuadrilla != null && item.atendida !== "OK" : valorEstado === "Pendiente" ? !item.cuadrilla && item.atendida !== "OK" : valorEstado === "Atendido" ? item.atendida === "OK" : true;

            const pasaEstadoActualOT = valorEstadoActualOT === "" || String(item.estado_actual).toLowerCase() === valorEstadoActualOT.toLowerCase();

            const pasaTurno = valorTurno === "" || String(item.historico).toLowerCase().includes(`y turno ${valorTurno.toLowerCase()}`);

            const pasaSeleccionMultiple = valorSeleccionMultiple === true ? item.atendida !== "OK" : true;

            const ordenesPermitidas = valorOrdenes && valorOrdenes.length > 0 ? new Set(valorOrdenes) : null;
            const pasaOrdenes = !ordenesPermitidas || ordenesPermitidas.has(Number(item.nro_orden));

            const pasaLotes = valorLote === "" || (Array.isArray(JSON.parse(item.lotes || '[]')) && JSON.parse(item.lotes || '[]').includes(Number(valorLote)));

            return pasaTexto && pasaCiudad && pasaFecha && pasaCuadrilla && pasaEstado && pasaEstadoActualOT && pasaTurno && pasaSeleccionMultiple && pasaOrdenes && pasaLotes;
        });

        mapRef.current.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                mapRef.current.removeLayer(layer);
            }
        });

        infoFiltrada.forEach(item => addMarkerToMap(item));

        actualizarTotalItems(infoFiltrada.length);

        if (infoFiltrada.length > 0) {
            const bounds = L.latLngBounds(infoFiltrada.map(item => [item.x, item.y]));
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    function actualizarTotalItems(cantidad) {
        const controlDiv = document.querySelector('.total-items-control');
        if (controlDiv) {
            controlDiv.innerHTML = `Total: ${cantidad}`;
        }
    }

    const generarMapa = async (data) => {

        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        const firstLocation = data[0];
        const { x, y } = firstLocation;
        mapRef.current = L.map('map').setView([x, y], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        data.forEach(item => {
            addMarkerToMap(item);
        });

        actualizarTotalItems(data.length);

        if (data.length > 1) {
            const bounds = L.latLngBounds(data.map(item => [item.x, item.y]));
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

        // Botón para establecer una ubicacion general
        const locationButton = L.control({ position: 'bottomright' });
        locationButton.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom mi-boton-ubicacion');

            div.innerHTML = '<i class="fa fa-location-arrow"></i>';

            div.onclick = function () {
                if (infoFiltrada.length > 0) {
                    const bounds = L.latLngBounds(infoFiltrada.map(item => [item.x, item.y]));
                    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                } else {
                    const bounds = L.latLngBounds(data.map(item => [item.x, item.y]));
                    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                }
            };

            return div;
        };
        locationButton.addTo(mapRef.current);

        let totalItemsControl = L.control({ position: 'bottomleft' });
        totalItemsControl.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom total-items-control');
            div.innerHTML = `Total items: ${data.length}`;
            return div;
        };
        totalItemsControl.addTo(mapRef.current);
    };

    const coordCount = {};

    const addMarkerToMap = (item) => {
        const { x, y, cuadrilla, atendida } = item;

        if (!x || !y || isNaN(x) || isNaN(y)) {
            console.warn("Coordenadas inválidas para el item:", item);
            return;
        }

        let xTemp = parseFloat(x);
        let yTemp = parseFloat(y);

        const coordKey = `${xTemp.toFixed(6)},${yTemp.toFixed(6)}`;

        if (!coordCount[coordKey]) {
            coordCount[coordKey] = 0;
        } else {
            const offset = (coordCount[coordKey] + 1) * 0.00005;
            xTemp = xTemp + (Math.random() > 0.5 ? offset : -offset);
            yTemp = yTemp + (Math.random() > 0.5 ? offset : -offset);
        }

        coordCount[coordKey]++;

        let markerColor;
        if (atendida === "OK") {
            markerColor = "black";
        } else if (cuadrilla && cuadrilla.trim() !== "") {
            markerColor = "green";
        } else {
            markerColor = "#18409E";
        }

        const awesomeMarker = L.divIcon({
            html: `<i class="fa fa-location-dot" 
                        style="color:${markerColor}; 
                            font-size:16px;"
                    ></i>`,
            className: 'transparent-marker',
            iconSize: [20, 20],
            popupAnchor: [0, -10]
        });

        const marker = L.marker([xTemp, yTemp], { icon: awesomeMarker }).addTo(mapRef.current);

        marker.bindPopup(
            `<p class='titulo'><b>${item.nro_orden || "Sin informacion"}</b></p>Rotulo: ${item.no_rotulo || "Sin informacion"}<br/>Tipo de falla: ${item.tipo_falla || "Sin informacion"}<br/>Ubicacion: <a href="https://www.google.com/maps?q=${item.x},${item.y}" target="_blank">Ver en Google Maps</a>`,
            { permanent: false, direction: "top", className: "popup-grande", interactive: true }
        );
        let hoverTimeout;
        marker.on("mouseover", function () {
            hoverTimeout = setTimeout(() => {
                marker.openPopup();
                marker.getPopup().getElement().addEventListener("mouseleave", () => {
                    marker.closePopup();
                });
                marker.getPopup().getElement().addEventListener("mouseenter", () => {
                    clearTimeout(hoverTimeout);
                });
            }, 400);
        });
        marker.on("mouseout", function () {
            clearTimeout(hoverTimeout);
        });
        allMarkersRef.current.push({ marker, data: item });

        marker.on("click", () => {
            if (seleccionMultiple) {
                setSelectedMarkers((prev) => {
                    const exists = prev.find(m => m.id === item.id);

                    let markerColor;
                    if (exists) {
                        markerColor = "#18409E";
                    } else {
                        markerColor = "orange";
                    }
                    const awesomeMarker = L.divIcon({
                        html: `<i class="fa fa-location-dot" 
                                    style="color:${markerColor}; 
                                        font-size:16px;"
                                ></i>`,
                        className: 'transparent-marker',
                        iconSize: [20, 20],
                        popupAnchor: [0, -10]
                    });
                    marker.setIcon(awesomeMarker);

                    return exists
                        ? prev.filter(m => m.id !== item.id)
                        : [...prev, item];
                });
            } else {
                mostrarInfoEnPanel(item);
            }
        });
    };

    useEffect(() => {
        const applyBtn = document.querySelector('#applySelectionBtn');
        const applyBtn2 = document.querySelector('.botonMapa');
        if (applyBtn) {
            applyBtn.style.display = selectedMarkers.length > 0 ? 'inline-block' : 'none';
            applyBtn2.style.display = selectedMarkers.length > 0 ? 'inline-block' : 'none';
        }
    }, [selectedMarkers]);

    useEffect(() => {
        const yaRecargado = localStorage.getItem('yaRecargado');
        const nombreUsuario = Cookies.get('userNombre');

        if (nombreUsuario === undefined) {
            window.location.href = '/ReportingCenter#/Login?tipo=GestionOts';
        } else if (!yaRecargado) {
            localStorage.setItem('yaRecargado', 'true');
            window.location.reload();
        }

        if (estadoNotificacion) {
            navigate('/GestionOts', { state: { role: role, nombre: nombre, estadoNotificacion: false } });
            toast.success('Datos enviados exitosamente', { className: 'toast-success' });
        }

        const ejecutarSecuencia = async () => {
            try {
                await cargarRegistros();
            } catch (error) {
                console.error('Error al ejecutar funciones secuenciales:', error);
            }
        };

        ejecutarSecuencia();
    }, []);

    useEffect(() => {
        if (data && data.length > 0) {
            const mapElement = document.getElementById('map');
            if (mapElement) {
                generarMapa(data);
            }
        }
    }, [data]);

    useEffect(() => {
        if ((infoVisible || infoVisibleVarios) && contenidoRef.current) {
            contenidoRef.current.scrollTop = 0;
        }
    }, [infoVisible, infoVisibleVarios]);

    const enviarActualizacionDeOT = async (ids) => {
        if (info.atendida !== 'OK') {
            if (!fechaProgramacion && cuadrilla !== 'Disponible') { toast.error('Por favor ingrese la fecha de programacion.'); return }
            if (!cuadrilla) { toast.error('Por favor ingrese la cuadrilla.'); return }
            if (!turnoAsignado && cuadrilla !== 'Disponible') { toast.error('Por favor ingrese el turno.'); return }
            if (!tipoMovil && cuadrilla !== 'Disponible') { toast.error('Por favor ingrese el tipo de inspeccion.'); return }
            if (ids.length === 1 && info.cuadrilla !== null) {
                if (!observacion) { toast.error('Por favor diligencie la observacion.'); return }
            }
        } else if (info.atendida === 'OK') {
            if (ids.length === 1) {
                if (!observacion) { toast.error('Por favor diligencie la observacion.'); return }
            }
        }

        setEnviando(true);

        try {
            if (info.atendida !== 'OK') {
                const [nro_movil, cedula_cuadrilla, nombre_cuadrilla] = cuadrilla.split(" - ");
                const datos = {
                    fecha_programacion: fechaProgramacion,
                    tipoMovil: tipoMovil,
                    cuadrilla: nro_movil,
                    cedula_cuadrilla: cedula_cuadrilla,
                    nombre_cuadrilla: nombre_cuadrilla,
                    turnoAsignado: turnoAsignado,
                    observaciones: observacion,
                    ids: ids,
                    nombreUsuario: Cookies.get('userNombre'),
                };

                const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/gestionOts/asignarOT`, datos);

                if (response2.status >= 200 && response2.status < 300) {
                    setEnviando(false)
                    console.log('Datos enviados exitosamente');
                    toast.success('Datos enviados exitosamente', { className: 'toast-success' });
                    setInfoVisible(false);
                    setInfoVisibleVarios(false);
                    setInfo('');
                    setFechaProgramacion('');
                    setTipoMovil('');
                    setTurnoAsignado('');
                    setCuadrilla('');
                    setObservacion('');
                    setSeleccionMultiple(false);
                    setSelectedMarkers([]);
                    await cargarRegistros();
                } else {
                    toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
                    setEnviando(false)
                }
            } else if (info.atendida === 'OK') {
                const datos = {
                    observaciones: observacion,
                    id: ids,
                    nombreUsuario: Cookies.get('userNombre'),
                };

                const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/gestionOts/rehabilitarOT`, datos);

                if (response2.status >= 200 && response2.status < 300) {
                    setEnviando(false)
                    console.log('Datos enviados exitosamente');
                    toast.success('Datos enviados exitosamente', { className: 'toast-success' });
                    setInfoVisible(false);
                    setInfoVisibleVarios(false);
                    setInfo('');
                    setObservacion('');
                    setSeleccionMultiple(false);
                    setSelectedMarkers([]);
                    await cargarRegistros();
                } else {
                    toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
                    setEnviando(false)
                }
            }
        } catch (error) {
            const mensaje = error.response?.data?.error || 'Error al enviar los datos.';
            console.error('Error al enviar:', mensaje);
            toast.error(mensaje, { className: 'toast-error' });
            setEnviando(false)
        }
    };

    const enviarActualizacionDeAtencion = async (valoresColumna) => {
        if (valoresColumna.length === 0) {
            toast.error('No hay ordenes en el archivo.');
            return
        }

        setEnviando(true);

        try {
            const datos = {
                ordenes: valoresColumna,
                nombreUsuario: Cookies.get('userNombre'),
            };

            const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/gestionOts/marcarAtendidas`, datos);

            if (response2.status >= 200 && response2.status < 300) {
                setEnviando(false)
                console.log('Datos enviados exitosamente');
                toast.success('Datos enviados exitosamente', { className: 'toast-success' });
                await cargarRegistros();
            } else {
                toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
                setEnviando(false)
            }
        } catch (error) {
            const mensaje = error.response?.data?.error || 'Error al enviar los datos.';
            console.error('Error al enviar:', mensaje);
            toast.error(mensaje, { className: 'toast-error' });
            setEnviando(false)
        }
    };

    const enviarActualizacionDeOtsNuevas = async (jsonData) => {
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            toast.error('El archivo no tiene información válida.');
            return;
        }

        setEnviando(true);

        try {
            const datos = {
                data: jsonData,
                nombreUsuario: Cookies.get('userNombre'),
            };

            const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/gestionOts/nuevasOrdenes`, datos);

            if (response2.status >= 200 && response2.status < 300) {
                setEnviando(false)
                console.log('Datos enviados exitosamente');
                toast.success('Datos enviados exitosamente', { className: 'toast-success' });
                await cargarRegistros();
            } else {
                toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
                setEnviando(false)
            }
        } catch (error) {
            const mensaje = error.response?.data?.error || 'Error al enviar los datos.';
            console.error('Error al enviar:', mensaje);
            toast.error(mensaje, { className: 'toast-error' });
            setEnviando(false)
        }
    };

    const [filtroCuadrilla, setFiltroCuadrilla] = useState('');
    const [filtroCiudad, setFiltroCiudad] = useState('');
    const [filtroAsignacion, setFiltroAsignacion] = useState('');
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
    const [filtroOtsInvalidas, setFiltroOtsInvalidas] = useState('');
    const [seleccionMultiple, setSeleccionMultiple] = useState(false);
    const [filtroEstadoActualOT, setFiltroEstadoActualOT] = useState('');
    const [filtroTurno, setFiltroTurno] = useState('');
    const [filtroOrdenes, setFiltroOrdenes] = useState('');
    const [inputFiltroOrdenesKey, setInputFiltroOrdenesKey] = useState('');
    const [filtroLote, setFiltroLote] = useState('');

    useEffect(() => {
        if (data) {
            aplicarFiltros();
        }
    }, [filtroCuadrilla, filtroCiudad, filtroAsignacion, filtroTexto, filtroFechaInicio, filtroOtsInvalidas, seleccionMultiple, filtroEstadoActualOT, filtroTurno, filtroOrdenes, filtroLote]);

    return (
        <div className="GestionOts">
            {loading ? (
                <CargandoDatos text={'Cargando Datos'} />
            ) : enviando ? (
                <CargandoDatos text={'Enviando Datos'} />
            ) : (
                <>
                    <div className='Filtros'>
                        <div className={`campo ${dataInvalida.length > 0 ? '' : 'ocultar'}`}>
                            <div className='titulo'>
                                <i className="fa fa-list"></i>
                                <Textos className='subtitulo'>OTs Invalidas</Textos>
                            </div>
                            <div className='opcion'>
                                <Selectores value={filtroOtsInvalidas}
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        setFiltroOtsInvalidas(valor);
                                        if (valor !== '') {
                                            const itemSeleccionado = dataInvalida
                                                .filter(item => item.nro_orden === valor)
                                            if (itemSeleccionado) {
                                                mostrarInfoEnPanel(itemSeleccionado[0]);
                                            }
                                        }
                                    }}
                                    options={dataInvalida.map((item) => ({
                                        value: item.nro_orden,
                                        label: `${item.nro_orden} - ${item.localidad_descrip}`
                                    }))}
                                    className="primary">
                                </Selectores>
                            </div>
                        </div>
                        <div className={`linea ${dataInvalida.length > 0 ? '' : 'ocultar'}`}></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-calendar"></i>
                                <Textos className='subtitulo'>Fecha Programacion</Textos>
                            </div>
                            <div className='opcion'>
                                <Entradas type="date" value={filtroFechaInicio} onChange={(e) => { setFiltroFechaInicio(e.target.value) }}></Entradas>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-pencil"></i>
                                <Textos className='subtitulo'>Texto</Textos>
                            </div>
                            <div className='opcion'>
                                <Entradas value={filtroTexto} placeholder="Filtro ..." onChange={(e) => { setFiltroTexto(e.target.value) }}></Entradas>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-city"></i>
                                <Textos className='subtitulo'>Ciudad</Textos>
                            </div>
                            <div className='opcion'>
                                <Selectores value={filtroCiudad} onChange={(e) => { setFiltroCiudad(e.target.value) }}
                                    options={
                                        [...new Set(data.map(d => d.proyecto))]
                                            .filter(Boolean)
                                            .sort((a, b) => a.localeCompare(b))
                                            .map(ciudad => ({ value: ciudad, label: ciudad }))
                                    }
                                    className="primary">
                                </Selectores>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-users"></i>
                                <Textos className='subtitulo'>Cuadrilla</Textos>
                            </div>
                            <div className='opcion'>
                                <Selectores value={filtroCuadrilla} onChange={(e) => { setFiltroCuadrilla(e.target.value) }}
                                    options={
                                        (Array.isArray(moviles) ? moviles : [])
                                            .filter((item, index, self) =>
                                                index === self.findIndex((m) => m.nro_movil === item.nro_movil)
                                            )
                                            .sort((a, b) => {
                                                const numA = parseInt(a.nro_movil, 10);
                                                const numB = parseInt(b.nro_movil, 10);
                                                return numA - numB;
                                            })
                                            .map((item) => ({
                                                value: item.nro_movil,
                                                label: `Movil ${item.nro_movil} - ${item.nombres_apellidos}`,
                                            }))
                                    }
                                    className="primary">
                                </Selectores>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-user-clock"></i>
                                <Textos className='subtitulo'>Turno</Textos>
                            </div>
                            <div className='opcion'>
                                <Selectores value={filtroTurno} onChange={(e) => { setFiltroTurno(e.target.value) }}
                                    options={[
                                        { value: 'A', label: 'A' },
                                        { value: 'B', label: 'B' },
                                        { value: 'C', label: 'C' },
                                    ]}
                                    className="primary">
                                </Selectores>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-hashtag"></i>
                                <Textos className='subtitulo'>Lote</Textos>
                            </div>
                            <div className='opcion'>
                                <Entradas
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={filtroLote}
                                    placeholder="Filtro ..."
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        if (valor === '' || /^[1-9]\d*$/.test(valor)) {
                                            setFiltroLote(valor);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-clipboard-list"></i>
                                <Textos className='subtitulo'>Estado Actual OT</Textos>
                            </div>
                            <div className='opcion'>
                                <Selectores value={filtroEstadoActualOT} onChange={(e) => { setFiltroEstadoActualOT(e.target.value) }}
                                    options={
                                        [...new Set(data.map(d => d.estado_actual))]
                                            .filter(Boolean)
                                            .sort((a, b) => a.localeCompare(b))
                                            .map(estado_actual => ({ value: estado_actual, label: estado_actual }))
                                    }
                                    className="primary">
                                </Selectores>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-hourglass-half"></i>
                                <Textos className='subtitulo'>Estado Aplicativo</Textos>
                            </div>
                            <div className='opcion'>
                                <Selectores value={filtroAsignacion} onChange={(e) => { setFiltroAsignacion(e.target.value) }}
                                    options={[
                                        { value: 'Asignado', label: 'Asignado' },
                                        { value: 'Pendiente', label: 'Pendiente' },
                                        { value: 'Atendido', label: 'Atendido' },
                                    ]}
                                    className="primary">
                                </Selectores>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='opcion'>
                                <div className="checkControl">
                                    <div className="texto">
                                        <i className="fa fa-check-double"></i>
                                        <Entradas type="checkbox" value={seleccionMultiple} onChange={(e) => {
                                            const valor = e.target.checked;
                                            setSeleccionMultiple(valor);
                                            aplicarFiltros();
                                            if (valor === false) {
                                                setSelectedMarkers([]);
                                            }
                                        }} />
                                        <Textos className='parrafo'>Seleccion multiple</Textos>
                                    </div>
                                    <div className={`botonMapa`} style={{ display: selectedMarkers.length > 0 ? "block" : "" }}>
                                        <Botones className="guardar icono" onClick={() => setInfoVisibleVarios(true)}>
                                            &#10003;
                                        </Botones>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='opcion'>
                                <i className="fa fa-trash"></i>
                                <Botones className='agregar'
                                    onClick={() => {
                                        setFiltroFechaInicio('');
                                        setFiltroTexto('');
                                        setFiltroCiudad('');
                                        setFiltroCuadrilla('');
                                        setFiltroTurno('');
                                        setFiltroEstadoActualOT('');
                                        setFiltroAsignacion('');
                                        setFiltroOrdenes('');
                                        setFiltroLote('');
                                        setInputFiltroOrdenesKey(Date.now());
                                        setSeleccionMultiple(false);
                                        setSelectedMarkers([]);
                                        infoFiltrada = data;
                                        aplicarFiltros();
                                        actualizarTotalItems(infoFiltrada.length);
                                    }}
                                >Borrar filtros</Botones>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='opcion'>
                                <i className="fa fa-trash"></i>
                                <Botones className='imagenes'
                                    onClick={() => {
                                        allMarkersRef.current.forEach(({ marker }) => marker.remove());
                                        allMarkersRef.current = [];
                                    }}
                                >Borrar Marcadores</Botones>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='opcion'>
                                <i className="fa fa-file-excel"></i>
                                <Botones className='guardar'
                                    onClick={() => {
                                        let dataExport
                                        if (!infoFiltrada || infoFiltrada.length === 0) {
                                            dataExport = data;
                                        } else {
                                            dataExport = infoFiltrada;
                                        }
                                        const ws = XLSX.utils.json_to_sheet(dataExport);
                                        const wb = XLSX.utils.book_new();
                                        XLSX.utils.book_append_sheet(wb, ws, "Datos");
                                        XLSX.writeFile(wb, "Gestion_OTs.xlsx");
                                    }}
                                >Exportar</Botones>
                            </div>
                        </div>
                        <div className="campo">
                            <div className='opcion'>
                                <i className="fa fa-undo"></i>
                                <Botones className='eliminar'
                                    onClick={() => {
                                        const ids = data
                                            .filter(item => item.atendida !== "OK" && item.cuadrilla !== null && item.cuadrilla.trim() !== "")
                                            .map(item => item.id);
                                        setCuadrilla('Disponible')
                                        setObservacion('Se desasigna masivamente las ordenes de trabajo.')
                                        enviarActualizacionDeOT(ids);
                                    }}
                                >Desasignar Ordenes</Botones>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-upload"></i>
                                <Textos className='subtitulo'>Nuevas</Textos>
                            </div>
                            <div className='opcion'>
                                <Entradas type="file" accept=".xlsx,.xls" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const reader = new FileReader();

                                    reader.onload = function (evt) {
                                        const data = new Uint8Array(evt.target.result);
                                        const workbook = XLSX.read(data, { type: 'array' });

                                        const hojas = ["Ordenes"];

                                        hojas.forEach(nombreHoja => {
                                            if (workbook.SheetNames.includes(nombreHoja)) {
                                                const worksheet = workbook.Sheets[nombreHoja];
                                                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                                                if (jsonData.length === 0) {
                                                    toast.warning(
                                                        `La hoja "${nombreHoja}" no contiene datos además del encabezado`,
                                                        { className: "toast-success" }
                                                    );
                                                    e.target.value = null;
                                                    return;
                                                }

                                                jsonData.forEach(row => {
                                                    if (typeof row.fecha_ingreso === "number") {
                                                        const fechaJS = XLSX.SSF.format("yyyy-mm-dd", row.fecha_ingreso);
                                                        row.fecha_ingreso = fechaJS;
                                                    }
                                                    if (typeof row.ahora === "number") {
                                                        const fechaJS = XLSX.SSF.format("yyyy-mm-dd hh:mm", row.ahora);
                                                        row.ahora = fechaJS;
                                                    }
                                                });

                                                enviarActualizacionDeOtsNuevas(jsonData)
                                            } else {
                                                toast.warning('Por favor cargar archivo correcto', { className: 'toast-success' });
                                                console.warn(`La hoja "${nombreHoja}" no existe en el archivo.`);
                                            }
                                        });
                                    };
                                    reader.readAsArrayBuffer(file);

                                    e.target.value = null;
                                }}></Entradas>
                            </div>
                            <div className="descarga">
                                <a href="https://drive.google.com/uc?export=download&id=1i-K_aG_bE_Ba83gF_K5DKxce4B-XpiOv" download>Descargar archivo plano</a>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-upload"></i>
                                <Textos className='subtitulo'>Atendidas</Textos>
                            </div>
                            <div className='opcion'>
                                <Entradas type="file" accept=".xlsx,.xls" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const reader = new FileReader();
                                    reader.onload = function (evt) {
                                        const data = new Uint8Array(evt.target.result);
                                        const workbook = XLSX.read(data, { type: 'array' });

                                        const hojasYColumnas = {
                                            "Atendidas": "nro_orden",
                                        };

                                        let valoresColumna = [];

                                        Object.entries(hojasYColumnas).forEach(([nombreHoja, nombreColumna]) => {
                                            if (workbook.SheetNames.includes(nombreHoja)) {
                                                const worksheet = workbook.Sheets[nombreHoja];
                                                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                                                if (jsonData.length === 0) {
                                                    toast.warning(
                                                        `La hoja "${nombreHoja}" no contiene datos además del encabezado`,
                                                        { className: "toast-success" }
                                                    );
                                                    e.target.value = null;
                                                    return;
                                                }

                                                jsonData.forEach(fila => {
                                                    if (fila[nombreColumna] !== undefined && fila[nombreColumna] !== null) {
                                                        valoresColumna.push(fila[nombreColumna]);
                                                    }
                                                });

                                                enviarActualizacionDeAtencion(valoresColumna)
                                            } else {
                                                toast.warning('Por favor cargar archivo correcto', { className: 'toast-success' });
                                                console.warn(`La hoja "${nombreHoja}" no existe en el archivo.`);
                                            }
                                        });
                                    };
                                    reader.readAsArrayBuffer(file);

                                    e.target.value = null;
                                }}></Entradas>
                            </div>
                            <div className="descarga">
                                <a href="https://drive.google.com/uc?export=download&id=12l90aMGmivuFDs0uDNl4kZaSjWOq5ZKK" download>Descargar archivo plano</a>
                            </div>
                        </div>
                        <div className='linea'></div>
                        <div className="campo">
                            <div className='titulo'>
                                <i className="fa fa-upload"></i>
                                <Textos className='subtitulo'>Visualizar Ordenes</Textos>
                            </div>
                            <div className='opcion'>
                                <Entradas key={inputFiltroOrdenesKey} type="file" accept=".xlsx,.xls" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const reader = new FileReader();
                                    reader.onload = function (evt) {
                                        const data = new Uint8Array(evt.target.result);
                                        const workbook = XLSX.read(data, { type: 'array' });

                                        const hojasYColumnas = {
                                            "Visualizar": "nro_orden",
                                        };

                                        let valoresColumna = [];

                                        Object.entries(hojasYColumnas).forEach(([nombreHoja, nombreColumna]) => {
                                            if (workbook.SheetNames.includes(nombreHoja)) {
                                                const worksheet = workbook.Sheets[nombreHoja];
                                                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                                                if (jsonData.length === 0) {
                                                    toast.warning(
                                                        `La hoja "${nombreHoja}" no contiene datos además del encabezado`,
                                                        { className: "toast-success" }
                                                    );
                                                    e.target.value = null;
                                                    return;
                                                }

                                                jsonData.forEach(fila => {
                                                    if (fila[nombreColumna] !== undefined && fila[nombreColumna] !== null) {
                                                        valoresColumna.push(fila[nombreColumna]);
                                                    }
                                                });
                                            } else {
                                                toast.warning('Por favor cargar archivo correcto', { className: 'toast-success' });
                                                console.warn(`La hoja "${nombreHoja}" no existe en el archivo.`);
                                            }
                                        });

                                        setFiltroOrdenes(valoresColumna);
                                    };
                                    reader.readAsArrayBuffer(file);
                                }}></Entradas>
                            </div>
                            <div className="descarga">
                                <a href="https://drive.google.com/uc?export=download&id=1fmNw88ivqSSiUcW3rlSoVPkeevOIkG9-" download>Descargar archivo plano</a>
                            </div>
                        </div>
                    </div>

                    <div className='Mapa'>
                        <div id="map" className='Mapa'></div>
                    </div>

                    <div className={`overlayGestionOts ${infoVisible || infoVisibleVarios ? '' : 'ocultar'}`} onClick={() => {
                        setInfoVisible(false);
                        setInfoVisibleVarios(false);
                        setInfo('');
                        setFechaProgramacion('');
                        setTipoMovil('');
                        setTurnoAsignado('');
                        setCuadrilla('');
                        setObservacion('');
                    }}></div>

                    <div className={`panel-info ${infoVisible ? '' : 'ocultar'}`}>
                        <div className='contenido' ref={contenidoRef}>
                            <div className='campo titulo'>
                                <Textos className='titulo'>Orden: {info.nro_orden && info.nro_orden.trim() !== "" ? info.nro_orden : "Sin Información"}</Textos>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tasks"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Asignado:</Textos>
                                    <Entradas disabled type="text" value={info.asignado && info.asignado.trim() !== "" ? info.asignado : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-map-marker-alt"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Direccion:</Textos>
                                    <Entradas disabled type="text" value={info.direccion && info.direccion.trim() !== "" ? info.direccion : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-calendar-day"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Fecha ingreso:</Textos>
                                    <Entradas disabled type="text" value={info.fecha_ingreso && info.fecha_ingreso.trim() !== "" ? info.fecha_ingreso : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-map"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Localidad:</Textos>
                                    <Entradas disabled type="text" value={info.localidad_giap && info.localidad_giap.trim() !== "" ? info.localidad_giap : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tag"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Numero Rotulo:</Textos>
                                    <Entradas disabled type="text" value={info.no_rotulo && info.no_rotulo.trim() !== "" ? info.no_rotulo : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-user"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Nombre:</Textos>
                                    <Entradas disabled type="text" value={info.nombre && info.nombre.trim() !== "" ? info.nombre : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-bolt"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Numero Transformador:</Textos>
                                    <Entradas disabled type="text" value={info.nro_transformador && info.nro_transformador.trim() !== "" ? info.nro_transformador : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-house-user"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Referencia Barrio:</Textos>
                                    <Entradas disabled type="text" value={info.referencia_barrio && info.referencia_barrio.trim() !== "" ? info.referencia_barrio : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-phone"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Telefono:</Textos>
                                    <Entradas disabled type="text" value={info.telefono && info.telefono.trim() !== "" ? info.telefono : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-exclamation-circle"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Tipo Falla:</Textos>
                                    <Entradas disabled type="text" value={info.tipo_falla && info.tipo_falla.trim() !== "" ? info.tipo_falla : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-globe-americas"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Latitud:</Textos>
                                    <Entradas disabled type="text" value={info.x && info.x.trim() !== "" ? info.x : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-globe-americas"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Longitud:</Textos>
                                    <Entradas disabled type="text" value={info.y && info.y.trim() !== "" ? info.y : "Sin Información"} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-layer-group"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Zona:</Textos>
                                    <Entradas disabled type="text" value={info.zona && info.zona.trim() !== "" ? info.zona : "Sin Información"} />
                                </div>
                            </div>
                            <div className={`campo subtitulo ${info.tipoMovil && info.tipoMovil.trim() !== "" ? '' : 'ocultar'}`}>
                                <Textos className='subtitulo'>Orden asignada a:</Textos>
                            </div>
                            <div className={`campo ${info.atendida === 'OK' ? 'ocultar' : info.fecha_programacion && info.fecha_programacion.trim() !== "" ? '' : 'ocultar'}`}>
                                <i className="fa fa-calendar"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Fecha Programacion:</Textos>
                                    <Entradas disabled type="date" value={info.fecha_programacion && info.fecha_programacion.trim() !== "" ? info.fecha_programacion : "Sin Información"}></Entradas>
                                </div>
                            </div>
                            <div className={`campo ${info.atendida === 'OK' ? 'ocultar' : info.tipoMovil && info.tipoMovil.trim() !== "" ? '' : 'ocultar'}`}>
                                <i className="fas fa-truck"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Tipo de Movil:</Textos>
                                    <Entradas disabled type="text" value={info.tipoMovil && info.tipoMovil.trim() !== "" ? info.tipoMovil : "Sin Información"} />
                                </div>
                            </div>
                            <div className={`campo ${info.atendida === 'OK' ? 'ocultar' : info.turnoAsignado && info.turnoAsignado.trim() !== "" ? '' : 'ocultar'}`}>
                                <i className="fa fa-user-clock"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Turno:</Textos>
                                    <Entradas disabled type="text" value={info.turnoAsignado && info.turnoAsignado.trim() !== "" ? info.turnoAsignado : "Sin Información"} />
                                </div>
                            </div>
                            <div className={`campo ${info.atendida === 'OK' ? 'ocultar' : info.cuadrilla && info.cuadrilla.trim() !== "" ? '' : 'ocultar'}`}>
                                <i className="fas fa-users"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Cuadrilla:</Textos>
                                    <Entradas disabled type="text" value={info.cuadrilla && info.cuadrilla.trim() !== "" ? info.cuadrilla : "Sin Información"} />
                                </div>
                            </div>
                            <div className={`campo subtitulo ${info.atendida === 'OK' ? 'ocultar' : ''}`}>
                                <Textos className='subtitulo'>Asignar orden a:</Textos>
                            </div>
                            <div className={`campo ${cuadrilla === 'Disponible' || info.atendida === 'OK' ? 'ocultar' : ''}`}>
                                <i className="fa fa-calendar"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Fecha Programacion:</Textos>
                                    <Entradas type="date" value={fechaProgramacion} onChange={(e) => { setFechaProgramacion(e.target.value) }}></Entradas>
                                </div>
                            </div>
                            <div className={`campo ${cuadrilla === 'Disponible' || info.atendida === 'OK' ? 'ocultar' : ''}`}>
                                <i className="fas fa-truck"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Tipo de Movil:</Textos>
                                    <Selectores value={tipoMovil || ""} onChange={(e) => setTipoMovil(e.target.value)}
                                        options={[
                                            { value: 'Canasta Corta', label: 'Canasta Corta' },
                                            { value: 'Canasta Media', label: 'Canasta Media' },
                                            { value: 'Canasta Pesada', label: 'Canasta Pesada' },
                                            { value: 'Escalera de Tijera', label: 'Escalera de Tijera' },
                                            { value: 'Grúa', label: 'Grúa' },
                                            { value: 'Grúa Aparejo', label: 'Grúa Aparejo' },
                                            { value: 'Liviano', label: 'Liviano' },
                                            { value: 'Subterráneo', label: 'Subterráneo' },
                                        ]} className="primary"
                                    ></Selectores>
                                </div>
                            </div>
                            <div className={`campo ${cuadrilla === 'Disponible' || info.atendida === 'OK' ? 'ocultar' : ''}`}>
                                <i className="fa fa-user-clock"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Turno:</Textos>
                                    <Selectores value={turnoAsignado || ""}
                                        onChange={(e) => { setTurnoAsignado(e.target.value) }}
                                        options={[
                                            { value: 'A', label: 'A' },
                                            { value: 'B', label: 'B' },
                                            { value: 'C', label: 'C' },
                                        ]} className="primary"
                                    ></Selectores>
                                </div>
                            </div>
                            <div className={`campo ${info.atendida === 'OK' ? 'ocultar' : ''}`}>
                                <i className="fas fa-users"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Cuadrilla:</Textos>
                                    <Selectores value={cuadrilla || ""}
                                        onChange={(e) => { setCuadrilla(e.target.value) }}
                                        options={[
                                            ...(info.cuadrilla ? [{ value: 'Disponible', label: 'Disponible' }] : []),
                                            ...(Array.isArray(moviles) ? moviles : [])
                                                .filter((item, index, self) =>
                                                    index === self.findIndex((m) => m.nro_movil === item.nro_movil)
                                                )
                                                .sort((a, b) => {
                                                    const numA = parseInt(a.nro_movil, 10);
                                                    const numB = parseInt(b.nro_movil, 10);
                                                    return numA - numB;
                                                })
                                                .map((item) => ({
                                                    value: `${item.nro_movil} - ${item.nombres_apellidos}`,
                                                    label: `Movil ${item.nro_movil} - ${item.nombres_apellidos}`,
                                                }))
                                        ]}
                                        className="primary"
                                    ></Selectores>
                                </div>
                            </div>
                            <div className={`campo ${info.atendida === 'OK' ? '' : info.cuadrilla !== null ? '' : 'ocultar'}`}>
                                <i className="fas fa-comment-dots"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Observaciones:</Textos>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={observacion} onChange={(e) => setObservacion(e.target.value)} rows={4} />
                                </div>
                            </div>
                            <div className='acciones'>
                                <Botones onClick={() => {
                                    setInfoVisible(false);
                                    setInfo('');
                                    setFechaProgramacion('');
                                    setTipoMovil('');
                                    setTurnoAsignado('');
                                    setCuadrilla('');
                                    setObservacion('');
                                }}>Cancelar</Botones>
                                <Botones className='guardar' onClick={() => enviarActualizacionDeOT([info.id])}>{info.atendida === 'OK' ? 'Rehabilitar' : 'Aceptar'}</Botones>
                            </div>
                            <div className={`campo historico ${!info?.historico?.length ? 'ocultar' : ''}`}>
                                <Textos className='titulo'>Histórico</Textos>
                                <div className="historico-cards">
                                    {(Array.isArray(
                                        (() => {
                                            try {
                                                return JSON.parse(info?.historico || "[]");
                                            } catch (e) {
                                                return [];
                                            }
                                        })()
                                    )
                                        ? JSON.parse(info?.historico || "[]")
                                        : []
                                    ).map((item, index) => (
                                        <div key={index} className="card-historico">
                                            <div className="fecha">
                                                {new Date(item.fecha).toLocaleString()}
                                            </div>
                                            <div className={`detalle ${item.usuario ? '' : 'ocultar'}`}>Usuario: {item.usuario}</div>
                                            <div className={`detalle ${item.fechaProgramacion ? '' : 'ocultar'}`}>Fecha Programacion: {item.fechaProgramacion ? new Date(item.fechaProgramacion).toLocaleDateString("es-ES") : "Sin fecha"}</div>
                                            <div className={`detalle ${item.tipoMovil ? '' : 'ocultar'}`}>Tipo de Movil: {item.tipoMovil}</div>
                                            <div className={`detalle ${item.turno ? '' : 'ocultar'}`}>Turno: {item.turno}</div>
                                            <div className={`detalle ${item.cuadrilla ? '' : 'ocultar'}`}>Cuadrilla: {item.cuadrilla}</div>
                                            <div className={`detalle ${item.cedula_cuadrilla ? '' : 'ocultar'}`}>Cedula: {item.cedula_cuadrilla}</div>
                                            <div className={`detalle ${item.nombre_cuadrilla ? '' : 'ocultar'}`}>Nombre: {item.nombre_cuadrilla}</div>
                                            <div className={`detalle ${item.lote ? '' : 'ocultar'}`}>Lote: {item.lote}</div>
                                            <div className={`detalle ${item.detalle ? '' : 'ocultar'}`}>Detalle: {item.detalle}</div>
                                            {item.observacion && (
                                                <div className="observacion">
                                                    Observación: {item.observacion}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`panel-info varios ${infoVisibleVarios ? '' : 'ocultar'}`}>
                        <div className='contenido' ref={contenidoRef}>
                            <div className='campo titulo'>
                                <Textos className='titulo'>Ordenes seleccionadas</Textos>
                            </div>
                            {selectedMarkers.length > 0 ? (
                                selectedMarkers.map((item, index) => (
                                    <div className='campo' key={index}>
                                        <i className="fas fa-tasks"></i>
                                        <div className='entradaDatos'>
                                            <Textos className='subtitulo'>Orden {index + 1}:</Textos>
                                            <Entradas disabled type="text" value={item.nro_orden && item.nro_orden.trim() !== "" ? item.nro_orden : "Sin Información"} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <Textos>No hay órdenes seleccionadas</Textos>
                            )}
                            <div className={`campo subtitulo ${info.atendida === 'OK' ? 'ocultar' : ''}`}>
                                <Textos className='subtitulo'>Asignar orden(es) a:</Textos>
                            </div>
                            <div className={`campo ${cuadrilla === 'Disponible' ? 'ocultar' : ''}`}>
                                <i className="fa fa-calendar"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Fecha Programacion:</Textos>
                                    <Entradas type="date" value={fechaProgramacion} onChange={(e) => { setFechaProgramacion(e.target.value) }}></Entradas>
                                </div>
                            </div>
                            <div className={`campo ${cuadrilla === 'Disponible' ? 'ocultar' : ''}`}>
                                <i className="fas fa-truck"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Tipo de Movil:</Textos>
                                    <Selectores value={tipoMovil} onChange={(e) => setTipoMovil(e.target.value)}
                                        options={[
                                            { value: 'Canasta Corta', label: 'Canasta Corta' },
                                            { value: 'Canasta Media', label: 'Canasta Media' },
                                            { value: 'Canasta Pesada', label: 'Canasta Pesada' },
                                            { value: 'Escalera de Tijera', label: 'Escalera de Tijera' },
                                            { value: 'Grúa', label: 'Grúa' },
                                            { value: 'Grúa Aparejo', label: 'Grúa Aparejo' },
                                            { value: 'Liviano', label: 'Liviano' },
                                            { value: 'Subterráneo', label: 'Subterráneo' },
                                        ]} className="primary"
                                    ></Selectores>
                                </div>
                            </div>
                            <div className={`campo ${cuadrilla === 'Disponible' ? 'ocultar' : ''}`}>
                                <i className="fa fa-user-clock"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Turno:</Textos>
                                    <Selectores value={turnoAsignado}
                                        onChange={(e) => { setTurnoAsignado(e.target.value) }}
                                        options={[
                                            { value: 'A', label: 'A' },
                                            { value: 'B', label: 'B' },
                                            { value: 'C', label: 'C' },
                                        ]} className="primary"
                                    ></Selectores>
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-users"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Cuadrilla:</Textos>
                                    <Selectores value={cuadrilla} onChange={(e) => setCuadrilla(e.target.value)}
                                        options={[
                                            ...([{ value: 'Disponible', label: 'Disponible' }]),
                                            ...(Array.isArray(moviles) ? moviles : [])
                                                .filter((item, index, self) =>
                                                    index === self.findIndex((m) => m.nro_movil === item.nro_movil)
                                                )
                                                .sort((a, b) => {
                                                    const numA = parseInt(a.nro_movil, 10);
                                                    const numB = parseInt(b.nro_movil, 10);
                                                    return numA - numB;
                                                })
                                                .map((item) => ({
                                                    value: `${item.nro_movil} - ${item.nombres_apellidos}`,
                                                    label: `Movil ${item.nro_movil} - ${item.nombres_apellidos}`,
                                                }))
                                        ]}
                                        className="primary"
                                    ></Selectores>
                                </div>
                            </div>
                            <div className={`campo ${cuadrilla === 'Disponible' ? '' : 'ocultar'}`}>
                                <i className="fas fa-comment-dots"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Observaciones:</Textos>
                                    <AreaTextos type="text" placeholder="Agregue las observacion pertinentes" value={observacion} onChange={(e) => setObservacion(e.target.value)} rows={4} />
                                </div>
                            </div>
                            <div className='acciones'>
                                <Botones onClick={() => {
                                    setInfoVisibleVarios(false);
                                    setFechaProgramacion('');
                                    setTipoMovil('');
                                    setTurnoAsignado('');
                                    setCuadrilla('');
                                    setInfo('');
                                    setObservacion('');
                                }}>Cancelar</Botones>
                                <Botones className='guardar' onClick={() => enviarActualizacionDeOT(selectedMarkers.map(item => item.id))}>Aceptar</Botones>
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

export default GestionOts;