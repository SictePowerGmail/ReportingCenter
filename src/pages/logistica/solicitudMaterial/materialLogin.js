import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sicte from '../../../images/Sicte 6.png'
import Cookies from 'js-cookie';

const MaterialLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('https://sicteferias.from-co.net:8120/user/login/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: username, contrasena: password }),
            });
    
            if (response.ok) {
                const data = await response.json();
                const userRole = data.rol; 
                const userNombre = data.nombre; 
                const userCedula = data.cedula; 
                Cookies.set('userRole', userRole, { expires: 7 });
                Cookies.set('userNombre', userNombre, { expires: 7 });
                Cookies.set('userCedula', userCedula, { expires: 7 });
                Cookies.set('solMatCiudad', "", { expires: 7 });
                Cookies.set('solMatUUID', "", { expires: 7 });
                Cookies.set('solMatNombreProyecto', "", { expires: 7 });
                Cookies.set('solMatEntregaProyectada', "", { expires: 7 });
                navigate('/MaterialPrincipal', { state: { estadoNotificacion:false } });
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
                        <input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)}/>
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

                <div className='Version'>
                    <p>v1.23</p>
                </div>
            </div>
        </div>
    );
};

export default MaterialLogin;