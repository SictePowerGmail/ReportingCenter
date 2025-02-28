import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sicte from '../../images/Sicte 6.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import './login.css'

const Login = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const tipo = params.get("tipo");
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const [enviando, setEnviando] = useState(false);

    const handleSendToken = async () => {
        if (!email) {
            toast.error('Por favor ingresar un correo electronico registrado', { className: 'toast-error' });
            return;
        }

        setEnviando(true);

        try {
            const usuarios = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const usuariosData = await usuarios.json();
            const emailExiste = usuariosData.some(usuario => usuario.correo === email);

            if (emailExiste) {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/user/enviarToken`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email }),
                });

                if (response.ok) {
                    toast.info("Token enviado al correo: " + email, { className: 'toast-error' });
                } else {
                    const errorText = await response.text();
                    toast.error("Error al enviar el token al correo: " + errorText, { className: 'toast-error' });
                }
            } else {
                toast.error("Correo ingresado no existe: " + email, { className: 'toast-error' });
            }
        } catch (error) {
            setError('Error al conectar con el servidor');
        }

        setEmail('');
        setEnviando(false);
        setShowModal(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/user/login/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: username, contrasena: password }),
            });

            if (response.ok) {
                const data = await response.json();
                Cookies.set('userRole', data.rol, { expires: 7 });
                Cookies.set('userNombre', data.nombre, { expires: 7 });
                Cookies.set('userCedula', data.cedula, { expires: 7 });
                Cookies.set('userCorreo', data.correo, { expires: 7 });
                Cookies.set('userTelefono', data.telefono, { expires: 7 });
                Cookies.set('repMatOt', "", { expires: 7 });
                Cookies.set('repMatCodMovil', "", { expires: 7 });
                Cookies.set('repMatMovil', "", { expires: 7 });
                Cookies.set('repMatResponsable', "", { expires: 7 });
                Cookies.set('repMatNodo', "", { expires: 7 });
                Cookies.set('repMatFilas', "", { expires: 7 });
                Cookies.set('solMatCiudad', "", { expires: 7 });
                Cookies.set('solMatUUID', "", { expires: 7 });
                Cookies.set('solMatNombreProyecto', "", { expires: 7 });
                Cookies.set('solMatEntregaProyectada', "", { expires: 7 });
                localStorage.removeItem('yaRecargado');
                if (tipo === 'supervision') {
                    navigate('/SupervisionPrincipal', { state: { estadoNotificacion: false } });
                } else if (tipo === 'solicitudMaterial') {
                    navigate('/MaterialPrincipal', { state: { estadoNotificacion: false } });
                } else if (tipo === 'reporteMaterialFerretero') {
                    navigate('/ReporteMaterialPrincipal', { state: { estadoNotificacion: false } });
                } else if (tipo === 'inventarioMaterial') {
                    navigate('/InventariosMaterialPrincipal', { state: { estadoNotificacion: false } });
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
    };

    useEffect(() => {
        const cedulaUsuario = Cookies.get('userCedula');
        const nombreUsuario = Cookies.get('userNombre');

        if (cedulaUsuario !== undefined && nombreUsuario !== undefined) {
            if (tipo === 'supervision') {
                navigate('/SupervisionPrincipal', { state: { estadoNotificacion: false } });
            } else if (tipo === 'solicitudMaterial') {
                navigate('/MaterialPrincipal', { state: { estadoNotificacion: false } });
            } else if (tipo === 'reporteMaterialFerretero') {
                navigate('/ReporteMaterialPrincipal', { state: { estadoNotificacion: false } });
            } else if (tipo === 'inventarioMaterial') {
                navigate('/InventariosMaterialPrincipal', { state: { estadoNotificacion: false } });
            }
        }
    }, []);

    return (
        <div className="Supervision-Login-App">
            <div className='Login-Contenido_1'>
                <img src={Sicte} alt="Logo Sicte" />
            </div>
            <div className='Login-Contenido_2'>
                <div className='Login-Titulo'>
                    <h1>¡ Bienvenido !</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='Login-Usuario'>
                        <i className="fas fa-user"></i>
                        <input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className='Login-Contraseña'>
                        <i className="fas fa-lock"></i>
                        <input type={mostrarPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <i className={`password-toggle fas ${mostrarPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setMostrarPassword(!mostrarPassword)}></i>
                    </div>

                    <div className='Login-Boton-Envio'>
                        <button type="submit" id='Login-Boton-Envio-Estilo' className="btn btn-primary">Iniciar sesión</button>
                    </div>
                </form>

                <div className='CambiarContraseña' onClick={() => setShowModal(true)}>
                    <span>¿Olvidaste la contraseña?</span>
                </div>

                {showModal && (
                    <div className="modal-overlay"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setEmail('');
                                setShowModal(false);
                            }
                        }}>
                        <div className="modal-content">
                            {enviando ? (
                                <div id="CargandoPagina">
                                    <ThreeDots
                                        type="ThreeDots"
                                        color="#0B1A46"
                                        height={150}
                                        width={200}
                                    />
                                    <p>... Enviando Correo ...</p>
                                </div>
                            ) : (
                                <>
                                    <h3>Cambiar Contraseña</h3>
                                    <p>Ingresa tu correo para enviar un token de recuperación.</p>
                                    <input
                                        type="email"
                                        placeholder="Correo electrónico"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <div className="modal-buttons">
                                        <button onClick={handleSendToken}>Enviar</button>
                                        <button onClick={() => {
                                            setShowModal(false);
                                            setEmail('');
                                        }}>Cancelar</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {error === "Error al conectar con el servidor" ? (
                    <div className='contenedor-error-message'>
                        <span className="error-message">
                            Por favor hacer click <a href="https://sicteferias.from-co.net:8120/" target="_blank" rel="noopener noreferrer">aqui</a> y dar acceso al enlace
                        </span>
                    </div>
                ) : (
                    <p className="error-message">
                        {error}
                    </p>
                )}
            </div>
            <div className='Notificaciones'>
                <ToastContainer />
            </div>
        </div>
    );
};

export default Login;