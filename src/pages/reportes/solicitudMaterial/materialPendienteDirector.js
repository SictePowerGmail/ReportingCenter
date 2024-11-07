import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './materialPendienteDirector.css';

const MaterialPendienteDirector = ({ isOpen, onClose, onApprove, onDeny, fila, observaciones, setObservaciones, pantalla }) => {
    const [diseñoFile, setDiseñoFile] = useState(null);
    const [kmzFile, setKmzFile] = useState(null);
    const contenidoRef = useRef(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (fila && fila[0]) {
            fetchArchivo(fila[0].diseño, 'diseño');
            fetchArchivo(fila[0].kmz, 'kmz');
        }
    }, [fila]);

    useEffect(() => {
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

    const fetchArchivo = async (fileName, tipo) => {
        try {
            if (tipo === 'diseño') {
                const response = await axios.get(`https://sicteferias.from-co.net:8120/solicitudMaterial/ObtenerDiseño`, {
                    params: { fileName },
                    responseType: 'blob'
                });

                const url = URL.createObjectURL(response.data);
                setDiseñoFile(url);
            } else if (tipo === 'kmz') {
                const response = await axios.get(`https://sicteferias.from-co.net:8120/solicitudMaterial/ObtenerKmz`, {
                    params: { fileName },
                    responseType: 'blob'
                });

                const url = URL.createObjectURL(response.data);
                setKmzFile(url);
            }
        } catch (error) {
            console.error(`Error al obtener el archivo ${fileName}:`, error);
        }
    };

    const manejarRechazo = () => {
        if (observaciones.trim() === '') {
            setError('Las observaciones son obligatorias al rechazar.');
        } else {
            setError('');
            onDeny();
        }
    };

    const manejarCambioObservacion = (e) => {
        setObservaciones(e.target.value);
        setError('');
    };


    const [pdfsUrl, setPdfsUrl] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [pdfNames, setPdfNames] = useState([]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const urls = files
            .filter(file => file.type === "application/pdf")
            .map(file => URL.createObjectURL(file));
        const names = files.map(file => file.name); // Obtener los nombres de los archivos

        setPdfsUrl(urls);
        setPdfNames(names); // Guardar los nombres de los archivos
        setCurrentIndex(0); // Resetear al primer archivo
    };

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : pdfsUrl.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex < pdfsUrl.length - 1 ? prevIndex + 1 : 0));
    };

    if (!isOpen) return null;

    return (
        <div className="PendienteDirector">
            <div className='Contenido' ref={contenidoRef}>
                <div className="BarraSuperior">
                    <h3>Detalles de la Solicitud</h3>
                    <button onClick={onClose}>X</button>
                </div>
                <div className='Detalles'>
                    <div className='Columna1'>
                        <span><strong>Fecha Soliciud:</strong> {fila[0].fecha}</span>
                        <span><strong>Cedula:</strong> {fila[0].cedula}</span>
                        <span><strong>Nombre:</strong> {fila[0].nombre}</span>
                        <span><strong>Ciudad:</strong> {fila[0].ciudad}</span>
                        <span><strong>Diseño:</strong>
                            {diseñoFile ? (
                                <a href={diseñoFile} download={fila[0].diseño}> Descargar Diseño</a>
                            ) : (
                                'Cargando...'
                            )}
                        </span>
                        <span><strong>Kmz:</strong>
                            {kmzFile ? (
                                <a href={kmzFile} download={fila[0].kmz}> Descargar KMZ</a>
                            ) : (
                                'Cargando...'
                            )}
                        </span>
                    </div>
                    <div className='Columna2'>
                        <span><strong>Uuid:</strong> {fila[0].uuid}</span>
                        <span><strong>Nombre Proyecto:</strong> {fila[0].nombreProyecto}</span>
                        <span><strong>Fecha Entrega Proyecto:</strong> {fila[0].entregaProyecto}</span>
                        <span><strong>Aprobacion Director:</strong> {fila[0].aprobacionDirector}</span>
                        {fila[0].aprobacionDirector !== "Pendiente" && fila[0].observacionesDirector !== "Ninguna" && fila[0].observacionesDirector !== null && (
                            <span><strong>Observaciones Director:</strong> {fila[0].observacionesDirector}</span>
                        )}
                        <span><strong>Aprobacion Direccion Operacion:</strong> {fila[0].aprobacionDireccionOperacion}</span>
                        {fila[0].aprobacionDireccionOperacion !== "Pendiente" && fila[0].observacionesDireccionOperacion !== "Ninguna" && fila[0].observacionesDireccionOperacion !== null && (
                            <span><strong>Observacion Direccion Operacion:</strong> {fila[0].observacionesDireccionOperacion}</span>
                        )}
                        <span><strong>Entrega Bodega:</strong> {fila[0].entregaBodega}</span>
                    </div>
                </div>
                <div className='Tabla'>
                    <table>
                        <thead>
                            <tr>
                                <th>Propiedad Material</th>
                                <th>Cantidad Disponible</th>
                                <th>Código SAP Material</th>
                                <th>Descripción Material</th>
                                <th>Unidad de Medida</th>
                                <th>Cantidad Solicitada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fila.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.propiedadMaterial}</td>
                                    <td>{item.codigoSapMaterial}</td>
                                    <td>{item.descripcionMaterial}</td>
                                    <td>{item.unidadMedidaMaterial}</td>
                                    <td>{item.cantidadDisponibleMaterial}</td>
                                    <td>{item.cantidadSolicitadaMaterial}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {((fila[0].aprobacionDirector === "Pendiente" && pantalla === "Director") || (fila[0].aprobacionDireccionOperacion === "Pendiente" && pantalla === "DireccionOperacion")) && (
                    <div className='Observaciones'>
                        <label htmlFor="observaciones">Observaciones:</label>
                        <textarea
                            id="observaciones"
                            value={observaciones}
                            onChange={manejarCambioObservacion}
                            placeholder="Escribe tus observaciones aquí..."
                            rows="2"
                            cols="100"
                        />
                        {error && <p className="error">{error}</p>}
                    </div>
                )}
                {((fila[0].aprobacionDirector === "Pendiente" && pantalla === "Director") || (fila[0].aprobacionDireccionOperacion === "Pendiente" && pantalla === "DireccionOperacion")) && (
                    <div className="Botones">
                        <button onClick={onApprove}>Aprobar</button>
                        <button onClick={manejarRechazo}>Rechazar</button>
                    </div>
                )}
                {(fila[0].entregaBodega === "Pendiente" && pantalla === "EntregaBodega") && (
                    <div className='LecturaPDFs'>
                        <input type="file" accept="application/pdf" multiple onChange={handleFileChange} />
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            {pdfsUrl.length > 0 && (
                                <>
                                    <div style={{ marginBottom: '10px' }}>
                                        <button onClick={handlePrevious} style={{ marginRight: '10px' }}>
                                            Anterior
                                        </button>
                                        <h4>{pdfNames[currentIndex]}</h4>
                                        <button onClick={handleNext}>Siguiente</button>
                                    </div>
                                    <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                                        <iframe
                                            src={pdfsUrl[currentIndex]}
                                            width="100%"
                                            height="500px"
                                            title={`PDF-${currentIndex + 1}`}
                                            style={{ border: 'none' }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialPendienteDirector;
