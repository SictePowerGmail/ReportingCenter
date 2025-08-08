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

const GestionOts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { estadoNotificacion } = location.state || {};
    const role = Cookies.get('userRole');
    const nombre = Cookies.get('userNombre');
    const mapRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState('');
    const [info, setInfo] = useState({});
    const [infoVisible, setInfoVisible] = useState(false);
    const contenidoRef = useRef(null);

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

                if (coordenadasInvalidas.length > 0) {
                    console.warn("Coordenadas inválidas encontradas:", coordenadasInvalidas);
                }

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
                if (data.length > 0) {
                    const bounds = L.latLngBounds(data.map(item => [item.x, item.y]));
                    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                }
            };

            return div;
        };
        locationButton.addTo(mapRef.current);

        // Input para filtrar
        const filterInput = L.control({ position: 'topright' });
        filterInput.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom mi-input-filtrar');

            div.innerHTML = `
                <input 
                    type="text" 
                    class="filterText" 
                    placeholder="Filtrar ..." 
                />
            `;

            // Evitar que el mapa se mueva al escribir
            L.DomEvent.disableClickPropagation(div);

            setTimeout(() => {
                const input = div.querySelector('.filterText');
                input.addEventListener('change', function () {
                    const valor = this.value.trim();
                    const filtrados = data.filter(item =>
                        Object.values(item).some(value =>
                            String(value).toLowerCase().includes(valor.toLowerCase())
                        )
                    );

                    mapRef.current.eachLayer(layer => {
                        if (layer instanceof L.Marker) {
                            mapRef.current.removeLayer(layer);
                        }
                    });

                    filtrados.forEach(item => addMarkerToMap(item));
                });
            });

            return div;
        };
        filterInput.addTo(mapRef.current);

        const clearButton = L.control({ position: 'topright' });
        clearButton.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom mi-boton-limpiar');
            div.innerHTML = '<i class="fa fa-trash"></i>';

            div.onclick = function () {
                mapRef.current.eachLayer(layer => {
                    if (layer instanceof L.Marker) {
                        mapRef.current.removeLayer(layer);
                    }
                });
            };

            return div;
        };
        clearButton.addTo(mapRef.current);
    };

    const addMarkerToMap = (item) => {
        const { x, y } = item;

        if (!x || !y || isNaN(x) || isNaN(y)) {
            console.warn("Coordenadas inválidas para el item:", item);
            return;
        }

        const awesomeMarker = L.AwesomeMarkers.icon({
            icon: 'lightbulb',
            prefix: 'fa',
            markerColor: 'cadetblue',
            iconColor: 'white'
        });

        const marker = L.marker([x, y], { icon: awesomeMarker }).addTo(mapRef.current);

        marker.on("click", () => {
            mostrarInfoEnPanel(item);
        });
    };

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
        if (infoVisible && contenidoRef.current) {
            contenidoRef.current.scrollTop = 0;
        }
    }, [infoVisible]);

    return (
        <div className="GestionOts">
            {loading ? (
                <CargandoDatos text={'Cargando Datos'} />
            ) : (
                <>
                    <div className='Mapa'>
                        <div id="map" className='Mapa'></div>
                    </div>

                    <div className={`overlayGestionOts ${infoVisible ? '' : 'ocultar'}`} onClick={() => setInfoVisible(false)}></div>

                    <div className={`panel-info ${infoVisible ? '' : 'ocultar'}`}>
                        <div className='contenido' ref={contenidoRef}>
                            <div className='campo titulo'>
                                <Textos className='titulo'>Orden: {info.nro_orden}</Textos>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Asignado:</Textos>
                                    <Entradas disabled type="text" value={info.asignado} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Direccion:</Textos>
                                    <Entradas disabled type="text" value={info.direccion} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Fecha ingreso:</Textos>
                                    <Entradas disabled type="text" value={info.fecha_ingreso} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Localidad:</Textos>
                                    <Entradas disabled type="text" value={info.localidad_giap} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Numero Rotulo:</Textos>
                                    <Entradas disabled type="text" value={info.no_rotulo} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Nombre:</Textos>
                                    <Entradas disabled type="text" value={info.nombre} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Numero Transformador:</Textos>
                                    <Entradas disabled type="text" value={info.nro_transformador} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Referencia Barrio:</Textos>
                                    <Entradas disabled type="text" value={info.referencia_barrio} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Telefono:</Textos>
                                    <Entradas disabled type="text" value={info.telefono} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Tipo Falla:</Textos>
                                    <Entradas disabled type="text" value={info.tipo_falla} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Latitud:</Textos>
                                    <Entradas disabled type="text" value={info.x} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Longitud:</Textos>
                                    <Entradas disabled type="text" value={info.y} />
                                </div>
                            </div>
                            <div className='campo'>
                                <i className="fas fa-tools"></i>
                                <div className='entradaDatos'>
                                    <Textos className='subtitulo'>Zona:</Textos>
                                    <Entradas disabled type="text" value={info.zona} />
                                </div>
                            </div>
                            <div className='acciones'>
                                <Botones onClick={() => {
                                    setInfoVisible(false);
                                    setInfo('');
                                }}>Cancelar</Botones>
                                <Botones className='guardar' onClick={() => {
                                    setInfoVisible(false);
                                    setInfo('');
                                }}>Aceptar</Botones>
                            </div>
                        </div>
                    </div>

                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </>
            )}
        </div>
    );
};

export default GestionOts;