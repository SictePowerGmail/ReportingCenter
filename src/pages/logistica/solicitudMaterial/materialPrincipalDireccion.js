import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';
import MaterialDetalle from './materialDetalle';
import Cookies from 'js-cookie';

const MaterialPrincipalDireccion = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [registrosSolicitudMaterial, setRegistrosSolicitudMaterial] = useState([]);
    
    const cargarDatosRegistrosSolicitudMaterial = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/solicitudMaterial/registros`)
            .then(response => {
                let datos = response.data;
                datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setRegistrosSolicitudMaterial(datos);

                const datosPendienteDireccionOperacion = datos
                    .filter(item => item.aprobacionAnalista === "Aprobado" && item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Pendiente")
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

                setPendienteDireccionOperacionSinMat(datosPendienteDireccionOperacion);

                const datosAprobadoDireccionOperacion = datos
                    .filter(item => item.aprobacionAnalista === "Aprobado" && item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Aprobado")
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

                setAprobacionDireccionOperacionSinMat(datosAprobadoDireccionOperacion);

                const datosRechazadoDireccionOperacion = datos
                    .filter(item => item.aprobacionAnalista === "Aprobado" && item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Rechazado")
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

                setRechazadoDireccionOperacionSinMat(datosRechazadoDireccionOperacion);

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

    const [pendienteDireccionOperacionSinMat, setPendienteDireccionOperacionSinMat] = useState([]);
    const [filtradoPendDireccOperaSinMat, setFiltradoPendDireccOperaSinMat] = useState({});
    const [expandidoPendDireccOperaSinMat, setExpandidoPendDireccOperaSinMat] = useState(false);
    const [observacionesPendDireccionOperacion, setObservacionesPendDireccionOperacion] = useState('');
    const [ventanaAbiertaPendienteDireccionOperacion, setVentanaAbiertaPendienteDireccionOperacion] = useState(false);
    const [filaSeleccionadaPendienteDireccionOperacion, setFilaSeleccionadaPendienteDireccionOperacion] = useState(null);
    const [ordenPendienteDireccionOperacion, setOrdenPendienteDireccionOperacion] = useState({ columna: null, ascendente: true });

    const datosFiltradosPendienteDireccionOperacionSinMat = pendienteDireccionOperacionSinMat.filter((fila) => {
        return Object.keys(filtradoPendDireccOperaSinMat).every((columna) => {
            return (
                !filtradoPendDireccOperaSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoPendDireccOperaSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroPendienteDireccionOperacion = (columna, valor) => {
        setFiltradoPendDireccOperaSinMat({
            ...filtradoPendDireccOperaSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaPendienteDireccionOperacion = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaPendienteDireccionOperacion(datosFiltrados);
        setVentanaAbiertaPendienteDireccionOperacion(true);
    };

    const manejarCerrarModalPendienteDireccionOperacion = () => {
        setVentanaAbiertaPendienteDireccionOperacion(false);
        setFilaSeleccionadaPendienteDireccionOperacion(null);
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const manejarAprobarPendienteDireccionOperacion = async () => {
        const ids = filaSeleccionadaPendienteDireccionOperacion.map(item => item.id);
        const estado = "Aprobado"
        let observacionesTemporal;
        const fechaRegistro = String(formatDate(new Date()));

        if (observacionesPendDireccionOperacion === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendDireccionOperacion;
        }
        
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/solicitudMaterial/actualizarEstadoDireccionOperacion`, { ids, estado, observacionesTemporal, fechaRegistro });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud aprobada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteDireccionOperacion();
        setObservacionesPendDireccionOperacion('');
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarRechazoPendienteDireccionOperacion = async () => {
        const ids = filaSeleccionadaPendienteDireccionOperacion.map(item => item.id);
        const estado = "Rechazado"
        let observacionesTemporal;
        const fechaRegistro = formatDate(new Date());

        if (observacionesPendDireccionOperacion === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendDireccionOperacion;
        }
        
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/solicitudMaterial/actualizarEstadoDireccionOperacion`, { ids, estado, observacionesTemporal, fechaRegistro });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud Rechazada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteDireccionOperacion();
        setObservacionesPendDireccionOperacion('');
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenPendienteDireccionOperacion = (columna) => {
        setOrdenPendienteDireccionOperacion((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenadosPendienteDireccionOperacion = [...datosFiltradosPendienteDireccionOperacionSinMat].sort((a, b) => {
        if (!ordenPendienteDireccionOperacion.columna) return 0;
        const valorA = a[ordenPendienteDireccionOperacion.columna];
        const valorB = b[ordenPendienteDireccionOperacion.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenPendienteDireccionOperacion.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenPendienteDireccionOperacion.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    const [aprobacionDireccionOperacionSinMat, setAprobacionDireccionOperacionSinMat] = useState([]);
    const [filtradoAprobacionDireccOperaSinMat, setFiltradoAprobacionDireccOperaSinMat] = useState({});
    const [expandidoAprobacionDireccOperaSinMat, setExpandidoAprobacionDireccOperaSinMat] = useState(false);
    const [ventanaAbiertaAprobacionDireccionOperacion, setVentanaAbiertaAprobacionDireccionOperacion] = useState(false);
    const [filaSeleccionadaAprobacionDireccionOperacion, setFilaSeleccionadaAprobacionDireccionOperacion] = useState(null);
    const [ordenAprobacionDireccionOperacion, setOrdenAprobacionDireccionOperacion] = useState({ columna: null, ascendente: true });

    const datosFiltradosAprobacionDireccionOperacionSinMat = aprobacionDireccionOperacionSinMat.filter((fila) => {
        return Object.keys(filtradoAprobacionDireccOperaSinMat).every((columna) => {
            return (
                !filtradoAprobacionDireccOperaSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoAprobacionDireccOperaSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroAprobacionDireccionOperacion = (columna, valor) => {
        setFiltradoAprobacionDireccOperaSinMat({
            ...filtradoAprobacionDireccOperaSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaAprobacionDireccionOperacion = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaAprobacionDireccionOperacion(datosFiltrados);
        setVentanaAbiertaAprobacionDireccionOperacion(true);
    };

    const manejarCerrarModalAprobacionDireccionOperacion = () => {
        setVentanaAbiertaAprobacionDireccionOperacion(false);
        setFilaSeleccionadaAprobacionDireccionOperacion(null);
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenAprobacionDireccionOperacion = (columna) => {
        setOrdenAprobacionDireccionOperacion((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenadosAprobacionDireccionOperacion = [...datosFiltradosAprobacionDireccionOperacionSinMat].sort((a, b) => {
        if (!ordenAprobacionDireccionOperacion.columna) return 0;
        const valorA = a[ordenAprobacionDireccionOperacion.columna];
        const valorB = b[ordenAprobacionDireccionOperacion.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenAprobacionDireccionOperacion.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenAprobacionDireccionOperacion.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    const [rechazadoDireccionOperacionSinMat, setRechazadoDireccionOperacionSinMat] = useState([]);
    const [filtradoRechazadoDireccOperaSinMat, setFiltradoRechazadoDireccOperaSinMat] = useState({});
    const [expandidoRechazadoDireccOperaSinMat, setExpandidoRechazadoDireccOperaSinMat] = useState(false);
    const [ventanaAbiertaRechazadoDireccionOperacion, setVentanaAbiertaRechazadoDireccionOperacion] = useState(false);
    const [filaSeleccionadaRechazadoDireccionOperacion, setFilaSeleccionadaRechazadoDireccionOperacion] = useState(null);
    const [ordenRechazadoDireccionOperacion, setOrdenRechazadoDireccionOperacion] = useState({ columna: null, ascendente: true });

    const datosFiltradosRechazadoDireccionOperacionSinMat = rechazadoDireccionOperacionSinMat.filter((fila) => {
        return Object.keys(filtradoRechazadoDireccOperaSinMat).every((columna) => {
            return (
                !filtradoRechazadoDireccOperaSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoRechazadoDireccOperaSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroRechazadoDireccionOperacion = (columna, valor) => {
        setFiltradoRechazadoDireccOperaSinMat({
            ...filtradoRechazadoDireccOperaSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaRechazadoDireccionOperacion = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaRechazadoDireccionOperacion(datosFiltrados);
        setVentanaAbiertaRechazadoDireccionOperacion(true);
    };

    const manejarCerrarModalRechazadoDireccionOperacion = () => {
        setVentanaAbiertaRechazadoDireccionOperacion(false);
        setFilaSeleccionadaRechazadoDireccionOperacion(null);
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenRechazadoDireccionOperacion = (columna) => {
        setOrdenRechazadoDireccionOperacion((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenadosRechazadoDireccionOperacion = [...datosFiltradosRechazadoDireccionOperacionSinMat].sort((a, b) => {
        if (!ordenRechazadoDireccionOperacion.columna) return 0;
        const valorA = a[ordenRechazadoDireccionOperacion.columna];
        const valorB = b[ordenRechazadoDireccionOperacion.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenRechazadoDireccionOperacion.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenRechazadoDireccionOperacion.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    return (
        <div className='DireccionOperacion'>
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
                        <span>Solicitudes Pendientes por la Direccion Operacion</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(pendienteDireccionOperacionSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenPendienteDireccionOperacion(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenPendienteDireccionOperacion.columna === columna ? (ordenPendienteDireccionOperacion.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                value={filtradoPendDireccOperaSinMat[columna] || ''}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroPendienteDireccionOperacion(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosPendienteDireccionOperacion.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(pendienteDireccionOperacionSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosPendienteDireccionOperacion.slice(0, expandidoPendDireccOperaSinMat ? datosOrdenadosPendienteDireccionOperacion.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaPendienteDireccionOperacion(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaPendienteDireccionOperacion(fila)}>
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
                        <span>Total de ítems: {datosOrdenadosPendienteDireccionOperacion.length}</span>
                        <span onClick={() => {
                            setExpandidoPendDireccOperaSinMat(!expandidoPendDireccOperaSinMat);
                        }}>
                            {expandidoPendDireccOperaSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaPendienteDireccionOperacion}
                        onClose={manejarCerrarModalPendienteDireccionOperacion}
                        onApprove={manejarAprobarPendienteDireccionOperacion}
                        onDeny={manejarRechazoPendienteDireccionOperacion}
                        fila={filaSeleccionadaPendienteDireccionOperacion}
                        observaciones={observacionesPendDireccionOperacion}
                        setObservaciones={setObservacionesPendDireccionOperacion}
                        pantalla="DireccionOperacion"
                    />



                    <div className='Subtitulo'>
                        <span>Solicitudes Aprobadas por la Direccion Operacion</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(aprobacionDireccionOperacionSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenAprobacionDireccionOperacion(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenAprobacionDireccionOperacion.columna === columna ? (ordenAprobacionDireccionOperacion.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                value={filtradoAprobacionDireccOperaSinMat[columna] || ''}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroAprobacionDireccionOperacion(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosAprobacionDireccionOperacion.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(aprobacionDireccionOperacionSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosAprobacionDireccionOperacion.slice(0, expandidoAprobacionDireccOperaSinMat ? datosOrdenadosAprobacionDireccionOperacion.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaAprobacionDireccionOperacion(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaAprobacionDireccionOperacion(fila)}>
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
                        <span>Total de ítems: {datosOrdenadosAprobacionDireccionOperacion.length}</span>
                        <span onClick={() => {
                            setExpandidoAprobacionDireccOperaSinMat(!expandidoAprobacionDireccOperaSinMat);
                        }}>
                            {expandidoAprobacionDireccOperaSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaAprobacionDireccionOperacion}
                        onClose={manejarCerrarModalAprobacionDireccionOperacion}
                        onApprove={manejarAprobarPendienteDireccionOperacion}
                        onDeny={manejarRechazoPendienteDireccionOperacion}
                        fila={filaSeleccionadaAprobacionDireccionOperacion}
                        observaciones={observacionesPendDireccionOperacion}
                        setObservaciones={setObservacionesPendDireccionOperacion}
                        pantalla="DireccionOperacion"
                    />

                    <div className='Subtitulo'>
                        <span>Solicitudes Rechazadas por la Direccion Operacion</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(rechazadoDireccionOperacionSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenRechazadoDireccionOperacion(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenRechazadoDireccionOperacion.columna === columna ? (ordenRechazadoDireccionOperacion.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                value={filtradoRechazadoDireccOperaSinMat[columna] || ''}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroRechazadoDireccionOperacion(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosRechazadoDireccionOperacion.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(rechazadoDireccionOperacionSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosRechazadoDireccionOperacion.slice(0, expandidoRechazadoDireccOperaSinMat ? datosOrdenadosRechazadoDireccionOperacion.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaRechazadoDireccionOperacion(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaRechazadoDireccionOperacion(fila)}>
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
                        <span>Total de ítems: {datosOrdenadosRechazadoDireccionOperacion.length}</span>
                        <span onClick={() => {
                            setExpandidoRechazadoDireccOperaSinMat(!expandidoRechazadoDireccOperaSinMat);
                        }}>
                            {expandidoRechazadoDireccOperaSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaRechazadoDireccionOperacion}
                        onClose={manejarCerrarModalRechazadoDireccionOperacion}
                        onApprove={manejarAprobarPendienteDireccionOperacion}
                        onDeny={manejarRechazoPendienteDireccionOperacion}
                        fila={filaSeleccionadaRechazadoDireccionOperacion}
                        observaciones={observacionesPendDireccionOperacion}
                        setObservaciones={setObservacionesPendDireccionOperacion}
                        pantalla="DireccionOperacion"
                    />

                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </>
            )}
        </div>
    );
};

export default MaterialPrincipalDireccion;