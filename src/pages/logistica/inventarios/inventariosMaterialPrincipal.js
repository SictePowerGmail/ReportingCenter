import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './inventariosMaterialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';
import ReporteMaterialDetalle from './inventariosMaterialDetalle';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Cookies from 'js-cookie';

const InventariosMaterialPrincipal = () => {
    const location = useLocation();
    const [error, setError] = useState('');
    const { estadoNotificacion } = location.state || {};
    const role = Cookies.get('userRole');
    const nombre = Cookies.get('userNombre');    
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [carpeta, setCarpeta] = useState('Registros');
    const [orden, setOrden] = useState({ columna: null, direccion: null });
    const [inventarioMaterial, setInventarioMaterial] = useState([]);
    const [inventarioMaterialSinMat, setInventarioMaterialSinMat] = useState([]);

    const [filtradoInventarioMaterialSinMat, setFiltradoInventarioMaterialSinMat] = useState({});
    const [expandidoInventarioMaterialSinMat, setExpandidoInventarioMaterialSinMat] = useState(false);
    const [ventanaAbiertaInventarioMaterialSinMat, setVentanaAbiertaInventarioMaterialSinMat] = useState(false);
    const [filaSeleccionadaInventarioMaterialSinMat, setFilaSeleccionadaInventarioMaterialSinMat] = useState(null);

    const cargarDatosInventarioMaterial = () => {
        axios.get('https://sicteferias.from-co.net:8120/inventarioMaterial/RegistrosInventarioMaterial')
            .then(response => {
                let datos = response.data;
                datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setInventarioMaterial(datos);

                const datosInventarioMaterialSinMat = datos
                    .map(({
                        fecha,
                        cedula,
                        nombre,
                        codigoMovil,
                        movil,
                        responsable,
                    }) => {
                        return {
                            fecha,
                            cedula,
                            nombre,
                            codigoMovil,
                            movil,
                            responsable,
                        };
                    })
                    .filter((value, index, self) =>
                        index === self.findIndex((t) => (
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                setInventarioMaterialSinMat(datosInventarioMaterialSinMat);

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
            navigate('/InventariosMaterialLogin', { state: { estadoNotificacion: false } });
        } else if (!yaRecargado) {
            localStorage.setItem('yaRecargado', 'true');
            window.location.reload();
        }

        cargarDatosInventarioMaterial();
    }, []);

    const formatearNombreColumna = (columna) => {
        return columna
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    const datosFiltradosInventariosMaterialSinMat = inventarioMaterialSinMat.filter((fila) => {
        return Object.keys(filtradoInventarioMaterialSinMat).every((columna) => {
            return (
                !filtradoInventarioMaterialSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoInventarioMaterialSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroInventarioMaterialSinMat = (columna, valor) => {
        setFiltradoInventarioMaterialSinMat({
            ...filtradoInventarioMaterialSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaInventarioMaterialSinMat = (fila) => {
        const datosFiltrados = inventarioMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaInventarioMaterialSinMat(datosFiltrados);
        setVentanaAbiertaInventarioMaterialSinMat(true);
    };

    const manejarCerrarModalInventarioMaterialSinMat = () => {
        setVentanaAbiertaInventarioMaterialSinMat(false);
        setFilaSeleccionadaInventarioMaterialSinMat(null);
    };

    const descargarArchivo = () => {
        const hoja = XLSX.utils.json_to_sheet(inventarioMaterial);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
        const archivoExcel = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([archivoExcel], { type: 'application/octet-stream' });
        saveAs(blob, 'Inventario de Material.xlsx');
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
            return datosFiltradosInventariosMaterialSinMat;
        }

        const datosOrdenados = [...datosFiltradosInventariosMaterialSinMat].sort((a, b) => {
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
        <div className="inventarioMaterialPrincipal">
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
                                navigate('/InventariosMaterialAgregar', { state: { role: role, nombre: nombre, estadoNotificacion: false } });
                            }}
                        >+</button>
                    </div>

                    <div className='Titulo'>
                        <h2>Inventario de Material</h2>
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
                                <span>Inventarios Realizados</span>
                            </div>
                            <div className='Tabla'>
                                <table>
                                    <thead>
                                        <tr>
                                            {Object.keys(inventarioMaterialSinMat[0] || {}).map((columna) => (
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
                                                        onChange={(e) => manejarCambioFiltroInventarioMaterialSinMat(columna, e.target.value)}
                                                    />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordenarDatos().length === 0 ? (
                                            <tr>
                                                <td colSpan={Object.keys(inventarioMaterialSinMat[0] || {}).length}>
                                                    No hay registros
                                                </td>
                                            </tr>
                                        ) : (
                                            ordenarDatos()
                                                .slice(0, expandidoInventarioMaterialSinMat ? datosFiltradosInventariosMaterialSinMat.length : 8)
                                                .map((fila, index) => (
                                                    <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaInventarioMaterialSinMat(fila)}>
                                                        {Object.values(fila).map((valor, idx) => (
                                                            <td key={idx} onClick={() => manejarClickFilaInventarioMaterialSinMat(fila)}>
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
                                    setExpandidoInventarioMaterialSinMat(!expandidoInventarioMaterialSinMat);
                                }}>
                                    {expandidoInventarioMaterialSinMat ? "Mostrar menos" : "Mostrar mas"}
                                </span>
                            </div>
                            <ReporteMaterialDetalle
                                isOpen={ventanaAbiertaInventarioMaterialSinMat}
                                onClose={manejarCerrarModalInventarioMaterialSinMat}
                                fila={filaSeleccionadaInventarioMaterialSinMat}
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

export default InventariosMaterialPrincipal;