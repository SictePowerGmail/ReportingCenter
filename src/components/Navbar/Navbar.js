import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import './Navbar.css'
import { FaBars, FaTimes, FaHome, FaChartLine, FaStar, FaTools, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { HiClipboardList, HiChartBar, HiOfficeBuilding } from "react-icons/hi";

const Navbar = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showDropdownFacturacion, setShowDropdownFacturacion] = useState(false);
    const [showDropdownProduccion, setShowDropdownProduccion] = useState(false);
    const [showDropdownIndicadores, setShowDropdownIndicadores] = useState(false);
    const [showDropdownPuntuacion, setShowDropdownPuntuacion] = useState(false);
    const [showDropdownMantenimiento, setShowDropdownMantenimiento] = useState(false);
    const [showDropdownDireccion, setShowDropdownDireccion] = useState(false);

    const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

    const closeAllDropdowns = () => {
        setShowDropdownFacturacion(false);
        setShowDropdownProduccion(false);
        setShowDropdownIndicadores(false);
        setShowDropdownPuntuacion(false);
        setShowDropdownMantenimiento(false);
        setShowDropdownDireccion(false);
    };

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
                            <Link id='SubMenu-Titulo' to='/'>
                                <span id='SubMenu-Titulo-Icono'><FaHome/></span>
                                <span id="SubMenu-Titulo-Texto">Inicio</span>
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
                                    <Link id='SubMenu-Contenido-Titulo' to="/RendimientoOperativo" onClick={toggleMobileMenu}>Rendimiento operativo</Link>
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
                                    <span id="SubMenu-Titulo-Texto">Mantenimiento</span>
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
                                    <Link id='SubMenu-Contenido-Titulo' to="/Seguimiento" onClick={toggleMobileMenu}>Seguimiento</Link>
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
                <div id='MenuContainerCerrado' onMouseEnter={() => 
                {
                    closeAllDropdowns();
                    setShowMobileMenu(true)
                }}>
                    <ul id='Menu'>
                        <li id='SubMenu'>
                            <span id='SubMenu-Titulo'>
                                <span id='SubMenu-Titulo-Icono'><FaHome/></span>
                            </span>      
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><HiClipboardList/></span>
                                </span>
                            </div>
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><HiChartBar/></span>
                                </span>
                            </div>
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><FaChartLine/></span>
                                </span>
                            </div>
                        </li>
                            
                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><FaStar/></span>
                                </span>
                            </div>
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><FaTools/></span>
                                </span>
                            </div>
                        </li>

                        <li id='SubMenu'>
                            <div id='SubMenu-Titulo'>
                                <span id='SubMenu-Titulo-Contenedor'>
                                    <span id='SubMenu-Titulo-Icono'><HiOfficeBuilding/></span>
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            )}

        </div>
        /*        <Container>
                    <Wrapper>
                        <IconContext.Provider value={{ style: { fontSize: "2em" } }}>
        
                            <LogoContainer>
                                <p>
                                    Sicte CCOT
                                </p>
                                <p>
                                    Centro de Control de Operaciones Técnicas
                                </p>
                            </LogoContainer>
                            <MobileIcon onClick={() => setShowMobileMenu(!showMobileMenu)}>
                                {
                                    showMobileMenu ? <FaTimes /> : <FaBars />
                                }
                            </MobileIcon>   
                            <Menu open={showMobileMenu}>
        
                                <DropDownLi>
                                    <StyledSubMenu to='/MantenimientoFacturacion'>
                                        Facturación
                                    </StyledSubMenu>
                                    <DropDownContent>
                                        <SubMenu to='/ConsolidadoNacionalFacturacion'>
                                            Consolidado nacional
                                        </SubMenu>
                                        <SubMenu to='/PlaneacionFacturacion'>
                                            Proyectos
                                        </SubMenu>
                                        <SubMenu to='/SeguimientoProyectos'>
                                            Seguimiento proyectos
                                        </SubMenu>
                                        <SubMenu to='/CorporativoFacturacion'>
                                            Corporativo
                                        </SubMenu>
                                        <SubMenu to='/MantenimientoFacturacion'>
                                            Mantenimiento
                                        </SubMenu>
                                        <SubMenu to='/OperacionesFacturacion'>
                                            Operaciones
                                        </SubMenu>
                                        <SubMenu to='/MinticFacturacion'>
                                            Mintic
                                        </SubMenu>
                                    </DropDownContent>
                                </DropDownLi>
        
                                <DropDownLi>
                                    <StyledSubMenu to='/RendimientoOperativo'>
                                        Producción
                                    </StyledSubMenu>
                                    <DropDownContent>
                                        <SubMenu to='/RendimientoOperativo'>
                                            Rendimiento operativo
                                        </SubMenu>
                                        <SubMenu to='/PlaneacionFinanciero'>
                                            Proyectos
                                        </SubMenu>
                                        <SubMenu to='/CorporativoFinanciero'>
                                            Corporativo
                                        </SubMenu>
                                        <SubMenu to='/MantenimientoFinanciero'>
                                            Mantenimiento
                                        </SubMenu>
                                        <SubMenu to='/ReingenieriaFinanciero'>
                                            Reingenierias
                                        </SubMenu>
                                        <SubMenu to='/OperacionesFinanciero'>
                                            Operaciones
                                        </SubMenu>
                                        
                                    </DropDownContent>
                                </DropDownLi>
        
                                <DropDownLi>
                                    <StyledSubMenu to='/MantenimientoTecnico'>
                                        Indicadores
                                    </StyledSubMenu>
                                    <DropDownContent>
                                        <SubMenu to='/HistoricoKPI'>
                                            Histórico KPI 
                                        </SubMenu>
                                        <SubMenu to='/MantenimientoTecnico'>
                                            G1 Mantenimiento
                                        </SubMenu>
                                        <SubMenu to='/Mintic'>
                                            G5 MINTIC
                                        </SubMenu>
                                        <SubMenu to='/NPS'>
                                            NPS
                                        </SubMenu>
                                    </DropDownContent>
                                </DropDownLi>
                                    
                                <DropDownLi>
                                    <StyledSubMenu to='/PlaneacionTecnico'>
                                        Puntuación
                                    </StyledSubMenu>
                                    <DropDownContent>
                                        
                                        <SubMenu to='/PlaneacionPuntuacion'>
                                            Proyectos
                                        </SubMenu>
                                        <SubMenu to='/CorporativoPuntuacion'>
                                            Corporativo
                                        </SubMenu>
                                        <SubMenu to='/MantenimientoPuntuacion'>
                                            Mantenimiento
                                        </SubMenu>
                                        <SubMenu to='/ReingenieriasPuntuacion'>
                                            Reingenierias
                                        </SubMenu>
        
                                    </DropDownContent> 
                                </DropDownLi>
        
                                <DropDownLi>
                                    <StyledSubMenu to='/MantenimientoTecnico'>
                                        Mantenimiento
                                    </StyledSubMenu>
                                    <DropDownContent>
                                        
                                        <SubMenu to='/MantenimientoBacklogFO'>
                                            Cumplimiento SLA FO
                                        </SubMenu>
                                        <SubMenu to='/MantenimientoBacklogHFC'>
                                            Cumplimiento SLA HFC
                                        </SubMenu>
                                        <SubMenu to='/MantenimientoPuntuacionTMRF'>
                                            Correctivo - Preventivo MTTO
                                        </SubMenu>
                                        <SubMenu to='/Seguimiento'>
                                            Seguimiento
                                        </SubMenu>
                                        <SubMenu to='/TorreDeControl'>
                                            Torre de control
                                        </SubMenu>
                                    </DropDownContent>
                                </DropDownLi>
        
                                <DropDownLi>
                                    <StyledSubMenu to='/Penalizaciones'>
                                        Dirección
                                    </StyledSubMenu>
                                    <DropDownContent>
                                        <SubMenu to='/Centro_de_costos'>
                                            Centros de costos
                                        </SubMenu>
                                        <SubMenu to='/Moviles'>
                                            Composición móviles
                                        </SubMenu>
                                        <SubMenu to='/Compras'>
                                            Compras
                                        </SubMenu>
                                        <SubMenu to='/STTA'>
                                            STTA
                                        </SubMenu>
        
                                    </DropDownContent>
                                </DropDownLi>
        
                            </Menu>
                        </IconContext.Provider>
                    </Wrapper>
                </Container>
        */
    );
}

export default Navbar