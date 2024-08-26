import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SupervisionAgregar.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SupervisionAgregar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, nombre } = location.state || {};
    const [error, setError] = useState(null);
    const [fecha, setFecha] = useState('');
    const [ubicacion, setUbicacion] = useState({ latitude: null, longitude: null });
    const [placa, setPlaca] = useState('');
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

        if (!placa) {
            toast.error('Por favor agrega la placa de la movil', { className: 'toast-error' });
            return;
        }

        if (!ot) {
            toast.error('Por favor agrega una OT', { className: 'toast-error' });
            return;
        }

        if (!novedad) {
            toast.error('Por favor agrega una Novedad', { className: 'toast-error' });
            return;
        }

        if (!observacion) {
            toast.error('Por favor agrega una Observacion', { className: 'toast-error' });
            return;
        }

        if (!ubicacion.latitude || !ubicacion.longitude) {
            toast.error('Por favor dar permisos para acceder a la ubicacion', { className: 'toast-error' });
            return;
        }

        if (!foto) {
            toast.error('Por favor agrega una foto', { className: 'toast-error' });
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
            await axios.post('https://sicteferias.from-co.net:8120/supervision/cargarImagen', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            await axios.post("https://sicteferias.from-co.net:8120/supervision/cargarDatos", {
                fecha: formattedDate2,
                nombre: nombre,
                placa: placa,
                ot: ot,
                novedad: novedad,
                observacion: observacion,
                latitud: ubicacion.latitude,
                longitud: ubicacion.longitude,
                fotoNombre: fotoNombre
            });

            navigate('/SupervisionPrincipal', { state: { role:role, nombre:nombre, estadoNotificacion:true } });
            console.log('Datos enviados exitosamente');

        } catch (error) {
            console.error('Error al subir el archivo o enviar los datos:', error);
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
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
                    <div className='Placa'>
                        <i className="fas fa-id-card"></i>
                        <input 
                            type="text" 
                            placeholder="Placa Movil (Ejemplo: ABC123)" 
                            value={placa} 
                            onChange={(e) => {
                                const newValue = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                                if (/^[A-Z]{0,3}[0-9]{0,3}$/.test(newValue)) {
                                    setPlaca(newValue); // Solo actualizar el estado si el nuevo valor coincide con el patrón
                                }
                            }}
                            pattern="[A-Za-z]{3}[0-9]{3}"
                            maxLength={6} // Limitar la longitud máxima a 6 caracteres
                            title="Debe ser en formato de 3 letras seguidas de 3 números (Ejemplo: ABC123)"
                        />
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
                            <div id="map" style={{ width: '100%', height: '270px' }}></div>
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
                <div className='Notificaciones'>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
};

export default SupervisionAgregar;