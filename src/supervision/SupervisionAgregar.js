import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SupervisionAgregar.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import axios from 'axios';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';

const SupervisionAgregar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, nombre, estadoNotificacion } = location.state || {};
    const [error, setError] = useState('');
    const [fecha, setFecha] = useState('');
    const [datosPlanta, setDatosPlanta] = useState('');
    const [datosUsuarios, setDatosUsuarios] = useState('');
    const [ubicacion, setUbicacion] = useState({ latitude: null, longitude: null });
    const [placa, setPlaca] = useState('');
    const [ot, setOt] = useState('');
    const [cedula, setCedula] = useState('');
    const [cedulaUsuario, setCedulaUsuario] = useState('');
    const [nombreUsuario, setNombreUsuario] = useState('Nombre');
    const [nombreCuadrilla, setNombreCuadrilla] = useState('Nombre');
    const [observacion, setObservacion] = useState('');
    const [foto, setFoto] = useState(null);
    const mapRef = useRef(null);
    const locationRef = useRef(null);
    const [datosRegistrosSupervision, setDatosRegistrosSupervision] = useState([]);
    const [listaPlacasRegistradas, setListaPlacasRegistradas] = useState([]);
    const [loading, setLoading] = useState(true);

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

        if (nombreUsuario === 'Nombre' || !nombreUsuario) {
            toast.error('Por favor agrega la cedula del supervisor', { className: 'toast-error' });
            return;
        }

        if (nombreUsuario === 'Usuario no encontrado') {
            toast.error('Por favor valide la cedula del supervisor', { className: 'toast-error' });
            return;
        }

        if (!placa) {
            toast.error('Por favor agrega la placa de la movil', { className: 'toast-error' });
            return;
        } else if (!/^[A-Z]{3}[0-9]{3}$/.test(placa)) {
            toast.error('La placa debe estar en el formato ABC123', { className: 'toast-error' });
            return;
        } else if (listaPlacasRegistradas.includes(placa)) {
            toast.error('La placa ya fue registrada el dia de hoy', { className: 'toast-error' });
            return;
        }

        if (nombreCuadrilla === 'Nombre' || nombreCuadrilla === '') {
            toast.error('Por favor agrega la cedula del lider de la cuadrilla', { className: 'toast-error' });
            return;
        }

        if (nombreCuadrilla === 'Usuario no encontrado') {
            toast.error('Por favor valide la cedula del lider de la cuadrilla', { className: 'toast-error' });
            return;
        }

        if (!ot) {
            toast.error('Por favor agrega una OT', { className: 'toast-error' });
            return;
        }

        if (!respuestaEPP) {
            toast.error('Por favor responda la primera pregunta', { className: 'toast-error' });
            return;
        }
        else if (respuestaEPP === 'no' && (!comentarioEPP || comentarioEPP.trim().length === 0)) {
            toast.error('Por favor justifique la primera pregunta', { className: 'toast-error' });
            return;
        }

        if (!respuestaAlturas) {
            toast.error('Por favor responda la segunda pregunta', { className: 'toast-error' });
            return;
        }
        else if (respuestaAlturas === 'no' && (!comentarioAlturas || comentarioAlturas.trim().length === 0)) {
            toast.error('Por favor justifique la segunda pregunta', { className: 'toast-error' });
            return;
        }

        if (!respuestaATS) {
            toast.error('Por favor responda la tercera pregunta', { className: 'toast-error' });
            return;
        }
        else if (respuestaATS === 'no' && (!comentarioATS || comentarioATS.trim().length === 0)) {
            toast.error('Por favor justifique la tercera pregunta', { className: 'toast-error' });
            return;
        }

        if (!respuestaEmpalmes) {
            toast.error('Por favor responda la cuarta pregunta', { className: 'toast-error' });
            return;
        }
        else if (!comentarioEmpalmes || comentarioEmpalmes.trim().length === 0) {
            toast.error('Por favor justifique la cuarta pregunta', { className: 'toast-error' });
            return;
        }

        if (!respuestaPreoperacional) {
            toast.error('Por favor responda la quinta pregunta', { className: 'toast-error' });
            return;
        }
        else if (respuestaPreoperacional === 'no' && (!comentarioPreoperacional || comentarioPreoperacional.trim().length === 0)) {
            toast.error('Por favor justifique la quinta pregunta', { className: 'toast-error' });
            return;
        }

        if (!respuestaVehiculo) {
            toast.error('Por favor responda la sexta pregunta', { className: 'toast-error' });
            return;
        }
        else if (respuestaVehiculo !== '5' && (!comentarioVehiculo || comentarioVehiculo.trim().length === 0)) {
            toast.error('Por favor justifique la sexta pregunta', { className: 'toast-error' });
            return;
        }

        if (!respuestaEmpalmadora) {
            toast.error('Por favor responda la septima pregunta - Empalmadora', { className: 'toast-error' });
            return;
        }

        if (!respuestaOTDR) {
            toast.error('Por favor responda la septima pregunta - OTDR', { className: 'toast-error' });
            return;
        }

        if (!respuestaCortadora) {
            toast.error('Por favor responda la septima pregunta - Cortadora', { className: 'toast-error' });
            return;
        }

        if (!respuestaPinza) {
            toast.error('Por favor responda la septima pregunta - Pinza', { className: 'toast-error' });
            return;
        }

        if (!respuestaOPM) {
            toast.error('Por favor responda la septima pregunta - OPM', { className: 'toast-error' });
            return;
        }

        if (!respuestaONEXPERT) {
            toast.error('Por favor responda la septima pregunta - ONEXPERT', { className: 'toast-error' });
            return;
        }

        if (!respuestaMedidorConductancia) {
            toast.error('Por favor responda la septima pregunta - Medidor de Conductancia', { className: 'toast-error' });
            return;
        }

        if (!respuestaMedidorFugas) {
            toast.error('Por favor responda la septima pregunta - Medidor de Fugas', { className: 'toast-error' });
            return;
        }

        if (!observacion) {
            toast.error('Por favor agrega una Observacion', { className: 'toast-error' });
            return;
        }

        if (!foto) {
            toast.error('Por favor agrega una foto', { className: 'toast-error' });
            return;
        }

        if (!ubicacion.latitude || !ubicacion.longitude) {
            toast.error('Por favor dar permisos para acceder a la ubicacion', { className: 'toast-error' });
            return;
        }

        const formattedDate = formatDate(fecha);
        const formattedDate2 = formatDate2(fecha);
        const formData = new FormData();
        const fotoNombre = `${formattedDate}_${foto.name}`
        formData.append('file', foto);
        formData.append("filename", fotoNombre);

        try {
            await axios.post('https://sicteferias.from-co.net:8120/supervision/cargarImagen', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            await axios.post("https://sicteferias.from-co.net:8120/supervision/cargarDatos", {
                fecha: formattedDate2,
                nombre: nombreUsuario,
                placa: placa,
                cedulaCuadrilla: cedula,
                nombreCuadrilla: nombreCuadrilla,
                ot: ot,
                epp: respuestaEPP,
                eppComentario: comentarioEPP,
                alturas: respuestaAlturas,
                alturasComentario: comentarioAlturas,
                ats: respuestaATS,
                atsComentario: comentarioATS,
                empalmes: respuestaEmpalmes,
                empalmesComentario: comentarioEmpalmes,
                preoperacional: respuestaPreoperacional,
                preoperacionalComentario: comentarioPreoperacional,
                vehiculo: respuestaVehiculo,
                vehiculoComentario: comentarioVehiculo,
                empalmadora: respuestaEmpalmadora,
                otdr: respuestaOTDR,
                cortadora: respuestaCortadora,
                pinza: respuestaPinza,
                opm: respuestaOPM,
                onexpert: respuestaONEXPERT,
                medidorConductancia: respuestaMedidorConductancia,
                medidorFugas: respuestaMedidorFugas,
                observacion: observacion,
                fotoNombre: fotoNombre,
                latitud: ubicacion.latitude,
                longitud: ubicacion.longitude
            });

            navigate('/SupervisionPrincipal', { state: { role:role, nombre:nombreUsuario, estadoNotificacion:true } });
            console.log('Datos enviados exitosamente');

        } catch (error) {
            console.error('Error al subir el archivo o enviar los datos:', error);
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
        }
    };

    const cargarDatosPlanta = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/PlantaEnLinea')
            .then(response => response.json())
            .then(data => {
                setDatosPlanta(data);
                
                
                setLoading(false);
                cargarGeolocalizacion();
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const cargarTodosUsuarios = () => {
        fetch('https://sicteferias.from-co.net:8120/user')
            .then(response => response.json())
            .then(data => {
                setDatosUsuarios(data);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const cargarRegistrosSupervision = async (event) => {
        axios.get('https://sicteferias.from-co.net:8120/supervision/RegistrosSupervision')
            .then(response => {
                const data = response.data;

                setDatosRegistrosSupervision(data);

                // Definir el inicio y el final del día de ayer y de hoy
                const todayStart = moment().startOf('day'); // Inicio del día de hoy
                const todayEnd = moment().endOf('day'); // Fin del día de hoy
                const yesterdayStart = moment().subtract(1, 'day').startOf('day');

                const filteredData = data.filter(item => {
                    const fechaItem = moment(item.fecha, 'YYYY-MM-DD HH:mm');
                    return fechaItem.isBetween(todayStart, todayEnd, null, '[]');
                });

                const uniquePlacas = Array.from(new Set(filteredData.map(item => item.placa)));

                setListaPlacasRegistradas(uniquePlacas);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    useEffect(() => {
        cargarRegistrosSupervision();
        cargarDatosPlanta();   
        cargarTodosUsuarios();
        setFecha(new Date());
    }, []);

    const cargarGeolocalizacion = () => {
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
                    setError(error);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    }
    
    const [respuestaEPP, setRespuestaEPP] = useState(null);
    const [comentarioEPP, setComentarioEPP] = useState('');

    const clickSiEPP = () => {
        setRespuestaEPP('si');
        setComentarioEPP('');
    };
    
    const clickNoEPP = () => {
        setRespuestaEPP('no');
    };

    const [respuestaAlturas, setRespuestaAlturas] = useState(null);
    const [comentarioAlturas, setComentarioAlturas] = useState('');

    const clickSiAlturas = () => {
        setRespuestaAlturas('si');
        setComentarioAlturas('');
    };
    
    const clickNoAlturas = () => {
        setRespuestaAlturas('no');
    };

    const [respuestaATS, setRespuestaATS] = useState(null);
    const [comentarioATS, setComentarioATS] = useState('');

    const clickSiATS = () => {
        setRespuestaATS('si');
        setComentarioATS('');
    };
    
    const clickNoATS = () => {
        setRespuestaATS('no');
    };

    const [respuestaEmpalmes, setRespuestaEmpalmes] = useState(null);
    const [comentarioEmpalmes, setComentarioEmpalmes] = useState('');

    const clickSiEmpalmes = () => {
        setRespuestaEmpalmes('si');
        setComentarioEmpalmes('');
    };
    
    const clickNoEmpalmes = () => {
        setRespuestaEmpalmes('no');
    };

    const [respuestaPreoperacional, setRespuestaPreoperacional] = useState(null);
    const [comentarioPreoperacional, setComentarioPreoperacional] = useState('');

    const clickSiPreoperacional = () => {
        setRespuestaPreoperacional('si');
        setComentarioPreoperacional('');
    };
    
    const clickNoPreoperacional = () => {
        setRespuestaPreoperacional('no');
    };

    const [respuestaVehiculo, setRespuestaVehiculo] = useState(null);
    const [comentarioVehiculo, setComentarioVehiculo] = useState('');

    const click1Vehiculo = () => {
        setRespuestaVehiculo('1');
        setComentarioVehiculo('');
    };
    
    const click2Vehiculo = () => {
        setRespuestaVehiculo('2');
    };
    
    const click3Vehiculo = () => {
        setRespuestaVehiculo('3');
    };

    const click4Vehiculo = () => {
        setRespuestaVehiculo('4');
    };

    const click5Vehiculo = () => {
        setRespuestaVehiculo('5');
    };

    const [respuestaEmpalmadora, setRespuestaEmpalmadora] = useState(null);

    const clickSiEmpalmadora = () => {
        setRespuestaEmpalmadora('Si');
    };
    
    const clickNoEmpalmadora = () => {
        setRespuestaEmpalmadora('No');
    };
    
    const clickNaEmpalmadora = () => {
        setRespuestaEmpalmadora('N/A');
    };

    const [respuestaOTDR, setRespuestaOTDR] = useState(null);

    const clickSiOTDR = () => {
        setRespuestaOTDR('Si');
    };
    
    const clickNoOTDR = () => {
        setRespuestaOTDR('No');
    };
    
    const clickNaOTDR = () => {
        setRespuestaOTDR('N/A');
    };

    const [respuestaCortadora, setRespuestaCortadora] = useState(null);

    const clickSiCortadora = () => {
        setRespuestaCortadora('Si');
    };
    
    const clickNoCortadora = () => {
        setRespuestaCortadora('No');
    };
    
    const clickNaCortadora = () => {
        setRespuestaCortadora('N/A');
    };

    const [respuestaPinza, setRespuestaPinza] = useState(null);

    const clickSiPinza = () => {
        setRespuestaPinza('Si');
    };
    
    const clickNoPinza = () => {
        setRespuestaPinza('No');
    };
    
    const clickNaPinza = () => {
        setRespuestaPinza('N/A');
    };

    const [respuestaOPM, setRespuestaOPM] = useState(null);

    const clickSiOPM = () => {
        setRespuestaOPM('Si');
    };
    
    const clickNoOPM = () => {
        setRespuestaOPM('No');
    };
    
    const clickNaOPM = () => {
        setRespuestaOPM('N/A');
    };

    const [respuestaONEXPERT, setRespuestaONEXPERT] = useState(null);

    const clickSiONEXPERT = () => {
        setRespuestaONEXPERT('Si');
    };
    
    const clickNoONEXPERT = () => {
        setRespuestaONEXPERT('No');
    };
    
    const clickNaONEXPERT = () => {
        setRespuestaONEXPERT('N/A');
    };

    const [respuestaMedidorConductancia, setRespuestaMedidorConductancia] = useState(null);

    const clickSiMedidorConductancia = () => {
        setRespuestaMedidorConductancia('Si');
    };
    
    const clickNoMedidorConductancia = () => {
        setRespuestaMedidorConductancia('No');
    };
    
    const clickNaMedidorConductancia = () => {
        setRespuestaMedidorConductancia('N/A');
    };

    const [respuestaMedidorFugas, setRespuestaMedidorFugas] = useState(null);

    const clickSiMedidorFugas = () => {
        setRespuestaMedidorFugas('Si');
    };
    
    const clickNoMedidorFugas = () => {
        setRespuestaMedidorFugas('No');
    };
    
    const clickNaMedidorFugas = () => {
        setRespuestaMedidorFugas('N/A');
    };

    const estadoCambioCedula = (e) => {
        const cedulaInput = e.target.value;
        setCedula(cedulaInput);

        const registroEncontrado = datosPlanta.find(item => item.nit === cedulaInput);
      
        if (registroEncontrado) {
            setNombreCuadrilla(registroEncontrado.nombre);
        } else {
            setNombreCuadrilla('Usuario no encontrado');
        }
    };

    const estadoCambioCedulaUsuario = (e) => {
        const cedulaInput = e.target.value;
        setCedulaUsuario(cedulaInput);

        const registroEncontrado = datosUsuarios.find(item => item.cedula === cedulaInput);
      
        if (registroEncontrado) {
            setNombreUsuario(registroEncontrado.nombre);
        } else {
            setNombreUsuario('Usuario no encontrado');
        }
    };

    return (
        <div className="Supervision-Agregar">
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
                    <form className='Formulario'>
                        <div className='Titulo'>
                            <h3>Actividad</h3>
                        </div>
                        <div className='Fecha'>
                            <i className="fas fa-calendar-alt"></i>
                            <div className='Entrada'>
                                <h5>Fecha:</h5>
                                <span>{fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <div className='Supervisor'>
                            <i className="fas fa-user-cog"></i>
                            <div className="Entrada">
                                <h5>Supervisor:</h5>
                                {nombreUsuario === 'Nombre' || nombreUsuario === 'Usuario no encontrado' || !nombreUsuario ? (
                                    <input type="text" placeholder="Cedula" value={cedulaUsuario} onChange={estadoCambioCedulaUsuario}/>
                                ) : null }
                                <input type="text" placeholder={!nombreUsuario ? "Nombre" : nombreUsuario} disabled={true} />
                            </div>
                        </div>
                        <div className='Placa'>
                            <i className="fas fa-id-card"></i>
                            <div className='Entrada'>
                                <h5>Ingrese la placa de la movil:</h5>
                                <input 
                                    type="text" 
                                    placeholder="Placa movil (Ejemplo: ABC123)" 
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
                        </div>
                        <div className='LiderCuadrilla'>
                            <i className="fas fa-users-cog"></i>
                            <div className='Entrada'>
                                <h5>Ingrese el lider de la cuadrilla:</h5>
                                <input type="text" placeholder="Cedula" value={cedula} onChange={estadoCambioCedula}/>
                                <input type="text" placeholder="Nombre" value={nombreCuadrilla} disabled={true} />
                            </div>
                        </div>
                        <div className='OT'>
                            <i className="fas fa-tools"></i>
                            <div className='Entrada'>
                                <h5>Ingrese la OT / UUID:</h5>
                                <input type="text" placeholder="OT / UUID" value={ot} onChange={(e) => setOt(e.target.value)}/>
                            </div>
                        </div>
                        <div className='EPP'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='Entrada'>
                                <h5>1. ¿Tienen todos los EPP?</h5>
                                <div className='Botones'>
                                    <button onClick={clickSiEPP} className={respuestaEPP === 'si' ? 'selected' : ''}>Sí</button>
                                    <button onClick={clickNoEPP} className={respuestaEPP === 'no' ? 'selected' : ''}>No</button>
                                    <div className="Comentario">
                                        <input type="text" placeholder={respuestaEPP === 'si' ? "" : "¿Por qué?"} value={comentarioEPP}
                                            onChange={(e) => setComentarioEPP(e.target.value)} disabled={respuestaEPP !== 'no'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='Alturas'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='Entrada'>
                                <h5>2. ¿Todos estan certificados en alturas?</h5>
                                <div className='Botones'>
                                    <button onClick={clickSiAlturas} className={respuestaAlturas === 'si' ? 'selected' : ''}>Sí</button>
                                    <button onClick={clickNoAlturas} className={respuestaAlturas === 'no' ? 'selected' : ''}>No</button>
                                    <div className="Comentario">
                                        <input type="text" placeholder={respuestaAlturas === 'si' ? "" : "¿Por qué?"} value={comentarioAlturas}
                                            onChange={(e) => setComentarioAlturas(e.target.value)} disabled={respuestaAlturas !== 'no'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='ATS'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='Entrada'>
                                <h5>3. ¿Se diligencio el ATS?</h5>
                                <div className='Botones'>
                                    <button onClick={clickSiATS} className={respuestaATS === 'si' ? 'selected' : ''}>Sí</button>
                                    <button onClick={clickNoATS} className={respuestaATS === 'no' ? 'selected' : ''}>No</button>
                                    <div className="Comentario">
                                        <input type="text" placeholder={respuestaATS === 'si' ? "" : "¿Por qué?"} value={comentarioATS}
                                            onChange={(e) => setComentarioATS(e.target.value)} disabled={respuestaATS !== 'no'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='Empalmes'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='Entrada'>
                                <h5>4. ¿Se realizo reporte de empalmes en WFM?</h5>
                                <div className='Botones'>
                                    <button onClick={clickSiEmpalmes} className={respuestaEmpalmes === 'si' ? 'selected' : ''}>Sí</button>
                                    <button onClick={clickNoEmpalmes} className={respuestaEmpalmes === 'no' ? 'selected' : ''}>No</button>
                                    <div className="Comentario">
                                        <input type="text" placeholder={respuestaEmpalmes === 'si' ? "¿Cuantos?" : "¿Por qué?"} value={comentarioEmpalmes}
                                            onChange={(e) => setComentarioEmpalmes(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='Preoperacional'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='Entrada'>
                                <h5>5. ¿Se realizo preoperacional?</h5>
                                <div className='Botones'>
                                    <button onClick={clickSiPreoperacional} className={respuestaPreoperacional === 'si' ? 'selected' : ''}>Sí</button>
                                    <button onClick={clickNoPreoperacional} className={respuestaPreoperacional === 'no' ? 'selected' : ''}>No</button>
                                    <div className="Comentario">
                                        <input type="text" placeholder={respuestaPreoperacional === 'si' ? "" : "¿Por qué?"} value={comentarioPreoperacional}
                                            onChange={(e) => setComentarioPreoperacional(e.target.value)} disabled={respuestaPreoperacional !== 'no'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='Vehiculo'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='Entrada'>
                                <h5>6. Estado del vehiculo:</h5>
                                <div className='Botones'>
                                    <button onClick={click1Vehiculo} className={respuestaVehiculo === '1' ? 'selected' : ''}>1</button>
                                    <button onClick={click2Vehiculo} className={respuestaVehiculo === '2' ? 'selected' : ''}>2</button>
                                    <button onClick={click3Vehiculo} className={respuestaVehiculo === '3' ? 'selected' : ''}>3</button>
                                    <button onClick={click4Vehiculo} className={respuestaVehiculo === '4' ? 'selected' : ''}>4</button>
                                    <button onClick={click5Vehiculo} className={respuestaVehiculo === '5' ? 'selected' : ''}>5</button>
                                </div>
                                <div className="Comentario">
                                    <input type="text" placeholder={respuestaVehiculo === '5' ? "" : "¿Por qué?"} value={comentarioVehiculo}
                                        onChange={(e) => setComentarioVehiculo(e.target.value)} disabled={respuestaVehiculo === '5'} />
                                </div>
                            </div>
                        </div>
                        <div className='Equipos'>
                            <i className="fas fa-bullhorn"></i>
                            <div className='Entrada'>
                                <h5>7. Equipos especializados:</h5>
                                <div className='Botones'>
                                    <div className='Titulo'>
                                        <h5>Empalmadora</h5>
                                    </div>
                                    <button onClick={clickSiEmpalmadora} className={respuestaEmpalmadora === 'Si' ? 'selected' : ''}>Si</button>
                                    <button onClick={clickNoEmpalmadora} className={respuestaEmpalmadora === 'No' ? 'selected' : ''}>No</button>
                                    <button onClick={clickNaEmpalmadora} className={respuestaEmpalmadora === 'N/A' ? 'selected' : ''}>N/A</button>
                                </div>
                                <div className='Botones'>
                                    <div className='Titulo'>
                                        <h5>OTDR</h5>
                                    </div>
                                    <button onClick={clickSiOTDR} className={respuestaOTDR === 'Si' ? 'selected' : ''}>Si</button>
                                    <button onClick={clickNoOTDR} className={respuestaOTDR === 'No' ? 'selected' : ''}>No</button>
                                    <button onClick={clickNaOTDR} className={respuestaOTDR === 'N/A' ? 'selected' : ''}>N/A</button>
                                </div>
                                <div className='Botones'>
                                    <div className='Titulo'>
                                        <h5>Cortadora</h5>
                                    </div>
                                    <button onClick={clickSiCortadora} className={respuestaCortadora === 'Si' ? 'selected' : ''}>Si</button>
                                    <button onClick={clickNoCortadora} className={respuestaCortadora === 'No' ? 'selected' : ''}>No</button>
                                    <button onClick={clickNaCortadora} className={respuestaCortadora === 'N/A' ? 'selected' : ''}>N/A</button>
                                </div>
                                <div className='Botones'>
                                    <div className='Titulo'>
                                        <h5>Pinza de Trafico</h5>
                                    </div>
                                    <button onClick={clickSiPinza} className={respuestaPinza === 'Si' ? 'selected' : ''}>Si</button>
                                    <button onClick={clickNoPinza} className={respuestaPinza === 'No' ? 'selected' : ''}>No</button>
                                    <button onClick={clickNaPinza} className={respuestaPinza === 'N/A' ? 'selected' : ''}>N/A</button>
                                </div>
                                <div className='Botones'>
                                    <div className='Titulo'>
                                        <h5>OPM</h5>
                                    </div>
                                    <button onClick={clickSiOPM} className={respuestaOPM === 'Si' ? 'selected' : ''}>Si</button>
                                    <button onClick={clickNoOPM} className={respuestaOPM === 'No' ? 'selected' : ''}>No</button>
                                    <button onClick={clickNaOPM} className={respuestaOPM === 'N/A' ? 'selected' : ''}>N/A</button>
                                </div>
                                <div className='Botones'>
                                    <div className='Titulo'>
                                        <h5>ONEXPERT</h5>
                                    </div>
                                    <button onClick={clickSiONEXPERT} className={respuestaONEXPERT === 'Si' ? 'selected' : ''}>Si</button>
                                    <button onClick={clickNoONEXPERT} className={respuestaONEXPERT === 'No' ? 'selected' : ''}>No</button>
                                    <button onClick={clickNaONEXPERT} className={respuestaONEXPERT === 'N/A' ? 'selected' : ''}>N/A</button>
                                </div>
                                <div className='Botones'>
                                    <div className='Titulo'>
                                        <h5>Medidor de Conductancia</h5>
                                    </div>
                                    <button onClick={clickSiMedidorConductancia} className={respuestaMedidorConductancia === 'Si' ? 'selected' : ''}>Si</button>
                                    <button onClick={clickNoMedidorConductancia} className={respuestaMedidorConductancia === 'No' ? 'selected' : ''}>No</button>
                                    <button onClick={clickNaMedidorConductancia} className={respuestaMedidorConductancia === 'N/A' ? 'selected' : ''}>N/A</button>
                                </div>
                                <div className='Botones'>
                                    <div className='Titulo'>
                                        <h5>Medidor de Fugas</h5>
                                    </div>
                                    <button onClick={clickSiMedidorFugas} className={respuestaMedidorFugas === 'Si' ? 'selected' : ''}>Si</button>
                                    <button onClick={clickNoMedidorFugas} className={respuestaMedidorFugas === 'No' ? 'selected' : ''}>No</button>
                                    <button onClick={clickNaMedidorFugas} className={respuestaMedidorFugas === 'N/A' ? 'selected' : ''}>N/A</button>
                                </div>
                            </div>
                        </div>
                        <div className='Observacion'>
                            <i className="fas fa-comment"></i>
                            <textarea type="text" placeholder="8. Observacion" value={observacion} onChange={(e) => setObservacion(e.target.value)} rows={1}/>
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
                                {foto ? foto.name : '9. Tomar foto de  la cuadrilla'}
                            </label>
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
                        <div className='Enviar' onClick={enviarFormulario}>
                            <button type="submit" id='Enviar' className="btn btn-primary">Enviar</button>
                        </div>
                    </form>
                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisionAgregar;