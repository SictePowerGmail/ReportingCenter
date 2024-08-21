import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SupervisionAgregar.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';

const SupervisionAgregar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userRole } = location.state || {};
    const [error, setError] = useState(null);
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
            setFoto(URL.createObjectURL(file));
        }
    };
    
    const enviarFormulario = async (event) => {
        
        event.preventDefault();
        setError('');
    
        console.log(JSON.stringify({ ot:ot, novedad:novedad, observacion:observacion, ubicacion:ubicacion, foto:foto }),);

        /*
        try {
            const response = await fetch('https://sicteferias.from-co.net:8120/user/login/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Cambia el tipo de contenido a application/json
                },
                body: JSON.stringify({ correo: username, contrasena: password }), // Convierte los datos a JSON
            });
    
            if (response.ok) {
                const data = await response.json(); // Obtén la respuesta como JSON
                const userRole = data.rol; // Asume que la respuesta tiene una propiedad 'rol'
                if (userRole === 'SUPERVISION' || userRole === 'admin') {
                    navigate('/SupervisionPrincipal', { state: { role: userRole } });
                } else {
                    setError('Permiso no autorizado');
                }
            } else {
                const errorText = await response.text();
                if (response.status === 404) {
                    setError('Usuario no encontrado');
                } else if (response.status === 401) {
                    setError('Contraseña incorrecta');
                } else {
                    setError('Error inesperado: ' + errorText);
                }
            }
        } catch (error) {
            setError('Error al conectar con el servidor');
        }
        */
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
    }, []);
    

    return (
        <div className="Supervision-Agregar">
            <div className='Contenido'>
                <form onSubmit={enviarFormulario} className='Formulario'>
                    <div className='Titulo'>
                        <h3>Actividad</h3>
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
                        <h4>Ubicación del Usuario</h4>
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
                            {foto ? <img src={foto} alt="Foto" className="foto-preview" /> : 'Tomar Foto'}
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