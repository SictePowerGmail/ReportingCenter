import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import './AlumbradoPublico.css'
import Cookies from 'js-cookie';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CargandoDatos from '../../../components/cargandoDatos/cargandoDatos';
import Botones from '../../../components/botones/botones';
import Tablas from '../../../components/tablas/tablas';

function AlumbradoPublico() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    return (
        <div className='AlumbradoPublico'>
            <div className='contenedor'>
                {loading ? (
                    <div className="CargandoPagina">
                        <CargandoDatos />
                    </div>
                ) : (
                    <>
                        <div className='Botones'>
                            <Botones onClick={() => navigate('/AlumbradoPublicoDetalle')} className='agregar'>Agrega OT</Botones>
                        </div>

                        <div className='Tabla'>
                            <Tablas></Tablas>
                        </div>

                        <div className='Notificaciones'>
                            <ToastContainer />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AlumbradoPublico;