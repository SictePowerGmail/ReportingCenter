import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SupervisionPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SupervisionPrincipal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, nombre, estadoNotificacion } = location.state || {};
    const [error, setError] = useState('');

    const Agregar = async (event) => {
        if (role === 'SUPERVISION' || role === 'admin') {
            navigate('/SupervisionAgregar', { state: { role:role, nombre:nombre, estadoNotificacion:false } });
        }  else {
            setError('Permiso no autorizado');
        }
    };

    useEffect(() => {
        if (estadoNotificacion) {
            navigate('/SupervisionPrincipal', { state: { role:role, nombre:nombre, estadoNotificacion:false } });
            toast.success('Datos enviados exitosamente', { className: 'toast-success' });
        }
    }, []);

    return (
        <div className="Supervision-Principal">
            <div className='Contenido'>
                <p>Prueba</p>
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