import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './materialPendienteDirector.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import { use } from 'react';

const MaterialPendienteDirector = ({ isOpen, onClose, onApprove, onDeny, fila, observaciones, setObservaciones, pantalla }) => {
    const [diseñoFile, setDiseñoFile] = useState(null);
    const [kmzFile, setKmzFile] = useState(null);
    const contenidoRef = useRef(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const formatDate3 = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}-${minutes}`;
    };

    useEffect(() => {
        if (fila && fila[0]) {
            fetchArchivo(fila[0].diseño, 'diseño');
            fetchArchivo(fila[0].kmz, 'kmz');
        }

        if (fila && fila[0] && fila[0].pdfs !== null) {
            optenerPDFs();
        }
    }, [fila]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contenidoRef.current && !contenidoRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        setPdfsUrl([]);
        setPdfData([]);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const optenerPDFs = async () => {
        const pdfs = fila[0].pdfs.split(',');

        for (const pdfNombre of pdfs) {
            try {
                const response = await axios.get(`https://sicteferias.from-co.net:8120/solicitudMaterial/ObtenerPDF`, {
                    params: { "fileName": pdfNombre },
                    responseType: 'blob',
                });

                const pdfUrl = URL.createObjectURL(response.data);

                setPdfsUrl(prevUrls => [...prevUrls, pdfUrl]);

            } catch (error) {
                console.error(`Error al enviar el PDF ${pdfNombre} al backend:`, error);
                toast.error(`Error al cargar el PDF: ${pdfNombre}`, { className: 'toast-success' });
            }

            try {
                const response = await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/leerPDF', { "rutaPdf": pdfNombre },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                const updatedData = response.data.map(row => ({
                    pdfNombre,
                    ...row,
                }));

                setPdfData(prevData => [...prevData, ...updatedData]);

            } catch (error) {
                console.error(`Error al enviar el PDF ${pdfNombre} al backend:`, error);
                toast.error(`Error al cargar el PDF: ${pdfNombre}`, { className: 'toast-success' });
            }
        }
    }

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

    const [pdfsUrl, setPdfsUrl] = useState([]);
    const [pdfsFiles, setPdfsFiles] = useState([]);
    const [pdfConteoIndice, setPdfConteoIndice] = useState(0);
    const [pdfNombres, setPdfNombres] = useState([]);
    const pdfInputRef = useRef(null);
    const [pdfData, setPdfData] = useState([]);

    const lecturaDePDFs = (event) => {
        const files = Array.from(event.target.files);
        const urls = files
            .filter(file => file.type === "application/pdf")
            .map(file => URL.createObjectURL(file));
        const pdfFiles = files.filter(file => file.type === "application/pdf");
        const nombres = files.map(file => file.name);

        setPdfsUrl(urls);
        setPdfsFiles(pdfFiles);
        setPdfNombres(nombres);
        setPdfConteoIndice(0);
    };

    const manejarCargueEntregaBodega = async () => {
        setLoading(true);
        const ids = fila.map(item => item.id);
        const estado = "Entregado"
        let observacionesTemporal;

        if (observaciones === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observaciones;
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoEntregaBodega', { ids, estado, observacionesTemporal });
            console.log('Solicitud enviada correctamente entrega bodega');
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        const fechaActual = new Date();
        const formattedDate = formatDate3(fechaActual);
        const pdfNombre = pdfNombres.map(pdf => `${formattedDate}_${pdf}`).join(",");

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoEntregaBodegaPDFs', { ids, pdfNombre });
            console.log('Solicitud enviada correctamente entrega bodega pdfs');
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        for (let i = 0; i < pdfsFiles.length; i++) {
            const pdf = pdfsFiles[i];
            const nombre = pdfNombres[i]
            const formDataPdf = new FormData();
            const pdfNombre = `${formattedDate}_${nombre}`;
            formDataPdf.append('file', pdf);
            formDataPdf.append("filename", pdfNombre);

            try {
                await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/cargarPDF', formDataPdf, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log(`Solicitud enviada correctamente para el PDF: ${pdfNombre}`);
            } catch (error) {
                console.error(`Error al enviar el PDF ${pdfNombre} al backend:`, error);
                toast.error(`Error al cargar el PDF: ${pdfNombre}`, { className: 'toast-success' });
            }
        }

        for (let i = 0; i < pdfsFiles.length; i++) {
            const nombre = pdfNombres[i]
            const pdfNombre = `${formattedDate}_${nombre}`;

            try {
                const response = await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/leerPDF', { "rutaPdf": pdfNombre },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                const updatedData = response.data.map(row => ({
                    pdfNombre,
                    ...row,
                }));

                setPdfData(prevData => [...prevData, ...updatedData]);

            } catch (error) {
                console.error(`Error al enviar el PDF ${pdfNombre} al backend:`, error);
                toast.error(`Error al cargar el PDF: ${pdfNombre}`, { className: 'toast-success' });
            }
        }

        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="PendienteDirector">

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
                                <span><strong>Entrega Bodega:</strong> {(fila[0].entregaBodega === "Pendiente" && pdfData.length > 0) ? "Entregado" : fila[0].entregaBodega}</span>
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

                        {(pantalla === "EntregaBodega") && (
                            <div className='LecturaPDFs'>
                                {(pdfData.length === 0 && fila[0].entregaBodega === "Pendiente") && (
                                    <div className='EntradaPDFs'>
                                        <span>Por favor agregue los PDFs de las salidas de material</span>
                                        <div className='inputPDFs'>
                                            <input type="file" accept="application/pdf" multiple onChange={lecturaDePDFs} ref={pdfInputRef} />
                                        </div>
                                    </div>
                                )}
                                <div className='Contenedor'>
                                    {pdfsUrl.length > 0 && (
                                        <>
                                            <div className='title'>
                                                <span>Salidas de Material</span>
                                            </div>
                                            <div className='VisorPDFs'>
                                                <iframe
                                                    src={pdfsUrl[pdfConteoIndice]}
                                                    title={`PDF-${pdfConteoIndice + 1}`}
                                                />
                                            </div>
                                            <div className='Botones'>
                                                <button
                                                    onClick={() => {
                                                        setPdfConteoIndice((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : pdfsUrl.length - 1));
                                                    }}
                                                >Anterior
                                                </button>
                                                <h4>{pdfNombres[pdfConteoIndice]}</h4>
                                                <button
                                                    onClick={() => {
                                                        setPdfConteoIndice((prevIndex) => (prevIndex < pdfsUrl.length - 1 ? prevIndex + 1 : 0));
                                                    }}
                                                >Siguiente</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {((fila[0].aprobacionDirector === "Pendiente" && pantalla === "Director") || (fila[0].aprobacionDireccionOperacion === "Pendiente" && pantalla === "DireccionOperacion") || (fila[0].entregaBodega === "Pendiente" && pantalla === "EntregaBodega" && pdfsUrl.length > 0 && pdfData.length === 0)) && (
                            <div className='Observaciones'>
                                <label htmlFor="observaciones">Observaciones:</label>
                                <textarea
                                    id="observaciones"
                                    value={observaciones}
                                    onChange={(e) => {
                                        setObservaciones(e.target.value);
                                        setError('');
                                    }}
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
                                <button
                                    onClick={() => {
                                        if (observaciones.trim() === '') {
                                            setError('Las observaciones son obligatorias al rechazar.');
                                        } else {
                                            setError('');
                                            onDeny();
                                        }
                                    }}
                                >Rechazar</button>
                            </div>
                        )}

                        {((fila[0].entregaBodega === "Pendiente" && pantalla === "EntregaBodega" && pdfsUrl.length > 0 && pdfData.length === 0)) && (
                            <div className="Botones">
                                <button onClick={manejarCargueEntregaBodega}>Cargar</button>
                                <button
                                    onClick={() => {
                                        setPdfsUrl([]);
                                        pdfInputRef.current.value = null;
                                    }}
                                >Limpiar</button>
                            </div>
                        )}

                        {pdfData.length > 0 && (
                            <div className="Tabla">
                                <span>Material Entregado</span>
                                <div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>SALIDA</th>
                                                <th>NRO.</th>
                                                <th>PRODUCTO</th>
                                                <th>DESCRIPCION</th>
                                                <th>U.M.</th>
                                                <th>CANTIDAD</th>
                                                <th>OBSERVACIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pdfData.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item["pdfNombre"]}</td>
                                                    <td>{item["NRO."]}</td>
                                                    <td>{item["PRODUCTO"]}</td>
                                                    <td>{item["DESCRIPCION"]}</td>
                                                    <td>{item["U.M."]}</td>
                                                    <td>{item["CANTIDAD"]}</td>
                                                    <td>{item["OBSERVACIONES"]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className='Notificaciones'>
                            <ToastContainer />
                        </div>
                    </div>
                )}
            </div>

        </div >
    );
};

export default MaterialPendienteDirector;
