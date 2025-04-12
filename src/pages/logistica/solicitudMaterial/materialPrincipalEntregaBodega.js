import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';
import MaterialDetalle from './materialDetalle';
import Cookies from 'js-cookie';
import { ObtenerRolUsuario, ObtenerRelacionCiudadBodega } from '../../../funciones';

const MaterialPrincipalEntregaBodega = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [registrosSolicitudMaterial, setRegistrosSolicitudMaterial] = useState([]);
    const rolUsuario = ObtenerRolUsuario(Cookies.get('userRole'));
    const nombreUsuario = Cookies.get('userNombre');
    
    const cargarDatosRegistrosSolicitudMaterial = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/solicitudMaterial/registros`)
            .then(response => {
                let datos = response.data;
                datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setRegistrosSolicitudMaterial(datos);

                const datosPendienteEntregaBodega = datos
                    .filter(item => item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Aprobado" && item.entregaBodega === "Pendiente" && item.estadoProyecto === "Abierto")
                    .map(({ fecha, cedula, nombre, ciudad, uuid, nombreProyecto, entregaProyecto }) => ({
                        fecha,
                        cedula,
                        nombre,
                        ciudad,
                        uuid,
                        nombreProyecto,
                        entregaProyecto
                    }))
                    .filter((value, index, self) =>
                        index === self.findIndex((t) => (
                            t.fecha === value.fecha && t.cedula === value.cedula && t.uuid === value.uuid
                        ))
                    );

                const datosFiltradosPendienteEntregaBodega = rolUsuario === "admin" || rolUsuario === "LOGISTICA" || rolUsuario === "CAROLINA FERNANDEZ"
                    ? datosPendienteEntregaBodega
                    : datosPendienteEntregaBodega.filter(item => ObtenerRelacionCiudadBodega(nombreUsuario) === item.ciudad.split(" ")[0]);

                setPendienteEntregaBodegaSinMat(datosFiltradosPendienteEntregaBodega);

                const datosEntregadoEntregaBodega = datos
                    .filter(item => item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Aprobado" && item.entregaBodega === "Entregado" && item.estadoProyecto === "Abierto")
                    .map(({ fecha, cedula, nombre, ciudad, uuid, nombreProyecto, entregaProyecto }) => ({
                        fecha,
                        cedula,
                        nombre,
                        ciudad,
                        uuid,
                        nombreProyecto,
                        entregaProyecto
                    }))
                    .filter((value, index, self) =>
                        index === self.findIndex((t) => (
                            t.fecha === value.fecha && t.cedula === value.cedula && t.uuid === value.uuid
                        ))
                    );

                const datosFiltradosEntregadoEntregaBodega = rolUsuario === "admin" || rolUsuario === "LOGISTICA" || rolUsuario === "CAROLINA FERNANDEZ"
                    ? datosEntregadoEntregaBodega
                    : datosEntregadoEntregaBodega.filter(item => ObtenerRelacionCiudadBodega(nombreUsuario) === item.ciudad.split(" ")[0]);

                setEntregadoEntregaBodegaSinMat(datosFiltradosEntregadoEntregaBodega);

                const datosProyectosCerrados = datos
                    .filter(item => item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Aprobado" && item.estadoProyecto === "Cerrado")
                    .map(({ fecha, cedula, nombre, ciudad, uuid, nombreProyecto, entregaProyecto }) => ({
                        fecha,
                        cedula,
                        nombre,
                        ciudad,
                        uuid,
                        nombreProyecto,
                        entregaProyecto
                    }))
                    .filter((value, index, self) =>
                        index === self.findIndex((t) => (
                            t.fecha === value.fecha && t.cedula === value.cedula && t.uuid === value.uuid
                        ))
                    );

                const datosFiltradosProyectosCerrados = rolUsuario === "admin" || rolUsuario === "LOGISTICA" || rolUsuario === "CAROLINA FERNANDEZ"
                    ? datosProyectosCerrados
                    : datosProyectosCerrados.filter(item => ObtenerRelacionCiudadBodega(nombreUsuario) === item.ciudad.split(" ")[0]);

                setProyectosCerradosSinMat(datosFiltradosProyectosCerrados);

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

    const [pendienteEntregaBodegaSinMat, setPendienteEntregaBodegaSinMat] = useState([]);
    const [expandidoPendienteEntregaBodegaSinMat, setExpandidoPendienteEntregaBodegaSinMat] = useState(false);
    const [ventanaAbiertaPendienteEntregaBodega, setVentanaAbiertaPendienteEntregaBodega] = useState(false);
    const [filaSeleccionadaPendienteEntregaBodega, setFilaSeleccionadaPendienteEntregaBodega] = useState(null);
    const [ordenPendienteEntregaBodega, setOrdenPendienteEntregaBodega] = useState({ columna: null, ascendente: true });

    const manejarClickFilaPendienteEntregaBodega = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaPendienteEntregaBodega(datosFiltrados);
        setVentanaAbiertaPendienteEntregaBodega(true);
    };

    const manejarCerrarModalPendienteEntregaBodega = () => {
        setVentanaAbiertaPendienteEntregaBodega(false);
        setFilaSeleccionadaPendienteEntregaBodega(null);
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenPendienteEntregaBodega = (columna) => {
        setOrdenPendienteEntregaBodega((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const [entregadoEntregaBodegaSinMat, setEntregadoEntregaBodegaSinMat] = useState([]);
    const [expandidoEntregadoEntregaBodegaSinMat, setExpandidoEntregadoEntregaBodegaSinMat] = useState(false);
    const [ventanaAbiertaEntregadoEntregaBodega, setVentanaAbiertaEntregadoEntregaBodega] = useState(false);
    const [filaSeleccionadaEntregadoEntregaBodega, setFilaSeleccionadaEntregadoEntregaBodega] = useState([]);
    const [ordenEntregadoEntregaBodega, setOrdenEntregadoEntregaBodega] = useState({ columna: null, ascendente: true });

    const manejarClickFilaEntregadoEntregaBodega = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaEntregadoEntregaBodega(datosFiltrados);
        setVentanaAbiertaEntregadoEntregaBodega(true);
    };

    const manejarCerrarModalEntregadoEntregaBodega = () => {
        setVentanaAbiertaEntregadoEntregaBodega(false);
        setFilaSeleccionadaEntregadoEntregaBodega(null);
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenEntregadoEntregaBodega = (columna) => {
        setOrdenEntregadoEntregaBodega((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const [proyectosCerradosSinMat, setProyectosCerradosSinMat] = useState([]);
    const [expandidoProyectosCerradosSinMat, setExpandidoProyectosCerradosSinMat] = useState(false);
    const [ventanaAbiertaProyectosCerrados, setVentanaAbiertaProyectosCerrados] = useState(false);
    const [filaSeleccionadaProyectosCerrados, setFilaSeleccionadaProyectosCerrados] = useState([]);
    const [ordenProyectosCerrados, setOrdenProyectosCerrados] = useState({ columna: null, ascendente: true });

    const manejarClickFilaProyectosCerrados = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaProyectosCerrados(datosFiltrados);
        setVentanaAbiertaProyectosCerrados(true);
    };

    const manejarCerrarModalProyectosCerrados = () => {
        setVentanaAbiertaProyectosCerrados(false);
        setFilaSeleccionadaProyectosCerrados(null);
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenProyectosCerrados = (columna) => {
        setOrdenProyectosCerrados((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const [filtrosComunes, setFiltrosComunes] = useState({});

    const manejarCambioFiltroComun = (columna, valor) => {
        setFiltrosComunes((prevFiltros) => ({
            ...prevFiltros,
            [columna]: valor,
        }));
    };

    const datosFiltradosPendienteEntregaBodegaSinMat = pendienteEntregaBodegaSinMat.filter((fila) =>
        Object.entries(filtrosComunes).every(([columna, valor]) =>
            fila[columna]?.toString().toLowerCase().includes(valor.toLowerCase())
        )
    );

    const datosOrdenadosPendienteEntregaBodega = [...datosFiltradosPendienteEntregaBodegaSinMat].sort((a, b) => {
        if (!ordenPendienteEntregaBodega.columna) return 0;
        const valorA = a[ordenPendienteEntregaBodega.columna];
        const valorB = b[ordenPendienteEntregaBodega.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenPendienteEntregaBodega.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenPendienteEntregaBodega.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    const datosFiltradosEntregadoEntregaBodegaSinMat = entregadoEntregaBodegaSinMat.filter((fila) =>
        Object.entries(filtrosComunes).every(([columna, valor]) =>
            fila[columna]?.toString().toLowerCase().includes(valor.toLowerCase())
        )
    );

    const datosOrdenadosEntregadoEntregaBodega = [...datosFiltradosEntregadoEntregaBodegaSinMat].sort((a, b) => {
        if (!ordenEntregadoEntregaBodega.columna) return 0;
        const valorA = a[ordenEntregadoEntregaBodega.columna];
        const valorB = b[ordenEntregadoEntregaBodega.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenEntregadoEntregaBodega.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenEntregadoEntregaBodega.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    const datosFiltradosProyectosCerradosSinMat = proyectosCerradosSinMat.filter((fila) =>
        Object.entries(filtrosComunes).every(([columna, valor]) =>
            fila[columna]?.toString().toLowerCase().includes(valor.toLowerCase())
        )
    );

    const datosOrdenadosProyectosCerrados = [...datosFiltradosProyectosCerradosSinMat].sort((a, b) => {
        if (!ordenProyectosCerrados.columna) return 0;
        const valorA = a[ordenProyectosCerrados.columna];
        const valorB = b[ordenProyectosCerrados.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenProyectosCerrados.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenProyectosCerrados.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    return (
        <div className='EntregaBodega'>
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
                    <div className='Subtitulo'>
                        <span>Solicitudes Pendientes Por Entrega Bodega</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(pendienteEntregaBodegaSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenPendienteEntregaBodega(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenPendienteEntregaBodega.columna === columna ? (ordenPendienteEntregaBodega.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                value={filtrosComunes[columna] || ''}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroComun(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosPendienteEntregaBodega.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(pendienteEntregaBodegaSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosPendienteEntregaBodega.slice(0, expandidoPendienteEntregaBodegaSinMat ? datosOrdenadosPendienteEntregaBodega.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaPendienteEntregaBodega(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaPendienteEntregaBodega(fila)}>
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
                        <span>Total de ítems: {datosOrdenadosPendienteEntregaBodega.length}</span>
                        <span onClick={() => {
                            setExpandidoPendienteEntregaBodegaSinMat(!expandidoPendienteEntregaBodegaSinMat);
                        }}>
                            {expandidoPendienteEntregaBodegaSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaPendienteEntregaBodega}
                        onClose={manejarCerrarModalPendienteEntregaBodega}
                        onApprove=""
                        onDeny=""
                        fila={filaSeleccionadaPendienteEntregaBodega}
                        observaciones=""
                        setObservaciones=""
                        pantalla="EntregaBodega"
                    />

                    <div className='Subtitulo'>
                        <span>Solicitudes Entregadas por Bodega</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(entregadoEntregaBodegaSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenEntregadoEntregaBodega(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenEntregadoEntregaBodega.columna === columna ? (ordenEntregadoEntregaBodega.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                value={filtrosComunes[columna] || ''}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroComun(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosEntregadoEntregaBodega.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(entregadoEntregaBodegaSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosEntregadoEntregaBodega.slice(0, expandidoEntregadoEntregaBodegaSinMat ? datosOrdenadosEntregadoEntregaBodega.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaEntregadoEntregaBodega(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaEntregadoEntregaBodega(fila)}>
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
                        <span>Total de ítems: {datosOrdenadosEntregadoEntregaBodega.length}</span>
                        <span onClick={() => {
                            setExpandidoEntregadoEntregaBodegaSinMat(!expandidoEntregadoEntregaBodegaSinMat);
                        }}>
                            {expandidoEntregadoEntregaBodegaSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaEntregadoEntregaBodega}
                        onClose={manejarCerrarModalEntregadoEntregaBodega}
                        onApprove=""
                        onDeny=""
                        fila={filaSeleccionadaEntregadoEntregaBodega}
                        observaciones=""
                        setObservaciones=""
                        pantalla="EntregaBodega"
                    />

                    <div className='Subtitulo'>
                        <span>Proyectos Cerrados</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(proyectosCerradosSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenProyectosCerrados(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenProyectosCerrados.columna === columna ? (ordenProyectosCerrados.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                value={filtrosComunes[columna] || ''}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroComun(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosProyectosCerrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(proyectosCerradosSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosProyectosCerrados.slice(0, expandidoProyectosCerradosSinMat ? datosOrdenadosProyectosCerrados.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaProyectosCerrados(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaProyectosCerrados(fila)}>
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
                        <span>Total de ítems: {datosOrdenadosProyectosCerrados.length}</span>
                        <span onClick={() => {
                            setExpandidoProyectosCerradosSinMat(!expandidoProyectosCerradosSinMat);
                        }}>
                            {expandidoProyectosCerradosSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaProyectosCerrados}
                        onClose={manejarCerrarModalProyectosCerrados}
                        onApprove=""
                        onDeny=""
                        fila={filaSeleccionadaProyectosCerrados}
                        observaciones=""
                        setObservaciones=""
                        pantalla="EntregaBodega"
                    />

                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </>
            )}
        </div>
    );
};

export default MaterialPrincipalEntregaBodega;