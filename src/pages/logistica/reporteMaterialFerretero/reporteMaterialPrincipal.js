import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './reporteMaterialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';
import ReporteMaterialDetalle from './reporteMaterialDetalle';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Cookies from 'js-cookie';

const ReporteMaterialPrincipal = () => {
    const location = useLocation();
    const [error, setError] = useState('');
    const { estadoNotificacion } = location.state || {};
    const role = Cookies.get('userRole');
    const nombre = Cookies.get('userNombre');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [carpeta, setCarpeta] = useState('Registros');
    const [orden, setOrden] = useState({ columna: null, direccion: null });
    const [reporteMaterialTecnico, setReporteMaterialTecnico] = useState([]);
    const [reporteMaterialTecnicoSinMat, setReporteMaterialTecnicoSinMat] = useState([]);
    const [filtradoReporteMaterialTecnicoSinMat, setFiltradoReporteMaterialTecnicoSinMat] = useState({});
    const [expandidoReporteMaterialTecnicoSinMat, setExpandidoReporteMaterialTecnicoSinMat] = useState(false);
    const [ventanaAbiertaReporteMaterialTecnicoSinMat, setVentanaAbiertaReporteMaterialTecnicoSinMat] = useState(false);
    const [filaSeleccionadaReporteMaterialTecnicoSinMat, setFilaSeleccionadaReporteMaterialTecnicoSinMat] = useState(null);

    const cargarDatosReporteMaterialTecnico = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/reporteMaterialFerretero/obtenerReporteMaterialFerretero`)
            .then(response => {
                let datos = response.data;
                datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setReporteMaterialTecnico(datos);

                const datosReporteMaterialTecnicoSinMat = datos
                    .map(({
                        fecha,
                        cedula,
                        nombre,
                        ot,
                        movil,
                        responsable,
                        nodo
                    }) => {
                        return {
                            fecha,
                            cedula,
                            nombre,
                            ot,
                            movil,
                            responsable,
                            nodo
                        };
                    })
                    .filter((value, index, self) =>
                        index === self.findIndex((t) => (
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                setReporteMaterialTecnicoSinMat(datosReporteMaterialTecnicoSinMat);

                setLoading(false);
            })
            .catch(error => {
                setError(error);
            });
    };

    useEffect(() => {
        const yaRecargado = localStorage.getItem('yaRecargado');
        const cedulaUsuario = Cookies.get('userCedula');
        const nombreUsuario = Cookies.get('userNombre');

        if (cedulaUsuario === undefined && nombreUsuario === undefined) {
            navigate('/ReporteMaterialLogin', { state: { estadoNotificacion: false } });
        } else if (!yaRecargado) {
            localStorage.setItem('yaRecargado', 'true');
            window.location.reload();
        }

        cargarDatosReporteMaterialTecnico();
    }, []);

    const formatearNombreColumna = (columna) => {
        return columna
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    const datosFiltradosReporteMaterialTecnicoSinMat = reporteMaterialTecnicoSinMat.filter((fila) => {
        return Object.keys(filtradoReporteMaterialTecnicoSinMat).every((columna) => {
            return (
                !filtradoReporteMaterialTecnicoSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoReporteMaterialTecnicoSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroReporteMaterialTecnicoSinMat = (columna, valor) => {
        setFiltradoReporteMaterialTecnicoSinMat({
            ...filtradoReporteMaterialTecnicoSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaReporteMaterialTecnicoSinMat = (fila) => {
        const datosFiltrados = reporteMaterialTecnico.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaReporteMaterialTecnicoSinMat(datosFiltrados);
        setVentanaAbiertaReporteMaterialTecnicoSinMat(true);
    };

    const manejarCerrarModalReporteMaterialTecnicoSinMat = () => {
        setVentanaAbiertaReporteMaterialTecnicoSinMat(false);
        setFilaSeleccionadaReporteMaterialTecnicoSinMat(null);
    };

    const descargarArchivo = () => {
        const hoja = XLSX.utils.json_to_sheet(reporteMaterialTecnico);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
        const archivoExcel = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([archivoExcel], { type: 'application/octet-stream' });
        saveAs(blob, 'Registros de Material.xlsx');
    };

    const manejarOrden = (columna) => {
        setOrden((prevOrden) => {
            if (prevOrden.columna === columna) {
                const nuevaDireccion = prevOrden.direccion === 'asc' ? 'desc' : prevOrden.direccion === 'desc' ? null : 'asc';
                return { columna: nuevaDireccion ? columna : null, direccion: nuevaDireccion };
            }
            return { columna, direccion: 'asc' };
        });
    };

    const ordenarDatos = () => {
        if (!orden.columna || !orden.direccion) {
            return datosFiltradosReporteMaterialTecnicoSinMat;
        }

        const datosOrdenados = [...datosFiltradosReporteMaterialTecnicoSinMat].sort((a, b) => {
            if (a[orden.columna] < b[orden.columna]) {
                return orden.direccion === 'asc' ? -1 : 1;
            }
            if (a[orden.columna] > b[orden.columna]) {
                return orden.direccion === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return datosOrdenados;
    };

    return (
        <div className="reporteMaterialPrincipal">
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
                                navigate('/ReporteMaterialAgregar', { state: { role: role, nombre: nombre, estadoNotificacion: false } });
                            }}
                        >+</button>
                    </div>

                    <div className='Titulo'>
                        <h2>Reporte de Material Ferretero</h2>
                    </div>

                    <div className='menuNavegacion'>
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${carpeta === 'Registros' ? 'active' : ''}`}
                                    onClick={() => setCarpeta('Registros')}
                                >
                                    Registros
                                </a>
                            </li>
                        </ul>
                    </div>

                    {carpeta === "Registros" && (
                        <div className='Registros'>
                            <div className='Botones'>
                                <button className='btn btn-success' onClick={descargarArchivo}>Descargar Excel</button>
                            </div>
                            <div className='Subtitulo'>
                                <span>Registros Realizados</span>
                            </div>
                            <div className='Tabla'>
                                <table>
                                    <thead>
                                        <tr>
                                            {Object.keys(reporteMaterialTecnicoSinMat[0] || {}).map((columna) => (
                                                <th key={columna} onClick={() => manejarOrden(columna)}>
                                                    {formatearNombreColumna(columna)}
                                                    {orden.columna === columna ? (
                                                        orden.direccion === 'asc' ? (
                                                            <i className="fas fa-sort-up"></i>
                                                        ) : (
                                                            <i className="fas fa-sort-down"></i>
                                                        )
                                                    ) : (
                                                        <i className="fas fa-sort"></i>
                                                    )}
                                                    <br />
                                                    <input
                                                        type="text"
                                                        onChange={(e) => manejarCambioFiltroReporteMaterialTecnicoSinMat(columna, e.target.value)}
                                                    />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordenarDatos().length === 0 ? (
                                            <tr>
                                                <td colSpan={Object.keys(reporteMaterialTecnicoSinMat[0] || {}).length}>
                                                    No hay registros
                                                </td>
                                            </tr>
                                        ) : (
                                            ordenarDatos()
                                                .slice(0, expandidoReporteMaterialTecnicoSinMat ? datosFiltradosReporteMaterialTecnicoSinMat.length : 8)
                                                .map((fila, index) => (
                                                    <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaReporteMaterialTecnicoSinMat(fila)}>
                                                        {Object.values(fila).map((valor, idx) => (
                                                            <td key={idx} onClick={() => manejarClickFilaReporteMaterialTecnicoSinMat(fila)}>
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
                                <span>Total de ítems: {datosFiltradosReporteMaterialTecnicoSinMat.length}</span>
                                <span onClick={() => {
                                    setExpandidoReporteMaterialTecnicoSinMat(!expandidoReporteMaterialTecnicoSinMat);
                                }}>
                                    {expandidoReporteMaterialTecnicoSinMat ? "Mostrar menos" : "Mostrar mas"}
                                </span>
                            </div>
                            <ReporteMaterialDetalle
                                isOpen={ventanaAbiertaReporteMaterialTecnicoSinMat}
                                onClose={manejarCerrarModalReporteMaterialTecnicoSinMat}
                                fila={filaSeleccionadaReporteMaterialTecnicoSinMat}
                            />
                        </div>
                    )}

                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReporteMaterialPrincipal;