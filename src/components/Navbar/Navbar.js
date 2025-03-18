import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { FaHardHat, FaFileAlt, FaTruck, FaBars, FaTimes, FaHome, FaChartLine, FaStar, FaTools, FaChevronDown, FaChevronUp, FaUser, FaBoxes, FaUserTie } from 'react-icons/fa';
import { HiClipboardList, HiChartBar, HiOfficeBuilding } from "react-icons/hi";
import { cargarDirectores } from '../../funciones';
import { ThreeDots } from 'react-loader-spinner';
import './Navbar.css'
import Cookies from 'js-cookie';
import axios from 'axios';

function Navbar() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    const menuRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const fullName = Cookies.get('userNombre');
    const initial = fullName ? fullName.charAt(0).toUpperCase() : "";
    const name = fullName ? fullName.split(" ")[0] : "";
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 530);
    const role = Cookies.get('userRole');
    const [loading, setLoading] = useState(true);

    const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

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
    }, [isLogin]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 600);
            setIsLargeScreen(window.innerWidth > 530);
        };

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMobileMenu(false);
                closeAllDropdowns();
            }

            if (!document.getElementById('Login').contains(event.target)) {
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

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/user/login/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Cambia el tipo de contenido a application/json
                },
                body: JSON.stringify({ correo: username, contrasena: password }), // Convierte los datos a JSON
            });

            if (response.ok) {
                setIsOpen(false);
                setIsLogin(true);
                cargarDirectores();
                const data = await response.json();
                Cookies.set('token', data.role, { expires: 7 });
                Cookies.set('userCedula', data.cedula, { expires: 7 });
                Cookies.set('userNombre', data.nombre, { expires: 7 });
                Cookies.set('userCorreo', data.correo, { expires: 7 });
                Cookies.set('userTelefono', data.telefono, { expires: 7 });
                Cookies.set('userRole', data.rol, { expires: 7 });
                cargarDatosPagesUser();
            } else {
                const errorText = await response.text();
                if (response.status === 404) {
                    setError('Usuario no encontrado');
                } else if (response.status === 401) {
                    setError('Contraseña incorrecta');
                } else {
                    setError('Error inesperado: ' + errorText);
                }
            }
        } catch (error) {
            setError('Error al conectar con el servidor');
        } finally {
            window.location.reload();
        }
    };

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
        SeguimientoMttoCentro: false,
        SeguimientoOperaciones: false,
        SeguimientoSmu: false,
        TecnicoSmu: false,
        TorreDeControl: false
    });

    const [logistica, setLogistica] = useState(false);
    const [subChecksLogistica, setSubChecksLogistica] = useState({
        EquiposEnMovilesR2: false,
        EquiposEnMovilesR4: false,
        ConsumosOperaciones: false,
        DesmonteMantenimiento: false,
        SolicitudDeMaterial: false,
        ReporteMaterialFerretero: false,
        InventarioMaterial: false,
        EstadoProyectosR4: false
    });

    const [direccion, setDireccion] = useState(false);
    const [subChecksDireccion, setSubChecksDireccion] = useState({
        Penalizaciones: false,
        CentroDeCostos: false,
        ComposicionMoviles: false,
        Compras: false
    });

    const [ssta, setSsta] = useState(false);
    const [subChecksSsta, setSubChecksSsta] = useState({
        Ssta: false,
        CursoDeAlturas: false,
        EntregasPendientesDotacion: false,
    });

    const [parqueAutomotor, setParqueAutomotor] = useState(false);
    const [subChecksParqueAutomotor, setSubChecksParqueAutomotor] = useState({
        Moviles: false,
    });

    const [gestionHumana, setGestionHumana] = useState(false);
    const [subChecksGestionHumana, setSubChecksGestionHumana] = useState({
        ChatBot: false,
        Carnetizacion: true,
    });

    const cargarDatosPagesUser = async (usuario) => {
        try {
            setLoading(true);
            const responsePagesUser = await axios.get(`${process.env.REACT_APP_API_URL}/user/pagesUser`);
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
                    SeguimientoMttoCentro: usuarioEncontrado.operacionSeguimientoMttoCentro === "1",
                    SeguimientoOperaciones: usuarioEncontrado.operacionSeguimientoOperaciones === "1",
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
                    EquiposEnMovilesR2: usuarioEncontrado.logisticaEquiposEnMovilesR2 === "1",
                    EquiposEnMovilesR4: usuarioEncontrado.logisticaEquiposEnMovilesR4 === "1",
                    ConsumosOperaciones: usuarioEncontrado.logisticaConsumosOperaciones === "1",
                    DesmonteMantenimiento: usuarioEncontrado.logisticaDesmonteMantenimiento === "1",
                    SolicitudDeMaterial: usuarioEncontrado.logisticaSolicitudDeMaterial === "1",
                    ReporteMaterialFerretero: usuarioEncontrado.logisticaReporteMaterialFerretero === "1",
                    InventarioMaterial: usuarioEncontrado.logisticaInventarioMaterial === "1",
                    EstadoProyectosR4: usuarioEncontrado.logisticaEstadoProyectosR4 === "1"
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
                    Compras: usuarioEncontrado.direccionCompras === "1"
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
                    Carnetizacion: true,
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
        <div id='Contenedor'>
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
                    <div id='Icono-Menu' onClick={() => setShowMobileMenu(!showMobileMenu)}>
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
                    <div id='Titulo'>
                        <p>
                            Sicte CCOT
                        </p>
                        <p>
                            Centro de Control de Operaciones Técnicas
                        </p>
                    </div>
                    {isLogin === true ? (
                        <div id='Login' className='ON'>
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
                                            {
                                                showDropdownUser ? <FaChevronUp /> : <FaChevronDown />
                                            }
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="circle">{initial}</div>
                                        <span className='iconoMenu'>
                                            {
                                                showDropdownUser ? <FaChevronUp /> : <FaChevronDown />
                                            }
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
                        <div id='Login' className='OFF'>
                            <div className="circle-container"
                                onClick={() => {
                                    setIsOpen(!isOpen);
                                    setShowDropdownUser(!showDropdownUser);
                                }}
                            >
                                {isLargeScreen ? (
                                    <span className="name">Iniciar Sesión</span>
                                ) : (
                                    <FaUser className="icon" />
                                )}

                                <span className='iconoMenu'>
                                    {
                                        showDropdownUser ? <FaChevronUp /> : <FaChevronDown />
                                    }
                                </span>
                            </div>
                            <div className={`menu ${isOpen ? 'open' : ''}`}>
                                <form onSubmit={handleLogin}>
                                    <div>
                                        <label htmlFor="email">Correo</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Ingrese el correo"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required />
                                    </div>
                                    <div>
                                        <label htmlFor="password">Contraseña</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            placeholder="Ingrese la contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required />
                                    </div>
                                    <button type="submit" className='btn '>Ingresar</button>
                                </form>
                                {error && <p>{error}</p>}
                            </div>
                        </div>
                    )}

                    <div id='MenuContainer' className={showMobileMenu ? 'abierto' : 'Cerrado'} ref={menuRef}>
                        <ul id='Menu'>
                            <li id='SubMenu' className={showMobileMenu ? 'abierto' : 'Cerrado'} >
                                <Link id='SubMenu-Titulo-Solo' className={showMobileMenu ? 'abierto' : 'Cerrado'} to='/' onClick={showMobileMenu ? toggleMobileMenu : ''}>
                                    <span id='SubMenu-Titulo-Icono'><FaHome /></span>
                                    {showMobileMenu && (
                                        <span id="SubMenu-Titulo-Texto">Inicio</span>
                                    )}
                                </Link>
                            </li>

                            {reportes === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownReportes(!showDropdownReportes);
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><FaFileAlt /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Reportes</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownReportes ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownReportes && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksReportes.Capacidades === true && (<Link id='SubMenu-Contenido-Titulo' to="/Capacidades" onClick={toggleMobileMenu}><li>Capacidades</li></Link>)}
                                                {subChecksReportes.Supervision === true && (<Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=supervision" }} onClick={toggleMobileMenu}><li>Supervision</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {facturacion === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownFacturacion(!showDropdownFacturacion);
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><HiClipboardList /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Facturación</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownFacturacion ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownFacturacion && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksFacturacion.ConsolidadoNacional === true && (<Link id='SubMenu-Contenido-Titulo' to="/ConsolidadoNacionalFacturacion" onClick={toggleMobileMenu}><li>Consolidado nacional</li></Link>)}
                                                {subChecksFacturacion.Proyectos === true && (<Link id='SubMenu-Contenido-Titulo' to="/Proyectos" onClick={toggleMobileMenu}><li>Proyectos</li></Link>)}
                                                {subChecksFacturacion.Corporativo === true && (<Link id='SubMenu-Contenido-Titulo' to="/CorporativoFacturacion" onClick={toggleMobileMenu}><li>Corporativo</li></Link>)}
                                                {subChecksFacturacion.Mantenimiento === true && (<Link id='SubMenu-Contenido-Titulo' to="/MantenimientoFacturacion" onClick={toggleMobileMenu}><li>Mantenimiento</li></Link>)}
                                                {subChecksFacturacion.Operaciones === true && (<Link id='SubMenu-Contenido-Titulo' to="/OperacionesFacturacion" onClick={toggleMobileMenu}><li>Operaciones</li></Link>)}
                                                {subChecksFacturacion.Mintic === true && (<Link id='SubMenu-Contenido-Titulo' to="/MinticFacturacion" onClick={toggleMobileMenu}><li>Mintic</li></Link>)}
                                                {subChecksFacturacion.Smu === true && (<Link id='SubMenu-Contenido-Titulo' to="/SMU" onClick={toggleMobileMenu}><li>SMU</li></Link>)}
                                                {subChecksFacturacion.ImplementacionMovil === true && (<Link id='SubMenu-Contenido-Titulo' to="/ImplementacionesFacturacion" onClick={toggleMobileMenu}><li>Implementacion Movil</li></Link>)}
                                                {subChecksFacturacion.MedicionesMovil === true && (<Link id='SubMenu-Contenido-Titulo' to="/MedicionesFacturacion" onClick={toggleMobileMenu}><li>Mediciones Movil</li></Link>)}
                                                {subChecksFacturacion.ObraCivilMovil === true && (<Link id='SubMenu-Contenido-Titulo' to="/ObraCivilFacturacion" onClick={toggleMobileMenu}><li>Obra Civil Movil</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {produccion === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownProduccion(!showDropdownProduccion)
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><HiChartBar /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Producción</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownProduccion ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownProduccion && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksProduccion.ProducionNacional === true && (<Link id='SubMenu-Contenido-Titulo' to="/RendimientoOperativo" onClick={toggleMobileMenu}><li>Productividad nacional</li></Link>)}
                                                {subChecksProduccion.Proyectos === true && (<Link id='SubMenu-Contenido-Titulo' to="/PlaneacionFinanciero" onClick={toggleMobileMenu}><li>Proyectos</li></Link>)}
                                                {subChecksProduccion.Corporativo === true && (<Link id='SubMenu-Contenido-Titulo' to="/CorporativoFinanciero" onClick={toggleMobileMenu}><li>Corporativo</li></Link>)}
                                                {subChecksProduccion.Mantenimiento === true && (<Link id='SubMenu-Contenido-Titulo' to="/MantenimientoFinanciero" onClick={toggleMobileMenu}><li>Mantenimiento</li></Link>)}
                                                {subChecksProduccion.Reingenierias === true && (<Link id='SubMenu-Contenido-Titulo' to="/ReingenieriaFinanciero" onClick={toggleMobileMenu}><li>Reingenierias</li></Link>)}
                                                {subChecksProduccion.Operaciones === true && (<Link id='SubMenu-Contenido-Titulo' to="/OperacionesFinanciero" onClick={toggleMobileMenu}><li>Operaciones</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {indicadores === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownIndicadores(!showDropdownIndicadores)
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><FaChartLine /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Indicadores</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownIndicadores ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownIndicadores && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksIndicadores.HistoricoKpi && (<Link id='SubMenu-Contenido-Titulo' to="/HistoricoKPI" onClick={toggleMobileMenu}><li>Histórico KPI</li></Link>)}
                                                {subChecksIndicadores.G1Mantenimiento && (<Link id='SubMenu-Contenido-Titulo' to="/MantenimientoTecnico" onClick={toggleMobileMenu}><li>G1 Mantenimiento</li></Link>)}
                                                {subChecksIndicadores.G2G8MasivoCentro && (<Link id='SubMenu-Contenido-Titulo' to="/G2G8MasivoCentro" onClick={toggleMobileMenu}><li>G2 - G8 Masivo Centro</li></Link>)}
                                                {/*<Link id='SubMenu-Contenido-Titulo' to="/Mintic" onClick={toggleMobileMenu}>G5 MINTIC</Link>*/}
                                                {subChecksIndicadores.Nps && (<Link id='SubMenu-Contenido-Titulo' to="/NPS" onClick={toggleMobileMenu}><li>NPS</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {puntuacion === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownPuntuacion(!showDropdownPuntuacion)
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><FaStar /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Puntuación</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownPuntuacion ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownPuntuacion && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksPuntuacion.Proyectos && (<Link id='SubMenu-Contenido-Titulo' to="/PlaneacionPuntuacion" onClick={toggleMobileMenu}><li>Proyectos</li></Link>)}
                                                {subChecksPuntuacion.Corporativo && (<Link id='SubMenu-Contenido-Titulo' to="/CorporativoPuntuacion" onClick={toggleMobileMenu}><li>Corporativo</li></Link>)}
                                                {subChecksPuntuacion.Mantenimiento && (<Link id='SubMenu-Contenido-Titulo' to="/MantenimientoPuntuacion" onClick={toggleMobileMenu}><li>Mantenimiento</li></Link>)}
                                                {subChecksPuntuacion.Reingenierias && (<Link id='SubMenu-Contenido-Titulo' to="/ReingenieriasPuntuacion" onClick={toggleMobileMenu}><li>Reingenierias</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {operacion === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownMantenimiento(!showDropdownMantenimiento)
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><FaTools /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Operación</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownMantenimiento ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownMantenimiento && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksOperacion.CumplimientoSlaFo === true && (<Link id='SubMenu-Contenido-Titulo' to="/MantenimientoBacklogFO" onClick={toggleMobileMenu}><li>Cumplimiento SLA FO</li></Link>)}
                                                {subChecksOperacion.CumplimientoSlaHfc === true && (<Link id='SubMenu-Contenido-Titulo' to="/MantenimientoBacklogHFC" onClick={toggleMobileMenu}><li>Cumplimiento SLA HFC</li></Link>)}
                                                {subChecksOperacion.CorrectivoPreventivo === true && (<Link id='SubMenu-Contenido-Titulo' to="/MantenimientoPuntuacionTMRF" onClick={toggleMobileMenu}><li>Correctivo - Preventivo</li></Link>)}
                                                {subChecksOperacion.SeguimientoMttoCentro === true && (<Link id='SubMenu-Contenido-Titulo' to="/Seguimiento" onClick={toggleMobileMenu}><li>Seguimiento MTTO Centro</li></Link>)}
                                                {subChecksOperacion.SeguimientoOperaciones === true && (<Link id='SubMenu-Contenido-Titulo' to={isMobile ? "/SeguimientoOperacionesMovil" : "/SeguimientoOperaciones"} onClick={toggleMobileMenu}><li>Seguimiento Operaciones</li></Link>)}
                                                {subChecksOperacion.SeguimientoSmu === true && (<Link id='SubMenu-Contenido-Titulo' to={isMobile ? "/SeguimientoSMUMovil" : "/SeguimientoSMU"} onClick={toggleMobileMenu}><li>Seguimiento SMU</li></Link>)}
                                                {subChecksOperacion.TecnicoSmu === true && (<Link id='SubMenu-Contenido-Titulo' to="/SMU_Tecnico" onClick={toggleMobileMenu}><li>Técnico SMU</li></Link>)}
                                                {subChecksOperacion.TorreDeControl === true && (<Link id='SubMenu-Contenido-Titulo' to="/TorreDeControl" onClick={toggleMobileMenu}><li>Torre de control</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {logistica === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownLogistica(!showDropdownLogistica)
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><FaBoxes /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Logistica</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownLogistica ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownLogistica && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksLogistica.EquiposEnMovilesR2 === true && (<Link id='SubMenu-Contenido-Titulo' to="/EquiposMovilesR2" onClick={toggleMobileMenu}><li>Equipos en moviles R2</li></Link>)}
                                                {subChecksLogistica.EquiposEnMovilesR4 === true && (<Link id='SubMenu-Contenido-Titulo' to="/EquiposMovilesR4" onClick={toggleMobileMenu}><li>Equipos en moviles R4</li></Link>)}
                                                {subChecksLogistica.ConsumosOperaciones === true && (<Link id='SubMenu-Contenido-Titulo' to="/ConsumosOperaciones" onClick={toggleMobileMenu}><li>Consumos Operaciones</li></Link>)}
                                                {subChecksLogistica.DesmonteMantenimiento === true && (<Link id='SubMenu-Contenido-Titulo' to="/DesmonteMantenimiento" onClick={toggleMobileMenu}><li>Desmonte Mantenimiento</li></Link>)}
                                                {subChecksLogistica.SolicitudDeMaterial === true && (<Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=solicitudMaterial" }} onClick={toggleMobileMenu}><li>Solicitud de Material</li></Link>)}
                                                {subChecksLogistica.ReporteMaterialFerretero === true && (<Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=reporteMaterialFerretero" }} onClick={toggleMobileMenu}><li>Reporte Material Ferretero</li></Link>)}
                                                {subChecksLogistica.InventarioMaterial === true && (<Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=inventarioMaterial" }} onClick={toggleMobileMenu}><li>Inventario Material</li></Link>)}
                                                {subChecksLogistica.EstadoProyectosR4 === true && (<Link id='SubMenu-Contenido-Titulo' to="/EstadoProyectosR4" onClick={toggleMobileMenu}><li>Estado Proyectos R4</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {direccion === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownDireccion(!showDropdownDireccion)
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><HiOfficeBuilding /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Dirección</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownDireccion ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownDireccion && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksDireccion.Penalizaciones === true && (<Link id='SubMenu-Contenido-Titulo' to="/Penalizaciones" onClick={toggleMobileMenu}><li>Penalizaciones</li></Link>)}
                                                {subChecksDireccion.CentroDeCostos === true && (<Link id='SubMenu-Contenido-Titulo' to="/Centro_de_costos" onClick={toggleMobileMenu}><li>Centros de costos</li></Link>)}
                                                {subChecksDireccion.ComposicionMoviles === true && (<Link id='SubMenu-Contenido-Titulo' to="/ComposicionMoviles" onClick={toggleMobileMenu}><li>Composición móviles</li></Link>)}
                                                {subChecksDireccion.Compras === true && (<Link id='SubMenu-Contenido-Titulo' to="/Compras" onClick={toggleMobileMenu}><li>Compras</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {ssta === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownSSTA(!showDropdownSSTA)
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><FaHardHat /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">SSTA</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownSSTA ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownSSTA && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksSsta.Ssta === true && (<Link id='SubMenu-Contenido-Titulo' to="/SSTA" onClick={toggleMobileMenu}><li>SSTA</li></Link>)}
                                                {subChecksSsta.CursoDeAlturas === true && (<Link id='SubMenu-Contenido-Titulo' to="/CursosDeAlturas" onClick={toggleMobileMenu}><li>Cursos de Alturas</li></Link>)}
                                                {subChecksSsta.EntregasPendientesDotacion === true && (<Link id='SubMenu-Contenido-Titulo' to="/EntregasPendientesDotacion" onClick={toggleMobileMenu}><li>Entregas Pendientes Dotación</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {parqueAutomotor === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownParqueAutomotor(!showDropdownParqueAutomotor)
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><FaTruck /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Parque Automotor</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownParqueAutomotor ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownParqueAutomotor && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksParqueAutomotor.Moviles === true && (<Link id='SubMenu-Contenido-Titulo' to="/Moviles" onClick={toggleMobileMenu}><li>Moviles</li></Link>)}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {gestionHumana === true && (
                                <li id='SubMenu'>
                                    <div id='SubMenu-Titulo' onClick={() => {
                                        closeAllDropdowns();
                                        if (showMobileMenu === false) {
                                            toggleMobileMenu()
                                        }
                                        setShowDropdownGestionHumana(!showDropdownGestionHumana)
                                    }}>
                                        <span id='SubMenu-Titulo-Contenedor'>
                                            <span id='SubMenu-Titulo-Icono'><FaUserTie /></span>
                                            {showMobileMenu && (
                                                <div>
                                                    <span id="SubMenu-Titulo-Texto">Gestion Humana</span>
                                                    <span id="SubMenu-Titulo-Icono2">
                                                        {
                                                            showDropdownGestionHumana ? <FaChevronUp /> : <FaChevronDown />
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    {showMobileMenu && showDropdownGestionHumana && (
                                        <div id='SubMenu-Contenido'>
                                            <ul>
                                                {subChecksGestionHumana.Chatbot === true && (<Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=ChatBot" }} onClick={toggleMobileMenu}><li>ChatBot</li></Link>)}
                                                {role === 'admin' && subChecksGestionHumana.Carnetizacion === true && (<Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=Carnetizacion" }} onClick={toggleMobileMenu}><li>Carnetizacion</li></Link>) }
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}
                        </ul>

                        {showMobileMenu && (
                            <div className='Version'>
                                <p>v1.41</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Navbar;