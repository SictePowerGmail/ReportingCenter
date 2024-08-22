import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SupervisionAgregar.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import axios from 'axios';

const SupervisionAgregar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, nombre } = location.state || {};
    const [error, setError] = useState(null);
    const [fecha, setFecha] = useState('');
    const [ubicacion, setUbicacion] = useState({ latitude: null, longitude: null });
    const [ot, setOt] = useState('');
    const [novedad, setNovedad] = useState('');
    const [observacion, setObservacion] = useState('');
    const [foto, setFoto] = useState(null);
    const mapRef = useRef(null);
    const locationRef = useRef(null);

    const clickCapture = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFoto(file);
        }
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}-${minutes}`;
    };

    const formatDate2 = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    
    const enviarFormulario = async (event) => {
        
        event.preventDefault();
        setError('');

        if (!ot) {
            alert("Por favor agrega una OT");
            return;
        }

        if (!novedad) {
            alert("Por favor agrega una Novedad");
            return;
        }

        if (!observacion) {
            alert("Por favor agrega una Observacion");
            return;
        }

        if (!ubicacion.latitude || !ubicacion.longitude) {
            alert("Por favor dar permisos para acceder a la ubicacion");
            return;
        }

        if (!foto) {
            alert("Por favor agrega una foto");
            return;
        }

        const formattedDate = formatDate(fecha);
        const formattedDate2 = formatDate2(fecha);
        const formData = new FormData();
        const fotoNombre = `${formattedDate}_${foto.name}`
        formData.append('file', foto);
        formData.append("filename", fotoNombre);
        //console.log(JSON.stringify({ nombre:nombre, fecha:formattedDate, ot:ot, novedad:novedad, observacion:observacion, latitud:ubicacion.latitude, longitud:ubicacion.longitude, fotoNombre:fotoNombre }));

        try {
            const response = await axios.post('https://sicteferias.from-co.net:8120/supervision/cargarImagen', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            await axios.post("https://sicteferias.from-co.net:8120/supervision/cargarDatos", {
                fecha: formattedDate2,
                nombre: nombre,
                ot: ot,
                novedad: novedad,
                observacion: observacion,
                latitud: ubicacion.latitude,
                longitud: ubicacion.longitude,
                fotoNombre: fotoNombre
            });

            console.log('Datos enviados exitosamente');
        } catch (error) {
            console.error('Error al subir el archivo o enviar los datos:', error);
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUbicacion({ latitude, longitude });

                    if (mapRef.current === null) {

                        mapRef.current = L.map('map').setView([latitude, longitude], 16);

                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(mapRef.current);

                        const awesomeMarker = L.AwesomeMarkers.icon({
                            icon: 'car',   // nombre del icono de Font Awesome
                            prefix: 'fa',     // prefijo para el icono de Font Awesome (normalmente 'fa')
                            markerColor: 'blue',  // color del marcador
                            iconColor: 'white'    // color del icono
                        });

                        L.marker([latitude, longitude], { icon: awesomeMarker }).addTo(mapRef.current)
                            .openPopup();

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
                },
                (error) => {
                    setError(error.message);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }

        setFecha(new Date())
    }, []);
    

    return (
        <div className="Supervision-Agregar">
            <div className='Contenido'>
                <form onSubmit={enviarFormulario} className='Formulario'>
                    <div className='Titulo'>
                        <h3>Actividad</h3>
                    </div>
                    <div className='Fecha'>
                        <i className="fas fa-calendar-alt"></i>
                        <span>{fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className='OT'>
                        <i className="fas fa-tools"></i>
                        <input type="text" placeholder="OT" value={ot} onChange={(e) => setOt(e.target.value)}/>
                    </div>
                    <div className='Novedad'>
                        <i className="fas fa-bullhorn"></i>
                        <input type="text" placeholder="Novedad" value={novedad} onChange={(e) => setNovedad(e.target.value)}/>
                    </div>
                    <div className='Observacion'>
                        <i className="fas fa-comment"></i>
                        <textarea type="text" placeholder="Observacion" value={observacion} onChange={(e) => setObservacion(e.target.value)} rows={1}/>
                    </div>
                    <div className='Ubicacion'>
                        <div className='Contenedor'>
                            <i className="fas fa-map-marker-alt"></i>
                            <span>Ubicación del Usuario</span>
                        </div>
                        {error ? (
                            <p>Error: {error}</p>
                        ) : (
                            <div id="map" style={{ width: '100%', height: '300px' }}></div>
                        )}
                    </div>
                    <div className='Foto'>
                        <i className="fas fa-camera"></i>
                        <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            onChange={clickCapture}
                            style={{ display: 'none' }}
                            id="fotoInput"
                        />
                        <label htmlFor="fotoInput" className="foto-label">
                            {foto ? foto.name : 'Tomar Foto'}
                        </label>
                    </div>

                    <div className='Enviar'>
                        <button type="submit" id='Enviar' className="btn btn-primary">Enviar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupervisionAgregar;