import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './supervisionPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Legend, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import L from 'leaflet';
import { ThreeDots } from 'react-loader-spinner';
import Cookies from 'js-cookie';

const SupervisionPrincipal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { estadoNotificacion } = location.state || {};
    const role = Cookies.get('userRole');
    const nombre = Cookies.get('userNombre');
    const mapRef = useRef(null);
    const [registrosSupervision, setRegistrosSupervision] = useState({});
    const [graficaRegistrosSupervisionDia, setGraficaRegistrosSupervisionDia] = useState({});
    const [graficaRegistrosSupervisionCadaUno, setGraficaRegistrosSupervisionCadaUno] = useState({});
    const [graficaRegistrosOrdenadosPorPlaca, setGraficaRegistrosOrdenadosPorPlaca] = useState({});
    const [graficaRegistrosOrdenadosPorEpp, setGraficaRegistrosOrdenadosPorEPP] = useState({});
    const [registrosOrdenadosPorEppNo, setRegistrosOrdenadosPorEppNo] = useState({});
    const [graficaRegistrosOrdenadosPorAlturas, setGraficaRegistrosOrdenadosPorAlturas] = useState({});
    const [registrosOrdenadosPorAlturasNo, setRegistrosOrdenadosPorAlturasNo] = useState({});
    const [graficaRegistrosOrdenadosPorATS, setGraficaRegistrosOrdenadosPorATS] = useState({});
    const [registrosOrdenadosPorATSNo, setRegistrosOrdenadosPorATSNo] = useState({});
    const [graficaRegistrosOrdenadosPorEmpalmes, setGraficaRegistrosOrdenadosPorEmpalmes] = useState({});
    const [registrosOrdenadosPorEmpalmesNo, setRegistrosOrdenadosPorEmpalmesNo] = useState({});
    const [registrosOrdenadosPorEmpalmesSi, setRegistrosOrdenadosPorEmpalmesSi] = useState({});
    const [graficaRegistrosOrdenadosPorPreoperacional, setGraficaRegistrosOrdenadosPorPreoperacional] = useState({});
    const [registrosOrdenadosPorPreoperacionalNo, setRegistrosOrdenadosPorPreoperacionalNo] = useState({});
    const [graficaRegistrosOrdenadosPorVehiculo, setGraficaRegistrosOrdenadosPorVehiculo] = useState({});
    const [registrosOrdenadosPorVehiculoNo, setRegistrosOrdenadosPorVehiculoNo] = useState({});
    const [graficaRegistrosOrdenadosPorEquipos, setGraficaRegistrosOrdenadosPorEquipos] = useState({});
    const [fechaSeleccionada, setFechaSeleccionada] = useState('Todo');
    const [añoSeleccionada, setAñoSeleccionada] = useState(() => {
        const añoActual = new Date().getFullYear();
        return añoActual.toString();
    });
    const [mesSeleccionada, setMesSeleccionada] = useState(() => {
        const mesActual = new Date().getMonth() + 1;
        return mesActual.toString().padStart(2, '0'); // Para asegurarte que siempre sea de dos dígitos, como '01' para enero
    });
    const [diaSeleccionada, setDiaSeleccionada] = useState('Todo');
    const [supervisorSeleccionado, setSupervisorSeleccionado] = useState('Todo');
    const [placaSeleccionada, setPlacaSeleccionada] = useState('Todo');
    const [cantidadAcompañamientos, setCantidadAcompañamientos] = useState('0');
    const [listaFecha, setListaFecha] = useState([]);
    const [listaAño, setListaAño] = useState([]);
    const [listaMes, setListaMes] = useState([]);
    const [listaDia, setListaDia] = useState([]);
    const [listaSupervisor, setListaSupervisor] = useState([]);
    const [listaPlaca, setListaPlaca] = useState([]);
    const [loading, setLoading] = useState(false);

    const Agregar = async (event) => {
        navigate('/SupervisionAgregar', { state: { role: role, nombre: nombre, estadoNotificacion: false } });
    };

    const cargarRegistrosSupervision = async (event) => {
        axios.get(`${process.env.REACT_APP_API_URL}/supervision/registros`)
            .then(response => {
                let dataFiltrada;
                const data = response.data;

                if (supervisorSeleccionado === 'Todo') {
                    dataFiltrada = data
                } else {
                    dataFiltrada = data.filter(item => item.nombre === supervisorSeleccionado);
                }

                if (fechaSeleccionada !== 'Todo') {
                    dataFiltrada = dataFiltrada.filter(item => {
                        const itemFecha = item.fecha.split(' ')[0];
                        return itemFecha === fechaSeleccionada;
                    });
                }

                if (añoSeleccionada !== 'Todo') {
                    dataFiltrada = dataFiltrada.filter(item => {
                        const [yearItem, monthItem, dayItem] = item.fecha.split(' ')[0].split('-'); // Descomponer la fecha del item
                        return yearItem === añoSeleccionada; // Comparar año, mes y día
                    });
                }

                if (mesSeleccionada !== 'Todo') {
                    dataFiltrada = dataFiltrada.filter(item => {
                        const [yearItem, monthItem, dayItem] = item.fecha.split(' ')[0].split('-'); // Descomponer la fecha del item
                        return monthItem === mesSeleccionada; // Comparar año, mes y día
                    });
                }

                if (diaSeleccionada !== 'Todo') {
                    dataFiltrada = dataFiltrada.filter(item => {
                        const [yearItem, monthItem, dayItem] = item.fecha.split(' ')[0].split('-'); // Descomponer la fecha del item
                        return dayItem === diaSeleccionada; // Comparar año, mes y día
                    });
                }

                if (placaSeleccionada !== 'Todo') {
                    dataFiltrada = dataFiltrada.filter(item => item.placa === placaSeleccionada);
                }

                setRegistrosSupervision(dataFiltrada);

                const registrosPorDia = dataFiltrada.reduce((acc, item) => {
                    // Formatear la fecha en formato YYYY-MM-DD
                    const fechaObj = new Date(item.fecha);
                    const fecha = fechaObj.toISOString().split('T')[0]; // Extraer solo la parte de la fecha

                    if (!acc[fecha]) {
                        acc[fecha] = 0;
                    }
                    acc[fecha]++;
                    return acc;
                }, {});

                // Convertir objeto a array y ordenar por fecha
                const registrosPorDia2 = Object.entries(registrosPorDia)
                    .map(([fecha, registros]) => {
                        const date = new Date(fecha);
                        return {
                            name: date.getUTCDate(),  // Extraer el día sin modificar la fecha por la zona horaria
                            registros: registros
                        };
                    })
                    .sort((a, b) => a.name - b.name);  // Ordenar por día numérico

                setGraficaRegistrosSupervisionDia(registrosPorDia2);

                const registrosPorCadaUno = dataFiltrada.reduce((acc, item) => {
                    if (!acc[item.nombre]) {
                        acc[item.nombre] = 0;
                    }
                    acc[item.nombre]++;
                    return acc;
                }, {});

                const registrosPorCadaUno2 = Object.entries(registrosPorCadaUno).map(([nombre, registros]) => ({
                    name: nombre,
                    registros: registros
                }));

                setGraficaRegistrosSupervisionCadaUno(registrosPorCadaUno2)

                const registrosPorPlaca = dataFiltrada.reduce((acc, item) => {
                    // Formatear la fecha en formato YYYY-MM-DD
                    const placa = item.placa;

                    if (!acc[placa]) {
                        acc[placa] = 0;
                    }
                    acc[placa]++;
                    return acc;
                }, {});

                const registrosOrdenadosPorPlaca = Object.entries(registrosPorPlaca)
                    .sort(([, a], [, b]) => b - a)  // Ordenar por el valor (cantidad)
                    .map(([placa, cantidad]) => ({ placa, cantidad }));  // Convertir de nuevo a objetos

                setGraficaRegistrosOrdenadosPorPlaca(registrosOrdenadosPorPlaca)

                const registrosTotal = dataFiltrada.length;

                setCantidadAcompañamientos(registrosTotal)
                setLoading(false);

                const registrosPorEPP = dataFiltrada.reduce((acc, item) => {
                    // Formatear la fecha en formato YYYY-MM-DD
                    const epp = item.epp;

                    if (!acc[epp]) {
                        acc[epp] = 0;
                    }
                    acc[epp]++;
                    return acc;
                }, {});

                const registrosOrdenadosPorEPP = Object.entries(registrosPorEPP).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),  // Capitaliza 'si' y 'no'
                    value: value
                }));

                setGraficaRegistrosOrdenadosPorEPP(registrosOrdenadosPorEPP)

                const datosFiltradosPorEppNo = dataFiltrada.filter(item => item.epp === 'no');

                setRegistrosOrdenadosPorEppNo(datosFiltradosPorEppNo);

                const registrosPorAlturas = dataFiltrada.reduce((acc, item) => {
                    // Formatear la fecha en formato YYYY-MM-DD
                    const alturas = item.alturas;

                    if (!acc[alturas]) {
                        acc[alturas] = 0;
                    }
                    acc[alturas]++;
                    return acc;
                }, {});

                const registrosOrdenadosPorAlturas = Object.entries(registrosPorAlturas).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),  // Capitaliza 'si' y 'no'
                    value: value
                }));

                setGraficaRegistrosOrdenadosPorAlturas(registrosOrdenadosPorAlturas)

                const datosFiltradosPorAlturasNo = dataFiltrada.filter(item => item.alturas === 'no');

                setRegistrosOrdenadosPorAlturasNo(datosFiltradosPorAlturasNo);

                const registrosPorATS = dataFiltrada.reduce((acc, item) => {
                    // Formatear la fecha en formato YYYY-MM-DD
                    const ats = item.ats;

                    if (!acc[ats]) {
                        acc[ats] = 0;
                    }
                    acc[ats]++;
                    return acc;
                }, {});

                const registrosOrdenadosPorATS = Object.entries(registrosPorATS).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),  // Capitaliza 'si' y 'no'
                    value: value
                }));

                setGraficaRegistrosOrdenadosPorATS(registrosOrdenadosPorATS)

                const datosFiltradosPorATSNo = dataFiltrada.filter(item => item.ats === 'no');

                setRegistrosOrdenadosPorATSNo(datosFiltradosPorATSNo);

                const registrosPorEmpalmes = dataFiltrada.reduce((acc, item) => {
                    // Formatear la fecha en formato YYYY-MM-DD
                    const empalmes = item.empalmes;

                    if (!acc[empalmes]) {
                        acc[empalmes] = 0;
                    }
                    acc[empalmes]++;
                    return acc;
                }, {});

                const registrosOrdenadosPorEmpalmes = Object.entries(registrosPorEmpalmes).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),  // Capitaliza 'si' y 'no'
                    value: value
                }));

                setGraficaRegistrosOrdenadosPorEmpalmes(registrosOrdenadosPorEmpalmes)

                const datosFiltradosPorEmpalmesNo = dataFiltrada.filter(item => item.empalmes === 'no');

                setRegistrosOrdenadosPorEmpalmesNo(datosFiltradosPorEmpalmesNo);

                const datosFiltradosPorEmpalmesSi = dataFiltrada.filter(item => item.empalmes === 'si');

                setRegistrosOrdenadosPorEmpalmesSi(datosFiltradosPorEmpalmesSi);

                const registrosPorPreoperacional = dataFiltrada.reduce((acc, item) => {
                    // Formatear la fecha en formato YYYY-MM-DD
                    const preoperacional = item.preoperacional;

                    if (!acc[preoperacional]) {
                        acc[preoperacional] = 0;
                    }
                    acc[preoperacional]++;
                    return acc;
                }, {});

                const registrosOrdenadosPorPreoperacional = Object.entries(registrosPorPreoperacional).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),  // Capitaliza 'si' y 'no'
                    value: value
                }));

                setGraficaRegistrosOrdenadosPorPreoperacional(registrosOrdenadosPorPreoperacional)

                const datosFiltradosPorPreoperacionalNo = dataFiltrada.filter(item => item.preoperacional === 'no');

                setRegistrosOrdenadosPorPreoperacionalNo(datosFiltradosPorPreoperacionalNo);

                const registrosPorVehiculo = dataFiltrada.reduce((acc, item) => {
                    // Formatear la fecha en formato YYYY-MM-DD
                    const vehiculo = item.vehiculo;

                    if (!acc[vehiculo]) {
                        acc[vehiculo] = 0;
                    }
                    acc[vehiculo]++;
                    return acc;
                }, {});

                const registrosOrdenadosPorVehiculo = Object.entries(registrosPorVehiculo).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),  // Capitaliza 'si' y 'no'
                    value: value
                }));

                setGraficaRegistrosOrdenadosPorVehiculo(registrosOrdenadosPorVehiculo)

                const datosFiltradosPorVehiculoNo = dataFiltrada.filter(item => item.vehiculo !== '5');

                setRegistrosOrdenadosPorVehiculoNo(datosFiltradosPorVehiculoNo);

                const equipos = dataFiltrada.map(item => ({
                    empalmadora: item.empalmadora,
                    otdr: item.otdr,
                    cortadora: item.cortadora,
                    pinza: item.pinza,
                    opm: item.opm,
                    onexpert: item.onexpert,
                    medidorConductancia: item.medidorConductancia,
                    medidorFugas: item.medidorFugas
                }));

                const respuestasAgrupadasEquipos = [
                    {
                        name: 'Empalmadora',
                        si: equipos.filter(item => item.empalmadora === 'Si').length,
                        no: equipos.filter(item => item.empalmadora === 'No').length,
                        na: equipos.filter(item => item.empalmadora === 'N/A').length,
                    },
                    {
                        name: 'OTDR',
                        si: equipos.filter(item => item.otdr === 'Si').length,
                        no: equipos.filter(item => item.otdr === 'No').length,
                        na: equipos.filter(item => item.otdr === 'N/A').length,
                    },
                    {
                        name: 'Cortadora',
                        si: equipos.filter(item => item.cortadora === 'Si').length,
                        no: equipos.filter(item => item.cortadora === 'No').length,
                        na: equipos.filter(item => item.cortadora === 'N/A').length,
                    },
                    {
                        name: 'Pinza',
                        si: equipos.filter(item => item.pinza === 'Si').length,
                        no: equipos.filter(item => item.pinza === 'No').length,
                        na: equipos.filter(item => item.pinza === 'N/A').length,
                    },
                    {
                        name: 'OPM',
                        si: equipos.filter(item => item.opm === 'Si').length,
                        no: equipos.filter(item => item.opm === 'No').length,
                        na: equipos.filter(item => item.opm === 'N/A').length,
                    },
                    {
                        name: 'Onexpert',
                        si: equipos.filter(item => item.onexpert === 'Si').length,
                        no: equipos.filter(item => item.onexpert === 'No').length,
                        na: equipos.filter(item => item.onexpert === 'N/A').length,
                    },
                    {
                        name: 'Medidor de Conductancia',
                        si: equipos.filter(item => item.medidorConductancia === 'Si').length,
                        no: equipos.filter(item => item.medidorConductancia === 'No').length,
                        na: equipos.filter(item => item.medidorConductancia === 'N/A').length,
                    },
                    {
                        name: 'Medidor de Fugas',
                        si: equipos.filter(item => item.medidorFugas === 'Si').length,
                        no: equipos.filter(item => item.medidorFugas === 'No').length,
                        na: equipos.filter(item => item.medidorFugas === 'N/A').length,
                    }
                ];

                setGraficaRegistrosOrdenadosPorEquipos(respuestasAgrupadasEquipos);




                const uniqueFecha = new Set();
                const uniqueDia = new Set();
                const uniqueMes = new Set();
                const uniqueAño = new Set();
                uniqueFecha.add("Todo");
                uniqueDia.add("Todo");
                uniqueMes.add("Todo");
                uniqueAño.add("Todo");
                data.forEach(item => {
                    const fechaCompleta = new Date(item.fecha); // Asumiendo que item.fecha está en formato ISO
                    const dia = fechaCompleta.getDate().toString().padStart(2, '0');
                    const mes = (fechaCompleta.getMonth() + 1).toString().padStart(2, '0'); // Meses en JavaScript son 0-indexados
                    const año = fechaCompleta.getFullYear();
                    const fechaFormateada = `${año}-${mes}-${dia}`;
                    uniqueFecha.add(fechaFormateada);
                    uniqueDia.add(dia);
                    uniqueMes.add(mes);
                    uniqueAño.add(año);
                });
                const listaFechaOrdenada = Array.from(uniqueFecha).sort((a, b) => {
                    if (a === "Todo") return -1; // Mantener "Todo" en el primer lugar
                    if (b === "Todo") return 1;
                    return new Date(b) - new Date(a);
                });
                const listaAñoOrdenada = Array.from(uniqueAño).sort((a, b) => {
                    if (a === "Todo") return -1; // Mantener "Todo" en el primer lugar
                    if (b === "Todo") return 1;
                    return a - b;
                });
                const listaMesOrdenada = Array.from(uniqueMes).sort((a, b) => {
                    if (a === "Todo") return -1; // Mantener "Todo" en el primer lugar
                    if (b === "Todo") return 1;
                    return a - b;
                });
                const listaDiaOrdenada = Array.from(uniqueDia).sort((a, b) => {
                    if (a === "Todo") return -1; // Mantener "Todo" en el primer lugar
                    if (b === "Todo") return 1;
                    return a - b;
                });
                setListaFecha(listaFechaOrdenada);
                setListaAño(listaAñoOrdenada);
                setListaMes(listaMesOrdenada);
                setListaDia(listaDiaOrdenada);

                const uniqueNombre = new Set();
                uniqueNombre.add("Todo");
                data.forEach(item => {
                    uniqueNombre.add(item.nombre);
                });
                const listaSupervisorOrdenada = Array.from(uniqueNombre).sort((a, b) => {
                    if (a === "Todo") return -1; // Mantener "Todo" en el primer lugar
                    if (b === "Todo") return 1;
                    return a.localeCompare(b); // Comparar de forma ascendente
                });
                setListaSupervisor(listaSupervisorOrdenada);

                const uniquePlaca = new Set();
                uniquePlaca.add("Todo");
                data.forEach(item => {
                    uniquePlaca.add(item.placa);
                });
                const listaPlacaOrdenada = Array.from(uniquePlaca).sort((a, b) => {
                    if (a === "Todo") return -1; // Mantener "Todo" en el primer lugar
                    if (b === "Todo") return 1;
                    return a.localeCompare(b); // Comparar de forma ascendente
                });
                setListaPlaca(listaPlacaOrdenada);

                generarMapa(dataFiltrada);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }

    const generarMapa = async (data) => {
        if (mapRef.current === null) {
            const firstLocation = data[0];
            const { latitud, longitud } = firstLocation;
            mapRef.current = L.map('map').setView([latitud, longitud], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);

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
                    if (data.length > 0) {
                        const bounds = L.latLngBounds(data.map(item => [item.latitud, item.longitud]));
                        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                    }
                };

                return div;
            };
            locationButton.addTo(mapRef.current);

        } else {

            if (mapRef.current) {
                mapRef.current.eachLayer(layer => {
                    if (layer instanceof L.Marker) {
                        mapRef.current.removeLayer(layer);
                    }
                });
            }

            data.forEach(item => {
                addMarkerToMap(item);
            });

            if (data.length > 0) {
                const bounds = L.latLngBounds(data.map(item => [item.latitud, item.longitud]));
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    };

    const addMarkerToMap = (item) => {
        const { latitud, longitud, foto_nombre, fecha, ot, nombre_cuadrilla, observacion, placa, nombre } = item;

        const awesomeMarker = L.AwesomeMarkers.icon({
            icon: 'car',
            prefix: 'fa',
            markerColor: 'blue',
            iconColor: 'white'
        });

        // Crea el marcador y añádelo al mapa
        const marker = L.marker([latitud, longitud], { icon: awesomeMarker }).addTo(mapRef.current);

        // Separar el nombre en partes
        const partesNombre = nombre_cuadrilla.split(" ");

        // Obtener el primer apellido y el primer nombre
        const primerApellido = partesNombre[0];
        const primerNombre = partesNombre[2]; // Asegúrate de que el nombre siempre esté en esta posición

        // Crear el nombre corto
        const nombreCorto = `${primerApellido} ${primerNombre}`;
        let nombreCapitalizado = nombreCorto
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');

        // Definir el contenido del popup (inicialmente sin imagen)
        const popupContent = `
            <div>
                <h6><strong>Fecha: </strong>${fecha}<br><strong>Supervisor: </strong>${nombre}<br><strong>Placa: </strong>${placa}<br><strong>Nombre Tecnico: </strong>${nombreCapitalizado}<br><strong>OT: </strong>${ot}<br><strong>Observación: </strong>${observacion}</h6>
                <div id="image-container-${foto_nombre}" style="width: 100px; height: auto; text-align: center;"></div>
            </div>
        `;

        // Asignar el contenido del popup al marcador
        marker.bindPopup(popupContent);

        // Evento de clic en el marcador para cargar la imagen cuando se abre el popup
        marker.on('popupopen', async () => {
            const imageContainer = document.getElementById(`image-container-${foto_nombre}`);
            if (imageContainer) {
                const imageUrl = await fetchImage(foto_nombre);
                imageContainer.innerHTML = imageUrl ? `<img src="${imageUrl}" alt="${foto_nombre}" style="width: 150px; height: auto;"/>` : `<p>No image available</p>`;
            }
        });
    };

    const fetchImage = async (imageName) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/supervision/obtenerImagen?imageName=${encodeURIComponent(imageName)}`);

            if (!response.ok) {
                console.error(`Error fetching image: ${response.status} ${response.statusText}`);
                return null;
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                console.error('Received an empty image blob');
                return null;
            }

            const imageUrl = URL.createObjectURL(blob);
            return imageUrl;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    };

    useEffect(() => {
        const yaRecargado = localStorage.getItem('yaRecargado');
        const nombreUsuario = Cookies.get('userNombre');

        if (nombreUsuario === undefined) {
            window.location.href = '/ReportingCenter#/Login?tipo=supervision';
        } else if (!yaRecargado) {
            localStorage.setItem('yaRecargado', 'true');
            window.location.reload();
        }

        if (estadoNotificacion) {
            navigate('/SupervisionPrincipal', { state: { role: role, nombre: nombre, estadoNotificacion: false } });
            toast.success('Datos enviados exitosamente', { className: 'toast-success' });
        }

        cargarRegistrosSupervision();
    }, []);

    useEffect(() => {
        cargarRegistrosSupervision();
    }, [fechaSeleccionada, añoSeleccionada, mesSeleccionada, diaSeleccionada, supervisorSeleccionado, placaSeleccionada]);

    return (
        <div className="Supervision-Principal">
            {loading ? (
                <div id="CargandoPagina">
                    <ThreeDots
                        type="ThreeDots"
                        color="#0B1A46"
                        height={200}
                        width={200}
                    />
                    <p>... Cargando Datos ...</p>
                </div>
            ) : (
                <div className='Contenido'>
                    <div className='RenderizarFiltros'>
                        <div className='SeleccionFecha'>
                            <div className='TituloFecha'>
                                <i className="fas fa-calendar"></i>
                                <span>Año</span>
                            </div>
                            <select id='Fecha-Reporte-Boton' value={añoSeleccionada} onChange={(e) => setAñoSeleccionada(e.target.value)} className="select-box">
                                {listaAño.map((fecha, index) => (
                                    <option key={index} value={fecha}>
                                        {fecha}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='SeleccionFecha'>
                            <div className='TituloFecha'>
                                <i className="fas fa-calendar-alt"></i>
                                <span>Mes</span>
                            </div>
                            <select id='Fecha-Reporte-Boton' value={mesSeleccionada} onChange={(e) => setMesSeleccionada(e.target.value)} className="select-box">
                                {listaMes.map((fecha, index) => (
                                    <option key={index} value={fecha}>
                                        {fecha}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='SeleccionFecha'>
                            <div className='TituloFecha'>
                                <i className="fas fa-calendar-day"></i>
                                <span>Dia</span>
                            </div>
                            <select id='Fecha-Reporte-Boton' value={diaSeleccionada} onChange={(e) => setDiaSeleccionada(e.target.value)} className="select-box">
                                {listaDia.map((fecha, index) => (
                                    <option key={index} value={fecha}>
                                        {fecha}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='SeleccionSupervision'>
                            <div className='TituloSupervision'>
                                <i className="fas fa-user-tie"></i>
                                <span>Supervisor</span>
                            </div>
                            <select id='Fecha-Reporte-Boton' value={supervisorSeleccionado} onChange={(e) => setSupervisorSeleccionado(e.target.value)} className="select-box">
                                {listaSupervisor.map((nombres, index) => (
                                    <option key={index} value={nombres}>
                                        {nombres}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='SeleccionPlaca'>
                            <div className='TituloPlaca'>
                                <i className="fas fa-id-card"></i>
                                <span>Placa</span>
                            </div>
                            <select id='Fecha-Reporte-Boton' value={placaSeleccionada} onChange={(e) => setPlacaSeleccionada(e.target.value)} className="select-box">
                                {listaPlaca.map((placa, index) => (
                                    <option key={index} value={placa}>
                                        {placa}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='RenderizarMapaYGraficos'>
                        <div className='RenderizarMapa'>

                            <div className='Total'>
                                <i className="fas fa-calculator"></i>
                                <span>Total acompañamientos: {cantidadAcompañamientos}</span>
                            </div>

                            <div className='UbicacionYPlaca'>
                                <div className='Ubicacion'>
                                    <div className='Contenedor'>
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>Ubicaciónes registradas</span>
                                    </div>
                                    <div id="map" className='Mapa'></div>
                                </div>
                                <div className='Placa'>
                                    <div className='TituloBarraSupervision'>
                                        <i className="fas fa-chart-bar"></i>
                                        <span>Acompañamientos por placa</span>
                                    </div>
                                    <div className='Grafica'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={graficaRegistrosOrdenadosPorPlaca}
                                                layout="vertical"
                                            >
                                                <YAxis dataKey="placa" type="category" width={100} />
                                                <XAxis
                                                    type="number"
                                                    domain={[dataMin => dataMin - 1, dataMax => dataMax + 5]}
                                                    tick={false} 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    interval={0}
                                                />
                                                <Tooltip />
                                                <Bar dataKey="cantidad" fill="#8884d8">
                                                    <LabelList dataKey="cantidad" position="right" />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className='SupervisoresYDia'>
                                <div className='BarraSupervision'>
                                    <div className='TituloBarraSupervision'>
                                        <i className="fas fa-chart-bar"></i>
                                        <span>Acompañamientos por supervisor</span>
                                    </div>
                                    <div className='Grafica'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                margin={0}
                                                data={graficaRegistrosSupervisionCadaUno}
                                                layout="vertical"
                                            >
                                                <YAxis dataKey="name" type="category" width={100} />
                                                <XAxis
                                                    type="number" // Cambiado a tipo number para ajustar dinámicamente
                                                    domain={[dataMin => dataMin - 1, dataMax => dataMax + 5]}
                                                    tick={false} // Oculta los ticks del eje X
                                                    axisLine={false} // Oculta la línea del eje X
                                                    tickLine={false} // Oculta las líneas de los ticks
                                                    interval={0} // Muestra todos los ticks
                                                />
                                                <Tooltip />
                                                <Bar dataKey="registros" fill="#8884d8">
                                                    <LabelList dataKey="registros" position="right" />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className='BarraFecha'>
                                    <div className='TituloBarraFecha'>
                                        <i className="fas fa-chart-bar"></i>
                                        <span>Acompañamientos por dia</span>
                                    </div>
                                    <div className='GraficaFecha'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                margin={0}
                                                data={graficaRegistrosSupervisionDia}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis domain={[dataMin => dataMin - 1, dataMax => dataMax + 5]} />
                                                <Tooltip />
                                                <Bar dataKey="registros" fill="#8884d8">
                                                    <LabelList dataKey="registros" position="top" />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button onClick={Agregar} className="btn-flotante">+</button>
                    </div>
                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisionPrincipal;