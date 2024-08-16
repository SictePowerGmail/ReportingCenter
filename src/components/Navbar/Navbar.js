import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import './Navbar.css'
import { FaCogs, FaBars, FaTimes, FaHome, FaChartLine, FaStar, FaTools, FaChevronDown, FaChevronUp, FaEye } from 'react-icons/fa';
import { HiClipboardList, HiChartBar, HiOfficeBuilding } from "react-icons/hi";

function Navbar() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showDropdownFacturacion, setShowDropdownFacturacion] = useState(false);
    const [showDropdownProduccion, setShowDropdownProduccion] = useState(false);
    const [showDropdownIndicadores, setShowDropdownIndicadores] = useState(false);
    const [showDropdownPuntuacion, setShowDropdownPuntuacion] = useState(false);
    const [showDropdownMantenimiento, setShowDropdownMantenimiento] = useState(false);
    const [showDropdownDireccion, setShowDropdownDireccion] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

    const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

    const closeAllDropdowns = () => {
        setShowDropdownFacturacion(false);
        setShowDropdownProduccion(false);
        setShowDropdownIndicadores(false);
        setShowDropdownPuntuacion(false);
        setShowDropdownMantenimiento(false);
        setShowDropdownDireccion(false);
    };

    useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth < 600);
        };
    
        // Escuchar el evento de cambio de tamaño
        window.addEventListener('resize', handleResize);
    
        // Limpiar el evento al desmontar el componente
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, [window.innerWidth]);

    return (
        <div id='Contenedor'>
            <div id='Icono-Menu' onClick={() => setShowMobileMenu(!showMobileMenu)}>
                {
                    showMobileMenu ? <FaTimes /> : <FaBars />
                }
            </div>
            <div id='Titulo'>
                <p>
                    Sicte CCOT
                </p>
                <p>
                    Centro de Control de Operaciones Técnicas
                </p>
            </div>
            {showMobileMenu && (
                <div id='MenuContainer'>
                    <ul id='Menu'>
                        <li id='SubMenu'>
                            <Link id='SubMenu-Titulo' to='/' onClick={toggleMobileMenu}>
                                <span id='SubMenu-Titulo-Icono'><FaHome/></span>
                                <span id="SubMenu-Titulo-Texto">Inicio</span>
                            </Link>      
                        </li>

                        <li id='SubMenu'>
                            <Link id='SubMenu-Titulo' to='/Capacidades' onClick={toggleMobileMenu}>
                                <span id='SubMenu-Titulo-Icono'><FaCogs/></span>
                                <span id="SubMenu-Titulo-Texto">Capacidades</span>
                            </Link>  
                        </li>
                        
                        <li id='SubMenu'>
                            <Link id='SubMenu-Titulo' to='/SupervisionLogin' onClick={toggleMobileMenu}>
                                <span id='SubMenu-Titulo-Icono'><FaEye /></span>
                                <span id="SubMenu-Titulo-Texto">Supervision</span>
                            </Link>  
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo' onClick={() => {
                                closeAllDropdowns();
                                setShowDropdownFacturacion(!showDropdownFacturacion);
                            }}>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><HiClipboardList /></span>
                                    <span id="SubMenu-Titulo-Texto">Facturación</span>
                                    <span id="SubMenu-Titulo-Icono2">
                                        {
                                            showDropdownFacturacion ? <FaChevronUp /> : <FaChevronDown />
                                        }
                                    </span>
                                </span>
                            </div>
                            {showDropdownFacturacion && (
                                <div id='SubMenu-Contenido'>
                                    <Link id='SubMenu-Contenido-Titulo' to="/ConsolidadoNacionalFacturacion" onClick={toggleMobileMenu}>Consolidado nacional</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/PlaneacionFacturacion" onClick={toggleMobileMenu}>Proyectos</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/SeguimientoProyectos" onClick={toggleMobileMenu}>Seguimiento proyectos</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/CorporativoFacturacion" onClick={toggleMobileMenu}>Corporativo</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoFacturacion" onClick={toggleMobileMenu}>Mantenimiento</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/OperacionesFacturacion" onClick={toggleMobileMenu}>Operaciones</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MinticFacturacion" onClick={toggleMobileMenu}>Mintic</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/SMU" onClick={toggleMobileMenu}>SMU</Link>
                                </div>
                            )}
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo' onClick={() => 
                            {   
                                closeAllDropdowns();
                                setShowDropdownProduccion(!showDropdownProduccion)
                            }}>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><HiChartBar/></span>
                                    <span id="SubMenu-Titulo-Texto">Producción</span>
                                    <span id="SubMenu-Titulo-Icono2">
                                        {
                                            showDropdownProduccion ? <FaChevronUp /> : <FaChevronDown />
                                        }
                                    </span>
                                </span>
                            </div>
                            {showDropdownProduccion && (
                                <div id='SubMenu-Contenido'>
                                    <Link id='SubMenu-Contenido-Titulo' to="/RendimientoOperativo" onClick={toggleMobileMenu}>Productividad nacional</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/PlaneacionFinanciero" onClick={toggleMobileMenu}>Proyectos</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/CorporativoFinanciero" onClick={toggleMobileMenu}>Corporativo</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoFinanciero" onClick={toggleMobileMenu}>Mantenimiento</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/ReingenieriaFinanciero" onClick={toggleMobileMenu}>Reingenierias</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/OperacionesFinanciero" onClick={toggleMobileMenu}>Operaciones</Link>
                                </div>
                            )}
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo' onClick={() => 
                            {
                                closeAllDropdowns();
                                setShowDropdownIndicadores(!showDropdownIndicadores)
                            }}>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><FaChartLine/></span>
                                    <span id="SubMenu-Titulo-Texto">Indicadores</span>
                                    <span id="SubMenu-Titulo-Icono2">
                                        {
                                            showDropdownIndicadores ? <FaChevronUp /> : <FaChevronDown />
                                        }
                                    </span>
                                </span>
                            </div>
                            {showDropdownIndicadores && (
                                <div id='SubMenu-Contenido'>
                                    <Link id='SubMenu-Contenido-Titulo' to="/HistoricoKPI" onClick={toggleMobileMenu}>Histórico KPI</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoTecnico" onClick={toggleMobileMenu}>G1 Mantenimiento</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Mintic" onClick={toggleMobileMenu}>G5 MINTIC</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/NPS" onClick={toggleMobileMenu}>NPS</Link>
                                </div>
                            )}
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo' onClick={() => 
                            {   
                                closeAllDropdowns();
                                setShowDropdownPuntuacion(!showDropdownPuntuacion)
                            }}>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><FaStar/></span>
                                    <span id="SubMenu-Titulo-Texto">Puntuación</span>
                                    <span id="SubMenu-Titulo-Icono2">
                                        {
                                            showDropdownPuntuacion ? <FaChevronUp /> : <FaChevronDown />
                                        }
                                    </span>
                                </span>
                            </div>
                            {showDropdownPuntuacion && (
                                <div id='SubMenu-Contenido'>
                                    <Link id='SubMenu-Contenido-Titulo' to="/PlaneacionPuntuacion" onClick={toggleMobileMenu}>Proyectos</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/CorporativoPuntuacion" onClick={toggleMobileMenu}>Corporativo</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoPuntuacion" onClick={toggleMobileMenu}>Mantenimiento</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/ReingenieriasPuntuacion" onClick={toggleMobileMenu}>Reingenierias</Link>
                                </div> 
                            )}
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo' onClick={() => 
                            {
                                closeAllDropdowns();
                                setShowDropdownMantenimiento(!showDropdownMantenimiento)
                            }}>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><FaTools/></span>
                                    <span id="SubMenu-Titulo-Texto">Operación</span>
                                    <span id="SubMenu-Titulo-Icono2">
                                        {
                                            showDropdownMantenimiento ? <FaChevronUp /> : <FaChevronDown />
                                        }
                                    </span>
                                </span>
                            </div>
                            {showDropdownMantenimiento && (
                                <div id='SubMenu-Contenido'>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoBacklogFO" onClick={toggleMobileMenu}>Cumplimiento SLA FO</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoBacklogHFC" onClick={toggleMobileMenu}>Cumplimiento SLA HFC</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/MantenimientoPuntuacionTMRF" onClick={toggleMobileMenu}>Correctivo - Preventivo</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Seguimiento" onClick={toggleMobileMenu}>Seguimiento MTTO Centro</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to={isMobile ? "/SeguimientoOperacionesMovil" : "/SeguimientoOperaciones"} onClick={toggleMobileMenu}>Seguimiento Operaciones</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to={isMobile ? "/SeguimientoSMUMovil" : "/SeguimientoSMU"} onClick={toggleMobileMenu}>Seguimiento SMU</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/SMU_Tecnico" onClick={toggleMobileMenu}>Técnico SMU</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/TorreDeControl" onClick={toggleMobileMenu}>Torre de control</Link>
                                </div>
                            )}
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo' onClick={() => 
                            {
                                closeAllDropdowns();
                                setShowDropdownDireccion(!showDropdownDireccion)
                            }}>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><HiOfficeBuilding/></span>
                                    <span id="SubMenu-Titulo-Texto">Dirección</span>
                                    <span id="SubMenu-Titulo-Icono2">
                                        {
                                            showDropdownDireccion ? <FaChevronUp /> : <FaChevronDown />
                                        }
                                    </span>
                                </span>
                            </div>
                            {showDropdownDireccion && (
                                <div id='SubMenu-Contenido'>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Penalizaciones" onClick={toggleMobileMenu}>Penalizaciones</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Centro_de_costos" onClick={toggleMobileMenu}>Centros de costos</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Moviles" onClick={toggleMobileMenu}>Composición móviles</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/Compras" onClick={toggleMobileMenu}>Compras</Link>
                                    <Link id='SubMenu-Contenido-Titulo' to="/STTA" onClick={toggleMobileMenu}>STTA</Link>
                                </div>
                            )}
                        </li>

                    </ul>
                </div>
            )}

            {!showMobileMenu && (
                <div id='MenuContainerCerrado' onClick={() => 
                {
                    closeAllDropdowns();
                    setShowMobileMenu(true)
                }}>
                    <ul id='Menu'>
                        <li id='SubMenu'>
                            <span id='SubMenu-Titulo-Cerrado'>
                                <span id='SubMenu-Titulo-Icono'><FaHome/></span>
                            </span>      
                        </li>

                        <li id='SubMenu'>
                            <span id='SubMenu-Titulo-Cerrado'>
                                <span id='SubMenu-Titulo-Icono'><FaCogs/></span>
                            </span>
                        </li>

                        <li id='SubMenu'>
                            <span id='SubMenu-Titulo-Cerrado'>
                                <span id='SubMenu-Titulo-Icono'><FaEye/></span>
                            </span>
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo-Cerrado'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><HiClipboardList/></span>
                                </span>
                            </div>
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo-Cerrado'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><HiChartBar/></span>
                                </span>
                            </div>
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo-Cerrado'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><FaChartLine/></span>
                                </span>
                            </div>
                        </li>
                            
                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo-Cerrado'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><FaStar/></span>
                                </span>
                            </div>
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo-Cerrado'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><FaTools/></span>
                                </span>
                            </div>
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo-Cerrado'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><HiOfficeBuilding/></span>
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            )}

        </div>
    );
}

export default Navbar;