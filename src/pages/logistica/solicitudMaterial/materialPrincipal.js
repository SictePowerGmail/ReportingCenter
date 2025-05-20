import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ObtenerRolUsuario, cargarDirectores, cargarRelacionPersonal } from '../../../funciones';
import MaterialPrincipalSolicitudes from './materialPrincipalSolicitudes';
import MaterialPrincipalDirector from './materialPrincipalDirector';
import MaterialPrincipalDireccion from './materialPrincipalDireccion';
import MaterialPrincipalEntregaBodega from './materialPrincipalEntregaBodega';
import MaterialPrincipalLogistica from './materialPrincipalLogistica';
import MaterialPrincipalBodega from './MaterialPrincipalBodega';

const MaterialPrincipal = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [carpeta, setCarpeta] = useState('Solicitudes');
    const rolUsuario = ObtenerRolUsuario(Cookies.get('userRole'));
    const [dataKgprod, setDataKgprod] = useState(null);

    useEffect(() => {
        const yaRecargado = localStorage.getItem('yaRecargado');
        const cedulaUsuario = Cookies.get('userCedula');
        const nombreUsuario = Cookies.get('userNombre');

        if (cedulaUsuario === undefined && nombreUsuario === undefined) {
            navigate('/MaterialLogin', { state: { estadoNotificacion: false } });
        } else if (!yaRecargado) {
            localStorage.setItem('yaRecargado', 'true');
            window.location.reload();
        }

        calculo();

        cargarDirectores();
        cargarRelacionPersonal();
    }, []);

    const fetchDataKgprod = async () => {
        try {
            if (!dataKgprod) {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/solicitudMaterial/kgprod`);
                setDataKgprod(response.data);
                return response.data;
            }
            return dataKgprod;
        } catch (error) {
            console.error("Error al obtener datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculo = async () => {
        try {
            setLoading(true);

            const dataKgprodActualizado = await fetchDataKgprod();

            const ciudades = {
                "Manizales": ['KGPROD_MZL'],
                "Pereira": ['KGPROD_PER'],
                "Armenia": ['KGPROD_ARM'],
                "Bogota San Cipriano Corporativo": ['KGPROD_CORP_BOG'],
                "Bogota San Cipriano Red Externa": ['KGPROD_RED_BOG']
            };

            const responseRegistrosSolicitudMaterial = await axios.get(`${process.env.REACT_APP_API_URL}/solicitudMaterial/registros`);
            const responseRegistrosEntregadoSolicitudMaterial = await axios.get(`${process.env.REACT_APP_API_URL}/solicitudMaterial/registrosEntregados`);

            for (const [ciudadElgida, bodega] of Object.entries(ciudades)) {

                const datosFiltradosKgprod = bodega.length ? dataKgprodActualizado.filter(item => bodega.includes(item.Bodega)) : dataKgprodActualizado;

                const datosFiltradosRegistrosSolicitudMaterial = responseRegistrosSolicitudMaterial.data.filter(item =>
                    item.ciudad === ciudadElgida &&
                    item.aprobacionAnalista !== "Rechazado" &&
                    item.aprobacionDirector !== "Rechazado" &&
                    item.aprobacionDireccionOperacion !== "Rechazado" &&
                    item.estadoProyecto === "Abierto" &&
                    item.entregaBodega !== "Entregado"
                );

                const dinamicaRegistrosSolicitudMaterial = datosFiltradosRegistrosSolicitudMaterial.reduce((acumulador, item) => {
                    const codigo = item.codigoSapMaterial;
                    const cantidad = parseInt(item.cantidadSolicitadaMaterial, 10) || 0;

                    if (acumulador[codigo]) {
                        acumulador[codigo] += cantidad;
                    } else {
                        acumulador[codigo] = cantidad;
                    }

                    return acumulador;
                }, {});

                const datosFiltradosRegistrosSolicitudMaterialPendienteDespacho = responseRegistrosSolicitudMaterial.data.filter(item =>
                    item.ciudad === ciudadElgida &&
                    item.estadoProyecto === "Abierto" &&
                    item.entregaBodega === "Entregado"
                );

                const dinamicaRegistrosSolicitudMaterialPendienteDespacho = datosFiltradosRegistrosSolicitudMaterialPendienteDespacho.reduce((acumulador, item) => {
                    const codigo = item.codigoSapMaterial;
                    let cantidad = parseInt(item.cantidadRestantePorDespacho, 10) || 0;

                    cantidad = Math.max(0, cantidad);

                    if (acumulador[codigo]) {
                        acumulador[codigo] += cantidad;
                    } else {
                        acumulador[codigo] = cantidad;
                    }

                    return acumulador;
                }, {});

                const datosFiltradosRegistrosEntregadoSolicitudMaterial = responseRegistrosEntregadoSolicitudMaterial.data.filter(item => {
                    if (item.ciudad !== ciudadElgida) return false;

                    const fechaEntrega = new Date(item.fechaEntrega + ":00");

                    const ultimaFechaDescarga = new Date(Math.max(...datosFiltradosKgprod.map(d => new Date(d.fechaDescarga).getTime())));

                    return fechaEntrega > ultimaFechaDescarga;
                });

                const dinamicaRegistrosEntregaSolicitudMaterial = datosFiltradosRegistrosEntregadoSolicitudMaterial.reduce((acumulador, item) => {
                    const codigo = item.codigoSapMaterial;
                    const cantidad = parseInt(item.cantidadSolicitadaMaterial, 10) || 0;

                    if (acumulador[codigo]) {
                        acumulador[codigo] += cantidad;
                    } else {
                        acumulador[codigo] = cantidad;
                    }

                    return acumulador;
                }, {});

                const datosRestados = datosFiltradosKgprod.map(itemKgprod => {
                    const codigo = itemKgprod.codigo;
                    const cantidadDisponible = parseInt(itemKgprod.candisp, 10) || 0;
                    const cantidadSolicitada = dinamicaRegistrosSolicitudMaterial[codigo] || 0;
                    const cantidadEntregada = dinamicaRegistrosEntregaSolicitudMaterial[codigo] || 0;
                    const cantidadPendienteDespacho = dinamicaRegistrosSolicitudMaterialPendienteDespacho[codigo] || 0;

                    const nuevaCantidad = cantidadDisponible - cantidadSolicitada - cantidadEntregada - cantidadPendienteDespacho;

                    return {
                        ...itemKgprod,
                        cantidadRestada: nuevaCantidad,
                        cantidadSolicitada,
                        cantidadEntregada,
                        cantidadDisponible,
                        cantidadPendienteDespacho
                    };
                });

                const codigosNegativos = datosRestados.map(item => item.codigo);

                const datosFiltradosRegistrosSolicitudMaterialCompleto = responseRegistrosSolicitudMaterial.data.filter(item =>
                    item.ciudad === ciudadElgida &&
                    item.aprobacionAnalista !== "Rechazado" &&
                    item.aprobacionDirector !== "Rechazado" &&
                    item.aprobacionDireccionOperacion !== "Rechazado" &&
                    item.estadoProyecto === "Abierto"
                );

                const registrosFiltrados = datosFiltradosRegistrosSolicitudMaterialCompleto.filter(item =>
                    codigosNegativos.includes(item.codigoSapMaterial)
                );

                const resultado = registrosFiltrados.reduce((acc, registro) => {
                    const codigo = registro.codigoSapMaterial;
                    const datoNegativo = datosRestados.find(item => item.codigo === codigo);
                    const datoFiltrado = datosFiltradosKgprod.find(item => item.codigo === codigo);

                    if (datoNegativo && datoFiltrado) {
                        let cantidadDisponible = parseInt(datoFiltrado.candisp, 10) || 0;

                        const registrosPorCodigo = acc
                            .filter(item => item.codigoSapMaterial === codigo)
                            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                            .reduce((unique, item) => {
                                const seen = unique.map.get(item.id);
                                if (!seen) {
                                    unique.map.set(item.id, true);
                                    unique.list.push(item);
                                }
                                return unique;
                            }, { list: [], map: new Map() }).list;

                        registrosPorCodigo.forEach((registroPorFecha, index) => {
                            const cantidadRestantePorDespacho = parseInt(registroPorFecha.cantidadRestantePorDespacho, 10) || 0;

                            registroPorFecha.cantidadDisponibleMaterial = cantidadDisponible;
                            registroPorFecha.cantidadDisponibleMaterial = Math.max(0, registroPorFecha.cantidadDisponibleMaterial);
                            cantidadDisponible -= cantidadRestantePorDespacho;
                        });
                    }

                    return [...acc, ...registrosFiltrados.filter(item => item.codigoSapMaterial === codigo)];
                }, []);

                const ids = resultado.map(item => item.id);
                const cantidades = resultado.map(item => item.cantidadDisponibleMaterial)

                await axios.post(`${process.env.REACT_APP_API_URL}/solicitudMaterial/actualizarEstadoCantidadDisponibleMaterial`,
                    {
                        ids, cantidades
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }

            setLoading(false);

        } catch (error) {
            console.log(error);
        }
    }

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
                    <div>
                        <button className="btn-flotante"
                            onClick={() => {
                                navigate('/MaterialAgregar', { state: { estadoNotificacion: false } });
                            }}
                        >+</button>
                    </div>

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
                                    }}
                                >
                                    Solicitudes
                                </a>
                            </li>
                            {(rolUsuario === "CAROLINA FERNANDEZ" || rolUsuario === "LOGISTICA" || rolUsuario === "admin") && (
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${carpeta === 'Logistica' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCarpeta('Logistica');
                                        }}
                                    >
                                        Logistica
                                    </a>
                                </li>
                            )}
                            {(rolUsuario === "DIRECTOR" || rolUsuario === "admin") && (
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${carpeta === 'Director' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCarpeta('Director');
                                        }}
                                    >
                                        Director
                                    </a>
                                </li>
                            )}
                            {(rolUsuario === "admin") && (
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${carpeta === 'Direccion Operacion' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCarpeta('Direccion Operacion');
                                        }}
                                    >
                                        Direccion Operacion
                                    </a>
                                </li>
                            )}
                            {(rolUsuario === "CAROLINA FERNANDEZ" || rolUsuario === "LOGISTICA" || rolUsuario === "BODEGA" || rolUsuario === "admin") && (
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${carpeta === 'Entrega Bodega' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCarpeta('Entrega Bodega');
                                        }}
                                    >
                                        Entrega Bodega
                                    </a>
                                </li>
                            )}
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${carpeta === 'MaterialBodega' ? 'active' : ''}`}
                                    onClick={() => {
                                        setCarpeta('MaterialBodega');
                                    }}
                                >
                                    Material en Bodega
                                </a>
                            </li>
                        </ul>
                    </div>

                    {carpeta === "Solicitudes" && (
                        <MaterialPrincipalSolicitudes />
                    )}

                    {carpeta === "Logistica" && (
                        <MaterialPrincipalLogistica />
                    )}

                    {carpeta === "Director" && (
                        <MaterialPrincipalDirector />
                    )}

                    {carpeta === "Direccion Operacion" && (
                        <MaterialPrincipalDireccion />
                    )}

                    {carpeta === "Entrega Bodega" && (
                        <MaterialPrincipalEntregaBodega />
                    )}

                    {carpeta === "MaterialBodega" && (
                        <MaterialPrincipalBodega dataKgprod={dataKgprod} />
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