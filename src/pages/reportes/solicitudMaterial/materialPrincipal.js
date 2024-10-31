import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';

const MaterialPrincipal = () => {
    const location = useLocation();
    const { role, nombre, estadoNotificacion } = location.state || {};
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    return (
        <div className="materialPrincipal">
            {loading ? (
                <div className="CargandoPagina">
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
                    <div>
                        <button className="btn-flotante" 
                            onClick={() => {
                                navigate('/MaterialAgregar', { state: { role:role, nombre:nombre, estadoNotificacion:false } });
                            }}
                        >+</button>
                    </div>
                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialPrincipal;