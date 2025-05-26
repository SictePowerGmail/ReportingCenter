import React, { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaHardHat, FaFileAlt, FaTruck, FaBars, FaTimes, FaHome, FaChartLine, FaStar, FaTools, FaChevronDown, FaChevronLeft, FaUser, FaBoxes, FaUserTie } from 'react-icons/fa';
import { HiClipboardList, HiChartBar, HiOfficeBuilding } from "react-icons/hi";
import { ThreeDots } from 'react-loader-spinner';
import './Navbar.css'
import Cookies from 'js-cookie';
import axios from 'axios';

function Navbar() {
    const [showMobileMenu, setShowMobileMenu] = useState(true);
    const [showDropdownUser, setShowDropdownUser] = useState(false);
    const [showDropdownReportes, setShowDropdownReportes] = useState(false);
    const [showDropdownFacturacion, setShowDropdownFacturacion] = useState(false);
    const [showDropdownProduccion, setShowDropdownProduccion] = useState(false);
    const [showDropdownIndicadores, setShowDropdownIndicadores] = useState(false);
    const [showDropdownPuntuacion, setShowDropdownPuntuacion] = useState(false);
    const [showDropdownMantenimiento, setShowDropdownMantenimiento] = useState(false);
    const [showDropdownLogistica, setShowDropdownLogistica] = useState(false);
    const [showDropdownDireccion, setShowDropdownDireccion] = useState(false);
    const [showDropdownSSTA, setShowDropdownSSTA] = useState(false);
    const [showDropdownParqueAutomotor, setShowDropdownParqueAutomotor] = useState(false);
    const [showDropdownGestionHumana, setShowDropdownGestionHumana] = useState(false);
    const menuRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [error, setError] = useState('');
    const fullName = Cookies.get('userNombre');
    const initial = fullName ? fullName.charAt(0).toUpperCase() : "";
    const name = fullName ? fullName.split(" ")[0] : "";
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 530);
    const role = Cookies.get('userRole');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const closeAllDropdowns = () => {
        setShowDropdownReportes(false);
        setShowDropdownFacturacion(false);
        setShowDropdownProduccion(false);
        setShowDropdownIndicadores(false);
        setShowDropdownPuntuacion(false);
        setShowDropdownMantenimiento(false);
        setShowDropdownLogistica(false);
        setShowDropdownDireccion(false);
        setShowDropdownSSTA(false);
        setShowDropdownParqueAutomotor(false);
        setShowDropdownGestionHumana(false);
    };

    useEffect(() => {
        const nombre = Cookies.get('userNombre');
        if (nombre === "" || nombre === undefined) {
            setIsLogin(false);
            Cookies.set('userCedula', 'Invitado', { expires: 7 });
        } else {
            setIsLogin(true);
        }

        cargarDatosPagesUser()
    }, [isLogin, role]);

    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth > 530);
        };

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeAllDropdowns();
            }

            if (!Array.from(document.getElementsByClassName('Login')).some(el => el.contains(event.target))) {
                setShowDropdownUser(false);
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, [menuRef]);

    const ObtenerTextoMejorado = (rol) => {
        if (!rol) return "";
        return rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
    };

    const handleLogout = () => {
        setIsOpen(false);
        setIsLogin(false);
        Cookies.remove('token');
        Cookies.remove('userCedula');
        Cookies.remove('userNombre');
        Cookies.remove('userCorreo');
        Cookies.remove('userTelefono');
        Cookies.remove('userRole');
        window.location.href = '/ReportingCenter/';
    };

    const [reportes, setReportes] = useState(false);
    const [subChecksReportes, setSubChecksReportes] = useState({
        Capacidades: false,
        Supervision: false
    });

    const [facturacion, setFacturacion] = useState(false);
    const [subChecksFacturacion, setSubChecksFacturacion] = useState({
        ConsolidadoNacional: false,
        Proyectos: false,
        Corporativo: false,
        Mantenimiento: false,
        Operaciones: false,
        Mintic: false,
        Smu: false,
        ImplementacionMovil: false,
        MedicionesMovil: false,
        ObraCivilMovil: false
    });

    const [produccion, setProduccion] = useState(false);
    const [subChecksProduccion, setSubChecksProduccion] = useState({
        ProducionNacional: false,
        Proyectos: false,
        Corporativo: false,
        Mantenimiento: false,
        Reingenierias: false,
        Operaciones: false
    });

    const [indicadores, setIndicadores] = useState(false);
    const [subChecksIndicadores, setSubChecksIndicadores] = useState({
        HistoricoKpi: false,
        G1Mantenimiento: false,
        Nps: false,
        G2G8MasivoCentro: false
    });

    const [puntuacion, setPuntuacion] = useState(false);
    const [subChecksPuntuacion, setSubChecksPuntuacion] = useState({
        Proyectos: false,
        Corporativo: false,
        Mantenimiento: false,
        Reingenierias: false
    });

    const [operacion, setOperacion] = useState(false);
    const [subChecksOperacion, setSubChecksOperacion] = useState({
        CumplimientoSlaFo: false,
        CumplimientoSlaHfc: false,
        CorrectivoPreventivo: false,
        RecursoOperaciones: false,
        SeguimientoMttoCentro: false,
        SeguimientoOperacionesCentro: false,
        SeguimientoOperacionesNorte: false,
        SeguimientoSmu: false,
        TecnicoSmu: false,
        TorreDeControl: false
    });

    const [logistica, setLogistica] = useState(false);
    const [subChecksLogistica, setSubChecksLogistica] = useState({
        EquiposEnMoviles: false,
        ConsumosOperaciones: false,
        DesmonteMantenimiento: false,
        SolicitudDeMaterial: false,
        ReporteMaterialFerretero: false,
        InventarioMaterial: false,
        EstadoProyectosR4: false,
        Activos: false,
    });

    const [direccion, setDireccion] = useState(false);
    const [subChecksDireccion, setSubChecksDireccion] = useState({
        Penalizaciones: false,
        CentroDeCostos: false,
        ComposicionMoviles: false,
        Compras: false,
        Capacidades: false,
    });

    const [ssta, setSsta] = useState(false);
    const [subChecksSsta, setSubChecksSsta] = useState({
        Ssta: false,
        CursoDeAlturas: false,
        EntregasPendientesDotacion: false,
        UbicacionDeActividades: false,
    });

    const [parqueAutomotor, setParqueAutomotor] = useState(false);
    const [subChecksParqueAutomotor, setSubChecksParqueAutomotor] = useState({
        Moviles: false,
    });

    const [gestionHumana, setGestionHumana] = useState(false);
    const [subChecksGestionHumana, setSubChecksGestionHumana] = useState({
        ChatBot: false,
        Carnetizacion: false,
    });

    const cargarDatosPagesUser = async (usuario) => {
        try {
            setLoading(true);
            const responsePagesUser = await axios.get(`${process.env.REACT_APP_API_URL}/usuarios/pagesUser`);
            const data = responsePagesUser.data;
            const cedula = Cookies.get('userCedula');

            const usuarioEncontrado = data.find(user => user.cedula === cedula);

            if (usuarioEncontrado) {

                const mappedChecksReportes = {
                    Capacidades: usuarioEncontrado.reportesCapacidades === "1",
                    Supervision: usuarioEncontrado.reportesSupervision === "1"
                }

                setSubChecksReportes(mappedChecksReportes);

                const algunHabilitadoReporte = Object.values(mappedChecksReportes).some(valor => valor === true);

                if (algunHabilitadoReporte) {
                    setReportes(true);
                } else {
                    setReportes(false);
                }

                const mappedChecksFacturacion = {
                    ConsolidadoNacional: usuarioEncontrado.facturacionConsolidadoNacional === "1",
                    Proyectos: usuarioEncontrado.facturacionProyectos === "1",
                    Corporativo: usuarioEncontrado.facturacionCorporativo === "1",
                    Mantenimiento: usuarioEncontrado.facturacionMantenimiento === "1",
                    Operaciones: usuarioEncontrado.facturacionOperaciones === "1",
                    Mintic: usuarioEncontrado.facturacionMintic === "1",
                    Smu: usuarioEncontrado.facturacionSmu === "1",
                    ImplementacionMovil: usuarioEncontrado.facturacionImplementacionMovil === "1",
                    MedicionesMovil: usuarioEncontrado.facturacionMedicionesMovil === "1",
                    ObraCivilMovil: usuarioEncontrado.facturacionObraCivilMovil === "1"
                };

                setSubChecksFacturacion(mappedChecksFacturacion);

                const algunHabilitadosFacturacion = Object.values(mappedChecksFacturacion).some(valor => valor === true);

                if (algunHabilitadosFacturacion) {
                    setFacturacion(true);
                } else {
                    setFacturacion(false);
                }

                const mappedChecksProduccion = {
                    ProducionNacional: usuarioEncontrado.producionNacional === "1",
                    Proyectos: usuarioEncontrado.producionProyectos === "1",
                    Corporativo: usuarioEncontrado.producionCorporativo === "1",
                    Mantenimiento: usuarioEncontrado.producionMantenimiento === "1",
                    Reingenierias: usuarioEncontrado.producionReingenierias === "1",
                    Operaciones: usuarioEncontrado.producionOperaciones === "1"
                };

                setSubChecksProduccion(mappedChecksProduccion);

                const algunHabilitadosProduccion = Object.values(mappedChecksProduccion).some(valor => valor === true);

                if (algunHabilitadosProduccion) {
                    setProduccion(true);
                } else {
                    setProduccion(false);
                }

                const mappedChecksIndicadores = {
                    HistoricoKpi: usuarioEncontrado.indicadoresHistoricoKpi === "1",
                    G1Mantenimiento: usuarioEncontrado.indicadoresG1Mantenimiento === "1",
                    Nps: usuarioEncontrado.indicadoresNps === "1",
                    G2G8MasivoCentro: usuarioEncontrado.indicadoresG2G8MasivoCentro === "1",
                };

                setSubChecksIndicadores(mappedChecksIndicadores);

                const algunHabilitadosIndicadores = Object.values(mappedChecksIndicadores).some(valor => valor === true);

                if (algunHabilitadosIndicadores) {
                    setIndicadores(true);
                } else {
                    setIndicadores(false);
                }

                const mappedChecksSsta = {
                    Ssta: usuarioEncontrado.sstaSsta === "1",
                    CursoDeAlturas: usuarioEncontrado.sstaCursoDeAlturas === "1",
                    EntregasPendientesDotacion: usuarioEncontrado.sstaEntregasPendientesDotacion === "1",
                    UbicacionDeActividades: usuarioEncontrado.sstaUbicacionDeActividades === "1",
                };

                setSubChecksSsta(mappedChecksSsta);

                const algunHabilitadosSsta = Object.values(mappedChecksSsta).some(valor => valor === true);

                if (algunHabilitadosSsta) {
                    setSsta(true);
                } else {
                    setSsta(false);
                }

                const mappedChecksPuntuacion = {
                    Proyectos: usuarioEncontrado.puntuacionProyectos === "1",
                    Corporativo: usuarioEncontrado.puntuacionCorporativo === "1",
                    Mantenimiento: usuarioEncontrado.puntuacionMantenimiento === "1",
                    Reingenierias: usuarioEncontrado.puntuacionReingenierias === "1"
                };

                setSubChecksPuntuacion(mappedChecksPuntuacion);

                const algunHabilitadosPuntuacion = Object.values(mappedChecksPuntuacion).some(valor => valor === true);

                if (algunHabilitadosPuntuacion) {
                    setPuntuacion(true);
                } else {
                    setPuntuacion(false);
                }

                const mappedChecksOperacion = {
                    CumplimientoSlaFo: usuarioEncontrado.operacionCumplimientoSlaFo === "1",
                    CumplimientoSlaHfc: usuarioEncontrado.operacionCumplimientoSlaHfc === "1",
                    CorrectivoPreventivo: usuarioEncontrado.operacionCorrectivoPreventivo === "1",
                    RecursoOperaciones: usuarioEncontrado.operacionRecursoOperaciones === "1",
                    SeguimientoMttoCentro: usuarioEncontrado.operacionSeguimientoMttoCentro === "1",
                    SeguimientoOperacionesCentro: usuarioEncontrado.operacionSeguimientoOperacionesCentro === "1",
                    SeguimientoOperacionesNorte: usuarioEncontrado.operacionSeguimientoOperacionesNorte === "1",
                    SeguimientoSmu: usuarioEncontrado.operacionSeguimientoSmu === "1",
                    TecnicoSmu: usuarioEncontrado.operacionTecnicoSmu === "1",
                    TorreDeControl: usuarioEncontrado.operacionTorreDeControl === "1"
                };

                setSubChecksOperacion(mappedChecksOperacion);

                const algunHabilitadosOperacion = Object.values(mappedChecksOperacion).some(valor => valor === true);

                if (algunHabilitadosOperacion) {
                    setOperacion(true);
                } else {
                    setOperacion(false);
                }

                const mappedChecksLogistica = {
                    EquiposEnMoviles: usuarioEncontrado.logisticaEquiposEnMoviles === "1",
                    ConsumosOperaciones: usuarioEncontrado.logisticaConsumosOperaciones === "1",
                    DesmonteMantenimiento: usuarioEncontrado.logisticaDesmonteMantenimiento === "1",
                    SolicitudDeMaterial: usuarioEncontrado.logisticaSolicitudDeMaterial === "1",
                    ReporteMaterialFerretero: usuarioEncontrado.logisticaReporteMaterialFerretero === "1",
                    InventarioMaterial: usuarioEncontrado.logisticaInventarioMaterial === "1",
                    EstadoProyectosR4: usuarioEncontrado.logisticaEstadoProyectosR4 === "1",
                    Activos: usuarioEncontrado.logisticaActivos === "1",
                };

                setSubChecksLogistica(mappedChecksLogistica);

                const algunHabilitadosLogistica = Object.values(mappedChecksLogistica).some(valor => valor === true);

                if (algunHabilitadosLogistica) {
                    setLogistica(true);
                } else {
                    setLogistica(false);
                }

                const mappedChecksDireccion = {
                    Penalizaciones: usuarioEncontrado.direccionPenalizaciones === "1",
                    CentroDeCostos: usuarioEncontrado.direccionCentroDeCostos === "1",
                    ComposicionMoviles: usuarioEncontrado.direccionComposicionMoviles === "1",
                    Compras: usuarioEncontrado.direccionCompras === "1",
                    Capacidades: usuarioEncontrado.direccionCapacidades === "1",
                };

                setSubChecksDireccion(mappedChecksDireccion);

                const algunHabilitadosDireccion = Object.values(mappedChecksDireccion).some(valor => valor === true);

                if (algunHabilitadosDireccion) {
                    setDireccion(true);
                } else {
                    setDireccion(false);
                }

                const mappedChecksParqueAutomotor = {
                    Moviles: usuarioEncontrado.parqueAutomotorMoviles === "1",
                };

                setSubChecksParqueAutomotor(mappedChecksParqueAutomotor);

                const algunHabilitadosParqueAutomotor = Object.values(mappedChecksParqueAutomotor).some(valor => valor === true);

                if (algunHabilitadosParqueAutomotor) {
                    setParqueAutomotor(true);
                } else {
                    setParqueAutomotor(false);
                }

                const mappedChecksGestionHumana = {
                    Chatbot: usuarioEncontrado.gestionHumanaChatbot === "1",
                    Carnetizacion: usuarioEncontrado.gestionHumanaCarnetizacion === "1",
                };

                setSubChecksGestionHumana(mappedChecksGestionHumana);

                const algunHabilitadosGestionHumana = Object.values(mappedChecksGestionHumana).some(valor => valor === true);

                if (algunHabilitadosGestionHumana) {
                    setGestionHumana(true);
                } else {
                    setGestionHumana(false);
                }

            } else {
                console.log("Usuario no encontrado");
            }

        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='contenedor'>

            <div className={`menuLateral ${showMobileMenu ? 'abierto' : 'Cerrado'}`} ref={menuRef}>
                <ul className='Menu'>
                    <li className={`SubMenu ${showMobileMenu ? 'abierto' : 'Cerrado'}`}>
                        <Link className={`SubMenu-Titulo-Solo ${showMobileMenu ? 'abierto' : 'Cerrado'}`} to='/' >
                            <span className='SubMenu-Titulo-Icono'><FaHome /></span>
                            {showMobileMenu && (
                                <span className="SubMenu-Titulo-Texto">Inicio</span>
                            )}
                        </Link>
                    </li>

                    {reportes === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownReportes(!showDropdownReportes);
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><FaFileAlt /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Reportes</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownReportes ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownReportes ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksReportes.Capacidades === true && (<Link className='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=Capacidades" }} ><li>Capacidades</li></Link>)}
                                    {subChecksReportes.Supervision === true && (<Link className='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=supervision" }} ><li>Supervision</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {facturacion === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownFacturacion(!showDropdownFacturacion);
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><HiClipboardList /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Facturación</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownFacturacion ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownFacturacion ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksFacturacion.ConsolidadoNacional === true && (<Link className='SubMenu-Contenido-Titulo' to="/ConsolidadoNacionalFacturacion" ><li>Consolidado nacional</li></Link>)}
                                    {subChecksFacturacion.Proyectos === true && (<Link className='SubMenu-Contenido-Titulo' to="/Proyectos" ><li>Proyectos</li></Link>)}
                                    {subChecksFacturacion.Corporativo === true && (<Link className='SubMenu-Contenido-Titulo' to="/CorporativoFacturacion" ><li>Corporativo</li></Link>)}
                                    {subChecksFacturacion.Mantenimiento === true && (<Link className='SubMenu-Contenido-Titulo' to="/MantenimientoFacturacion" ><li>Mantenimiento</li></Link>)}
                                    {subChecksFacturacion.Operaciones === true && (<Link className='SubMenu-Contenido-Titulo' to="/OperacionesFacturacion" ><li>Operaciones</li></Link>)}
                                    {subChecksFacturacion.Mintic === true && (<Link className='SubMenu-Contenido-Titulo' to="/MinticFacturacion" ><li>Mintic</li></Link>)}
                                    {subChecksFacturacion.Smu === true && (<Link className='SubMenu-Contenido-Titulo' to="/SMU" ><li>SMU</li></Link>)}
                                    {subChecksFacturacion.ImplementacionMovil === true && (<Link className='SubMenu-Contenido-Titulo' to="/ImplementacionesFacturacion" ><li>Implementacion Movil</li></Link>)}
                                    {subChecksFacturacion.MedicionesMovil === true && (<Link className='SubMenu-Contenido-Titulo' to="/MedicionesFacturacion" ><li>Mediciones Movil</li></Link>)}
                                    {subChecksFacturacion.ObraCivilMovil === true && (<Link className='SubMenu-Contenido-Titulo' to="/ObraCivilFacturacion" ><li>Obra Civil Movil</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {produccion === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownProduccion(!showDropdownProduccion)
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><HiChartBar /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Producción</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownProduccion ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownProduccion ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksProduccion.ProducionNacional === true && (<Link className='SubMenu-Contenido-Titulo' to="/ProductividadNacional" ><li>Productividad nacional</li></Link>)}
                                    {subChecksProduccion.Proyectos === true && (<Link className='SubMenu-Contenido-Titulo' to="/PlaneacionFinanciero" ><li>Proyectos</li></Link>)}
                                    {subChecksProduccion.Corporativo === true && (<Link className='SubMenu-Contenido-Titulo' to="/CorporativoFinanciero" ><li>Corporativo</li></Link>)}
                                    {subChecksProduccion.Mantenimiento === true && (<Link className='SubMenu-Contenido-Titulo' to="/MantenimientoFinanciero" ><li>Mantenimiento</li></Link>)}
                                    {subChecksProduccion.Reingenierias === true && (<Link className='SubMenu-Contenido-Titulo' to="/ReingenieriaFinanciero" ><li>Reingenierias</li></Link>)}
                                    {subChecksProduccion.Operaciones === true && (<Link className='SubMenu-Contenido-Titulo' to="/OperacionesFinanciero" ><li>Operaciones</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {indicadores === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownIndicadores(!showDropdownIndicadores)
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><FaChartLine /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Indicadores</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownIndicadores ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownIndicadores ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksIndicadores.HistoricoKpi && (<Link className='SubMenu-Contenido-Titulo' to="/HistoricoKPI" ><li>Histórico KPI</li></Link>)}
                                    {subChecksIndicadores.G1Mantenimiento && (<Link className='SubMenu-Contenido-Titulo' to="/MantenimientoTecnico" ><li>G1 Mantenimiento</li></Link>)}
                                    {subChecksIndicadores.G2G8MasivoCentro && (<Link className='SubMenu-Contenido-Titulo' to="/G2G8MasivoCentro" ><li>G2 - G8 Masivo Centro</li></Link>)}
                                    {/*<Link className='SubMenu-Contenido-Titulo' to="/Mintic" >G5 MINTIC</Link>*/}
                                    {subChecksIndicadores.Nps && (<Link className='SubMenu-Contenido-Titulo' to="/NPS" ><li>NPS</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {puntuacion === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownPuntuacion(!showDropdownPuntuacion)
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><FaStar /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Puntuación</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownPuntuacion ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownPuntuacion ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksPuntuacion.Proyectos && (<Link className='SubMenu-Contenido-Titulo' to="/PlaneacionPuntuacion" ><li>Proyectos</li></Link>)}
                                    {subChecksPuntuacion.Corporativo && (<Link className='SubMenu-Contenido-Titulo' to="/CorporativoPuntuacion" ><li>Corporativo</li></Link>)}
                                    {subChecksPuntuacion.Mantenimiento && (<Link className='SubMenu-Contenido-Titulo' to="/MantenimientoPuntuacion" ><li>Mantenimiento</li></Link>)}
                                    {subChecksPuntuacion.Reingenierias && (<Link className='SubMenu-Contenido-Titulo' to="/ReingenieriasPuntuacion" ><li>Reingenierias</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {operacion === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownMantenimiento(!showDropdownMantenimiento)
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><FaTools /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Operación</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownMantenimiento ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownMantenimiento ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksOperacion.CumplimientoSlaFo === true && (<Link className='SubMenu-Contenido-Titulo' to="/MantenimientoBacklogFO" ><li>Cumplimiento SLA FO</li></Link>)}
                                    {subChecksOperacion.CumplimientoSlaHfc === true && (<Link className='SubMenu-Contenido-Titulo' to="/MantenimientoBacklogHFC" ><li>Cumplimiento SLA HFC</li></Link>)}
                                    {subChecksOperacion.CorrectivoPreventivo === true && (<Link className='SubMenu-Contenido-Titulo' to="/MantenimientoPuntuacionTMRF" ><li>Correctivo - Preventivo</li></Link>)}
                                    {subChecksOperacion.RecursoOperaciones === true && (<Link className='SubMenu-Contenido-Titulo' to="/RecursoOperaciones" ><li>Recurso Operaciones</li></Link>)}
                                    {subChecksOperacion.SeguimientoMttoCentro === true && (<Link className='SubMenu-Contenido-Titulo' to="/Seguimiento" ><li>Seguimiento MTTO Centro</li></Link>)}
                                    {subChecksOperacion.SeguimientoOperacionesCentro === true && (<Link className='SubMenu-Contenido-Titulo' to="/SeguimientoOperacionesCentro" ><li>Seguimiento Operaciones Centro</li></Link>)}
                                    {subChecksOperacion.SeguimientoOperacionesNorte === true && (<Link className='SubMenu-Contenido-Titulo' to="/SeguimientoOperacionesNorte" ><li>Seguimiento Operaciones Norte</li></Link>)}
                                    {subChecksOperacion.SeguimientoSmu === true && (<Link className='SubMenu-Contenido-Titulo' to="/SeguimientoSMU" ><li>Seguimiento SMU</li></Link>)}
                                    {subChecksOperacion.TecnicoSmu === true && (<Link className='SubMenu-Contenido-Titulo' to="/SMU_Tecnico" ><li>Técnico SMU</li></Link>)}
                                    {subChecksOperacion.TorreDeControl === true && (<Link className='SubMenu-Contenido-Titulo' to="/TorreDeControl" ><li>Torre de control</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {logistica === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownLogistica(!showDropdownLogistica)
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><FaBoxes /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Logistica</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownLogistica ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownLogistica ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksLogistica.EquiposEnMoviles === true && (<Link className='SubMenu-Contenido-Titulo' to="/EquiposMoviles" ><li>Equipos en moviles</li></Link>)}
                                    {subChecksLogistica.ConsumosOperaciones === true && (<Link className='SubMenu-Contenido-Titulo' to="/ConsumosOperaciones" ><li>Consumos Operaciones</li></Link>)}
                                    {subChecksLogistica.DesmonteMantenimiento === true && (<Link className='SubMenu-Contenido-Titulo' to="/DesmonteMantenimiento" ><li>Desmonte Mantenimiento</li></Link>)}
                                    {subChecksLogistica.SolicitudDeMaterial === true && (<Link className='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=solicitudMaterial" }} ><li>Solicitud de Material</li></Link>)}
                                    {subChecksLogistica.ReporteMaterialFerretero === true && (<Link className='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=reporteMaterialFerretero" }} ><li>Reporte Material Ferretero</li></Link>)}
                                    {subChecksLogistica.InventarioMaterial === true && (<Link className='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=inventarioMaterial" }} ><li>Inventario Material</li></Link>)}
                                    {subChecksLogistica.EstadoProyectosR4 === true && (<Link className='SubMenu-Contenido-Titulo' to="/EstadoProyectosR4" ><li>Estado Proyectos R4</li></Link>)}
                                    {subChecksLogistica.Activos === true && (<Link className='SubMenu-Contenido-Titulo' to="/Activos" ><li>Activos</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {direccion === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownDireccion(!showDropdownDireccion)
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><HiOfficeBuilding /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Dirección</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownDireccion ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownDireccion ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksDireccion.Penalizaciones === true && (<Link className='SubMenu-Contenido-Titulo' to="/Penalizaciones" ><li>Penalizaciones</li></Link>)}
                                    {subChecksDireccion.CentroDeCostos === true && (<Link className='SubMenu-Contenido-Titulo' to="/Centro_de_costos" ><li>Centros de costos</li></Link>)}
                                    {subChecksDireccion.ComposicionMoviles === true && (<Link className='SubMenu-Contenido-Titulo' to="/ComposicionMoviles" ><li>Composición móviles</li></Link>)}
                                    {subChecksDireccion.Compras === true && (<Link className='SubMenu-Contenido-Titulo' to="/Compras" ><li>Compras</li></Link>)}
                                    {subChecksDireccion.Capacidades === true && (<Link className='SubMenu-Contenido-Titulo' to="/CapacidadesTablero" ><li>Capacidades</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {ssta === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownSSTA(!showDropdownSSTA)
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><FaHardHat /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">SSTA</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownSSTA ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownSSTA ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksSsta.Ssta === true && (<Link className='SubMenu-Contenido-Titulo' to="/SSTA" ><li>SSTA</li></Link>)}
                                    {subChecksSsta.CursoDeAlturas === true && (<Link className='SubMenu-Contenido-Titulo' to="/CursosDeAlturas" ><li>Indicadores Capacitación</li></Link>)}
                                    {subChecksSsta.EntregasPendientesDotacion === true && (<Link className='SubMenu-Contenido-Titulo' to="/EntregasPendientesDotacion" ><li>Entregas Pendientes Dotación</li></Link>)}
                                    {subChecksSsta.UbicacionDeActividades === true && (<Link className='SubMenu-Contenido-Titulo' to="/UbicacionDeActividades" ><li>Ubicacion de Actividades</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {parqueAutomotor === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownParqueAutomotor(!showDropdownParqueAutomotor)
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><FaTruck /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Parque Automotor</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownParqueAutomotor ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownParqueAutomotor ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksParqueAutomotor.Moviles === true && (<Link className='SubMenu-Contenido-Titulo' to="/Moviles" ><li>Moviles</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}

                    {gestionHumana === true && (
                        <li className='SubMenu'>
                            <div className='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                if (showMobileMenu === false) {
                                    setShowMobileMenu(true);
                                }
                                setShowDropdownGestionHumana(!showDropdownGestionHumana)
                            }}>
                                <span className='SubMenu-Titulo-Contenedor'>
                                    <span className='SubMenu-Titulo-Icono'><FaUserTie /></span>
                                    {showMobileMenu && (
                                        <div>
                                            <span className="SubMenu-Titulo-Texto">Gestion Humana</span>
                                            <span className="SubMenu-Titulo-Icono2">
                                                <FaChevronLeft className={`icono-flecha ${showDropdownGestionHumana ? 'rotado' : ''}`} />
                                            </span>
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownGestionHumana ? 'visible' : 'oculto'}`}>
                                <ul>
                                    {subChecksGestionHumana.Chatbot === true && (<Link className='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=ChatBot" }} ><li>ChatBot</li></Link>)}
                                    {subChecksGestionHumana.Carnetizacion === true && (<Link className='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=Carnetizacion" }} ><li>Carnetizacion</li></Link>)}
                                </ul>
                            </div>
                        </li>
                    )}
                </ul>
            </div>

            <div className='sub-contenedor'>
                <div className='barraSuperior'>
                    <div className='Icono-Menu' onClick={() => setShowMobileMenu(!showMobileMenu)}>
                        {
                            showMobileMenu ? <FaTimes /> : <FaBars />
                        }
                        {isLargeScreen === true ? (
                            <div>
                                {isLogin === true ? (
                                    <div className='AjusteTitulo2'></div>
                                ) : (
                                    <div className='AjusteTitulo1'></div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {isLogin === true ? (
                                    <div className='AjusteTitulo4'></div>
                                ) : (
                                    <div className='AjusteTitulo3'></div>
                                )}
                            </div>
                        )}

                    </div>
                    <div className='Titulo'>
                        <p>
                            Sicte CCOT
                        </p>
                        <p>
                            Centro de Control de Operaciones Técnicas
                        </p>
                    </div>
                    {isLogin === true ? (
                        <div className='Login ON'>
                            <div className="circle-container"
                                onClick={() => {
                                    setIsOpen(!isOpen);
                                    setShowDropdownUser(!showDropdownUser);
                                }}
                            >
                                {isLargeScreen ? (
                                    <div>
                                        <div className="circle">{initial}</div>
                                        <span className="name">{name}</span>
                                        <span className='iconoMenu'>
                                            <FaChevronLeft className={`icono-flecha ${showDropdownUser ? 'rotado' : ''}`} />
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="circle">{initial}</div>
                                        <span className='iconoMenu'>
                                            <FaChevronLeft className={`icono-flecha ${showDropdownUser ? 'rotado' : ''}`} />
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className={`menu ${isOpen ? 'open' : ''}`}>
                                <span>{Cookies.get('userCorreo')}</span>
                                <span>{Cookies.get('userNombre')}</span>
                                <span>CC: {Cookies.get('userCedula')}</span>
                                <span>Tel: {Cookies.get('userTelefono')}</span>
                                <span>Rol: {ObtenerTextoMejorado(Cookies.get('userRole'))}</span>
                                <ul>
                                    {role === 'admin' && (
                                        <Link to="/BasesDeDatos"
                                            onClick={() => {
                                                setIsOpen(!isOpen);
                                                setShowDropdownUser(!showDropdownUser);
                                            }}
                                        ><li>Bases de Datos</li></Link>
                                    )}
                                    {role === 'admin' && (
                                        <Link to="/ControlUsuarios"
                                            onClick={() => {
                                                setIsOpen(!isOpen);
                                                setShowDropdownUser(!showDropdownUser);
                                            }}
                                        ><li>Control de Usuarios</li></Link>
                                    )}
                                    <li onClick={handleLogout}>Cerrar Sesión</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className='Login OFF'>
                            <div className="circle-container"
                                onClick={() => {
                                    navigate('/Login?tipo=Inicio');
                                }}
                            >
                                {isLargeScreen ? (
                                    <span className="name">Iniciar Sesión</span>
                                ) : (
                                    <FaUser className="icon" />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="contenido">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Navbar;