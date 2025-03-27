import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
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
    const [error, setError] = useState('');
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

        calculo("Manizales");
        calculo("Pereira");
        calculo("Armenia");
        calculo("Bogota San Cipriano Corporativo");
        calculo("Bogota San Cipriano Red Externa");

        cargarDirectores();
        cargarRelacionPersonal();

        //calculoCantidadRestanteDespacho("Manizales");
        //calculoCantidadRestanteDespacho("Pereira");
        //calculoCantidadRestanteDespacho("Armenia");
        //calculoCantidadRestanteDespacho("Bogota San Cipriano Corporativo");
        //calculoCantidadRestanteDespacho("Bogota San Cipriano Red Externa");
    }, []);

    // const calculoCantidadRestanteDespacho = async (ciudadElgida) => {
    //     try {
    //         setLoading(true);

    //         const responseRegistrosEntregadoSolicitudMaterial = await axios.get('https://sicteferias.from-co.net:8120/solicitudMaterial/RegistrosEntregadosSolicitudMaterial');

    //         const datosFiltradosRegistrosEntregadoSolicitudMaterial = responseRegistrosEntregadoSolicitudMaterial.data.filter(item =>
    //             item.ciudad === ciudadElgida
    //         );

    //         const resultadosFiltrados = datosFiltradosRegistrosEntregadoSolicitudMaterial.filter(item =>
    //             item.uuid === '9C4442-21CAD3' &&
    //             (item.fechaEntrega === "2024-12-12 08:06" ||
    //                 item.fechaEntrega === "2024-12-18 08:28")
    //         );

    //         console.log(resultadosFiltrados);

    //         const responseRegistrosSolicitudMaterial = await axios.get('https://sicteferias.from-co.net:8120/solicitudMaterial/RegistrosSolicitudMaterial');

    //         const datosFiltradosRegistrosSolicitudMaterial = responseRegistrosSolicitudMaterial.data.filter(item =>
    //             item.ciudad === ciudadElgida &&
    //             item.aprobacionAnalista !== "Rechazado" &&
    //             item.aprobacionDirector !== "Rechazado" &&
    //             item.aprobacionDireccionOperacion !== "Rechazado"
    //         );

    //         const resultadosFiltrados2 = datosFiltradosRegistrosSolicitudMaterial.filter(item =>
    //             item.uuid === '9C4442-21CAD3' && item.fecha === "2024-12-09 11:23:36"
    //         );

    //         console.log(resultadosFiltrados2);

    //         const resultadoActualizado = datosFiltradosRegistrosSolicitudMaterial.map(item1 => {
    //             const itemTabla2 = datosFiltradosRegistrosEntregadoSolicitudMaterial.filter(item2 => item2.uuid === item1.uuid);

    //             console.log(itemTabla2.filter(item => item.uuid === '9C4442-21CAD3' && (item.fechaEntrega === "2024-12-12 08:06" || item.fechaEntrega === "2024-12-18 08:28")));

    //             // // Si no encontramos datos para este uuid, continuar
    //             // if (itemTabla2.length === 0) return item1;

    //             // // Separar los PDFs por coma
    //             // const pdfsSeparados = item1.pdfs.split(',');

    //             // // Iterar sobre los PDFs y procesar la diferencia
    //             // let cantidadRestante = parseInt(item1.cantidadRestantePorDespacho);
    //             // pdfsSeparados.forEach(pdf => {
    //             //     // Aquí vamos a suponer que el nombre del archivo PDF tiene información relacionada
    //             //     // con el código SAP del material y el uuid, y vamos a hacer el cruce

    //             //     // Supongamos que en el PDF tenemos el código SAP como parte del nombre (por ejemplo: "SAL-738")
    //             //     const codigoPdf = pdf.split('_')[1].split('.')[0];  // "SAL-738"

    //             //     // Buscar el código SAP en la tabla2
    //             //     itemTabla2.forEach(item2 => {
    //             //         if (item2.codigoSapMaterial.includes(codigoPdf)) {
    //             //             // Aquí puedes hacer el cálculo de la diferencia. 
    //             //             // Supongamos que la diferencia es la cantidad solicitada menos la cantidad disponible
    //             //             const diferencia = item2.cantidadSolicitadaMaterial - item2.cantidadDisponibleMaterial;

    //             //             // Actualizar la cantidad restante
    //             //             cantidadRestante -= diferencia;
    //             //         }
    //             //     });
    //             // });

    //             // // Devolver el objeto actualizado
    //             // return { ...item1, cantidadRestantePorDespacho: cantidadRestante };
    //         });

    //         console.log(resultadoActualizado);

    //         const resultadosFiltrados3 = resultadoActualizado.filter(item =>
    //             item.uuid === '9C4442-21CAD3' && item.fecha === "2024-12-09 11:23:36"
    //         );

    //         console.log(resultadosFiltrados3);



    //         // await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/actualizarEstadoCantidadDisponibleMaterial',
    //         //     {
    //         //         ids, cantidades
    //         //     },
    //         //     {
    //         //         headers: {
    //         //             'Content-Type': 'application/json',
    //         //         },
    //         //     }
    //         // );

    //         setLoading(false);

    //         // return resultado

    //     } catch (error) {
    //         setError(error);
    //     }
    // }

    const fetchDataKgprod = async () => {
        try {
            if (!dataKgprod) {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/bodega/kgprod`);
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

    const calculo = async (ciudadElgida) => {
        try {
            setLoading(true);

            const dataKgprodActualizado = await fetchDataKgprod();

            let ciudad;

            if (ciudadElgida === "Manizales") {
                ciudad = ['KGPROD_MZL'];
            } else if (ciudadElgida === "Pereira") {
                ciudad = ['KGPROD_PER'];
            } else if (ciudadElgida === "Armenia") {
                ciudad = ['KGPROD_ARM'];
            } else if (ciudadElgida === "Bogota San Cipriano Corporativo") {
                ciudad = ['KGPROD_CORP_BOG'];
            } else if (ciudadElgida === "Bogota San Cipriano Red Externa") {
                ciudad = ['KGPROD_RED_BOG'];
            } else {
                ciudad = []
            }

            console.log(dataKgprodActualizado);

            const datosFiltradosKgprod = ciudad.length ? dataKgprodActualizado.filter(item => ciudad.includes(item.bodega)) : dataKgprodActualizado;

            const responseRegistrosSolicitudMaterial = await axios.get(`${process.env.REACT_APP_API_URL}/solicitudMaterial/RegistrosSolicitudMaterial`);

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
                const cantidad = parseInt(item.cantidadRestantePorDespacho, 10) || 0;

                if (acumulador[codigo]) {
                    acumulador[codigo] += cantidad;
                } else {
                    acumulador[codigo] = cantidad;
                }

                return acumulador;
            }, {});

            const responseRegistrosEntregadoSolicitudMaterial = await axios.get(`${process.env.REACT_APP_API_URL}/solicitudMaterial/RegistrosEntregadosSolicitudMaterial`);

            const hoy = new Date().toISOString().split("T")[0];

            const datosFiltradosRegistrosEntregadoSolicitudMaterial = responseRegistrosEntregadoSolicitudMaterial.data.filter(item =>
                item.ciudad === ciudadElgida &&
                item.fechaEntrega.slice(0, 10) === hoy
            );

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

                        const codigoEspecifico = "4028942SIC";
                        const registrosFiltrados = registroPorFecha.filter(registro => registro.codigoSapMaterial === codigoEspecifico);
                        console.log(registrosFiltrados);
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

            setLoading(false);

            return resultado

        } catch (error) {
            setError(error);
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