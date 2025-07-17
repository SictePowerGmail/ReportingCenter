import React, { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHardHat, FaTruck, FaBars, FaDatabase, FaUsersCog, FaSignOutAlt, FaChartLine, FaStar, FaTools, FaSearch, FaChevronLeft, FaUser, FaBoxes, FaSun, FaMoon, FaUserCog, FaChartBar, FaUserTie, FaRobot, FaIdBadge } from 'react-icons/fa';
import { HiClipboardList, HiChartBar, HiOfficeBuilding } from "react-icons/hi";
import { MdInventory2 } from "react-icons/md";
import { GiToolbox, GiStreetLight } from "react-icons/gi";
import { ThreeDots } from 'react-loader-spinner';
import './navbar.css'
import Cookies from 'js-cookie';
import axios from 'axios';
import Logo from '../../images/Logo Original.png'
import Logo2 from '../../images/Logo Original 2.png'
import SGS from '../../images/SGS.png'
import SGS2 from '../../images/SGS 2.png'
import Colombia from '../../images/Flag_Colombia.png'
import EEUU from '../../images/Flag_United_States.png'
import { useTranslation } from 'react-i18next';
import { getPageTitle } from '../../rutas/pageTitles';
import Entradas from '../entradas/entradas';

function Navbar() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showDropdownUser, setShowDropdownUser] = useState(false);
    const [showDropdownFacturacion, setShowDropdownFacturacion] = useState(false);
    const [showDropdownProductividad, setShowDropdownProductividad] = useState(false);
    const [showDropdownIndicadores, setShowDropdownIndicadores] = useState(false);
    const [showDropdownPuntuacion, setShowDropdownPuntuacion] = useState(false);
    const [showDropdownMantenimiento, setShowDropdownMantenimiento] = useState(false);
    const [showDropdownLogistica, setShowDropdownLogistica] = useState(false);
    const [showDropdownAdministracion, setShowDropdownAdministracion] = useState(false);
    const [showDropdownHseq, setShowDropdownHseq] = useState(false);
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
    const [esModoClaro, setEsModoClaro] = useState(() => {
        const cookieValue = Cookies.get('dark-Mode');
        return cookieValue === undefined ? true : cookieValue === 'true';
    });
    const { i18n, t } = useTranslation();
    const [mostrarMenuIdioma, setMostrarMenuIdioma] = useState(false);
    const location = useLocation();
    const tituloActual = getPageTitle(location.pathname) || 'Inicio';

    const closeAllDropdowns = () => {
        setShowDropdownFacturacion(false);
        setShowDropdownProductividad(false);
        setShowDropdownIndicadores(false);
        setShowDropdownPuntuacion(false);
        setShowDropdownMantenimiento(false);
        setShowDropdownLogistica(false);
        setShowDropdownAdministracion(false);
        setShowDropdownHseq(false);
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

            if (!Array.from(document.getElementsByClassName('idiomaMenu')).some(el => el.contains(event.target))) {
                setMostrarMenuIdioma(false);
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

    const [aplicativos, setAplicativos] = useState(false);
    const [subChecksAplicativos, setSubChecksAplicativos] = useState({
        Capacidades: false,
        Supervision: false,
        SolicitudDeMaterial: false,
        ReporteMaterialFerretero: false,
        ChatBot: false,
        Carnetizacion: false,
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

    const [productividad, setProductividad] = useState(false);
    const [subChecksProductividad, setSubChecksProductividad] = useState({
        Nacional: false,
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
        SeguimientoOperacionesCentro: false,
        SeguimientoOperacionesNorte: false,
        SeguimientoSmu: false,
        TecnicoSmu: false,
        EnelCronograma: false,
    });

    const [logistica, setLogistica] = useState(false);
    const [subChecksLogistica, setSubChecksLogistica] = useState({
        EquiposEnMoviles: false,
        DesmonteMantenimiento: false,
        InventarioMaterial: false,
        EstadoProyectosR4: false,
        Activos: false,
        ReporteSicte: false,
        CriticidadEquipos: false,
        EnelControlMateriales: false,
    });

    const [administracion, setAdministracion] = useState(false);
    const [subChecksAdministracion, setSubChecksAdministracion] = useState({
        Penalizaciones: false,
        CentroDeCostos: false,
        ComposicionMoviles: false,
        Compras: false,
        Capacidades: false,
    });

    const [hseq, setHseq] = useState(false);
    const [subChecksHseq, setSubChecksHseq] = useState({
        Ssta: false,
        CursoDeAlturas: false,
        EntregasPendientesDotacion: false,
        UbicacionDeActividades: false,
        InspeccionesEnel: false,
        Copasst: false,
    });

    const [parqueAutomotor, setParqueAutomotor] = useState(false);
    const [subChecksParqueAutomotor, setSubChecksParqueAutomotor] = useState({
        Moviles: false,
        GestionMantenimientos: false,
    });

    const [gestionHumana, setGestionHumana] = useState(false);
    const [subChecksGestionHumana, setSubChecksGestionHumana] = useState({
        IndicadoresChatbot: false,
    });

    const mapearGrupoDesdeUsuario = (usuario, prefijo) => {
        const subChecks = Object.entries(usuario)
            .filter(([key]) => key.startsWith(prefijo))
            .reduce((acc, [key, value]) => {
                const nombre = key.replace(prefijo, "");
                acc[nombre] = value === "1" || value === 1;
                return acc;
            }, {});

        const algunoActivo = Object.values(subChecks).some(val => val);
        return { subChecks, algunoActivo };
    };

    const cargarDatosPagesUser = async (usuario) => {
        try {
            setLoading(true);
            const responsePagesUser = await axios.get(`${process.env.REACT_APP_API_URL}/usuarios/pagesUser`);
            const data = responsePagesUser.data;
            const cedula = Cookies.get('userCedula');

            const usuarioEncontrado = data.find(user => user.cedula === cedula);

            if (usuarioEncontrado) {

                const { subChecks: checksAplicativos, algunoActivo: activoAplicativos } = mapearGrupoDesdeUsuario(usuarioEncontrado, "aplicativos");
                setSubChecksAplicativos(checksAplicativos);
                setAplicativos(activoAplicativos);

                const { subChecks: checksFacturacion, algunoActivo: activoFacturacion } = mapearGrupoDesdeUsuario(usuarioEncontrado, "facturacion");
                setSubChecksFacturacion(checksFacturacion);
                setFacturacion(activoFacturacion);

                const { subChecks: checksProductividad, algunoActivo: activoProductividad } = mapearGrupoDesdeUsuario(usuarioEncontrado, "productividad");
                setSubChecksProductividad(checksProductividad);
                setProductividad(activoProductividad);

                const { subChecks: checksIndicadores, algunoActivo: activoIndicadores } = mapearGrupoDesdeUsuario(usuarioEncontrado, "indicadores");
                setSubChecksIndicadores(checksIndicadores);
                setIndicadores(activoIndicadores);

                const { subChecks: checksHseq, algunoActivo: activoHseq } = mapearGrupoDesdeUsuario(usuarioEncontrado, "hseq");
                setSubChecksHseq(checksHseq);
                setHseq(activoHseq);

                const { subChecks: checksPuntuacion, algunoActivo: activoPuntuacion } = mapearGrupoDesdeUsuario(usuarioEncontrado, "puntuacion");
                setSubChecksPuntuacion(checksPuntuacion);
                setPuntuacion(activoPuntuacion);

                const { subChecks: checksOperacion, algunoActivo: activoOperacion } = mapearGrupoDesdeUsuario(usuarioEncontrado, "operacion");
                setSubChecksOperacion(checksOperacion);
                setOperacion(activoOperacion);

                const { subChecks: checksLogistica, algunoActivo: activoLogistica } = mapearGrupoDesdeUsuario(usuarioEncontrado, "logistica");
                setSubChecksLogistica(checksLogistica);
                setLogistica(activoLogistica);

                const { subChecks: checksAdministracion, algunoActivo: activoAdministracion } = mapearGrupoDesdeUsuario(usuarioEncontrado, "administracion");
                setSubChecksAdministracion(checksAdministracion);
                setAdministracion(activoAdministracion);

                const { subChecks: checksParqueAutomotor, algunoActivo: activoParqueAutomotor } = mapearGrupoDesdeUsuario(usuarioEncontrado, "parqueAutomotor");
                setSubChecksParqueAutomotor(checksParqueAutomotor);
                setParqueAutomotor(activoParqueAutomotor);

                const { subChecks: checksGestionHumana, algunoActivo: activoGestionHumana } = mapearGrupoDesdeUsuario(usuarioEncontrado, "gestionHumana");
                setSubChecksGestionHumana(checksGestionHumana);
                setGestionHumana(activoGestionHumana);

            } else {
                console.log("Usuario no encontrado");
            }

        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleModo = () => {
        const cambio = !esModoClaro;
        setEsModoClaro(cambio);
        Cookies.set('dark-Mode', String(cambio));
    };

    const cambiarIdioma = (idioma) => {
        i18n.changeLanguage(idioma);
        Cookies.set('idioma', idioma);
        setMostrarMenuIdioma(false);
    };

    useEffect(() => {
        const root = document.documentElement;
        if (esModoClaro) {
            root.classList.remove('dark-mode');
        } else {
            root.classList.add('dark-mode');
        }
    }, [esModoClaro]);

    return (
        <div className='contenedor'>
            <div className='barraSuperior'>
                <div className='Logo'>
                    <div className='Icono-Menu' onClick={() => {
                        closeAllDropdowns()
                        setShowMobileMenu(!showMobileMenu)
                    }}>
                        <FaBars />
                    </div>

                    <Link to="/">
                        <div className={`logo ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                            {esModoClaro ? <img src={Logo} alt="Logo" /> : <img src={Logo2} alt="Logo" />}
                        </div>
                    </Link>
                </div>

                <div className='Titulo'>
                    <Link to="/" className="link">
                        <p>
                            <strong>CCOT</strong>{tituloActual !== "Sicte CCOT" && (<span>{tituloActual}</span>)}
                        </p>
                    </Link>
                </div>

                <div className="buscador">
                    <Entradas
                        type="text"
                        placeholder="Buscar..."
                    />
                    <span className="icono-lupa"><FaSearch /></span>
                </div>

                <div className="idioma-selector">
                    <button onClick={() => setMostrarMenuIdioma(!mostrarMenuIdioma)} className="bandera-btn">
                        {i18n.language === 'es' && <img src={Colombia} alt="Colombia" />}
                        {i18n.language === 'en' && <img src={EEUU} alt="USA" />}
                    </button>
                    <div className={`idiomaMenu ${mostrarMenuIdioma ? 'abierto' : ''}`}>
                        <button className="opcionIdioma" onClick={() => cambiarIdioma('es')}>
                            <img src={Colombia} alt="Colombia" /> Español
                        </button >
                        <button className="opcionIdioma" onClick={() => cambiarIdioma('en')}>
                            <img src={EEUU} alt="USA" /> Inglés
                        </button >
                    </div>
                </div>

                <div className='modoClaro'>
                    <button onClick={toggleModo}>
                        {esModoClaro ? <FaSun color="#facc15" /> : <FaMoon color="#64748b" />}
                    </button>
                </div>

                {isLogin === true ? (
                    <div className='Login ON'>
                        <div className="circle-container"
                            onClick={() => {
                                setIsOpen(!isOpen);
                                setShowDropdownUser(!showDropdownUser);
                            }}
                        >
                            <div className="circle">{initial}</div>
                        </div>
                        <div className={`menu ${isOpen ? 'open' : ''}`}>
                            <div className="circle-container">
                                <div className="circle">{initial}</div>
                            </div>
                            <span className='Cuerpo nombre'>Hola, {name}</span>
                            <div className='linea'></div>
                            <span className='Cuerpo'>{Cookies.get('userCorreo')}</span>
                            <span className='Cuerpo'>{Cookies.get('userNombre')}</span>
                            <span className='Cuerpo'>CC: {Cookies.get('userCedula')}</span>
                            <span className='Cuerpo'>Tel: {Cookies.get('userTelefono')}</span>
                            <span className='Cuerpo'>Rol: {ObtenerTextoMejorado(Cookies.get('userRole'))}</span>
                            {role === 'admin' && (
                                <>
                                    <div className='linea'></div>
                                    <Link to="/BasesDeDatos"
                                        onClick={() => {
                                            setIsOpen(!isOpen);
                                            setShowDropdownUser(!showDropdownUser);
                                        }}
                                    ><span className='Enlace'><FaDatabase />Bases de Datos</span></Link>
                                </>
                            )}
                            {role === 'admin' && (
                                <Link to="/ControlUsuarios"
                                    onClick={() => {
                                        setIsOpen(!isOpen);
                                        setShowDropdownUser(!showDropdownUser);
                                    }}
                                ><span className='Enlace'><FaUsersCog />Control de Usuarios</span></Link>
                            )}
                            <div className='linea'></div>
                            <span className='Enlace' onClick={handleLogout}><FaSignOutAlt />Cerrar Sesión</span>
                        </div>
                    </div>
                ) : (
                    <div className='Login OFF'>
                        <div className="circle-container"
                            onClick={() => {
                                navigate('/Login?tipo=Inicio');
                            }}
                        >
                            <FaUser className="icon" />
                        </div>
                    </div>
                )}
            </div>

            <div className='lineaHorizontal'></div>

            <div className='sub-contenedor'>

                <div className={`menuLateral ${showMobileMenu ? 'abierto' : 'cerrado'}`} ref={menuRef}>
                    <div className='menu'>
                        <ul className='Menu'>
                            <span className={`sub-titulo ${showMobileMenu ? 'abierto' : 'cerrado'}`}>Aplicativos</span>
                            <li className={`SubMenu ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                {subChecksAplicativos.Capacidades === true &&
                                    (<Link className={`SubMenu-Titulo-Solo ${showMobileMenu ? 'abierto' : 'cerrado'}`} to={{ pathname: "/Login", search: "?tipo=Capacidades" }} >
                                        <span className='SubMenu-Titulo-Icono'><FaChartBar /></span>
                                        {showMobileMenu && (
                                            <span className="SubMenu-Titulo-Texto">Capacidades</span>
                                        )}
                                    </Link>)
                                }
                            </li>

                            <li className={`SubMenu ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                {subChecksAplicativos.Supervision === true &&
                                    (<Link className={`SubMenu-Titulo-Solo ${showMobileMenu ? 'abierto' : 'cerrado'}`} to={{ pathname: "/Login", search: "?tipo=supervision" }} >
                                        <span className='SubMenu-Titulo-Icono'><FaUserCog /></span>
                                        {showMobileMenu && (
                                            <span className="SubMenu-Titulo-Texto">Supervision</span>
                                        )}
                                    </Link>)
                                }
                            </li>

                            <li className={`SubMenu ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                {subChecksAplicativos.SolicitudDeMaterial === true &&
                                    (<Link className={`SubMenu-Titulo-Solo ${showMobileMenu ? 'abierto' : 'cerrado'}`} to={{ pathname: "/Login", search: "?tipo=solicitudMaterial" }} >
                                        <span className='SubMenu-Titulo-Icono'><MdInventory2 /></span>
                                        {showMobileMenu && (
                                            <span className="SubMenu-Titulo-Texto">Gestión de materiales</span>
                                        )}
                                    </Link>)
                                }
                            </li>

                            <li className={`SubMenu ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                {subChecksAplicativos.ReporteMaterialFerretero === true &&
                                    (<Link className={`SubMenu-Titulo-Solo ${showMobileMenu ? 'abierto' : 'cerrado'}`} to={{ pathname: "/Login", search: "?tipo=reporteMaterialFerretero" }} >
                                        <span className='SubMenu-Titulo-Icono'><GiToolbox /></span>
                                        {showMobileMenu && (
                                            <span className="SubMenu-Titulo-Texto">Reporte Material Ferretero</span>
                                        )}
                                    </Link>)
                                }
                            </li>

                            <li className={`SubMenu ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                {subChecksAplicativos.Chatbot === true &&
                                    (<Link className={`SubMenu-Titulo-Solo ${showMobileMenu ? 'abierto' : 'cerrado'}`} to={{ pathname: "/Login", search: "?tipo=ChatBot" }} >
                                        <span className='SubMenu-Titulo-Icono'><FaRobot /></span>
                                        {showMobileMenu && (
                                            <span className="SubMenu-Titulo-Texto">ChatBot</span>
                                        )}
                                    </Link>)
                                }
                            </li>

                            <li className={`SubMenu ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                {subChecksAplicativos.Carnetizacion === true &&
                                    (<Link className={`SubMenu-Titulo-Solo ${showMobileMenu ? 'abierto' : 'cerrado'}`} to={{ pathname: "/Login", search: "?tipo=Carnetizacion" }} >
                                        <span className='SubMenu-Titulo-Icono'><FaIdBadge /></span>
                                        {showMobileMenu && (
                                            <span className="SubMenu-Titulo-Texto">Carnetizacion</span>
                                        )}
                                    </Link>)
                                }
                            </li>

                            {/* <li className={`SubMenu ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                {subChecksAplicativos.Carnetizacion === true &&
                                    (<Link className={`SubMenu-Titulo-Solo ${showMobileMenu ? 'abierto' : 'cerrado'}`} to={{ pathname: "/Login", search: "?tipo=AlumbradoPublico" }} >
                                        <span className='SubMenu-Titulo-Icono'><GiStreetLight /></span>
                                        {showMobileMenu && (
                                            <span className="SubMenu-Titulo-Texto">Alumbrado Publico</span>
                                        )}
                                    </Link>)
                                }
                            </li> */}

                            <span className={`sub-titulo ${showMobileMenu ? 'abierto' : 'cerrado'}`}>Desempeño Financiero</span>
                            <li className={`SubMenu ${facturacion ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownFacturacion(!showDropdownFacturacion);
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
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

                            <li className={`SubMenu ${productividad ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownProductividad(!showDropdownProductividad)
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                        <span className='SubMenu-Titulo-Icono'><HiChartBar /></span>
                                        {showMobileMenu && (
                                            <div>
                                                <span className="SubMenu-Titulo-Texto">Productividad</span>
                                                <span className="SubMenu-Titulo-Icono2">
                                                    <FaChevronLeft className={`icono-flecha ${showDropdownProductividad ? 'rotado' : ''}`} />
                                                </span>
                                            </div>
                                        )}
                                    </span>
                                </div>
                                <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownProductividad ? 'visible' : 'oculto'}`}>
                                    <ul>
                                        {subChecksProductividad.Nacional === true && (<Link className='SubMenu-Contenido-Titulo' to="/ProductividadNacional" ><li>Productividad nacional</li></Link>)}
                                        {subChecksProductividad.Proyectos === true && (<Link className='SubMenu-Contenido-Titulo' to="/PlaneacionFinanciero" ><li>Proyectos</li></Link>)}
                                        {subChecksProductividad.Corporativo === true && (<Link className='SubMenu-Contenido-Titulo' to="/CorporativoFinanciero" ><li>Corporativo</li></Link>)}
                                        {subChecksProductividad.Mantenimiento === true && (<Link className='SubMenu-Contenido-Titulo' to="/MantenimientoFinanciero" ><li>Mantenimiento</li></Link>)}
                                        {subChecksProductividad.Reingenierias === true && (<Link className='SubMenu-Contenido-Titulo' to="/ReingenieriaFinanciero" ><li>Reingenierias</li></Link>)}
                                        {subChecksProductividad.Operaciones === true && (<Link className='SubMenu-Contenido-Titulo' to="/OperacionesFinanciero" ><li>Operaciones</li></Link>)}
                                    </ul>
                                </div>
                            </li>

                            <li className={`SubMenu ${indicadores ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownIndicadores(!showDropdownIndicadores)
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
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
                                        {subChecksIndicadores.Nps && (<Link className='SubMenu-Contenido-Titulo' to="/NPS" ><li>NPS</li></Link>)}
                                    </ul>
                                </div>
                            </li>

                            <span className={`sub-titulo ${showMobileMenu ? 'abierto' : 'cerrado'}`}>Rendimiento Operativo</span>
                            <li className={`SubMenu ${operacion ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownMantenimiento(!showDropdownMantenimiento)
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
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
                                        {subChecksOperacion.SeguimientoOperacionesCentro === true && (<Link className='SubMenu-Contenido-Titulo' to="/SeguimientoOperacionesCentro" ><li>Seguimiento Operaciones Centro</li></Link>)}
                                        {subChecksOperacion.SeguimientoOperacionesNorte === true && (<Link className='SubMenu-Contenido-Titulo' to="/SeguimientoOperacionesNorte" ><li>Seguimiento Operaciones Norte</li></Link>)}
                                        {subChecksOperacion.SeguimientoSmu === true && (<Link className='SubMenu-Contenido-Titulo' to="/SeguimientoSMU" ><li>Seguimiento SMU</li></Link>)}
                                        {subChecksOperacion.TecnicoSmu === true && (<Link className='SubMenu-Contenido-Titulo' to="/SMU_Tecnico" ><li>Técnico SMU</li></Link>)}
                                        {subChecksOperacion.EnelCronograma === true && (<Link className='SubMenu-Contenido-Titulo' to="/EnelCronograma" ><li>Enel Cronograma</li></Link>)}
                                    </ul>
                                </div>
                            </li>

                            <li className={`SubMenu ${puntuacion ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownPuntuacion(!showDropdownPuntuacion)
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
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

                            <li className={`SubMenu ${administracion ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownAdministracion(!showDropdownAdministracion)
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                        <span className='SubMenu-Titulo-Icono'><HiOfficeBuilding /></span>
                                        {showMobileMenu && (
                                            <div>
                                                <span className="SubMenu-Titulo-Texto">Administracion</span>
                                                <span className="SubMenu-Titulo-Icono2">
                                                    <FaChevronLeft className={`icono-flecha ${showDropdownAdministracion ? 'rotado' : ''}`} />
                                                </span>
                                            </div>
                                        )}
                                    </span>
                                </div>
                                <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownAdministracion ? 'visible' : 'oculto'}`}>
                                    <ul>
                                        {subChecksAdministracion.Penalizaciones === true && (<Link className='SubMenu-Contenido-Titulo' to="/Penalizaciones" ><li>Penalizaciones</li></Link>)}
                                        {subChecksAdministracion.CentroDeCostos === true && (<Link className='SubMenu-Contenido-Titulo' to="/Centro_de_costos" ><li>Centros de costos</li></Link>)}
                                        {subChecksAdministracion.ComposicionMoviles === true && (<Link className='SubMenu-Contenido-Titulo' to="/ComposicionMoviles" ><li>Composición móviles</li></Link>)}
                                        {subChecksAdministracion.Compras === true && (<Link className='SubMenu-Contenido-Titulo' to="/Compras" ><li>Compras</li></Link>)}
                                        {subChecksAdministracion.Capacidades === true && (<Link className='SubMenu-Contenido-Titulo' to="/CapacidadesTablero" ><li>Capacidades</li></Link>)}
                                    </ul>
                                </div>
                            </li>

                            <span className={`sub-titulo ${showMobileMenu ? 'abierto' : 'cerrado'}`}>Cadena de Suministro</span>
                            <li className={`SubMenu ${logistica ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownLogistica(!showDropdownLogistica)
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
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
                                        {subChecksLogistica.DesmonteMantenimiento === true && (<Link className='SubMenu-Contenido-Titulo' to="/DesmonteMantenimiento" ><li>Desmonte Mantenimiento</li></Link>)}
                                        {/* {subChecksLogistica.InventarioMaterial === true && (<Link className='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=inventarioMaterial" }} ><li>Inventario Material</li></Link>)} */}
                                        {subChecksLogistica.EstadoProyectosR4 === true && (<Link className='SubMenu-Contenido-Titulo' to="/EstadoProyectosR4" ><li>Estado Proyectos R4</li></Link>)}
                                        {subChecksLogistica.Activos === true && (<Link className='SubMenu-Contenido-Titulo' to="/Activos" ><li>Activos</li></Link>)}
                                        {subChecksLogistica.ReporteSicte === true && (<Link className='SubMenu-Contenido-Titulo' to="/ReporteSicte" ><li>Reporte Sicte</li></Link>)}
                                        {subChecksLogistica.CriticidadEquipos === true && (<Link className='SubMenu-Contenido-Titulo' to="/CriticidadEquipos" ><li>Criticidad Equipos</li></Link>)}
                                        {subChecksLogistica.EnelControlMateriales === true && (<Link className='SubMenu-Contenido-Titulo' to="/EnelControlMateriales" ><li>Enel Control Materiales</li></Link>)}
                                    </ul>
                                </div>
                            </li>

                            <li className={`SubMenu ${parqueAutomotor ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownParqueAutomotor(!showDropdownParqueAutomotor)
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
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
                                        {subChecksParqueAutomotor.GestionMantenimientos === true && (<Link className='SubMenu-Contenido-Titulo' to="/GestionMantenimientos" ><li>Gestion Mantenimientos</li></Link>)}
                                    </ul>
                                </div>
                            </li>

                            <span className={`sub-titulo ${showMobileMenu ? 'abierto' : 'cerrado'}`}>HSEQ</span>
                            <li className={`SubMenu ${hseq ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownHseq(!showDropdownHseq)
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                        <span className='SubMenu-Titulo-Icono'><FaHardHat /></span>
                                        {showMobileMenu && (
                                            <div>
                                                <span className="SubMenu-Titulo-Texto">HSEQ</span>
                                                <span className="SubMenu-Titulo-Icono2">
                                                    <FaChevronLeft className={`icono-flecha ${showDropdownHseq ? 'rotado' : ''}`} />
                                                </span>
                                            </div>
                                        )}
                                    </span>
                                </div>
                                <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownHseq ? 'visible' : 'oculto'}`}>
                                    <ul>
                                        {subChecksHseq.Ssta === true && (<Link className='SubMenu-Contenido-Titulo' to="/SSTA" ><li>SSTA</li></Link>)}
                                        {subChecksHseq.CursoDeAlturas === true && (<Link className='SubMenu-Contenido-Titulo' to="/CursosDeAlturas" ><li>Indicadores Capacitación</li></Link>)}
                                        {subChecksHseq.EntregasPendientesDotacion === true && (<Link className='SubMenu-Contenido-Titulo' to="/EntregasPendientesDotacion" ><li>Entregas Pendientes Dotación</li></Link>)}
                                        {subChecksHseq.UbicacionDeActividades === true && (<Link className='SubMenu-Contenido-Titulo' to="/UbicacionDeActividades" ><li>Ubicacion de Actividades</li></Link>)}
                                        {subChecksHseq.InspeccionesEnel === true && (<Link className='SubMenu-Contenido-Titulo' to="/InspeccionesEnel" ><li>Inspecciones Enel</li></Link>)}
                                        {subChecksHseq.Copasst === true && (<Link className='SubMenu-Contenido-Titulo' to="/COPASST" ><li>COPASST</li></Link>)}
                                    </ul>
                                </div>
                            </li>

                            <li className={`SubMenu ${gestionHumana ? 'visible' : 'oculto'}`}>
                                <div className='SubMenu-Titulo' onClick={() => {
                                    closeAllDropdowns();
                                    if (showMobileMenu === false) {
                                        setShowMobileMenu(true);
                                    }
                                    setShowDropdownGestionHumana(!showDropdownGestionHumana)
                                }}>
                                    <span className={`SubMenu-Titulo-Contenedor ${showMobileMenu ? 'abierto' : 'cerrado'}`}>
                                        <span className='SubMenu-Titulo-Icono'><FaUserTie /></span>
                                        {showMobileMenu && (
                                            <div>
                                                <span className="SubMenu-Titulo-Texto">Gestion humana</span>
                                                <span className="SubMenu-Titulo-Icono2">
                                                    <FaChevronLeft className={`icono-flecha ${showDropdownGestionHumana ? 'rotado' : ''}`} />
                                                </span>
                                            </div>
                                        )}
                                    </span>
                                </div>
                                <div className={`SubMenu-Contenido ${showMobileMenu && showDropdownGestionHumana ? 'visible' : 'oculto'}`}>
                                    <ul>
                                        {subChecksGestionHumana.IndicadoresChatbot === true && (<Link className='SubMenu-Contenido-Titulo' to="/IndicadoresChatbot" ><li>Indicadores Chatbot</li></Link>)}
                                    </ul>
                                </div>
                            </li>

                            <span className={`sub-titulo ${showMobileMenu ? 'abierto' : 'cerrado'}`}>Version 2.0.11</span>
                        </ul>

                        {/* <div className='Logo2'>
                            {showMobileMenu ? <img src={SGS} alt="Logo" /> : <img src={SGS2} alt="Logo" />}
                        </div> */}
                    </div>
                </div>

                <div className='lineaVertical'></div>

                <div
                    className={`overlay ${showMobileMenu ? 'visible' : ''}`}
                    onClick={() => { setShowMobileMenu(!showMobileMenu) }}
                ></div>

                <div className={`contenido ${showMobileMenu ? 'visible' : 'oculto'}`}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Navbar;