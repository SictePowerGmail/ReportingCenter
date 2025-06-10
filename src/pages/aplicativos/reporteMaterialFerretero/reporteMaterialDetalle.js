import React, { useEffect, useState, useRef } from 'react';
import './reporteMaterialDetalle.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReporteMaterialDetalle = ({ isOpen, onClose, fila }) => {
    const navigate = useNavigate();
    const contenidoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState('');

    const obtenerImage = async () => {
        try {
            if (!fila || fila.length === 0) {
                return null;
            }

            const imageName = fila[0].firma;
            
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/reporteFerretero/obtenerImagen`,
                {
                    params: { imageName },
                    responseType: 'blob',
                }
            );

            if (response.data.size === 0) {
                console.error('Received an empty image blob');
                return null;
            }

            const imageUrl = URL.createObjectURL(response.data);
            setImageUrl(imageUrl);

        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cedulaUsuario = Cookies.get('userCedula');
        const nombreUsuario = Cookies.get('userNombre');

        if (cedulaUsuario === undefined && nombreUsuario === undefined) {
            navigate('/MaterialLogin', { state: { estadoNotificacion: false } });
        }
    }, []);

    useEffect(() => {
        obtenerImage();
    }, [fila]);

    useEffect(() => {
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
            setImageUrl('');
        }
        
        const handleClickOutside = (event) => {
            if (contenidoRef.current && !contenidoRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const generarPDF = async () => {
        setLoading(true);
        const elemento = document.getElementById('contenido-pdf');

        const estiloOriginal = document.createElement('style');
        estiloOriginal.innerHTML = `
            #contenido-pdf td::before {
                content: none !important;
            }
        `;
        document.head.appendChild(estiloOriginal);

        try {
            const canvas = await html2canvas(elemento, {
                scale: 2,
                windowWidth: 1400,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const margin = 10;
            const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
            const pdfHeight = pdf.internal.pageSize.getHeight() - margin * 2;

            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            const x = margin;
            const y = margin;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`Detalle Registro OT${fila[0].ot}.pdf`);
        } finally {
            document.head.removeChild(estiloOriginal);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="reporteMaterialDetalle">

            <div className='Contenido' ref={contenidoRef}>

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
                    <div>
                        <div id="contenido-pdf">
                            <div className="BarraSuperior">
                                <h3>Detalle del registro</h3>
                                <button onClick={onClose}><i className="fas fa-times"></i></button>
                            </div>

                            <div className='Detalles'>
                                <div className='Columna1'>
                                    <span><strong>Fecha Soliciud:</strong> {fila[0].fecha}</span>
                                    <span><strong>Cedula:</strong> {fila[0].cedula}</span>
                                    <span><strong>Nombre:</strong> {fila[0].nombre}</span>
                                    <span><strong>OT:</strong> {fila[0].ot}</span>
                                    <span><strong>Descargar PDF:</strong>
                                        <button onClick={generarPDF} className='btn btn-link'>Generar PDF</button>
                                    </span>
                                </div>
                                <div className='Columna2'>
                                    <span><strong>Codigo Movil:</strong> {fila[0].codigoMovil}</span>
                                    <span><strong>Movil:</strong> {fila[0].movil}</span>
                                    <span><strong>Responsable:</strong> {fila[0].responsable}</span>
                                    <span><strong>Nodo:</strong> {fila[0].nodo}</span>
                                </div>
                            </div>

                            <div className='Tabla'>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Codigo Sap</th>
                                            <th>Descripción de Material</th>
                                            <th>Unidad de Medida</th>
                                            <th>Cantidad</th>
                                            <th>Serial</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fila.map((item) => (
                                            <tr key={item.id}>
                                                <td data-label="Codigo Sap"><span>{item.codigoSap}</span></td>
                                                <td data-label="Descripcion de Material"><span>{item.descripcion}</span></td>
                                                <td data-label="Unidad de Medida"><span>{item.unidadMedida}</span></td>
                                                <td data-label="Cantidad"><span>{item.cantidad}</span></td>
                                                <td data-label="Serial"><span>{item.serial}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className='Firma'>
                                <span>Firma del Supervisor</span>
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Imagen cargada" className='imagen' />
                                ) : (
                                    <p>Cargando imagen...</p>
                                )}
                            </div>
                        </div>

                        <div className='Notificaciones'>
                            <ToastContainer />
                        </div>
                    </div>
                )}
            </div>

        </div >
    );
};

export default ReporteMaterialDetalle;