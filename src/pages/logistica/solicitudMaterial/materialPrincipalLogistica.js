import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';
import MaterialDetalle from './materialDetalle';
import Cookies from 'js-cookie';
import { ObtenerRolUsuario, ObtenerRelacionCoordinadorAnalistaLogistica } from '../../../funciones';

const MaterialPrincipalLogistica = () => {
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
                datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setRegistrosSolicitudMaterial(datos);

                const datosPendienteAnalista = datos
                    .filter(item => item.aprobacionAnalista === "Pendiente")
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

                const datosFiltradosPendienteAnalista = rolUsuario === "admin" || rolUsuario === "CAROLINA FERNANDEZ"
                    ? datosPendienteAnalista
                    : datosPendienteAnalista.filter(item => {
                        return ObtenerRelacionCoordinadorAnalistaLogistica(item.nombre)[0] === nombreUsuario;
                    });

                setPendienteAnalistaSinMat(datosFiltradosPendienteAnalista);

                const datosAprobadoAnalista = datos
                    .filter(item => item.aprobacionAnalista === "Aprobado")
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

                const datosFiltradosAprobadoAnalista = rolUsuario === "admin" || rolUsuario === "CAROLINA FERNANDEZ"
                    ? datosAprobadoAnalista
                    : datosAprobadoAnalista.filter(item => {
                        return ObtenerRelacionCoordinadorAnalistaLogistica(item.nombre)[0] === nombreUsuario;
                    });

                setAprobacionAnalistaSinMat(datosFiltradosAprobadoAnalista);

                const datosRechazadoAnalista = datos
                    .filter(item => item.aprobacionAnalista === "Rechazado")
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

                const datosFiltradosRechazadoAnalista = rolUsuario === "admin" || rolUsuario === "CAROLINA FERNANDEZ"
                    ? datosRechazadoAnalista
                    : datosRechazadoAnalista.filter(item => {
                        return ObtenerRelacionCoordinadorAnalistaLogistica(item.nombre)[0] === nombreUsuario;
                    });

                setRechazadoAnalistaSinMat(datosFiltradosRechazadoAnalista);

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

    const [pendienteAnalistaSinMat, setPendienteAnalistaSinMat] = useState([]);
    const [filtradoPendAnalistaSinMat, setFiltradoPendAnalistaSinMat] = useState({});
    const [expandidoPendAnalistaSinMat, setExpandidoPendAnalistaSinMat] = useState(false);
    const [observacionesPendAnalista, setObservacionesPendAnalista] = useState('');
    const [ventanaAbiertaPendienteAnalista, setVentanaAbiertaPendienteAnalista] = useState(false);
    const [filaSeleccionadaPendienteAnalista, setFilaSeleccionadaPendienteAnalista] = useState(null);
    const [ordenPendienteAnalista, setOrdenPendienteAnalista] = useState({ columna: null, ascendente: true });

    const datosFiltradosPendienteAnalistaSinMat = pendienteAnalistaSinMat.filter((fila) => {
        return Object.keys(filtradoPendAnalistaSinMat).every((columna) => {
            return (
                !filtradoPendAnalistaSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoPendAnalistaSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroPendienteAnalista = (columna, valor) => {
        setFiltradoPendAnalistaSinMat({
            ...filtradoPendAnalistaSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaPendienteAnalista = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaPendienteAnalista(datosFiltrados);
        setVentanaAbiertaPendienteAnalista(true);
    };

    const manejarCerrarModalPendienteAnalista = () => {
        setVentanaAbiertaPendienteAnalista(false);
        setFilaSeleccionadaPendienteAnalista(null);
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

    const manejarAprobarPendienteAnalista = async () => {
        const ids = filaSeleccionadaPendienteAnalista.map(item => item.id);
        const estado = "Aprobado"
        let observacionesTemporal;
        const fechaRegistro = String(formatDate(new Date()));

        if (observacionesPendAnalista === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendAnalista;
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoAnalista', { ids, estado, observacionesTemporal, fechaRegistro });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud aprobada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteAnalista();
        setObservacionesPendAnalista('');
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarRechazoPendienteAnalista = async () => {
        const ids = filaSeleccionadaPendienteAnalista.map(item => item.id);
        const estado = "Rechazado"
        let observacionesTemporal;
        const fechaRegistro = formatDate(new Date());

        if (observacionesPendAnalista === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendAnalista;
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoAnalista', { ids, estado, observacionesTemporal, fechaRegistro });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud Rechazada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteAnalista();
        setObservacionesPendAnalista('');
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarOrdenPendienteAnalista = (columna) => {
        setOrdenPendienteAnalista((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenadosPendienteAnalista = [...datosFiltradosPendienteAnalistaSinMat].sort((a, b) => {
        if (!ordenPendienteAnalista.columna) return 0;
        const valorA = a[ordenPendienteAnalista.columna];
        const valorB = b[ordenPendienteAnalista.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenPendienteAnalista.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenPendienteAnalista.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    const [aprobacionAnalistaSinMat, setAprobacionAnalistaSinMat] = useState([]);
    const [filtradoAprobacionAnalistaSinMat, setFiltradoAprobacionAnalistaSinMat] = useState({});
    const [expandidoAprobacionAnalistaSinMat, setExpandidoAprobacionAnalistaSinMat] = useState(false);
    const [ventanaAbiertaAprobacionAnalista, setVentanaAbiertaAprobacionAnalista] = useState(false);
    const [filaSeleccionadaAprobacionAnalista, setFilaSeleccionadaAprobacionAnalista] = useState(null);
    const [ordenAprobacionAnalista, setOrdenAprobacionAnalista] = useState({ columna: null, ascendente: true });

    const datosFiltradosAprobacionAnalistaSinMat = aprobacionAnalistaSinMat.filter((fila) => {
        return Object.keys(filtradoAprobacionAnalistaSinMat).every((columna) => {
            return (
                !filtradoAprobacionAnalistaSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoAprobacionAnalistaSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroAprobacionAnalista = (columna, valor) => {
        setFiltradoAprobacionAnalistaSinMat({
            ...filtradoAprobacionAnalistaSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaAprobacionAnalista = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula && item.uuid === fila.uuid
        );

        setFilaSeleccionadaAprobacionAnalista(datosFiltrados);
        setVentanaAbiertaAprobacionAnalista(true);
    };

    const manejarCerrarModalAprobacionAnalista = () => {
        setVentanaAbiertaAprobacionAnalista(false);
        setFilaSeleccionadaAprobacionAnalista(null);
    };

    const manejarOrdenAprobacionAnalista = (columna) => {
        setOrdenAprobacionAnalista((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenadosAprobacionAnalista = [...datosFiltradosAprobacionAnalistaSinMat].sort((a, b) => {
        if (!ordenAprobacionAnalista.columna) return 0;
        const valorA = a[ordenAprobacionAnalista.columna];
        const valorB = b[ordenAprobacionAnalista.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenAprobacionAnalista.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenAprobacionAnalista.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    const [rechazadoAnalistaSinMat, setRechazadoAnalistaSinMat] = useState([]);
    const [filtradoRechazadoAnalistaSinMat, setFiltradoRechazadoAnalistaSinMat] = useState({});
    const [expandidoRechazadoAnalistaSinMat, setExpandidoRechazadoAnalistaSinMat] = useState(false);
    const [ventanaAbiertaRechazadoAnalista, setVentanaAbiertaRechazadoAnalista] = useState(false);
    const [filaSeleccionadaRechazadoAnalista, setFilaSeleccionadaRechazadoAnalista] = useState(null);
    const [ordenRechazadoAnalista, setOrdenRechazadoAnalista] = useState({ columna: null, ascendente: true });

    const datosFiltradosRechazadoAnalistaSinMat = rechazadoAnalistaSinMat.filter((fila) => {
        return Object.keys(filtradoRechazadoAnalistaSinMat).every((columna) => {
            return (
                !filtradoRechazadoAnalistaSinMat[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoRechazadoAnalistaSinMat[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroRechazadoAnalista = (columna, valor) => {
        setFiltradoRechazadoAnalistaSinMat({
            ...filtradoRechazadoAnalistaSinMat,
            [columna]: valor,
        });
    };

    const manejarClickFilaRechazadoAnalista = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaRechazadoAnalista(datosFiltrados);
        setVentanaAbiertaRechazadoAnalista(true);
    };

    const manejarCerrarModalRechazadoAnalista = () => {
        setVentanaAbiertaRechazadoAnalista(false);
        setFilaSeleccionadaRechazadoAnalista(null);
    };

    const manejarOrdenRechazadoAnalista = (columna) => {
        setOrdenRechazadoAnalista((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenadosRechazadoAnalista = [...datosFiltradosRechazadoAnalistaSinMat].sort((a, b) => {
        if (!ordenRechazadoAnalista.columna) return 0;
        const valorA = a[ordenRechazadoAnalista.columna];
        const valorB = b[ordenRechazadoAnalista.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenRechazadoAnalista.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return ordenRechazadoAnalista.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    return (
        <div className='Analista'>
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
                        <span>Solicitudes Pendientes por Analista</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(pendienteAnalistaSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenPendienteAnalista(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenPendienteAnalista.columna === columna ? (ordenPendienteAnalista.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroPendienteAnalista(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosPendienteAnalista.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(pendienteAnalistaSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosPendienteAnalista.slice(0, expandidoPendAnalistaSinMat ? datosOrdenadosPendienteAnalista.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaPendienteAnalista(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaPendienteAnalista(fila)}>
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
                            setExpandidoPendAnalistaSinMat(!expandidoPendAnalistaSinMat);
                        }}>
                            {expandidoPendAnalistaSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaPendienteAnalista}
                        onClose={manejarCerrarModalPendienteAnalista}
                        onApprove={manejarAprobarPendienteAnalista}
                        onDeny={manejarRechazoPendienteAnalista}
                        fila={filaSeleccionadaPendienteAnalista}
                        observaciones={observacionesPendAnalista}
                        setObservaciones={setObservacionesPendAnalista}
                        pantalla="Analista"
                    />



                    <div className='Subtitulo'>
                        <span>Solicitudes Aprobadas por Analista</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(aprobacionAnalistaSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenAprobacionAnalista(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenAprobacionAnalista.columna === columna ? (ordenAprobacionAnalista.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroAprobacionAnalista(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosAprobacionAnalista.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(aprobacionAnalistaSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosAprobacionAnalista.slice(0, expandidoAprobacionAnalistaSinMat ? datosOrdenadosAprobacionAnalista.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaAprobacionAnalista(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaAprobacionAnalista(fila)}>
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
                            setExpandidoAprobacionAnalistaSinMat(!expandidoAprobacionAnalistaSinMat);
                        }}>
                            {expandidoAprobacionAnalistaSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaAprobacionAnalista}
                        onClose={manejarCerrarModalAprobacionAnalista}
                        onApprove={manejarAprobarPendienteAnalista}
                        onDeny={manejarRechazoPendienteAnalista}
                        fila={filaSeleccionadaAprobacionAnalista}
                        observaciones={observacionesPendAnalista}
                        setObservaciones={setObservacionesPendAnalista}
                        pantalla="Analista"
                    />



                    <div className='Subtitulo'>
                        <span>Solicitudes Rechazadas por Analista</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(rechazadoAnalistaSinMat[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrdenRechazadoAnalista(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {ordenRechazadoAnalista.columna === columna ? (ordenRechazadoAnalista.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroRechazadoAnalista(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenadosRechazadoAnalista.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(rechazadoAnalistaSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenadosRechazadoAnalista.slice(0, expandidoRechazadoAnalistaSinMat ? datosOrdenadosRechazadoAnalista.length : 5).map((fila, index) => (
                                        <tr key={`${fila.fecha}-${fila.cedula}-${fila.uuid}`} onClick={() => manejarClickFilaRechazadoAnalista(fila)}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx} onClick={() => manejarClickFilaRechazadoAnalista(fila)}>
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
                            setExpandidoRechazadoAnalistaSinMat(!expandidoRechazadoAnalistaSinMat);
                        }}>
                            {expandidoRechazadoAnalistaSinMat ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>
                    <MaterialDetalle
                        isOpen={ventanaAbiertaRechazadoAnalista}
                        onClose={manejarCerrarModalRechazadoAnalista}
                        onApprove={manejarAprobarPendienteAnalista}
                        onDeny={manejarRechazoPendienteAnalista}
                        fila={filaSeleccionadaRechazadoAnalista}
                        observaciones={observacionesPendAnalista}
                        setObservaciones={setObservacionesPendAnalista}
                        pantalla="Analista"
                    />

                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </>
            )}
        </div>
    );
};

export default MaterialPrincipalLogistica;