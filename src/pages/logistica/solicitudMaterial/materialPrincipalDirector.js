import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';
import MaterialDetalle from './materialDetalle';
import Cookies from 'js-cookie';
import { ObtenerRolUsuario, ObtenerRelacionPersonalDirectores } from '../../../funciones';

const MaterialPrincipalDirector = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const rolUsuario = ObtenerRolUsuario(Cookies.get('userRole'));
    const nombreUsuario = Cookies.get('userNombre');
    const [registrosSolicitudMaterial, setRegistrosSolicitudMaterial] = useState([]);

    const cargarDatosRegistrosSolicitudMaterial = () => {
        axios.get('https://sicteferias.from-co.net:8120/solicitudMaterial/RegistrosSolicitudMaterial')
            .then(response => {
                let datos = response.data;
                datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setRegistrosSolicitudMaterial(datos);

                const datosPendienteDirector = datos
                    .filter(item => item.aprobacionAnalista === "Aprobado" && item.aprobacionDirector === "Pendiente")
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

                const datosFiltradosPendienteDirector = rolUsuario === "admin" || rolUsuario === "LOGISTICA"
                    ? datosPendienteDirector
                    : datosPendienteDirector.filter(item => ObtenerRelacionPersonalDirectores(item.nombre) === nombreUsuario);

                setPendienteDirectorSinMat(datosFiltradosPendienteDirector);

                const datosAprobacionDirector = datos
                    .filter(item => item.aprobacionAnalista === "Aprobado" && item.aprobacionDirector === "Aprobado")
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

                const datosFiltradosAprobacionDirector = rolUsuario === "admin" || rolUsuario === "LOGISTICA"
                    ? datosAprobacionDirector
                    : datosAprobacionDirector.filter(item => ObtenerRelacionPersonalDirectores(item.nombre) === nombreUsuario);

                setAprobacionDirectorSinMat(datosFiltradosAprobacionDirector);

                const datosRechazadoDirector = datos
                    .filter(item => item.aprobacionAnalista === "Aprobado" && item.aprobacionDirector === "Rechazado")
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

                const datosFiltradosRechazadoDirector = rolUsuario === "admin" || rolUsuario === "LOGISTICA"
                    ? datosRechazadoDirector
                    : datosRechazadoDirector.filter(item => ObtenerRelacionPersonalDirectores(item.nombre) === nombreUsuario);

                setRechazadoDirectorSinMat(datosFiltradosRechazadoDirector);

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

    const [pendienteDirectorSinMat, setPendienteDirectorSinMat] = useState([]);
    const [filtradoPendDirectSinMat, setFiltradoPendDirectSinMat] = useState({});
    const [expandidoPendDirectSinMat, setExpandidoPendDirectSinMat] = useState(false);
    const [observacionesPendDirect, setObservacionesPendDirect] = useState('');
    const [ventanaAbiertaPendienteDirector, setVentanaAbiertaPendienteDirector] = useState(false);
    const [filaSeleccionadaPendienteDirector, setFilaSeleccionadaPendienteDirector] = useState(null);
    const [ordenPendienteDirector, setOrdenPendienteDirector] = useState({ columna: null, ascendente: true });

    const datosFiltradosPendienteDirectorSinMat = pendienteDirectorSinMat.filter((fila) => {
        return Object.keys(filtradoPendDirectSinMat).every((columna) => {
            return (
                !filtradoPendDirectSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoPendDirectSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroPendienteDirector = (columna, valor) => {
        setFiltradoPendDirectSinMat({
            ...filtradoPendDirectSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaPendienteDirector = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaPendienteDirector(datosFiltrados);
        setVentanaAbiertaPendienteDirector(true);
    };

    const manejarCerrarModalPendienteDirector = () => {
        setVentanaAbiertaPendienteDirector(false);
        setFilaSeleccionadaPendienteDirector(null);
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

    const manejarAprobarPendienteDirector = async () => {
        const ids = filaSeleccionadaPendienteDirector.map(item => item.id);
        const estado = "Aprobado"
        let observacionesTemporal;
        const fechaRegistro = String(formatDate(new Date()));

        if (observacionesPendDirect === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendDirect;
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoDirector', { ids, estado, observacionesTemporal, fechaRegistro });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud aprobada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteDirector();
        setObservacionesPendDirect('');
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarRechazoPendienteDirector = async () => {
        const ids = filaSeleccionadaPendienteDirector.map(item => item.id);
        const estado = "Rechazado"
        let observacionesTemporal;
        const fechaRegistro = String(formatDate(new Date()));

        if (observacionesPendDirect === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendDirect;
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoDirector', { ids, estado, observacionesTemporal, fechaRegistro });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud Rechazada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteDirector();
        setObservacionesPendDirect('');
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenPendienteDirector = (columna) => {
        setOrdenPendienteDirector((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenadosPendienteDirector = [...datosFiltradosPendienteDirectorSinMat].sort((a, b) => {
        if (!ordenPendienteDirector.columna) return 0;
        const valorA = a[ordenPendienteDirector.columna];
        const valorB = b[ordenPendienteDirector.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenPendienteDirector.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenPendienteDirector.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    const [aprobacionDirectorSinMat, setAprobacionDirectorSinMat] = useState([]);
    const [filtradoAprobacionDirectSinMat, setFiltradoAprobacionDirectSinMat] = useState({});
    const [expandidoAprobacionDirectSinMat, setExpandidoAprobacionDirectSinMat] = useState(false);
    const [ventanaAbiertaAprobacionDirector, setVentanaAbiertaAprobacionDirector] = useState(false);
    const [filaSeleccionadaAprobacionDirector, setFilaSeleccionadaAprobacionDirector] = useState(null);
    const [ordenAprobacionDirector, setOrdenAprobacionDirector] = useState({ columna: null, ascendente: true });

    const datosFiltradosAprobacionDirectorSinMat = aprobacionDirectorSinMat.filter((fila) => {
        return Object.keys(filtradoAprobacionDirectSinMat).every((columna) => {
            return (
                !filtradoAprobacionDirectSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoAprobacionDirectSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroAprobacionDirector = (columna, valor) => {
        setFiltradoAprobacionDirectSinMat({
            ...filtradoAprobacionDirectSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaAprobacionDirector = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaAprobacionDirector(datosFiltrados);
        setVentanaAbiertaAprobacionDirector(true);
    };

    const manejarCerrarModalAprobacionDirector = () => {
        setVentanaAbiertaAprobacionDirector(false);
        setFilaSeleccionadaAprobacionDirector(null);
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenAprobacionDirector = (columna) => {
        setOrdenAprobacionDirector((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenadosAprobacionDirector = [...datosFiltradosAprobacionDirectorSinMat].sort((a, b) => {
        if (!ordenAprobacionDirector.columna) return 0;
        const valorA = a[ordenAprobacionDirector.columna];
        const valorB = b[ordenAprobacionDirector.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenAprobacionDirector.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenAprobacionDirector.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    const [rechazadoDirectorSinMat, setRechazadoDirectorSinMat] = useState([]);
    const [filtradoRechazadoDirectSinMat, setFiltradoRechazadoDirectSinMat] = useState({});
    const [expandidoRechazadoDirectSinMat, setExpandidoRechazadoDirectSinMat] = useState(false);
    const [ventanaAbiertaRechazadoDirector, setVentanaAbiertaRechazadoDirector] = useState(false);
    const [filaSeleccionadaRechazadoDirector, setFilaSeleccionadaRechazadoDirector] = useState(null);
    const [ordenRechazadoDirector, setOrdenRechazadoDirector] = useState({ columna: null, ascendente: true });

    const datosFiltradosRechazadoDirectorSinMat = rechazadoDirectorSinMat.filter((fila) => {
        return Object.keys(filtradoRechazadoDirectSinMat).every((columna) => {
            return (
                !filtradoRechazadoDirectSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoRechazadoDirectSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroRechazadoDirector = (columna, valor) => {
        setFiltradoRechazadoDirectSinMat({
            ...filtradoRechazadoDirectSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaRechazadoDirector = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaRechazadoDirector(datosFiltrados);
        setVentanaAbiertaRechazadoDirector(true);
    };

    const manejarCerrarModalRechazadoDirector = () => {
        setVentanaAbiertaRechazadoDirector(false);
        setFilaSeleccionadaRechazadoDirector(null);
        setLoading(true);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenRechazadoDirector = (columna) => {
        setOrdenRechazadoDirector((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenadosRechazadoDirector = [...datosFiltradosRechazadoDirectorSinMat].sort((a, b) => {
        if (!ordenRechazadoDirector.columna) return 0;
        const valorA = a[ordenRechazadoDirector.columna];
        const valorB = b[ordenRechazadoDirector.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenRechazadoDirector.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenRechazadoDirector.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    return (
        <div className='Director'>
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
                        <span>Solicitudes Pendientes por el Director</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(pendienteDirectorSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenPendienteDirector(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenPendienteDirector.columna === columna ? (ordenPendienteDirector.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroPendienteDirector(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosPendienteDirector.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(pendienteDirectorSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosPendienteDirector.slice(0, expandidoPendDirectSinMat ? datosOrdenadosPendienteDirector.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaPendienteDirector(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaPendienteDirector(fila)}>
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
                            setExpandidoPendDirectSinMat(!expandidoPendDirectSinMat);
                        }}>
                            {expandidoPendDirectSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaPendienteDirector}
                        onClose={manejarCerrarModalPendienteDirector}
                        onApprove={manejarAprobarPendienteDirector}
                        onDeny={manejarRechazoPendienteDirector}
                        fila={filaSeleccionadaPendienteDirector}
                        observaciones={observacionesPendDirect}
                        setObservaciones={setObservacionesPendDirect}
                        pantalla="Director"
                    />

                    <div className='Subtitulo'>
                        <span>Solicitudes Aprobadas por el Director</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(aprobacionDirectorSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenAprobacionDirector(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenAprobacionDirector.columna === columna ? (ordenAprobacionDirector.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroAprobacionDirector(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosAprobacionDirector.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(aprobacionDirectorSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosAprobacionDirector.slice(0, expandidoAprobacionDirectSinMat ? datosOrdenadosAprobacionDirector.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaAprobacionDirector(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaAprobacionDirector(fila)}>
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
                            setExpandidoAprobacionDirectSinMat(!expandidoAprobacionDirectSinMat);
                        }}>
                            {expandidoAprobacionDirectSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaAprobacionDirector}
                        onClose={manejarCerrarModalAprobacionDirector}
                        onApprove={manejarAprobarPendienteDirector}
                        onDeny={manejarRechazoPendienteDirector}
                        fila={filaSeleccionadaAprobacionDirector}
                        observaciones={observacionesPendDirect}
                        setObservaciones={setObservacionesPendDirect}
                        pantalla="Director"
                    />

                    <div className='Subtitulo'>
                        <span>Solicitudes Rechazadas por el Director</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(rechazadoDirectorSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenRechazadoDirector(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenRechazadoDirector.columna === columna ? (ordenRechazadoDirector.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroRechazadoDirector(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosRechazadoDirector.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(rechazadoDirectorSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosRechazadoDirector.slice(0, expandidoRechazadoDirectSinMat ? datosOrdenadosRechazadoDirector.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaRechazadoDirector(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaRechazadoDirector(fila)}>
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
                            setExpandidoRechazadoDirectSinMat(!expandidoRechazadoDirectSinMat);
                        }}>
                            {expandidoRechazadoDirectSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaRechazadoDirector}
                        onClose={manejarCerrarModalRechazadoDirector}
                        onApprove={manejarAprobarPendienteDirector}
                        onDeny={manejarRechazoPendienteDirector}
                        fila={filaSeleccionadaRechazadoDirector}
                        observaciones={observacionesPendDirect}
                        setObservaciones={setObservacionesPendDirect}
                        pantalla="Director"
                    />

                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </>
            )}
        </div>
    );
};

export default MaterialPrincipalDirector;