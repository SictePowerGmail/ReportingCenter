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
import Tablas from '../../../components/tablas/tablas';
import Botones from '../../../components/botones/botones';
import Textos from '../../../components/textos/textos';
import Selectores from '../../../components/selectores/selectores';
import SemiPieChart from '../../../components/graficas/semiPieChart ';
import NightingaleChart from '../../../components/graficas/nightingaleChart';
import Navegacion from '../../../components/navegacion/navegacion';
import CargandoDatos from '../../../components/cargandoDatos/cargandoDatos';
import BarWithBackground from '../../../components/graficas/barWithBackground';
import BarHorizontal from '../../../components/graficas/barHorizontal';

const SupervisionPrincipal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { estadoNotificacion } = location.state || {};
    const role = Cookies.get('userRole');
    const nombre = Cookies.get('userNombre');
    const mapRef = useRef(null);
    const [graficaRegistrosSupervisionDia, setGraficaRegistrosSupervisionDia] = useState({});
    const [graficaRegistrosSupervisionCadaUno, setGraficaRegistrosSupervisionCadaUno] = useState({});
    const [graficaRegistrosOrdenadosPorPlaca, setGraficaRegistrosOrdenadosPorPlaca] = useState({});
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
    const [listaAño, setListaAño] = useState([]);
    const [listaMes, setListaMes] = useState([]);
    const [listaDia, setListaDia] = useState([]);
    const [listaSupervisor, setListaSupervisor] = useState([]);
    const [listaPlaca, setListaPlaca] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carpeta, setCarpeta] = useState(Cookies.get('SupervisionCarpeta') || 'Claro');
    const [dataClaro, setDataClaro] = useState('');
    const [dataEnelInspeccionIntegralHSE, setDataEnelInspeccionIntegralHSE] = useState('');
    const [dataEnelInspeccionAmbiental, setDataEnelInspeccionAmbiental] = useState('');
    const [datosParaGrafico1, setDatosParaGrafico1] = useState('');
    const [datosParaGrafico2, setDatosParaGrafico2] = useState('');

    const cargarRegistrosSupervision = async (event) => {
        setLoading(true);

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
                setLoading(false);
                setListaPlaca(listaPlacaOrdenada);
                setDataClaro(dataFiltrada);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }

    const generarMapa = async (data) => {

        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        const firstLocation = data[0];
        const { latitud, longitud } = firstLocation;
        mapRef.current = L.map('map').setView([latitud, longitud], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        data.forEach(item => {
            addMarkerToMap(item);
        });

        if (data.length > 1) {
            const bounds = L.latLngBounds(data.map(item => [item.latitud, item.longitud]));
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

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
                <h6><strong>Fecha: </strong>${fecha}<br>
                <strong>Supervisor: </strong>${nombre}<br>
                <strong>Placa: </strong>${placa}<br>
                <strong>Nombre Tecnico: </strong>${nombreCapitalizado}<br>
                <strong>OT: </strong>${ot}<br>
                <strong>Observación: </strong>${observacion}</h6>
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

    const parseFecha = (fechaStr) => {
        const [fecha, hora] = fechaStr.split(', ');
        const [dia, mes, anio] = fecha.split('/');
        return new Date(`${anio}-${mes}-${dia}T${hora}`);
    };

    const cargarRegistrosEnel = async () => {
        try {
            setLoading(true);
            const responseIntegral = await axios.get(`${process.env.REACT_APP_API_URL}/supervision/registrosEnelInspeccionIntegralHse`);
            const registrosIntegralOrdenados = responseIntegral.data
                .sort((a, b) => parseFecha(b.fechaFinal) - parseFecha(a.fechaFinal))
                .map((item) => ({
                    ...item,
                    id: `ENEL-${String(item.id).padStart(5, '0')}`
                }));
            setDataEnelInspeccionIntegralHSE(registrosIntegralOrdenados);

            const responseAmbiental = await axios.get(`${process.env.REACT_APP_API_URL}/supervision/registrosEnelInspeccionIntegralHse`);
            const registrosAmbientalOrdenados = responseAmbiental.data.sort((a, b) => {
                return parseFecha(b.fechaFinal) - parseFecha(a.fechaFinal);
            });
            setDataEnelInspeccionAmbiental(registrosAmbientalOrdenados);

            const conteoInspecciones = {};
            registrosIntegralOrdenados.forEach((item) => {
                const name = item.inspeccion?.trim() || 'Desconocido';
                if (conteoInspecciones[name]) {
                    conteoInspecciones[name]++;
                } else {
                    conteoInspecciones[name] = 1;
                }
            });
            const dataParaGraficoInspecciones = Object.entries(conteoInspecciones)
                .map(([nombre, cantidad]) => ({
                    name: nombre,
                    value: cantidad
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            setDatosParaGrafico1(dataParaGraficoInspecciones);

            const formatearNombre = (nombre) => {
                return nombre
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(palabra =>
                        palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
                    )
                    .join(' ');
            };
            const conteoSupervisores = {};
            registrosIntegralOrdenados.forEach((item) => {
                const name = item.nombreQuienInspecciona?.trim() || 'Desconocido';
                const nombreFormateado = formatearNombre(name);
                if (conteoSupervisores[nombreFormateado]) {
                    conteoSupervisores[nombreFormateado]++;
                } else {
                    conteoSupervisores[nombreFormateado] = 1;
                }
            });
            const dataParaGraficoSupervisores = Object.entries(conteoSupervisores)
                .map(([nombre, cantidad]) => ({
                    name: nombre,
                    value: cantidad
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            setDatosParaGrafico2(dataParaGraficoSupervisores);

        } catch (error) {
            console.error("Error al obtener datos:", error);
        } finally {
            setLoading(false);
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

        const ejecutarSecuencia = async () => {
            try {
                await cargarRegistrosEnel();
                await cargarRegistrosSupervision();
            } catch (error) {
                console.error('Error al ejecutar funciones secuenciales:', error);
            }
        };

        ejecutarSecuencia();
    }, []);

    useEffect(() => {
        if (dataClaro && dataClaro.length > 0) {
            const mapElement = document.getElementById('map');
            if (mapElement) {
                generarMapa(dataClaro);
            }
        }
    }, [dataClaro, carpeta]);

    useEffect(() => {
        cargarRegistrosSupervision();
    }, [fechaSeleccionada, añoSeleccionada, mesSeleccionada, diaSeleccionada, supervisorSeleccionado, placaSeleccionada]);

    const columnasEnel = [
        { header: 'Consecutivo', key: 'id' },
        { header: 'Fecha Final', key: 'fechaFinal' },
        { header: 'OP/OT', key: 'opOt' },
        { header: 'Nombre Proyecto', key: 'nombreProyecto' },
        { header: 'Nombre Quien Inspecciona', key: 'nombreQuienInspecciona' },
        { header: 'Nombre Supervisor Tecnico', key: 'nombreSupervisorTecnico' },
        { header: 'Inspeccion', key: 'inspeccion' },
    ];

    const [mostrarModal, setMostrarModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');

    const cargarFotosEnBase64 = async (obj) => {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;

            const valor = obj[key];
            if (Array.isArray(valor) && key.startsWith('foto')) {
                for (let i = 0; i < valor.length; i++) {
                    const imagen = valor[i];
                    if (imagen && typeof imagen.name === 'string') {
                        try {
                            const response = await fetch(
                                `${process.env.REACT_APP_API_URL}/supervision/obtenerImagen?imageName=${encodeURIComponent(imagen.name)}`
                            );
                            const blob = await response.blob();
                            const base64 = await blobToBase64(blob);
                            imagen.data = base64;
                        } catch (error) {
                            console.error(`Error cargando imagen ${imagen.name}:`, error);
                        }
                    }
                }
                continue;
            }

            if (typeof valor === 'object' && valor !== null) {
                await cargarFotosEnBase64(valor);
            }
        }

        return obj;
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    return (
        <div className="Supervision-Principal">
            {loading ? (
                <CargandoDatos text={'Cargando Datos'} />
            ) : (
                <>
                    <div className='menuNavegacion'>
                        <Navegacion
                            items={['Claro', 'Enel']}
                            value={carpeta}
                            onChange={(nuevoValor) => {
                                setCarpeta(nuevoValor);
                                Cookies.set('SupervisionCarpeta', nuevoValor);
                            }}
                        />
                    </div>

                    {carpeta === "Claro" && (
                        <div className='ContenidoClaro'>
                            <div className='RenderizarFiltros'>
                                <div className='SeleccionFecha'>
                                    <div className='TituloFecha'>
                                        <i className="fas fa-calendar"></i>
                                        <span>Año</span>
                                    </div>
                                    <Selectores
                                        id='Fecha-Reporte-Boton'
                                        value={añoSeleccionada}
                                        onChange={(e) => setAñoSeleccionada(e.target.value)}
                                        className="select-box"
                                        options={listaAño.map((item) => ({
                                            value: item,
                                            label: item.toString()
                                        }))}
                                    />
                                </div>
                                <div className='SeleccionFecha'>
                                    <div className='TituloFecha'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <span>Mes</span>
                                    </div>
                                    <Selectores
                                        id='Fecha-Reporte-Boton'
                                        value={mesSeleccionada}
                                        onChange={(e) => setMesSeleccionada(e.target.value)}
                                        className="select-box"
                                        options={listaMes.map((item) => ({
                                            value: item,
                                            label: item.toString()
                                        }))}
                                    />
                                </div>
                                <div className='SeleccionFecha'>
                                    <div className='TituloFecha'>
                                        <i className="fas fa-calendar-day"></i>
                                        <span>Dia</span>
                                    </div>
                                    <Selectores
                                        id='Fecha-Reporte-Boton'
                                        value={diaSeleccionada}
                                        onChange={(e) => setDiaSeleccionada(e.target.value)}
                                        className="select-box"
                                        options={listaDia.map((item) => ({
                                            value: item,
                                            label: item.toString()
                                        }))}
                                    />
                                </div>
                                <div className='SeleccionSupervision'>
                                    <div className='TituloSupervision'>
                                        <i className="fas fa-user-tie"></i>
                                        <span>Supervisor</span>
                                    </div>
                                    <Selectores
                                        id='Fecha-Reporte-Boton'
                                        value={supervisorSeleccionado}
                                        onChange={(e) => setSupervisorSeleccionado(e.target.value)}
                                        className="select-box"
                                        options={listaSupervisor.map((item) => ({
                                            value: item,
                                            label: item.toString()
                                        }))}
                                    />
                                </div>
                                <div className='SeleccionPlaca'>
                                    <div className='TituloPlaca'>
                                        <i className="fas fa-id-card"></i>
                                        <span>Placa</span>
                                    </div>
                                    <Selectores
                                        id='Fecha-Reporte-Boton'
                                        value={placaSeleccionada}
                                        onChange={(e) => setPlacaSeleccionada(e.target.value)}
                                        className="select-box"
                                        options={listaPlaca.map((item) => ({
                                            value: item,
                                            label: item.toString()
                                        }))}
                                    />
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
                                                <BarHorizontal xValues={graficaRegistrosOrdenadosPorPlaca.map(d => d.placa)} yValues={graficaRegistrosOrdenadosPorPlaca.map(d => d.cantidad)} title={'Acompañamientos por placa'} />
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
                                                <BarHorizontal xValues={graficaRegistrosSupervisionCadaUno.map(d => d.name)} yValues={graficaRegistrosSupervisionCadaUno.map(d => d.registros)} title={'Acompañamientos por supervisor'} />
                                            </div>
                                        </div>
                                        <div className='BarraFecha'>
                                            <div className='TituloBarraFecha'>
                                                <i className="fas fa-chart-bar"></i>
                                                <span>Acompañamientos por dia</span>
                                            </div>
                                            <div className='GraficaFecha'>
                                                <BarWithBackground xValues={graficaRegistrosSupervisionDia.map(d => d.name)} yValues={graficaRegistrosSupervisionDia.map(d => d.registros)} title={'Acompañamientos por dia'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button onClick={() => navigate('/SupervisionFormularioClaro')} className="btn-flotante">+</button>
                            </div>
                        </div>
                    )}

                    {carpeta === "Enel" && (
                        <div className='ContenidoEnel'>
                            <div className='botonAgregar'>
                                <Botones onClick={() => setMostrarModal(true)} className='agregar'>Agregar OP/OT</Botones>
                            </div>
                            <div className='Graficas'>
                                <div className='Grafica1'>
                                    <SemiPieChart data={datosParaGrafico1} title={'Inspecciones'} />
                                </div>
                                <div className='Grafica2'>
                                    <NightingaleChart data={datosParaGrafico2} title={'Supervisor Tecnico'} />
                                </div>
                            </div>
                            <div className='Datos'>
                                <Tablas columnas={columnasEnel} datos={dataEnelInspeccionIntegralHSE} editar={true} filasPorPagina={7}
                                    onEditar={async (fila) => {
                                        if (fila.formulario === "Enel Inspeccion Integral HSE") {
                                            setLoading(true);
                                            const datosConFotos = await cargarFotosEnBase64(fila);
                                            localStorage.removeItem('formularioEnelInspeccionIntegralHSE');
                                            localStorage.setItem('formularioEnelInspeccionIntegralHSE', JSON.stringify(fila));
                                            navigate('/SupervisionFormularioEnelIntegral', { state: { modo: 'editar' } });
                                        }
                                        if (fila.formulario === "Enel Inspeccion de Gestion Ambiental para Areas Operativas") {
                                            setLoading(true);
                                            navigate('/SupervisionFormularioEnelAmbiental', { state: { modo: 'editar' } });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {mostrarModal && (
                        <>
                            <div className="modal-overlay" onClick={() => setMostrarModal(false)}></div>
                            <div className="modal-cuadrilla">
                                <div className="modal-contenido">
                                    <div className={`titulo`}>
                                        <Textos className='subtitulo'>Por favor elija el tipo de formulario a diligenciar</Textos>
                                    </div>
                                    <div className={`selectores`}>
                                        <Selectores value={selectedOption} onChange={(e) => { setSelectedOption(e.target.value) }}
                                            options={[
                                                { value: 'ENEL - Inspeccion Integral HSE', label: 'ENEL - Inspeccion Integral HSE' },
                                                { value: 'ENEL - Inspección de Gestión Ambiental para Áreas Operativas', label: 'ENEL - Inspección de Gestión Ambiental para Áreas Operativas' },
                                                { value: 'ENEL - Inspección de Botiquin', label: 'ENEL - Inspección de Botiquin' },
                                                { value: 'ENEL - Inspección a Equipos y Elementos de Emergencia', label: 'ENEL - Inspección a Equipos y Elementos de Emergencia' },
                                            ]} className="primary">
                                        </Selectores>
                                    </div>
                                    <div className={`acciones`}>
                                        <Botones onClick={() => setMostrarModal(false)}>Cancelar</Botones>
                                        <Botones className='agregar' onClick={() => {
                                            if (selectedOption === 'ENEL - Inspeccion Integral HSE') {
                                                const dataStr = localStorage.getItem('formularioEnelInspeccionIntegralHSE');
                                                if (dataStr) {
                                                    const dataLocal = JSON.parse(dataStr);
                                                    if (dataLocal.id) {
                                                        localStorage.removeItem('formularioEnelInspeccionIntegralHSE');
                                                    }
                                                }
                                                navigate('/SupervisionFormularioEnelIntegral', { state: { modo: 'crear' } });
                                            } else if (selectedOption === 'ENEL - Inspección de Gestión Ambiental para Áreas Operativas') {
                                                const dataStr = localStorage.getItem('formularioEnelInspeccionDeGestionAmbientalParaAreasOperativas');
                                                if (dataStr) {
                                                    const dataLocal = JSON.parse(dataStr);
                                                    if (dataLocal.id) {
                                                        localStorage.removeItem('formularioEnelInspeccionDeGestionAmbientalParaAreasOperativas');
                                                    }
                                                }
                                                navigate('/SupervisionFormularioEnelAmbiental', { state: { modo: 'crear' } });
                                            } else if (selectedOption === 'ENEL - Inspección de Botiquin') {
                                                const dataStr = localStorage.getItem('formularioEnelInspeccionDeBotiquin');
                                                if (dataStr) {
                                                    const dataLocal = JSON.parse(dataStr);
                                                    if (dataLocal.id) {
                                                        localStorage.removeItem('formularioEnelInspeccionDeBotiquin');
                                                    }
                                                }
                                                navigate('/SupervisionFormularioEnelBotiquin', { state: { modo: 'crear' } });
                                            } else if (selectedOption === 'ENEL - Inspección a Equipos y Elementos de Emergencia') {
                                                const dataStr = localStorage.getItem('formularioEnelInspeccionAEquiposYElementosDeEmergencia');
                                                if (dataStr) {
                                                    const dataLocal = JSON.parse(dataStr);
                                                    if (dataLocal.id) {
                                                        localStorage.removeItem('formularioEnelInspeccionAEquiposYElementosDeEmergencia');
                                                    }
                                                }
                                                navigate('/SupervisionFormularioEnelElementosEmergencia', { state: { modo: 'crear' } });
                                            } else {
                                                toast.error('Por favor seleccione una opcion valida');
                                            }
                                        }}>Aceptar</Botones>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </>
            )}
        </div>
    );
};

export default SupervisionPrincipal;