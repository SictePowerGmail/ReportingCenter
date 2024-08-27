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
    const { role, nombre, estadoNotificacion } = location.state || {};
    const mapRef = useRef(null);
    const [graficaRegistrosSupervisionDia, setGraficaRegistrosSupervisionDia] = useState({});
    const [graficaRegistrosSupervisionCadaUno, setGraficaRegistrosSupervisionCadaUno] = useState({});
    const [fechaSeleccionada, setFechaSeleccionada] = useState('Todo');
    const [supervisorSeleccionado, setSupervisorSeleccionado] = useState('Todo');
    const [placaSeleccionada, setPlacaSeleccionada] = useState('Todo');
    const [cantidadAcompañamientos, setCantidadAcompañamientos] = useState('0');
    let registrosPorDia2;


    const Agregar = async (event) => {
        if (role === 'SUPERVISION' || role === 'admin' || role === 'COORDINACION') {
            navigate('/SupervisionAgregar', { state: { role:role, nombre:nombre, estadoNotificacion:false } });
        }  else {
            toast.error('Permiso no autorizado', { className: 'toast-error' });
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

                if (fechaSeleccionada !== 'Todo') {
                    dataFiltrada = dataFiltrada.filter(item => {
                        const itemFecha = item.fecha.split(' ')[0];
                        return itemFecha === fechaSeleccionada;
                    });
                }

                if (placaSeleccionada !== 'Todo') {
                    dataFiltrada = data.filter(item => item.placa === placaSeleccionada);
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

                const registrosTotal = dataFiltrada.length;

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
        const { latitud, longitud, fotoNombre, fecha, ot, novedad, observacion, placa } = item;
    
        const awesomeMarker = L.AwesomeMarkers.icon({
            icon: 'car',
            prefix: 'fa',
            markerColor: 'blue',
            iconColor: 'white'
        });
    
        // Crea el marcador y añádelo al mapa
        const marker = L.marker([latitud, longitud], { icon: awesomeMarker }).addTo(mapRef.current);
    
        // Definir el contenido del popup (inicialmente sin imagen)
        const popupContent = `
            <div>
                <p>Fecha: ${fecha}<br>Placa: ${placa}<br>OT: ${ot}<br>Novedad: ${novedad}<br>Observación: ${observacion}</p>
                <div id="image-container-${fotoNombre}" style="width: 100px; height: auto; text-align: center;"></div>
            </div>
        `;
    
        // Asignar el contenido del popup al marcador
        marker.bindPopup(popupContent);
    
        // Evento de clic en el marcador para cargar la imagen cuando se abre el popup
        marker.on('popupopen', async () => {
            const imageContainer = document.getElementById(`image-container-${fotoNombre}`);
            if (imageContainer) {
                const imageUrl = await fetchImage(fotoNombre);
                imageContainer.innerHTML = imageUrl ? `<img src="${imageUrl}" alt="${fotoNombre}" style="width: 100px; height: auto;"/>` : `<p>No image available</p>`;
            }
        });
    };
    
    const fetchImage = async (imageName) => {
        try {
            const response = await fetch(`https://sicteferias.from-co.net:8120/supervision/ObtenerImagen?imageName=${encodeURIComponent(imageName)}`);
            
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
        if (estadoNotificacion) {
            navigate('/SupervisionPrincipal', { state: { role:role, nombre:nombre, estadoNotificacion:false } });
            toast.success('Datos enviados exitosamente', { className: 'toast-success' });
        }

        cargarRegistrosSupervision();
    }, []);

    useEffect(() => {
        cargarRegistrosSupervision();
    }, [supervisorSeleccionado, fechaSeleccionada, placaSeleccionada]);

    const getListaNombre = () => {
        const uniqueNombre = new Set();
        uniqueNombre.add("Todo");
        datosRegistrosSupervision.forEach(item => {
            uniqueNombre.add(item.nombre);
        });
        return Array.from(uniqueNombre);
    };

    const getListaFecha = () => {
        const uniqueDia = new Set();
        uniqueDia.add("Todo");
        datosRegistrosSupervision.forEach(item => {
            const fechaCompleta = new Date(item.fecha); // Asumiendo que item.fecha está en formato ISO
            const dia = fechaCompleta.getDate().toString().padStart(2, '0');
            const mes = (fechaCompleta.getMonth() + 1).toString().padStart(2, '0'); // Meses en JavaScript son 0-indexados
            const año = fechaCompleta.getFullYear();
            const fechaFormateada = `${año}-${mes}-${dia}`;
            uniqueDia.add(fechaFormateada);
        });
        return Array.from(uniqueDia);
    };

    const getListaPlaca = () => {
        const uniquePlaca = new Set();
        uniquePlaca.add("Todo");
        datosRegistrosSupervision.forEach(item => {
            uniquePlaca.add(item.placa);
        });
        return Array.from(uniquePlaca);
    };

    return (
        <div className="Supervision-Principal">
            <div className='Contenido'>
                <h4>Registros</h4>
                <div className='SeleccionFecha'>
                    <div className='TituloFecha'>
                        <i className="fas fa-calendar-alt"></i>
                        <span>Fecha</span>
                    </div>
                    <select id='Fecha-Reporte-Boton' value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} className="select-box">
                        {getListaFecha().map((fecha, index) => (
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
                        {getListaNombre().map((nombres, index) => (
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
                        {getListaPlaca().map((placa, index) => (
                            <option key={index} value={placa}>
                                {placa}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='Total'>
                    <i className="fas fa-calculator"></i>
                    <span>Total acompañamientos: {cantidadAcompañamientos}</span>
                </div>
                <div className='BarraFecha'>
                    <div className='TituloBarraFecha'>
                        <i className="fas fa-chart-bar"></i>
                        <span>Acompañamientos por dia</span>
                    </div>
                    <BarChart
                        width={310}
                        height={200}
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
                </div>
                <div className='Ubicacion'>
                    <div className='Contenedor'>
                        <i className="fas fa-map-marker-alt"></i>
                        <span>Ubicaciónes registradas</span>
                    </div>
                    <div id="map" className='Mapa' style={{ width: '330px', height: '300px' }}></div>
                </div>
                <div className='BarraSupervision'>
                    <div className='TituloBarraSupervision'>
                        <i className="fas fa-chart-bar"></i>
                        <span>Acompañamientos por supervisor</span>
                    </div>
                    <BarChart
                        width={310}
                        height={300}
                        data={graficaRegistrosSupervisionCadaUno}
                        layout="vertical"
                        >
                        <YAxis dataKey="name" type="category" width={100}/>
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
                </div>
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