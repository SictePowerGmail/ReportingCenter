import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';
import MaterialDetalle from './materialDetalle';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ObtenerRolUsuario, ObtenerRelacionCiudadFacturacion } from '../../../funciones';

const MaterialPrincipalSolicitudes = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [registrosSolicitudMaterial, setRegistrosSolicitudMaterial] = useState([]);
    const rolUsuario = ObtenerRolUsuario(Cookies.get('userRole'));
    const nombreUsuario = Cookies.get('userNombre');

    const cargarDatosRegistrosSolicitudMaterial = () => {
        axios.get('https://sicteferias.from-co.net:8120/solicitudMaterial/RegistrosSolicitudMaterial')
            .then(response => {
                let datos = response.data;

                datos = datos.map((item) => {
                    const cantidadDisponible = parseInt(item.cantidadDisponibleMaterial, 10) || 0;
                    const cantidadRestante = parseInt(item.cantidadRestantePorDespacho, 10) || 0;
                    let estado;

                    if (cantidadDisponible < cantidadRestante) {
                        estado = "Desabastecido";
                    } else if (item.aprobacionAnalista === "Pendiente") {
                        estado = "Pendiente por Analista";
                    } else if (item.aprobacionAnalista === "Rechazado") {
                        estado = "Rechazado por Analista";
                    } else if (item.aprobacionDirector === "Pendiente") {
                        estado = "Pendiente por Director";
                    } else if (item.aprobacionDirector === "Rechazado") {
                        estado = "Rechazado por Director";
                    } else if (item.aprobacionDireccionOperacion === "Pendiente") {
                        estado = "Pendiente por Direccion";
                    } else if (item.aprobacionDireccionOperacion === "Rechazado") {
                        estado = "Rechazado por Direccion";
                    } else if (item.entregaBodega === "Pendiente") {
                        estado = "Pendiente Entrega Bodega";
                    } else {
                        estado = "Material Entregado";
                    }

                    return {
                        ...item,
                        estado,
                    };
                });

                datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

                datos = rolUsuario === "FACTURACION"
                    ? datos.filter(item => {
                        const ciudadesRelacionadas = ObtenerRelacionCiudadFacturacion(nombreUsuario);
                        return ciudadesRelacionadas.includes(item.ciudad.split(" ")[0]);
                    })
                    : datos;

                setRegistrosSolicitudMaterial(datos);

                const datosSolicitudesRealizadas = Object.entries(
                    datos.reduce((acc, item) => {
                        const key = `${item.fecha}_${item.cedula}_${item.uuid}`;
                        if (!acc[key]) {
                            acc[key] = [];
                        }
                        acc[key].push(item);
                        return acc;
                    }, {})
                ).map(([key, items]) => {
                    const estadoGeneral = items.some((item) => item.estado === "Desabastecido")
                        ? "Desabastecido"
                        : items[0].estado;

                    return {
                        fecha: items[0].fecha,
                        cedula: items[0].cedula,
                        nombre: items[0].nombre,
                        ciudad: items[0].ciudad,
                        uuid: items[0].uuid,
                        nombreProyecto: items[0].nombreProyecto,
                        entregaProyecto: items[0].entregaProyecto,
                        estado: estadoGeneral,
                    };
                });



                setSolicitudMaterialSinMat(datosSolicitudesRealizadas);

                setLoading(false);
            })
            .catch(error => {
                setError(error);
            });
    };

    useEffect(() => {
        const cedulaUsuario = Cookies.get('userCedula');
        const nombreUsuario = Cookies.get('userNombre');

        if (cedulaUsuario === undefined && nombreUsuario === undefined) {
            navigate('/MaterialLogin', { state: { estadoNotificacion: false } });
        }

        cargarDatosRegistrosSolicitudMaterial();
    }, []);

    const formatearNombreColumna = (columna) => {
        return columna
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    const [solicitudMaterialSinMat, setSolicitudMaterialSinMat] = useState([]);
    const [filtradoSolicitudMaterialSinMat, setFiltradoSolicitudMaterialSinMat] = useState({});
    const [expandidoSolicitudMaterialSinMat, setExpandidoSolicitudMaterialSinMat] = useState(false);

    const datosFiltradosSolicitudMaterialSinMat = solicitudMaterialSinMat.filter((fila) => {
        return Object.keys(filtradoSolicitudMaterialSinMat).every((columna) => {
            return (
                !filtradoSolicitudMaterialSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoSolicitudMaterialSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroSolicitudMaterial = (columna, valor) => {
        setFiltradoSolicitudMaterialSinMat({
            ...filtradoSolicitudMaterialSinMat,
            [columna]: valor,
        });
    };

    const [ventanaAbiertaSolicitudMaterial, setVentanaAbiertaSolicitudMaterial] = useState(false);
    const [filaSeleccionadaSolicitudMaterial, setFilaSeleccionadaSolicitudMaterial] = useState(null);

    const manejarClickFilaSolicitudMaterial = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaSolicitudMaterial(datosFiltrados);
        setVentanaAbiertaSolicitudMaterial(true);
    };

    const manejarCerrarModalSolicitudMaterial = () => {
        setVentanaAbiertaSolicitudMaterial(false);
        setFilaSeleccionadaSolicitudMaterial(null);
    };

    const descargarArchivoSolicitudMaterial = () => {
        const hoja = XLSX.utils.json_to_sheet(registrosSolicitudMaterial);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
        const archivoExcel = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([archivoExcel], { type: 'application/octet-stream' });
        saveAs(blob, 'Solicitudes de Material.xlsx');
    };

    const [orden, setOrden] = useState({ columna: null, ascendente: true });

    const manejarOrden = (columna) => {
        setOrden((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenados = [...datosFiltradosSolicitudMaterialSinMat].sort((a, b) => {
        if (!orden.columna) return 0;
        const valorA = a[orden.columna];
        const valorB = b[orden.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return orden.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return orden.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    return (
        <div className='Solicitudes'>
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
                <>
                    <div className='Botones'>
                        <button className='btn btn-success' onClick={descargarArchivoSolicitudMaterial}>Descargar Solicitudes</button>
                    </div>
                    <div className='Subtitulo'>
                        <span>Solicitudes Realizadas</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(solicitudMaterialSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrden(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {orden.columna === columna ? (orden.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroSolicitudMaterial(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenados.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(solicitudMaterialSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenados.slice(0, expandidoSolicitudMaterialSinMat ? datosOrdenados.length : 6).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaSolicitudMaterial(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaSolicitudMaterial(fila)}>
                                                    {valor}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className='Boton'>
                        <span onClick={() => {
                            setExpandidoSolicitudMaterialSinMat(!expandidoSolicitudMaterialSinMat);
                        }}>
                            {expandidoSolicitudMaterialSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaSolicitudMaterial}
                        onClose={manejarCerrarModalSolicitudMaterial}
                        onApprove=''
                        onDeny=''
                        fila={filaSeleccionadaSolicitudMaterial}
                        observaciones=''
                        setObservaciones=''
                        pantalla="Solicitudes"
                    />
                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </>
            )}
        </div>
    );
};

export default MaterialPrincipalSolicitudes;