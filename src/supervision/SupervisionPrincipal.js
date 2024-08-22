import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SupervisionPrincipal.css'

const SupervisionPrincipal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, nombre } = location.state || {};
    const [error, setError] = useState('');

    const Agregar = async (event) => {
        if (role === 'SUPERVISION' || role === 'admin') {
            navigate('/SupervisionAgregar', { state: { role:role, nombre:nombre } });
        }  else {
            setError('Permiso no autorizado');
        }
    };

    return (
        <div className="Supervision-Principal">
            <div className='Contenido'>
                <p>Prueba</p>
                <div>
                    <button onClick={Agregar} className="btn-flotante">+</button>
                </div>
            </div>
        </div>
    );
};

export default SupervisionPrincipal;