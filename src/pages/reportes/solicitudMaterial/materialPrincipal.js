import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';
import MaterialDetalle from './materialDetalle';
import Cookies from 'js-cookie';
import { ObtenerRolUsuario, ObtenerRelacionPersonalDirectores } from '../../../funciones';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const MaterialPrincipal = () => {
    const location = useLocation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [carpeta, setCarpeta] = useState('Solicitudes');
    const [registrosSolicitudMaterial, setRegistrosSolicitudMaterial] = useState([]);
    const rolUsuario = ObtenerRolUsuario(Cookies.get('userRole'));
    const nombreUsuario = Cookies.get('userNombre');

    const cargarDatosRegistrosSolicitudMaterial = () => {
        axios.get('https://sicteferias.from-co.net:8120/solicitudMaterial/RegistrosSolicitudMaterial')
            .then(response => {
                let datos = response.data;
                datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setRegistrosSolicitudMaterial(datos);

                const datosSolicitudesRealizadas = datos
                    .map(({
                        fecha,
                        cedula,
                        nombre,
                        ciudad,
                        uuid,
                        nombreProyecto,
                        entregaProyecto,
                        aprobacionDirector,
                        aprobacionDireccionOperacion,
                        entregaBodega
                    }) => {
                        let estado;
                        if (aprobacionDirector === "Pendiente") {
                            estado = "Pendiente por Director";
                        } else if (aprobacionDirector === "Rechazado") {
                            estado = "Rechazado por Director";
                        } else if (aprobacionDireccionOperacion === "Pendiente") {
                            estado = "Pendiente por Direccion";
                        } else if (aprobacionDireccionOperacion === "Rechazado") {
                            estado = "Rechazado por Direccion";
                        } else if (entregaBodega === "Pendiente") {
                            estado = "Pendiente Entrega Bodega";
                        } else {
                            estado = "Material Entregado";
                        }

                        return {
                            fecha,
                            cedula,
                            nombre,
                            ciudad,
                            uuid,
                            nombreProyecto,
                            entregaProyecto,
                            estado
                        };
                    })
                    .filter((value, index, self) =>
                        index === self.findIndex((t) => (
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                setSolicitudMaterialSinMat(datosSolicitudesRealizadas);

                const datosPendienteDirector = datos
                    .filter(item => item.aprobacionDirector === "Pendiente")
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
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                const datosFiltradosPendienteDirector = rolUsuario === "admin"
                    ? datosPendienteDirector
                    : datosPendienteDirector.filter(item => ObtenerRelacionPersonalDirectores(item.nombre) === nombreUsuario);

                setPendienteDirectorSinMat(datosFiltradosPendienteDirector);

                const datosAprobacionDirector = datos
                    .filter(item => item.aprobacionDirector === "Aprobado")
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
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                const datosFiltradosAprobacionDirector = rolUsuario === "admin"
                    ? datosAprobacionDirector
                    : datosAprobacionDirector.filter(item => ObtenerRelacionPersonalDirectores(item.nombre) === nombreUsuario);

                setAprobacionDirectorSinMat(datosFiltradosAprobacionDirector);

                const datosRechazadoDirector = datos
                    .filter(item => item.aprobacionDirector === "Rechazado")
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
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                const datosFiltradosRechazadoDirector = rolUsuario === "admin"
                    ? datosRechazadoDirector
                    : datosRechazadoDirector.filter(item => ObtenerRelacionPersonalDirectores(item.nombre) === nombreUsuario);

                setRechazadoDirectorSinMat(datosFiltradosRechazadoDirector);

                const datosPendienteDireccionOperacion = datos
                    .filter(item => item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Pendiente")
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
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                setPendienteDireccionOperacionSinMat(datosPendienteDireccionOperacion);

                const datosAprobadoDireccionOperacion = datos
                    .filter(item => item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Aprobado")
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
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                setAprobacionDireccionOperacionSinMat(datosAprobadoDireccionOperacion);

                const datosRechazadoDireccionOperacion = datos
                    .filter(item => item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Rechazado")
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
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                setRechazadoDireccionOperacionSinMat(datosRechazadoDireccionOperacion);

                const datosPendienteEntregaBodega = datos
                    .filter(item => item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Aprobado" && item.entregaBodega === "Pendiente")
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
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                setPendienteEntregaBodegaSinMat(datosPendienteEntregaBodega);

                const datosEntregadoEntregaBodega = datos
                    .filter(item => item.aprobacionDirector === "Aprobado" && item.aprobacionDireccionOperacion === "Aprobado" && item.entregaBodega === "Entregado")
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
                            t.fecha === value.fecha && t.cedula === value.cedula
                        ))
                    );

                setEntregadoEntregaBodegaSinMat(datosEntregadoEntregaBodega);

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

    const [pendienteDirectorSinMat, setPendienteDirectorSinMat] = useState([]);
    const [filtradoPendDirectSinMat, setFiltradoPendDirectSinMat] = useState({});
    const [expandidoPendDirectSinMat, setExpandidoPendDirectSinMat] = useState(false);
    const [observacionesPendDirect, setObservacionesPendDirect] = useState('');
    const [ventanaAbiertaPendienteDirector, setVentanaAbiertaPendienteDirector] = useState(false);
    const [filaSeleccionadaPendienteDirector, setFilaSeleccionadaPendienteDirector] = useState(null);

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
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaPendienteDirector(datosFiltrados);
        setVentanaAbiertaPendienteDirector(true);
    };

    const manejarCerrarModalPendienteDirector = () => {
        setVentanaAbiertaPendienteDirector(false);
        setFilaSeleccionadaPendienteDirector(null);
    };

    const manejarAprobarPendienteDirector = async () => {
        const ids = filaSeleccionadaPendienteDirector.map(item => item.id);
        const estado = "Aprobado"
        let observacionesTemporal;

        if (observacionesPendDirect === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendDirect;
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoDirector', { ids, estado, observacionesTemporal });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud aprobada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteDirector();
        setObservacionesPendDirect('');
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarRechazoPendienteDirector = async () => {
        const ids = filaSeleccionadaPendienteDirector.map(item => item.id);
        const estado = "Rechazado"
        let observacionesTemporal;

        if (observacionesPendDirect === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendDirect;
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoDirector', { ids, estado, observacionesTemporal });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud Rechazada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteDirector();
        setObservacionesPendDirect('');
        cargarDatosRegistrosSolicitudMaterial();
    };

    const [aprobacionDirectorSinMat, setAprobacionDirectorSinMat] = useState([]);
    const [filtradoAprobacionDirectSinMat, setFiltradoAprobacionDirectSinMat] = useState({});
    const [expandidoAprobacionDirectSinMat, setExpandidoAprobacionDirectSinMat] = useState(false);
    const [ventanaAbiertaAprobacionDirector, setVentanaAbiertaAprobacionDirector] = useState(false);
    const [filaSeleccionadaAprobacionDirector, setFilaSeleccionadaAprobacionDirector] = useState(null);

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
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaAprobacionDirector(datosFiltrados);
        setVentanaAbiertaAprobacionDirector(true);
    };

    const manejarCerrarModalAprobacionDirector = () => {
        setVentanaAbiertaAprobacionDirector(false);
        setFilaSeleccionadaAprobacionDirector(null);
    };

    const [rechazadoDirectorSinMat, setRechazadoDirectorSinMat] = useState([]);
    const [filtradoRechazadoDirectSinMat, setFiltradoRechazadoDirectSinMat] = useState({});
    const [expandidoRechazadoDirectSinMat, setExpandidoRechazadoDirectSinMat] = useState(false);
    const [ventanaAbiertaRechazadoDirector, setVentanaAbiertaRechazadoDirector] = useState(false);
    const [filaSeleccionadaRechazadoDirector, setFilaSeleccionadaRechazadoDirector] = useState(null);

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
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaRechazadoDirector(datosFiltrados);
        setVentanaAbiertaRechazadoDirector(true);
    };

    const manejarCerrarModalRechazadoDirector = () => {
        setVentanaAbiertaRechazadoDirector(false);
        setFilaSeleccionadaRechazadoDirector(null);
    };

    const [pendienteDireccionOperacionSinMat, setPendienteDireccionOperacionSinMat] = useState([]);
    const [filtradoPendDireccOperaSinMat, setFiltradoPendDireccOperaSinMat] = useState({});
    const [expandidoPendDireccOperaSinMat, setExpandidoPendDireccOperaSinMat] = useState(false);
    const [observacionesPendDireccionOperacion, setObservacionesPendDireccionOperacion] = useState('');
    const [ventanaAbiertaPendienteDireccionOperacion, setVentanaAbiertaPendienteDireccionOperacion] = useState(false);
    const [filaSeleccionadaPendienteDireccionOperacion, setFilaSeleccionadaPendienteDireccionOperacion] = useState(null);

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
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaPendienteDireccionOperacion(datosFiltrados);
        setVentanaAbiertaPendienteDireccionOperacion(true);
    };

    const manejarCerrarModalPendienteDireccionOperacion = () => {
        setVentanaAbiertaPendienteDireccionOperacion(false);
        setFilaSeleccionadaPendienteDireccionOperacion(null);
    };

    const manejarAprobarPendienteDireccionOperacion = async () => {
        const ids = filaSeleccionadaPendienteDireccionOperacion.map(item => item.id);
        const estado = "Aprobado"
        let observacionesTemporal;

        if (observacionesPendDirect === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendDirect;
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoDireccionOperacion', { ids, estado, observacionesTemporal });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud aprobada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteDireccionOperacion();
        setObservacionesPendDireccionOperacion('');
        cargarDatosRegistrosSolicitudMaterial();
    };

    const manejarRechazoPendienteDireccionOperacion = async () => {
        const ids = filaSeleccionadaPendienteDireccionOperacion.map(item => item.id);
        const estado = "Rechazado"
        let observacionesTemporal;

        if (observacionesPendDireccionOperacion === "") {
            observacionesTemporal = "Ninguna";
        } else {
            observacionesTemporal = observacionesPendDireccionOperacion;
        }

        try {
            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoDireccionOperacion', { ids, estado, observacionesTemporal });
            console.log('Solicitud enviada correctamente');
            toast.success('Solicitud Rechazada', { className: 'toast-success' });
        } catch (error) {
            console.error('Error al enviar los IDs al backend:', error);
            toast.error('Error en actualizar estado', { className: 'toast-success' });
        }

        manejarCerrarModalPendienteDireccionOperacion();
        setObservacionesPendDireccionOperacion('');
        cargarDatosRegistrosSolicitudMaterial();
    };

    const [aprobacionDireccionOperacionSinMat, setAprobacionDireccionOperacionSinMat] = useState([]);
    const [filtradoAprobacionDireccOperaSinMat, setFiltradoAprobacionDireccOperaSinMat] = useState({});
    const [expandidoAprobacionDireccOperaSinMat, setExpandidoAprobacionDireccOperaSinMat] = useState(false);
    const [ventanaAbiertaAprobacionDireccionOperacion, setVentanaAbiertaAprobacionDireccionOperacion] = useState(false);
    const [filaSeleccionadaAprobacionDireccionOperacion, setFilaSeleccionadaAprobacionDireccionOperacion] = useState(null);

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
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaAprobacionDireccionOperacion(datosFiltrados);
        setVentanaAbiertaAprobacionDireccionOperacion(true);
    };

    const manejarCerrarModalAprobacionDireccionOperacion = () => {
        setVentanaAbiertaAprobacionDireccionOperacion(false);
        setFilaSeleccionadaAprobacionDireccionOperacion(null);
    };

    const [rechazadoDireccionOperacionSinMat, setRechazadoDireccionOperacionSinMat] = useState([]);
    const [filtradoRechazadoDireccOperaSinMat, setFiltradoRechazadoDireccOperaSinMat] = useState({});
    const [expandidoRechazadoDireccOperaSinMat, setExpandidoRechazadoDireccOperaSinMat] = useState(false);
    const [ventanaAbiertaRechazadoDireccionOperacion, setVentanaAbiertaRechazadoDireccionOperacion] = useState(false);
    const [filaSeleccionadaRechazadoDireccionOperacion, setFilaSeleccionadaRechazadoDireccionOperacion] = useState(null);

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
    };

    const [pendienteEntregaBodegaSinMat, setPendienteEntregaBodegaSinMat] = useState([]);
    const [expandidoPendienteEntregaBodegaSinMat, setExpandidoPendienteEntregaBodegaSinMat] = useState(false);
    const [ventanaAbiertaPendienteEntregaBodega, setVentanaAbiertaPendienteEntregaBodega] = useState(false);
    const [filaSeleccionadaPendienteEntregaBodega, setFilaSeleccionadaPendienteEntregaBodega] = useState(null);

    const manejarClickFilaPendienteEntregaBodega = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaPendienteEntregaBodega(datosFiltrados);
        setVentanaAbiertaPendienteEntregaBodega(true);
    };

    const manejarCerrarModalPendienteEntregaBodega = () => {
        setVentanaAbiertaPendienteEntregaBodega(false);
        setFilaSeleccionadaPendienteEntregaBodega(null);
        cargarDatosRegistrosSolicitudMaterial();
    };

    const [entregadoEntregaBodegaSinMat, setEntregadoEntregaBodegaSinMat] = useState([]);
    const [expandidoEntregadoEntregaBodegaSinMat, setExpandidoEntregadoEntregaBodegaSinMat] = useState(false);
    const [ventanaAbiertaEntregadoEntregaBodega, setVentanaAbiertaEntregadoEntregaBodega] = useState(false);
    const [filaSeleccionadaEntregadoEntregaBodega, setFilaSeleccionadaEntregadoEntregaBodega] = useState([]);

    const manejarClickFilaEntregadoEntregaBodega = (fila) => {
        const datosFiltrados = registrosSolicitudMaterial.filter(
            (item) => item.fecha === fila.fecha && item.cedula === fila.cedula
        );

        setFilaSeleccionadaEntregadoEntregaBodega(datosFiltrados);
        setVentanaAbiertaEntregadoEntregaBodega(true);
    };

    const manejarCerrarModalEntregadoEntregaBodega = () => {
        setVentanaAbiertaEntregadoEntregaBodega(false);
        setFilaSeleccionadaEntregadoEntregaBodega(null);
        cargarDatosRegistrosSolicitudMaterial();
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

    const datosFiltradosEntregadoEntregaBodegaSinMat = entregadoEntregaBodegaSinMat.filter((fila) =>
        Object.entries(filtrosComunes).every(([columna, valor]) =>
            fila[columna]?.toString().toLowerCase().includes(valor.toLowerCase())
        )
    );

    const descargarArchivo = () => {
        const hoja = XLSX.utils.json_to_sheet(registrosSolicitudMaterial);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
        const archivoExcel = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([archivoExcel], { type: 'application/octet-stream' });
        saveAs(blob, 'Solicitudes de Material.xlsx');
    };

    const [orden, setOrden] = useState({ columna: null, ascendente: true });
    const [datosOrdenados, setDatosOrdenados] = useState([]);

    useEffect(() => {
        setDatosOrdenados(datosFiltradosSolicitudMaterialSinMat);
    }, [datosFiltradosSolicitudMaterialSinMat]);

    const manejarOrdenarColumna = (columna) => {
        const esAscendente = orden.columna === columna ? !orden.ascendente : true;
        setOrden({ columna, ascendente: esAscendente });

        const datosOrdenadosTemporal = [...datosOrdenados].sort((a, b) => {
            if (a[columna] < b[columna]) return esAscendente ? -1 : 1;
            if (a[columna] > b[columna]) return esAscendente ? 1 : -1;
            return 0;
        });

        setDatosOrdenados(datosOrdenadosTemporal);
    };

    return (
        <div className="materialPrincipal">
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
                    {(rolUsuario === "COORDINACION" || rolUsuario === "DIRECTOR" || rolUsuario === "admin") && (
                        <div>
                            <button className="btn-flotante"
                                onClick={() => {
                                    navigate('/MaterialAgregar', { state: { estadoNotificacion: false } });
                                }}
                            >+</button>
                        </div>
                    )}

                    <div className='Titulo'>
                        <h2>Solicitudes de Material</h2>
                    </div>

                    <div className='menuNavegacion'>
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${carpeta === 'Solicitudes' ? 'active' : ''}`}
                                    onClick={() => {
                                        setCarpeta('Solicitudes');
                                        setFiltradoSolicitudMaterialSinMat({});
                                    }}
                                >
                                    Solicitudes
                                </a>
                            </li>
                            {(rolUsuario === "DIRECTOR" || rolUsuario === "admin") && (
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${carpeta === 'Director' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCarpeta('Director');
                                            setFiltradoPendDirectSinMat({});
                                            setFiltradoAprobacionDirectSinMat({});
                                            setFiltradoRechazadoDirectSinMat({});
                                        }}
                                    >
                                        Director
                                    </a>
                                </li>
                            )}
                            {rolUsuario === "admin" && (
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${carpeta === 'Direccion Operacion' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCarpeta('Direccion Operacion');
                                            setFiltradoPendDireccOperaSinMat({});
                                            setFiltradoAprobacionDireccOperaSinMat({});
                                            setFiltradoRechazadoDireccOperaSinMat({});
                                        }}
                                    >
                                        Direccion Operacion
                                    </a>
                                </li>
                            )}
                            {(rolUsuario === "BODEGA" || rolUsuario === "admin") && (
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${carpeta === 'Entrega Bodega' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCarpeta('Entrega Bodega');
                                            setFiltrosComunes({});
                                        }}
                                    >
                                        Entrega Bodega
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {carpeta === "Solicitudes" && (
                        <div className='Solicitudes'>
                            <div className='Botones'>
                                <button className='btn btn-success' onClick={descargarArchivo}>Descargar Excel</button>
                            </div>
                            <div className='Subtitulo'>
                                <span>Solicitudes Realizadas</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(solicitudMaterialSinMat[0] || {}).map((columna) => (
                                            <th key={columna} onClick={() => manejarOrdenarColumna(columna)}>
                                                {formatearNombreColumna(columna)}
                                                {orden.columna === columna ? (
                                                    orden.ascendente ? (
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
                                            <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaPendienteDirector(fila)}>
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
                            <div className='Boton'>
                                <span onClick={() => {
                                    setExpandidoSolicitudMaterialSinMat(!expandidoSolicitudMaterialSinMat);
                                }}>
                                    {expandidoSolicitudMaterialSinMat ? "Mostrar menos" : "Mostrar mas"}
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
                                pantalla="Solicitudes"
                            />
                        </div>
                    )}

                    {carpeta === "Director" && (
                        <div className='Director'>
                            <div className='Subtitulo'>
                                <span>Solicitudes Pendientes por el Director</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(pendienteDirectorSinMat[0] || {}).map((columna) => (
                                            <th key={columna}>
                                                {formatearNombreColumna(columna)}
                                                <br />
                                                <input
                                                    type="text"
                                                    placeholder={`Filtrar ${formatearNombreColumna(columna)}`}
                                                    onChange={(e) => manejarCambioFiltroPendienteDirector(columna, e.target.value)}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosFiltradosPendienteDirectorSinMat.length === 0 ? (
                                        <tr>
                                            <td colSpan={Object.keys(pendienteDirectorSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        datosFiltradosPendienteDirectorSinMat.slice(0, expandidoPendDirectSinMat ? datosFiltradosPendienteDirectorSinMat.length : 5).map((fila, index) => (
                                            <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaPendienteDirector(fila)}>
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
                        </div>
                    )}

                    {carpeta === "Director" && (
                        <div className='Director'>
                            <div className='Subtitulo'>
                                <span>Solicitudes Aprobadas por el Director</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(aprobacionDirectorSinMat[0] || {}).map((columna) => (
                                            <th key={columna}>
                                                {formatearNombreColumna(columna)}
                                                <br />
                                                <input
                                                    type="text"
                                                    placeholder={`Filtrar ${formatearNombreColumna(columna)}`}
                                                    onChange={(e) => manejarCambioFiltroAprobacionDirector(columna, e.target.value)}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosFiltradosAprobacionDirectorSinMat.length === 0 ? (
                                        <tr>
                                            <td colSpan={Object.keys(aprobacionDirectorSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        datosFiltradosAprobacionDirectorSinMat.slice(0, expandidoAprobacionDirectSinMat ? datosFiltradosAprobacionDirectorSinMat.length : 5).map((fila, index) => (
                                            <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaAprobacionDirector(fila)}>
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
                        </div>
                    )}

                    {carpeta === "Director" && (
                        <div className='Director'>
                            <div className='Subtitulo'>
                                <span>Solicitudes Rechazadas por el Director</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(rechazadoDirectorSinMat[0] || {}).map((columna) => (
                                            <th key={columna}>
                                                {formatearNombreColumna(columna)}
                                                <br />
                                                <input
                                                    type="text"
                                                    placeholder={`Filtrar ${formatearNombreColumna(columna)}`}
                                                    onChange={(e) => manejarCambioFiltroRechazadoDirector(columna, e.target.value)}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosFiltradosRechazadoDirectorSinMat.length === 0 ? (
                                        <tr>
                                            <td colSpan={Object.keys(rechazadoDirectorSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        datosFiltradosRechazadoDirectorSinMat.slice(0, expandidoRechazadoDirectSinMat ? datosFiltradosRechazadoDirectorSinMat.length : 5).map((fila, index) => (
                                            <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaRechazadoDirector(fila)}>
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
                        </div>
                    )}

                    {carpeta === "Direccion Operacion" && (
                        <div className='DireccionOperacion'>
                            <div className='Subtitulo'>
                                <span>Solicitudes Pendientes por la Direccion Operacion</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(pendienteDireccionOperacionSinMat[0] || {}).map((columna) => (
                                            <th key={columna}>
                                                {formatearNombreColumna(columna)}
                                                <br />
                                                <input
                                                    type="text"
                                                    placeholder={`Filtrar ${formatearNombreColumna(columna)}`}
                                                    onChange={(e) => manejarCambioFiltroPendienteDireccionOperacion(columna, e.target.value)}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosFiltradosPendienteDireccionOperacionSinMat.length === 0 ? (
                                        <tr>
                                            <td colSpan={Object.keys(pendienteDireccionOperacionSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        datosFiltradosPendienteDireccionOperacionSinMat.slice(0, expandidoPendDireccOperaSinMat ? datosFiltradosPendienteDireccionOperacionSinMat.length : 5).map((fila, index) => (
                                            <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaPendienteDireccionOperacion(fila)}>
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
                            <div className='Boton'>
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
                        </div>
                    )}

                    {carpeta === "Direccion Operacion" && (
                        <div className='DireccionOperacion'>
                            <div className='Subtitulo'>
                                <span>Solicitudes Aprobadas por la Direccion Operacion</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(aprobacionDireccionOperacionSinMat[0] || {}).map((columna) => (
                                            <th key={columna}>
                                                {formatearNombreColumna(columna)}
                                                <br />
                                                <input
                                                    type="text"
                                                    placeholder={`Filtrar ${formatearNombreColumna(columna)}`}
                                                    onChange={(e) => manejarCambioFiltroAprobacionDireccionOperacion(columna, e.target.value)}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosFiltradosAprobacionDireccionOperacionSinMat.length === 0 ? (
                                        <tr>
                                            <td colSpan={Object.keys(aprobacionDireccionOperacionSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        datosFiltradosAprobacionDireccionOperacionSinMat.slice(0, expandidoAprobacionDireccOperaSinMat ? datosFiltradosAprobacionDireccionOperacionSinMat.length : 5).map((fila, index) => (
                                            <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaAprobacionDireccionOperacion(fila)}>
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
                            <div className='Boton'>
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
                        </div>
                    )}

                    {carpeta === "Direccion Operacion" && (
                        <div className='DireccionOperacion'>
                            <div className='Subtitulo'>
                                <span>Solicitudes Rechazadas por la Direccion Operacion</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(rechazadoDireccionOperacionSinMat[0] || {}).map((columna) => (
                                            <th key={columna}>
                                                {formatearNombreColumna(columna)}
                                                <br />
                                                <input
                                                    type="text"
                                                    placeholder={`Filtrar ${formatearNombreColumna(columna)}`}
                                                    onChange={(e) => manejarCambioFiltroRechazadoDireccionOperacion(columna, e.target.value)}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosFiltradosRechazadoDireccionOperacionSinMat.length === 0 ? (
                                        <tr>
                                            <td colSpan={Object.keys(rechazadoDireccionOperacionSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        datosFiltradosRechazadoDireccionOperacionSinMat.slice(0, expandidoRechazadoDireccOperaSinMat ? datosFiltradosRechazadoDireccionOperacionSinMat.length : 5).map((fila, index) => (
                                            <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaRechazadoDireccionOperacion(fila)}>
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
                            <div className='Boton'>
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
                        </div>
                    )}

                    {carpeta === "Entrega Bodega" && (
                        <div className='EntregaBodega'>
                            <div className='Subtitulo'>
                                <span>Solicitudes Pendientes Por Entrega Bodega</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(pendienteEntregaBodegaSinMat[0] || {}).map((columna) => (
                                            <th key={columna}>
                                                {formatearNombreColumna(columna)}
                                                <br />
                                                <input
                                                    type="text"
                                                    placeholder={`Filtrar ${formatearNombreColumna(columna)}`}
                                                    onChange={(e) => manejarCambioFiltroComun(columna, e.target.value)}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosFiltradosPendienteEntregaBodegaSinMat.length === 0 ? (
                                        <tr>
                                            <td colSpan={Object.keys(pendienteEntregaBodegaSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        datosFiltradosPendienteEntregaBodegaSinMat.slice(0, expandidoPendienteEntregaBodegaSinMat ? datosFiltradosPendienteEntregaBodegaSinMat.length : 5).map((fila, index) => (
                                            <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaPendienteEntregaBodega(fila)}>
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
                            <div className='Boton'>
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
                        </div>
                    )}

                    {carpeta === "Entrega Bodega" && (
                        <div className='EntregaBodega'>
                            <div className='Subtitulo'>
                                <span>Solicitudes Entregadas por Bodega</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(entregadoEntregaBodegaSinMat[0] || {}).map((columna) => (
                                            <th key={columna}>
                                                {formatearNombreColumna(columna)}
                                                <br />
                                                <input
                                                    type="text"
                                                    placeholder={`Filtrar ${formatearNombreColumna(columna)}`}
                                                    onChange={(e) => manejarCambioFiltroComun(columna, e.target.value)}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosFiltradosEntregadoEntregaBodegaSinMat.length === 0 ? (
                                        <tr>
                                            <td colSpan={Object.keys(entregadoEntregaBodegaSinMat[0] || {}).length} style={{ textAlign: 'center' }}>
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        datosFiltradosEntregadoEntregaBodegaSinMat.slice(0, expandidoEntregadoEntregaBodegaSinMat ? datosFiltradosEntregadoEntregaBodegaSinMat.length : 5).map((fila, index) => (
                                            <tr key={`${fila.fecha}-${fila.cedula}`} onClick={() => manejarClickFilaEntregadoEntregaBodega(fila)}>
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
                            <div className='Boton'>
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

export default MaterialPrincipal;