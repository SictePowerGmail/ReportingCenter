import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom';
import './navbar.css'
import { FaHardHat, FaFileAlt, FaTruck, FaBars, FaTimes, FaHome, FaChartLine, FaStar, FaTools, FaChevronDown, FaChevronUp, FaUser } from 'react-icons/fa';
import { HiClipboardList, HiChartBar, HiOfficeBuilding } from "react-icons/hi";
import Cookies from 'js-cookie';

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
    };

    useEffect(() => {
        const cedula = Cookies.get('userCedula');
        if (cedula === "" || cedula === undefined) {
            setIsLogin(false);
        } else {
            setIsLogin(true);
        }
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
            const response = await fetch('https://sicteferias.from-co.net:8120/user/login/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Cambia el tipo de contenido a application/json
                },
                body: JSON.stringify({ correo: username, contrasena: password }), // Convierte los datos a JSON
            });
    
            if (response.ok) {
                setIsOpen(false);
                setIsLogin(true);
                const data = await response.json();
                Cookies.set('token', data.role, { expires: 7 });
                Cookies.set('userCedula', data.cedula, { expires: 7 });
                Cookies.set('userNombre', data.nombre, { expires: 7 });
                Cookies.set('userCorreo', data.correo, { expires: 7 });
                Cookies.set('userTelefono', data.telefono, { expires: 7 });
                Cookies.set('userRole', data.rol, { expires: 7 });
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
        }
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
        window.location.href = '/ReportingCenter';
    };

    return (
        <div id='Contenedor'>
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
                        <span>Rol: {Cookies.get('userRole')}</span>
                        <ul>
                            <Link to="/BasesDeDatos" 
                                onClick={() => {
                                    setIsOpen(!isOpen);
                                    setShowDropdownUser(!showDropdownUser);
                                }}
                            ><li>Bases de Datos</li></Link>
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
                                    <Link id='SubMenu-Contenido-Titulo' to="/Capacidades" onClick={toggleMobileMenu}><li>Capacidades</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=supervision" }} onClick={toggleMobileMenu}><li>Supervision</li></Link>
                                </ul>
                            </div>
                        )}
                    </li>

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
                                    <Link id='SubMenu-Contenido-Titulo' to="/ConsolidadoNacionalFacturacion" onClick={toggleMobileMenu}><li>Consolidado nacional</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Proyectos" onClick={toggleMobileMenu}><li>Proyectos</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/CorporativoFacturacion" onClick={toggleMobileMenu}><li>Corporativo</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoFacturacion" onClick={toggleMobileMenu}><li>Mantenimiento</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/OperacionesFacturacion" onClick={toggleMobileMenu}><li>Operaciones</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MinticFacturacion" onClick={toggleMobileMenu}><li>Mintic</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/SMU" onClick={toggleMobileMenu}><li>SMU</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/ImplementacionesFacturacion" onClick={toggleMobileMenu}><li>Implementacion Movil</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MedicionesFacturacion" onClick={toggleMobileMenu}><li>Mediciones Movil</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/ObraCivilFacturacion" onClick={toggleMobileMenu}><li>Obra Civil Movil</li></Link>
                                </ul>
                            </div>
                        )}
                    </li>

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
                                    <Link id='SubMenu-Contenido-Titulo' to="/RendimientoOperativo" onClick={toggleMobileMenu}><li>Productividad nacional</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/PlaneacionFinanciero" onClick={toggleMobileMenu}><li>Proyectos</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/CorporativoFinanciero" onClick={toggleMobileMenu}><li>Corporativo</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoFinanciero" onClick={toggleMobileMenu}><li>Mantenimiento</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/ReingenieriaFinanciero" onClick={toggleMobileMenu}><li>Reingenierias</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/OperacionesFinanciero" onClick={toggleMobileMenu}><li>Operaciones</li></Link>
                                </ul>
                            </div>
                        )}
                    </li>

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
                                    <Link id='SubMenu-Contenido-Titulo' to="/HistoricoKPI" onClick={toggleMobileMenu}><li>Histórico KPI</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoTecnico" onClick={toggleMobileMenu}><li>G1 Mantenimiento</li></Link>
                                    {/*<Link id='SubMenu-Contenido-Titulo' to="/Mintic" onClick={toggleMobileMenu}>G5 MINTIC</Link>*/}
                                    <Link id='SubMenu-Contenido-Titulo' to="/NPS" onClick={toggleMobileMenu}><li>NPS</li></Link>
                                </ul>
                            </div>
                        )}
                    </li>

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
                                    <Link id='SubMenu-Contenido-Titulo' to="/PlaneacionPuntuacion" onClick={toggleMobileMenu}><li>Proyectos</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/CorporativoPuntuacion" onClick={toggleMobileMenu}><li>Corporativo</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoPuntuacion" onClick={toggleMobileMenu}><li>Mantenimiento</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/ReingenieriasPuntuacion" onClick={toggleMobileMenu}><li>Reingenierias</li></Link>
                                </ul>
                            </div>
                        )}
                    </li>

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
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoBacklogFO" onClick={toggleMobileMenu}><li>Cumplimiento SLA FO</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoBacklogHFC" onClick={toggleMobileMenu}><li>Cumplimiento SLA HFC</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoPuntuacionTMRF" onClick={toggleMobileMenu}><li>Correctivo - Preventivo</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Seguimiento" onClick={toggleMobileMenu}><li>Seguimiento MTTO Centro</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to={isMobile ? "/SeguimientoOperacionesMovil" : "/SeguimientoOperaciones"} onClick={toggleMobileMenu}><li>Seguimiento Operaciones</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to={isMobile ? "/SeguimientoSMUMovil" : "/SeguimientoSMU"} onClick={toggleMobileMenu}><li>Seguimiento SMU</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/SMU_Tecnico" onClick={toggleMobileMenu}><li>Técnico SMU</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/TorreDeControl" onClick={toggleMobileMenu}><li>Torre de control</li></Link>
                                </ul>
                            </div>
                        )}
                    </li>

                    <li id='SubMenu'>
                        <div id='SubMenu-Titulo' onClick={() => {
                            closeAllDropdowns();
                            if (showMobileMenu === false) {
                                toggleMobileMenu()
                            }
                            setShowDropdownLogistica(!showDropdownLogistica)
                        }}>
                            <span id='SubMenu-Titulo-Contenedor'>
                                <span id='SubMenu-Titulo-Icono'><FaTruck /></span>
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
                                    <Link id='SubMenu-Contenido-Titulo' to="/EquiposMovilesR2" onClick={toggleMobileMenu}><li>Equipos en moviles R2</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/EquiposMovilesR4" onClick={toggleMobileMenu}><li>Equipos en moviles R4</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/ConsumosOperaciones" onClick={toggleMobileMenu}><li>Consumos Operaciones</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/DesmonteMantenimiento" onClick={toggleMobileMenu}><li>Desmonte Mantenimiento</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=solicitudMaterial" }} onClick={toggleMobileMenu}><li>Solicitud de Material</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=reporteMaterialFerretero" }} onClick={toggleMobileMenu}><li>Reporte Material Ferretero</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to={{ pathname: "/Login", search: "?tipo=inventarioMaterial" }} onClick={toggleMobileMenu}><li>Inventario Material</li></Link>
                                </ul>
                            </div>
                        )}
                    </li>

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
                                    <Link id='SubMenu-Contenido-Titulo' to="/Penalizaciones" onClick={toggleMobileMenu}><li>Penalizaciones</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Centro_de_costos" onClick={toggleMobileMenu}><li>Centros de costos</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Moviles" onClick={toggleMobileMenu}><li>Composición móviles</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Compras" onClick={toggleMobileMenu}><li>Compras</li></Link>
                                </ul>
                            </div>
                        )}
                    </li>

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
                                    <Link id='SubMenu-Contenido-Titulo' to="/SSTA" onClick={toggleMobileMenu}><li>SSTA</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/CursosDeAlturas" onClick={toggleMobileMenu}><li>Cursos de Alturas</li></Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/EntregasPendientesDotacion" onClick={toggleMobileMenu}><li>Entregas Pendientes Dotación</li></Link>
                                </ul>
                            </div>
                        )}
                    </li>
                </ul>
                {showMobileMenu && (
                    <div className='Version'>
                        <p>v1.28</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Navbar;