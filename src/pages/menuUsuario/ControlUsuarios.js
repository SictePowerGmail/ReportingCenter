import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './BasesDeDatos.css'
import Cookies from 'js-cookie';

function ControlUsuarios() {
    const navigate = useNavigate();

    useEffect(() => {
        const role = Cookies.get('userRole');
        if (role !== "admin") {
            navigate('/ReportingCenter');
        }

    }, []);

    return (
        <div className='BasesDeDatos'>
            <div className='contenedor'>

            </div>
        </div>
    )
}

export default ControlUsuarios;