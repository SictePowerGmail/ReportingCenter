import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './materialDetalle.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import { ObtenerRolUsuario } from '../../../funciones';

const MaterialDetalle = ({ isOpen, onClose, onApprove, onDeny, fila, observaciones, setObservaciones, pantalla }) => {
    const [diseñoFile, setDiseñoFile] = useState(null);
    const [kmzFile, setKmzFile] = useState(null);
    const contenidoRef = useRef(null);
    const [error, setError] = useState('');
    const [observacionesBodega, setObservacionesBodega] = useState('');
    const [loading, setLoading] = useState(true);
    const [filaEditada, setFilaEditada] = useState(null);
    const navigate = useNavigate();
    const rolUsuario = ObtenerRolUsuario(Cookies.get('userRole'));

    const formatDate2 = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const formatDate3 = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}-${minutes}`;
    };

    useEffect(() => {
        const cedulaUsuario = Cookies.get('userCedula');
        const nombreUsuario = Cookies.get('userNombre');

        if (cedulaUsuario === undefined && nombreUsuario === undefined) {
            navigate('/MaterialLogin', { state: { estadoNotificacion: false } });
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contenidoRef.current && !contenidoRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        setPdfsUrl([]);
        setPdfsUrlNuevos([]);
        setPdfData([]);
        setPdfDataNuevos([]);
        setObservacionesBodega('');

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

                const codigoSapMateriales = fila.map(f => f.codigoSapMaterial);

                const updatedDataConEstado = updatedData.map(data => ({
                    ...data,
                    material: codigoSapMateriales.includes(data.PRODUCTO) ? "Solicitado" : "No solicitado",
                }));

                setPdfData(prevData => [...prevData, ...updatedDataConEstado]);

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

    const [pdfData, setPdfData] = useState([]);
    const [pdfsUrl, setPdfsUrl] = useState([]);
    const [pdfNombres, setPdfNombres] = useState([]);
    const [pdfConteoIndice, setPdfConteoIndice] = useState(0);
    const [pdfsFiles, setPdfsFiles] = useState([]);
    const pdfInputRef = useRef(null);
    const [pdfDataNuevos, setPdfDataNuevos] = useState([]);
    const [pdfsUrlNuevos, setPdfsUrlNuevos] = useState([]);
    const [pdfNombresNuevos, setPdfNombresNuevos] = useState([]);
    const [pdfConteoIndiceNuevos, setPdfConteoIndiceNuevos] = useState(0);
    const [pdfsFilesNuevos, setPdfsFilesNuevos] = useState([]);
    const pdfInputRefNuevos = useRef(null);

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
        setLoading(false);
    }, [pdfData])

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

    const lecturaDePDFsNuevos = (event) => {
        const files = Array.from(event.target.files);
        const urls = files
            .filter(file => file.type === "application/pdf")
            .map(file => URL.createObjectURL(file));
        const pdfFiles = files.filter(file => file.type === "application/pdf");
        const nombres = files.map(file => file.name);

        setPdfsUrlNuevos(urls);
        setPdfsFilesNuevos(pdfFiles);
        setPdfNombresNuevos(nombres);
        setPdfConteoIndiceNuevos(0);
    };

    let estadoCargue;

    const manejarCargueEntregaBodega = async () => {
        const ids = fila.map(item => item.id);
        const estado = "Entregado"
        let observacionesTemporal;

        if (observacionesBodega === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesBodega;
        }

        if (estadoCargue === 'normal') {
            try {
                await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoEntregaBodega', { ids, estado, observacionesTemporal });
                console.log('Solicitud enviada correctamente entrega bodega');
            } catch (error) {
                console.error('Error al enviar los IDs al backend:', error);
                toast.error('Error en actualizar estado', { className: 'toast-success' });
            }
        }

        const fechaActual = new Date();
        const formattedDate3 = formatDate3(fechaActual);
        let pdfNombre;
        if (estadoCargue === 'normal') {
            pdfNombre = pdfNombres.map(pdf => `${formattedDate3}_${pdf}`).join(",");
        } else if (estadoCargue === 'nuevo') {
            const prfNombreAnterior = fila[0].pdfs
            const pdfNombresNuevosFormateados = pdfNombresNuevos.map(pdf => `${formattedDate3}_${pdf}`).join(",");
            pdfNombre = `${prfNombreAnterior},${pdfNombresNuevosFormateados}`
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoEntregaBodegaPDFs', { ids, pdfNombre });
            console.log('Solicitud enviada correctamente entrega bodega pdfs');
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        let pdfsFilesDefinitivos;

        if (estadoCargue === 'normal') {
            pdfsFilesDefinitivos = pdfsFiles;
        } else if (estadoCargue === 'nuevo') {
            pdfsFilesDefinitivos = pdfsFilesNuevos;
        }

        for (let i = 0; i < pdfsFilesDefinitivos.length; i++) {
            const pdf = pdfsFilesDefinitivos[i];
            let nombre;
            if (estadoCargue === 'normal') {
                nombre = pdfNombres[i]
            } else if (estadoCargue === 'nuevo') {
                nombre = pdfNombresNuevos[i]
            }
            const formDataPdf = new FormData();
            const pdfNombre = `${formattedDate3}_${nombre}`;
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

        const formattedDate2 = formatDate2(fechaActual);
        let updatedDataConEstado2;

        for (let i = 0; i < pdfsFilesDefinitivos.length; i++) {
            let nombre;
            if (estadoCargue === 'normal') {
                nombre = pdfNombres[i]
            } else if (estadoCargue === 'nuevo') {
                nombre = pdfNombresNuevos[i]
            }
            const pdfNombre = `${formattedDate3}_${nombre}`;

            try {
                const response = await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/leerPDF',
                    { "rutaPdf": pdfNombre },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                const updatedData = response.data.map(row => ({
                    pdfNombre,
                    ...row,
                }));

                const codigoSapMateriales = fila.map(f => f.codigoSapMaterial);

                const updatedDataConEstado = updatedData.map(data => ({
                    ...data,
                    material: codigoSapMateriales.includes(data.PRODUCTO) ? "Solicitado" : "No solicitado",
                }));

                if (estadoCargue === 'normal') {
                    updatedDataConEstado2 = updatedDataConEstado;
                    setPdfData(prevData => [...prevData, ...updatedDataConEstado]);
                } else if (estadoCargue === 'nuevo') {
                    updatedDataConEstado2 = updatedDataConEstado.concat(pdfData);
                    setPdfDataNuevos(prevData => [...prevData, ...updatedDataConEstado]);
                }

                for (const row of updatedDataConEstado) {

                    try {
                        await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/cargarDatosEntregados',
                            {
                                fechaEntrega: formattedDate2,
                                ciudad: fila[0].ciudad,
                                documento: nombre,
                                uuid: fila[0].uuid,
                                nombreProyecto: fila[0].nombreProyecto,
                                codigoSapMaterial: row.PRODUCTO,
                                descripcionMaterial: row.DESCRIPCION,
                                unidadMedidaMaterial: row["U.M."],
                                cantidadSolicitadaMaterial: row.CANTIDAD,
                                material: row.material
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                    } catch (error) {
                        console.error('Error al enviar la fila al backend:', error);
                        toast.error(`Error al cargar los datos: ${pdfNombre}`, { className: 'toast-error' });
                    }
                }

            } catch (error) {
                console.error(`Error al enviar el PDF ${pdfNombre} al backend:`, error);
                toast.error(`Error al cargar el PDF: ${pdfNombre}`, { className: 'toast-success' });
            }
        }

        const fila2 = fila.map((item) => {
            const cantidadSolicitada = parseFloat(item.cantidadSolicitadaMaterial) || 0;

            const cantidadDespachada = updatedDataConEstado2
                .filter((pdfItem) => pdfItem.PRODUCTO.trim() === item.codigoSapMaterial.trim())
                .reduce((total, pdfItem) => {
                    return total + (parseFloat(pdfItem.CANTIDAD) || 0);
                }, 0);

            const cantidadRestante = cantidadSolicitada - cantidadDespachada;

            return {
                ...item,
                cantidadRestantePorDespacho: cantidadRestante.toFixed(0),
            };
        });

        const cantidades = fila2.map(item => item.cantidadRestantePorDespacho);

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoCantidadRestantePorDespacho',
                {
                    ids, cantidades
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Solicitud enviada correctamente entrega bodega');
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        setFilaEditada(fila2);
    };

    if (!isOpen) return null;

    return (
        <div className="MaterialDetalle">

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
                            <button onClick={onClose}><i className="fas fa-times"></i></button>
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
                                <div>
                                    <span><strong>Uuid:</strong> {fila[0].uuid}</span>
                                    <button
                                        title='Copiar Texto'
                                        onClick={() => {
                                            navigator.clipboard.writeText(fila[0].uuid);
                                            toast.info(`Texto Copiado`, { className: 'toast-error' });
                                        }}
                                    >
                                        <i className="fas fa-copy"></i>
                                    </button>
                                </div>
                                <span><strong>Nombre Proyecto:</strong> {fila[0].nombreProyecto}</span>
                                <span><strong>Fecha Entrega Proyecto:</strong> {fila[0].entregaProyecto}</span>
                                <span><strong>Aprobacion Director:</strong> {fila[0].aprobacionDirector}</span>
                                {fila[0].aprobacionDirector !== "Pendiente" && fila[0].observacionesDirector !== "Ninguna" && (
                                    <span><strong>Observaciones Director:</strong> {fila[0].observacionesDirector}</span>
                                )}
                                {fila[0].aprobacionDirector === "Aprobado" && (
                                    <span><strong>Aprobacion Direccion Operacion:</strong> {fila[0].aprobacionDireccionOperacion}</span>
                                )}
                                {fila[0].aprobacionDireccionOperacion !== "Pendiente" && fila[0].observacionesDireccionOperacion !== "Ninguna" && (
                                    <span><strong>Observacion Direccion Operacion:</strong> {fila[0].observacionesDireccionOperacion}</span>
                                )}
                                {fila[0].aprobacionDirector === "Aprobado" && fila[0].aprobacionDireccionOperacion === "Aprobado" && (
                                    <span><strong>Entrega Bodega:</strong> {(fila[0].entregaBodega === "Pendiente" && pdfData.length > 0) ? "Entregado" : fila[0].entregaBodega}</span>
                                )}
                            </div>
                        </div>

                        <div className='Tabla'>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Propiedad Material</th>
                                        <th>Código SAP Material</th>
                                        <th>Descripción Material</th>
                                        <th>Unidad de Medida</th>
                                        <th>Cantidad Disponible</th>
                                        <th>Cantidad Solicitada</th>
                                        <th>Cantidad Restante por Despacho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(filaEditada && filaEditada.length > 0 ? filaEditada : fila).map((item) => {
                                        const cantidadDisponible = parseInt(item.cantidadDisponibleMaterial, 10) || 0;
                                        const cantidadRestante = parseInt(item.cantidadRestantePorDespacho, 10) || 0;
                                        const isDesabastecido = cantidadDisponible < cantidadRestante;

                                        return (
                                            <tr
                                                key={item.id}
                                                className={isDesabastecido ? 'desabastecido' : ''}
                                            >
                                                <td>{item.propiedadMaterial}</td>
                                                <td>{item.codigoSapMaterial}</td>
                                                <td>{item.descripcionMaterial}</td>
                                                <td>{item.unidadMedidaMaterial}</td>
                                                <td>{item.cantidadDisponibleMaterial}</td>
                                                <td>{item.cantidadSolicitadaMaterial}</td>
                                                <td>{item.cantidadRestantePorDespacho}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className='LecturaPDFs'>
                            {(pdfData.length === 0 && fila[0].entregaBodega === "Pendiente" && pantalla === "EntregaBodega" && rolUsuario !== "LOGISTICA") && (
                                <div className='EntradaPDFs'>
                                    <span>Por favor agregue los PDFs de las salidas de material</span>
                                    <div className='inputPDFs'>
                                        <input type="file" accept="application/pdf" multiple onChange={lecturaDePDFs} ref={pdfInputRef} />
                                    </div>
                                </div>
                            )}
                            {pdfsUrl.length > 0 && (
                                <div className='Contenedor'>
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
                                        <button className='btn btn-secondary'
                                            disabled={pdfsUrl.length < 2}
                                            onClick={() => {
                                                setPdfConteoIndice((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : pdfsUrl.length - 1));
                                            }}
                                        >Anterior
                                        </button>
                                        <h5>Archivo {pdfConteoIndice + 1} de {pdfsUrl.length}</h5>
                                        <button className='btn btn-secondary'
                                            disabled={pdfsUrl.length < 2}
                                            onClick={() => {
                                                setPdfConteoIndice((prevIndex) => (prevIndex < pdfsUrl.length - 1 ? prevIndex + 1 : 0));
                                            }}
                                        >Siguiente</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {(((fila[0].aprobacionDirector === "Pendiente" && pantalla === "Director") || (fila[0].aprobacionDireccionOperacion === "Pendiente" && pantalla === "DireccionOperacion")) && rolUsuario !== "LOGISTICA") && (
                            <div className='Observaciones'>
                                <label htmlFor="observaciones">Observaciones:</label>
                                <textarea
                                    id="observaciones"
                                    value={observaciones}
                                    onChange={(e) => {
                                        setObservaciones(e.target.value);
                                    }}
                                    placeholder="Escribe tus observaciones aquí..."
                                    rows="2"
                                    cols="100"
                                />
                                {error && <p className="error">{error}</p>}
                            </div>
                        )}

                        {(fila[0].entregaBodega === "Pendiente" && pantalla === "EntregaBodega" && pdfData.length === 0 && pdfsUrl.length > 0) && (
                            <div className='Observaciones'>
                                <label htmlFor="observaciones">Observaciones:</label>
                                <textarea
                                    id="observaciones"
                                    value={observacionesBodega}
                                    onChange={(e) => {
                                        setObservacionesBodega(e.target.value);
                                    }}
                                    placeholder="Escribe tus observaciones aquí..."
                                    rows="2"
                                    cols="100"
                                />
                                {error && <p className="error">{error}</p>}
                            </div>
                        )}

                        {(((fila[0].aprobacionDirector === "Pendiente" && pantalla === "Director") || (fila[0].aprobacionDireccionOperacion === "Pendiente" && pantalla === "DireccionOperacion")) && rolUsuario !== "LOGISTICA") && (
                            <div className="Botones">
                                <button className='btn btn-success' onClick={onApprove}>Aprobar</button>
                                <button className='btn btn-danger'
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

                        {((fila[0].entregaBodega === "Pendiente" && pantalla === "EntregaBodega" && pdfData.length === 0 && pdfsUrl.length > 0)) && (
                            <div className="Botones">
                                <button className='btn btn-success'
                                    onClick={() => {
                                        estadoCargue = "normal";
                                        manejarCargueEntregaBodega();
                                    }}
                                >Cargar</button>
                                <button className='btn btn-primary'
                                    onClick={() => {
                                        setPdfsUrl([]);
                                        pdfInputRef.current.value = null;
                                        setObservacionesBodega('');
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
                                                <th>MATERIAL</th>
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
                                                    <td
                                                        className={
                                                            item["material"] === "Solicitado"
                                                                ? "material-solicitado"
                                                                : "material-no-solicitado"
                                                        }
                                                    >
                                                        {item["material"]}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {(fila[0].entregaBodega !== "Pendiente" && pantalla === "EntregaBodega" && rolUsuario !== "LOGISTICA") && (
                            <div className='LecturaPDFs'>
                                <div className='Contenedor'>
                                    <div className='title'>
                                        <span>Agregar Salidas de Material</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className='LecturaPDFs'>
                            {(pdfDataNuevos.length === 0 && fila[0].entregaBodega !== "Pendiente" && pantalla === "EntregaBodega" && rolUsuario !== "LOGISTICA") && (
                                <div className='EntradaPDFs'>
                                    <span>Por favor agregue los nuevos PDFs de salidas de material</span>
                                    <div className='inputPDFs'>
                                        <input type="file" accept="application/pdf" multiple onChange={lecturaDePDFsNuevos} ref={pdfInputRefNuevos} />
                                    </div>
                                </div>
                            )}
                            {pdfsUrlNuevos.length > 0 && (
                                <div className='Contenedor'>
                                    <div className='title'>
                                        <span>Salidas de Material</span>
                                    </div>
                                    <div className='VisorPDFs'>
                                        <iframe
                                            src={pdfsUrlNuevos[pdfConteoIndiceNuevos]}
                                            title={`PDF-${pdfConteoIndiceNuevos + 1}`}
                                        />
                                    </div>
                                    <div className='Botones'>
                                        <button className='btn btn-secondary'
                                            disabled={pdfsUrlNuevos.length < 2}
                                            onClick={() => {
                                                setPdfConteoIndiceNuevos((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : pdfsUrlNuevos.length - 1));
                                            }}
                                        >Anterior
                                        </button>
                                        <h5>Archivo {pdfConteoIndiceNuevos + 1} de {pdfsUrlNuevos.length}</h5>
                                        <button className='btn btn-secondary'
                                            disabled={pdfsUrlNuevos.length < 2}
                                            onClick={() => {
                                                setPdfConteoIndiceNuevos((prevIndex) => (prevIndex < pdfsUrlNuevos.length - 1 ? prevIndex + 1 : 0));
                                            }}
                                        >Siguiente</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {(fila[0].entregaBodega !== "Pendiente" && pantalla === "EntregaBodega" && pdfDataNuevos.length === 0 && pdfsUrlNuevos.length > 0) && (
                            <div className='Observaciones'>
                                <label htmlFor="observaciones">Observaciones:</label>
                                <textarea
                                    id="observaciones"
                                    value={observacionesBodega}
                                    onChange={(e) => {
                                        setObservacionesBodega(e.target.value);
                                    }}
                                    placeholder="Escribe tus observaciones aquí..."
                                    rows="2"
                                    cols="100"
                                />
                                {error && <p className="error">{error}</p>}
                            </div>
                        )}

                        {((fila[0].entregaBodega !== "Pendiente" && pantalla === "EntregaBodega" && pdfDataNuevos.length === 0 && pdfsUrlNuevos.length > 0)) && (
                            <div className="Botones">
                                <button className='btn btn-success'
                                    onClick={() => {
                                        estadoCargue = "nuevo";
                                        manejarCargueEntregaBodega();
                                    }}
                                >Cargar</button>
                                <button className='btn btn-primary'
                                    onClick={() => {
                                        setPdfsUrlNuevos([]);
                                        pdfInputRefNuevos.current.value = null;
                                        setObservacionesBodega('');
                                    }}
                                >Limpiar</button>
                            </div>
                        )}

                        {pdfDataNuevos.length > 0 && (
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
                                                <th>MATERIAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pdfDataNuevos.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item["pdfNombre"]}</td>
                                                    <td>{item["NRO."]}</td>
                                                    <td>{item["PRODUCTO"]}</td>
                                                    <td>{item["DESCRIPCION"]}</td>
                                                    <td>{item["U.M."]}</td>
                                                    <td>{item["CANTIDAD"]}</td>
                                                    <td>{item["OBSERVACIONES"]}</td>
                                                    <td
                                                        className={
                                                            item["material"] === "Solicitado"
                                                                ? "material-solicitado"
                                                                : "material-no-solicitado"
                                                        }
                                                    >
                                                        {item["material"]}
                                                    </td>
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

export default MaterialDetalle;