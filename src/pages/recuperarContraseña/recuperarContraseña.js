import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sicte from '../../images/Sicte 6.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const RecuperarContraseña = () => {
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [mostrarPassword1, setMostrarPassword1] = useState(false);
    const [mostrarPassword2, setMostrarPassword2] = useState(false);
    const [token, setToken] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!password1) {
            toast.error('Por favor ingresar una contraseña', { className: 'toast-error' });
            return;
        }

        if (!password2) {
            toast.error('Por favor ingresa nuevamente la contraseña', { className: 'toast-error' });
            return;
        }

        if (password1 !== password2) {
            toast.error('Los campos ingresados no son iguales', { className: 'toast-error' });
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/user/validarToken?token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const message = await response.text();

                if (message === 'Token valido') {
                    try {
                        const tokens = await fetch(`${process.env.REACT_APP_API_URL}/user/tokens`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        const tokensData = await tokens.json();
                        const tokenData = tokensData.find(item => item.token === token);
                        const emailToken = tokenData.email
                        if (tokenData) {

                            try {
                                toast.success('Cambio de contraseña exitoso', { className: 'toast-success' });
                                await axios.post(`${process.env.REACT_APP_API_URL}/user/actualizarContrasena`, { emailToken, password2 });
                                setTimeout(() => {
                                    navigate('/ReportingCenter');
                                }, 1000);
                            } catch (error) {
                                toast.error('Cambio de contraseña fallido', { className: 'toast-success' });
                            }

                        } else {
                            toast.error("Token no encontrado.", { className: 'toast-error' });
                        }
                    } catch (error) {
                        setError('Error al conectar con el servidor');
                    }
                } else if (message === 'Token expirado') {
                    toast.error("Token ya expiro.", { className: 'toast-error' });
                }

            } else {
                toast.error("Error al validar el token.", { className: 'toast-error' });
            }

        } catch (error) {
            console.error('Error en la solicitud de validación:', error);
            toast.error("Error en la validación del token.", { className: 'toast-error' });
        }
    };

    useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.split('?')[1]);
        const tokenFromUrl = params.get('token');

        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            navigate('/ReportingCenter');
        }
    }, []);

    return (
        <div className="Supervision-Login-App">
            <div className='Login-Contenido_1'>
                <img src={Sicte} alt="Logo Sicte" />
            </div>
            <div className='Login-Contenido_2'>
                <div className='Login-Titulo'>
                    <h1>Nueva Contraseña</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='subTitulo1'>
                        <span>Ingresa la nueva contraseña</span>
                    </div>
                    <div className='Login-Contraseña'>
                        <i className="fas fa-lock"></i>
                        <input type={mostrarPassword1 ? 'text' : 'password'} value={password1} onChange={(e) => setPassword1(e.target.value)} />
                        <i className={`password-toggle fas ${mostrarPassword1 ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setMostrarPassword1(!mostrarPassword1)}></i>
                    </div>
                    <span className='subTitulo2'>Ingresa nuevamente la contraseña</span>
                    <div className='Login-Contraseña'>
                        <i className="fas fa-lock"></i>
                        <input type={mostrarPassword2 ? 'text' : 'password'} value={password2} onChange={(e) => setPassword2(e.target.value)} />
                        <i className={`password-toggle fas ${mostrarPassword2 ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setMostrarPassword2(!mostrarPassword2)}></i>
                    </div>

                    <div className='Login-Boton-Envio'>
                        <button type="submit" id='Login-Boton-Envio-Estilo' className="btn btn-primary">Cambiar Contraseña</button>
                    </div>
                </form>

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

export default RecuperarContraseña;