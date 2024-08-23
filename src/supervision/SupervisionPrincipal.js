import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SupervisionPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import L from 'leaflet';

const SupervisionPrincipal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [datosRegistrosSupervision, setDatosRegistrosSupervision] = useState([]);
    const [datosRegistrosSupervisionCadaUno, setDatosRegistrosSupervisionCadaUno] = useState([]);
    const { role, nombre, estadoNotificacion } = location.state || {};
    const [error, setError] = useState('');
    const [mapa, setMapa] = useState(null);
    const mapRef = useRef(null);
    const [graficaRegistrosSupervisionDia, setGraficaRegistrosSupervisionDia] = useState({});
    const [graficaRegistrosSupervisionCadaUno, setGraficaRegistrosSupervisionCadaUno] = useState({});
    const [supervisorSeleccionado, setSupervisorSeleccionado] = useState('Todo');
    const [cantidadAcompañamientos, setCantidadAcompañamientos] = useState('0');
    let registrosPorDia2;


    const Agregar = async (event) => {
        if (role === 'SUPERVISION' || role === 'admin') {
            navigate('/SupervisionAgregar', { state: { role:role, nombre:nombre, estadoNotificacion:false } });
        }  else {
            setError('Permiso no autorizado');
        }
    };

    const cargarRegistrosSupervision = async (event) => {
        axios.get('https://sicteferias.from-co.net:8120/supervision/RegistrosSupervision')
            .then(response => {
                let dataFiltrada;
                const data = response.data;
                setDatosRegistrosSupervision(data)

                if (supervisorSeleccionado === 'Todo') {
                    dataFiltrada = data
                } else {
                    dataFiltrada = data.filter(item => item.nombre === supervisorSeleccionado);
                }

                generarMapa(dataFiltrada);

                const registrosPorDia = dataFiltrada.reduce((acc, item) => {
                    const fecha = new Date(item.fecha).toLocaleDateString('es-ES');
                    if (!acc[fecha]) {
                        acc[fecha] = 0;
                    }
                    acc[fecha]++;
                    return acc;
                }, {});

                registrosPorDia2 = Object.entries(registrosPorDia).map(([fecha, registros]) => ({
                    name: fecha,
                    registros: registros
                }));

                setGraficaRegistrosSupervisionDia(registrosPorDia2);

                const registrosPorCadaUno = data.reduce((acc, item) => {
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

                const registrosTotal = data.length;

                setCantidadAcompañamientos(registrosTotal)
            })
            .catch(error => {
                console.error('Error fetching data:', error);
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
                        mapRef.current.setView([data[0].latitud, data[0].longitud], 16);
                    }
                };
    
                return div;
            };
            locationButton.addTo(mapRef.current);
        }
    
        if (mapRef.current) {
            mapRef.current.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    mapRef.current.removeLayer(layer);
                }
            });
        }
    
        data.forEach(item => {
            const { latitud, longitud } = item;
            const awesomeMarker = L.AwesomeMarkers.icon({
                icon: 'car',
                prefix: 'fa',
                markerColor: 'blue',
                iconColor: 'white'
            });
    
            L.marker([latitud, longitud], { icon: awesomeMarker })
                .addTo(mapRef.current)
                .bindPopup(`Fecha: ${item.fecha}<br>OT: ${item.ot}<br>Novedad: ${item.novedad}<br>Observación: ${item.observacion}`)
                .openPopup();
        });
    
        if (data.length > 0) {
            const bounds = L.latLngBounds(data.map(item => [item.latitud, item.longitud]));
            mapRef.current.fitBounds(bounds);
        }
    };    
    

    useEffect(() => {
        if (estadoNotificacion) {
            navigate('/SupervisionPrincipal', { state: { role:role, nombre:nombre, estadoNotificacion:false } });
            toast.success('Datos enviados exitosamente', { className: 'toast-success' });
        }

        cargarRegistrosSupervision();
    }, []);

    useEffect(() => {
        cargarRegistrosSupervision();
    }, [supervisorSeleccionado]);

    const getListaNombre = () => {
        const uniqueNombre = new Set();
        uniqueNombre.add("Todo");
        datosRegistrosSupervision.forEach(item => {
            uniqueNombre.add(item.nombre);
        });
        return Array.from(uniqueNombre);
    };

    return (
        <div className="Supervision-Principal">
            <div className='Contenido'>
                <h4>Registros</h4>
                <select id='Fecha-Reporte-Boton' value={supervisorSeleccionado} onChange={(e) => setSupervisorSeleccionado(e.target.value)} className="select-box">
                    {getListaNombre().map((nombres, index) => (
                        <option key={index} value={nombres}>
                            {nombres}
                        </option>
                    ))}
                </select>
                <div><p>Total Acompañamientos: {cantidadAcompañamientos}</p></div>
                <BarChart
                    width={340}
                    height={200}
                    margin={0}
                    data={graficaRegistrosSupervisionDia}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 30]} />
                    <Tooltip />
                    <Bar dataKey="registros" fill="#8884d8">
                        <LabelList dataKey="registros" position="top" />
                    </Bar>
                </BarChart>
                <div className='Ubicacion'>
                    <div className='Contenedor'>
                        <i className="fas fa-map-marker-alt"></i>
                        <span>Ubicación del Usuario</span>
                    </div>
                    {mapa ? (
                        <p>Error: {mapa}</p>
                    ) : (
                        <div id="map" style={{ width: '340px', height: '300px' }}></div>
                    )}
                </div>
                <BarChart
                    width={340}
                    height={300}
                    data={graficaRegistrosSupervisionCadaUno}
                    layout="vertical"
                    >
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="registros" fill="#8884d8">
                        <LabelList dataKey="registros" position="right" />
                    </Bar>
                </BarChart>
                <div>
                    <button onClick={Agregar} className="btn-flotante">+</button>
                </div>
                <div className='Notificaciones'>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
};

export default SupervisionPrincipal;