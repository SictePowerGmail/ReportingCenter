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
    const [dataInvalida, setDataInvalida] = useState('');
    const [info, setInfo] = useState({});
    const [infoVisible, setInfoVisible] = useState(false);
    const contenidoRef = useRef(null);
    const [tipoMovil, setTipoMovil] = useState('');
    const [cuadrilla, setCuadrilla] = useState('');
    const [observacion, setObservacion] = useState('');
    let selectionMode = false;
    const [selectedMarkers, setSelectedMarkers] = useState([]);
    const [infoVisibleVarios, setInfoVisibleVarios] = useState(false);
    const allMarkersRef = useRef([]);

    const mostrarInfoEnPanel = (data) => {
        setInfo(data);
        setInfoVisible(true);
    };

    const cargarRegistros = async (event) => {
        setLoading(true);

        axios.get(`${process.env.REACT_APP_API_URL}/gestionOts/registros`)
            .then(response => {
                const data = response.data;

                const coordenadasInvalidas = data.filter(
                    item => !item.x || !item.y || isNaN(item.x) || isNaN(item.y)
                );
                setDataInvalida(coordenadasInvalidas);

                const coordenadasValidas = data
                    .filter(item => item.x && item.y && !isNaN(item.x) && !isNaN(item.y))

                setLoading(false);
                setData(coordenadasValidas);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }

    let infoFiltrada = "";
    const generarMapa = async (data) => {
        let selectionCheckbox = null;
        let applySelectionBtn = null;

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
                }
            };

            return div;
        };
        locationButton.addTo(mapRef.current);

        function aplicarFiltros() {
            const valorTexto = document.querySelector('.filterText')?.value.trim().toLowerCase() || "";
            const valorCiudad = document.querySelector('.filterCity')?.value.trim() || "";
            const startDate = document.querySelector('.startDate')?.value || "";
            const endDate = document.querySelector('.endDate')?.value || "";
            const valorCuadrilla = document.querySelector('.filterMovil')?.value.trim() || "";
            const valorEstado = document.querySelector('.filterEstado')?.value.trim() || "";

            infoFiltrada = data.filter(item => {
                const pasaTexto = valorTexto === "" || Object.values(item).some(value =>
                    String(value).toLowerCase().includes(valorTexto)
                );

                let ciudadValor = "";
                if (valorCiudad === "Cundinamarca") {
                    ciudadValor = "MICOL CUNDINAMARCA";
                } else if (valorCiudad === "Bogota") {
                    ciudadValor = "MICOL";
                }
                const pasaCiudad = ciudadValor === "" || String(item.asignado).toLowerCase() === ciudadValor.toLowerCase();

                const fechaItem = item.fecha_ingreso.split(' ')[0];
                const pasaFecha =
                    (!startDate || fechaItem >= startDate) &&
                    (!endDate || fechaItem <= endDate);

                const pasaCuadrilla = valorCuadrilla === "" || String(item.cuadrilla).toLowerCase() === valorCuadrilla.toLowerCase();

                const pasaEstado = valorEstado === "Asignado" ? item.cuadrilla != null : valorEstado === "Pendiente" ? !item.cuadrilla : true;

                return pasaTexto && pasaCiudad && pasaFecha && pasaCuadrilla && pasaEstado;
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

        // Select con lista de items que abre un modal
        if (dataInvalida.length > 0) {
            const modalButton = L.control({ position: 'topright' });
            modalButton.onAdd = function () {
                const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom lista-ots-invalidas');
                let optionsHTML = `<option value="">OTs invalidas</option>`;
                dataInvalida.forEach((item, index) => {
                    optionsHTML += `<option value="${item.nro_orden}">${item.nro_orden} - ${item.localidad_giap}</option>`;
                });

                div.innerHTML = `
                <i class="fa fa-list"></i>
                <select class="itemList">
                    ${optionsHTML}
                </select>
            `;

                L.DomEvent.disableClickPropagation(div);

                setTimeout(() => {
                    const select = div.querySelector('.itemList');
                    select.addEventListener('change', function () {
                        const value = this.value;

                        const itemSeleccionado = dataInvalida
                            .filter(item => item.nro_orden === value)

                        if (itemSeleccionado) {
                            mostrarInfoEnPanel(itemSeleccionado[0]);
                            this.value = "";
                        }
                    });
                });

                return div;
            };
            modalButton.addTo(mapRef.current);
        }

        // Input para filtrar texto
        const filterInput = L.control({ position: 'topright' });
        filterInput.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom filtro-texto');

            div.innerHTML = `
                <i class="fa fa-pencil"></i>
                <input 
                    type="text" 
                    class="filterText" 
                    placeholder="Filtrar por texto ..." 
                    value=""
                />
            `;

            L.DomEvent.disableClickPropagation(div);

            setTimeout(() => {
                div.querySelector('.filterText').addEventListener('input', aplicarFiltros);
            });

            return div;
        };
        filterInput.addTo(mapRef.current)

        // Checkbox para activar selección múltiple
        const selectionControl = L.control({ position: 'topright' });
        selectionControl.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom checkbox-seleccion');
            div.innerHTML = `
                <label class="checkControl">
                    <div class="texto">
                        <i class="fa fa-check-double"></i>
                        <input type="checkbox" id="selectionModeCheckbox" />
                        <span>Seleccion multiple</span>
                    </div>
                    <div class="botonMapa">
                        <button id="applySelectionBtn">
                            &#10003;
                        </button>
                    </div>
                </label>
            `;

            L.DomEvent.disableClickPropagation(div);

            setTimeout(() => {
                selectionCheckbox = div.querySelector('#selectionModeCheckbox');
                applySelectionBtn = div.querySelector('#applySelectionBtn').parentNode;

                selectionCheckbox.checked = selectionMode === true;

                applySelectionBtn.querySelector('#applySelectionBtn').addEventListener('click', () => {
                    setInfoVisibleVarios(true);
                });

                selectionCheckbox.addEventListener('change', function () {
                    toggleSelectionMode(this.checked);
                    aplicarFiltros();
                });
            });

            return div;
        };
        selectionControl.addTo(mapRef.current);;

        // Botón para filtrar por rango de fechas (solo año-mes-día)
        const dateRangeFilterControl = L.control({ position: 'topright' });
        dateRangeFilterControl.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom boton-fecha-rango');

            div.innerHTML = `
                <i class="fa fa-calendar"></i>
                <input type="date" class="startDate" />
                <input type="date" class="endDate" />
            `;

            L.DomEvent.disableClickPropagation(div);

            setTimeout(() => {
                div.querySelector('.startDate').addEventListener('change', aplicarFiltros);
                div.querySelector('.endDate').addEventListener('change', aplicarFiltros);
            });

            return div;
        };
        dateRangeFilterControl.addTo(mapRef.current);

        // Select para filtrar por ciudad
        const filterSelect = L.control({ position: 'topright' });
        filterSelect.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom filtro-ciudad');

            div.innerHTML = `
                <i class="fa fa-city"></i>
                <select class="filterCity">
                    <option value="">Ciudad</option>
                    <option value="Bogota">Bogotá</option>
                    <option value="Cundinamarca">Cundinamarca</option>
                </select>
            `;

            L.DomEvent.disableClickPropagation(div);

            setTimeout(() => {
                div.querySelector('.filterCity').addEventListener('change', aplicarFiltros);
            });

            return div;
        };
        filterSelect.addTo(mapRef.current);

        // Select para filtrar por cuadrilla
        const filterSelectCuadrilla = L.control({ position: 'topright' });
        filterSelectCuadrilla.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom filtro-cuadrilla');

            div.innerHTML = `
                <i class="fa fa-users"></i>
                <select class="filterMovil">
                    <option value="">Cuadrilla</option>
                    <option value="Cuadrilla 1">Cuadrilla 1</option>
                    <option value="Cuadrilla 2">Cuadrilla 2</option>
                </select>
            `;

            L.DomEvent.disableClickPropagation(div);

            setTimeout(() => {
                div.querySelector('.filterMovil').addEventListener('change', aplicarFiltros);
            });

            return div;
        };
        filterSelectCuadrilla.addTo(mapRef.current);

        // Select para filtrar por estado OTs
        const filterSelectEstado = L.control({ position: 'topright' });
        filterSelectEstado.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom filtro-estado');

            div.innerHTML = `
                <i class="fa fa-hourglass-half"></i>
                <select class="filterEstado">
                    <option value="">Estado OTs</option>
                    <option value="Asignado">Asignado</option>
                    <option value="Pendiente">Pendiente</option>
                </select>
            `;

            L.DomEvent.disableClickPropagation(div);

            setTimeout(() => {
                div.querySelector('.filterEstado').addEventListener('change', aplicarFiltros);
            });

            return div;
        };
        filterSelectEstado.addTo(mapRef.current);

        // Boton para borrar filtros
        const clearButton = L.control({ position: 'topright' });
        clearButton.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom mi-boton-limpiar');
            div.innerHTML = `
                <div class="botonBorrar">
                    <i class="fa fa-trash"></i>
                    <span>Borrar filtros</span>
                </div>
            `;

            div.onclick = function () {
                const textInput = document.querySelector('.filterText');
                if (textInput) textInput.value = "";

                const selectCity = document.querySelector('.filterCity');
                if (selectCity) selectCity.value = "";

                const selectMovil = document.querySelector('.filterMovil');
                if (selectMovil) selectMovil.value = "";

                const selectEstado = document.querySelector('.filterEstado');
                if (selectEstado) selectEstado.value = "";

                const startDate = document.querySelector('.startDate');
                if (startDate) startDate.value = "";
                const endDate = document.querySelector('.endDate');
                if (endDate) endDate.value = "";

                infoFiltrada = data;
                aplicarFiltros();
                actualizarTotalItems(infoFiltrada.length);

                if (typeof selectionCheckbox !== 'undefined' && selectionCheckbox) {
                    selectionCheckbox.checked = false;
                }
                if (typeof applySelectionBtn !== 'undefined' && applySelectionBtn) {
                    applySelectionBtn.style.display = 'none';
                }
                if (typeof toggleSelectionMode === 'function') {
                    toggleSelectionMode(false);
                }
            };

            return div;
        };
        clearButton.addTo(mapRef.current);

        function actualizarTotalItems(cantidad) {
            const controlDiv = document.querySelector('.total-items-control');
            if (controlDiv) {
                controlDiv.innerHTML = `Total: ${cantidad}`;
            }
        }

        let totalItemsControl = L.control({ position: 'bottomleft' });
        totalItemsControl.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom total-items-control');
            div.innerHTML = `Total items: ${data.length}`;
            return div;
        };
        totalItemsControl.addTo(mapRef.current);

        // Botón para exportar a Excel
        const exportExcelButton = L.control({ position: 'bottomleft' });
        exportExcelButton.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom mi-boton-exportar');
            div.innerHTML = `
                <div class="botonExportar">
                    <i class="fa fa-file-excel"></i>
                    <span>Exportar</span>
                </div>
            `;

            div.onclick = function () {
                if (!data || data.length === 0) {
                    alert("No hay datos para exportar.");
                    return;
                }

                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Datos");
                XLSX.writeFile(wb, "Gestion_OTs.xlsx");
            };

            return div;
        };
        exportExcelButton.addTo(mapRef.current);

        // Botón para importar Excel Nuevas
        const importExcelButtonNuevas = L.control({ position: 'bottomleft' });
        importExcelButtonNuevas.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom mi-boton-importar');
            div.innerHTML = `
                <div class="botonImportar">
                    <i class="fa fa-upload"></i>
                    <span>Nuevas</span>
                    <input type="file" accept=".xlsx,.xls" style="display:none" />
                </div>
            `;

            const fileInput = div.querySelector("input");

            div.onclick = function () {
                fileInput.click();
            };

            fileInput.onchange = function (e) {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (evt) {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    jsonData.forEach(row => {
                        if (typeof row["Fecha Ingreso"] === "number") {
                            const fechaJS = XLSX.SSF.format("yyyy-mm-dd", row["Fecha Ingreso"]);
                            row["Fecha Ingreso"] = fechaJS;
                        }
                    });

                    enviarActualizacionDeOtsNuevas(jsonData)
                };
                reader.readAsArrayBuffer(file);
            };

            return div;
        };
        importExcelButtonNuevas.addTo(mapRef.current);

        // Botón para importar Excel Atentidas
        const importExcelButtonAtentidas = L.control({ position: 'bottomleft' });
        importExcelButtonAtentidas.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom mi-boton-importar');
            div.innerHTML = `
                <div class="botonImportar">
                    <i class="fa fa-upload"></i>
                    <span>Atendidas</span>
                    <input type="file" accept=".xlsx,.xls" style="display:none" />
                </div>
            `;

            const fileInput = div.querySelector("input");

            div.onclick = function () {
                fileInput.click();
            };

            fileInput.onchange = function (e) {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (evt) {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    const hojasYColumnas = {
                        "Atendidas": "Orden",
                        "Relacion OTR SISDA": "OTR",
                        "Error descargue": "Orden"
                    };

                    let valoresColumna = [];

                    Object.entries(hojasYColumnas).forEach(([nombreHoja, nombreColumna]) => {
                        if (workbook.SheetNames.includes(nombreHoja)) {
                            const worksheet = workbook.Sheets[nombreHoja];
                            const jsonData = XLSX.utils.sheet_to_json(worksheet);

                            jsonData.forEach(fila => {
                                if (fila[nombreColumna] !== undefined && fila[nombreColumna] !== null) {
                                    valoresColumna.push(fila[nombreColumna]);
                                }
                            });
                        } else {
                            console.warn(`La hoja "${nombreHoja}" no existe en el archivo.`);
                        }
                    });

                    enviarActualizacionDeAtencion(valoresColumna)
                };
                reader.readAsArrayBuffer(file);
            };

            return div;
        };
        importExcelButtonAtentidas.addTo(mapRef.current);
    };

    const addMarkerToMap = (item) => {
        const { x, y, cuadrilla } = item;

        if (!x || !y || isNaN(x) || isNaN(y)) {
            console.warn("Coordenadas inválidas para el item:", item);
            return;
        }

        const markerColor = cuadrilla && cuadrilla.trim() !== '' ? 'green' : 'cadetblue';

        const awesomeMarker = L.AwesomeMarkers.icon({
            icon: 'lightbulb',
            prefix: 'fa',
            markerColor: markerColor,
            iconColor: 'white'
        });

        const marker = L.marker([x, y], { icon: awesomeMarker }).addTo(mapRef.current);
        allMarkersRef.current.push({ marker, data: item });

        marker.on("click", () => {

            if (selectionMode) {
                setSelectedMarkers((prev) => {
                    const exists = prev.find(m => m.id === item.id);

                    const newIcon = L.AwesomeMarkers.icon({
                        icon: 'lightbulb',
                        prefix: 'fa',
                        markerColor: exists ? 'cadetblue' : 'orange',
                        iconColor: 'white'
                    });
                    marker.setIcon(newIcon);

                    return exists
                        ? prev.filter(m => m.id !== item.id)
                        : [...prev, item];
                });
            } else {
                mostrarInfoEnPanel(item);
            }
        });
    };

    const toggleSelectionMode = () => {
        selectionMode = !selectionMode;
        if (selectionMode === false) {
            setSelectedMarkers([]);
        }
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
        if (!cuadrilla) { toast.error('Por favor ingrese la cuadrilla.'); return }
        if (!tipoMovil && cuadrilla !== 'Disponible') { toast.error('Por favor ingrese el tipo de inspeccion.'); return }

        if (ids.length === 1 && info.cuadrilla !== null) {
            if (!observacion) { toast.error('Por favor diligencie la observacion.'); return }
        }

        setEnviando(true);

        try {
            for (const id of ids) {
                const datos = {
                    tipoMovil: tipoMovil,
                    cuadrilla: cuadrilla,
                    observaciones: observacion,
                    id: id
                };

                const response2 = await axios.post(`${process.env.REACT_APP_API_URL}/gestionOts/asignarOT`, datos);

                if (response2.status >= 200 && response2.status < 300) {
                    setEnviando(false)
                    console.log('Datos enviados exitosamente');
                    toast.success('Datos enviados exitosamente', { className: 'toast-success' });
                    setInfoVisible(false);
                    setInfoVisibleVarios(false);
                    setInfo('');
                    setTipoMovil('');
                    setCuadrilla('');
                    setObservacion('');
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

    return (
        <div className="GestionOts">
            {loading ? (
                <CargandoDatos text={'Cargando Datos'} />
            ) : enviando ? (
                <CargandoDatos text={'Enviando Datos'} />
            ) : (
                <>
                    <div className='Mapa'>
                        <div id="map" className='Mapa'></div>
                    </div>

                    <div className={`overlayGestionOts ${infoVisible || infoVisibleVarios ? '' : 'ocultar'}`} onClick={() => {
                        setInfoVisible(false);
                        setInfoVisibleVarios(false);
                        setInfo('');
                        setTipoMovil('');
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
                            <div className={`campo ${cuadrilla === 'Disponible' ? 'ocultar' : ''}`}>
                                <i className="fas fa-truck"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Tipo de Movil:</Textos>
                                    <Selectores value={tipoMovil || info.tipoMovil || ""} onChange={(e) => setTipoMovil(e.target.value)}
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
                            <div className='campo'>
                                <i className="fas fa-users"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Cuadrilla:</Textos>
                                    <Selectores value={cuadrilla || info.cuadrilla || ""}
                                        onChange={(e) => { setCuadrilla(e.target.value) }}
                                        options={[
                                            ...(info.cuadrilla ? [{ value: 'Disponible', label: 'Disponible' }] : []),
                                            { value: 'Cuadrilla 1', label: 'Cuadrilla 1' },
                                            { value: 'Cuadrilla 2', label: 'Cuadrilla 2' },
                                        ]} className="primary"
                                    ></Selectores>
                                </div>
                            </div>
                            <div className={`campo ${info.cuadrilla === null ? 'ocultar' : ''}`}>
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
                                    setTipoMovil('');
                                    setCuadrilla('');
                                    setObservacion('');
                                }}>Cancelar</Botones>
                                <Botones className='guardar' onClick={() => enviarActualizacionDeOT([info.id])}>Aceptar</Botones>
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
                                            <div className="detalle">{item.detalle}</div>
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
                            <div className='campo'>
                                <i className="fas fa-users"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Cuadrilla:</Textos>
                                    <Selectores value={cuadrilla} onChange={(e) => setCuadrilla(e.target.value)}
                                        options={[
                                            { value: 'Disponible', label: 'Disponible' },
                                            { value: 'Cuadrilla 1', label: 'Cuadrilla 1' },
                                            { value: 'Cuadrilla 2', label: 'Cuadrilla 2' },
                                        ]} className="primary"
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
                                    setTipoMovil('');
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