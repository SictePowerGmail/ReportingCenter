import React, { useState } from 'react'
import {
    Container,
    LogoContainer,
    Menu,
    MobileIcon,
    Wrapper,
    DropDownContent,
    DropDownLi,
    StyledSubMenu,
    SubMenu
} from './Narbar.elements';
import {
    FaBars,
    FaTimes
} from "react-icons/fa";
import { IconContext } from 'react-icons';



const Navbar = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <Container>
            <Wrapper>
                <IconContext.Provider value={{ style: { fontSize: "2em" } }}>

                    <LogoContainer>
                        <p>
                            Sicte CCOT
                        </p>
                        <p>
                            Centro Técnico de Control
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
                                {" "}
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
                            </DropDownContent>
                        </DropDownLi>

                    <DropDownLi>
                            <StyledSubMenu to='/PlaneacionFinanciero'>
                                Producción
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
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
                                {" "}
                                <SubMenu to='/HistoricoKPI'>
                                    Histórico KPI 
                                </SubMenu>
                                <SubMenu to='/MantenimientoTecnico'>
                                    G1 Mantenimiento
                                </SubMenu>
                                <SubMenu to='/MercadoMasivo'>
                                    G2 - G8 Mercado masivo
                                </SubMenu>
                                <SubMenu to='/CorporativoKPI'>
                                    G3 - G9 Corporativo	
                                </SubMenu>
                                <SubMenu to='/SMU_Tecnico'>
                                    G4 SMU
                                </SubMenu>
                                <SubMenu to='/Mintic'>
                                    G5 MINTIC
                                </SubMenu>
                                <SubMenu to='/PlaneacionTecnico'>
                                    G6 Proyectos
                                </SubMenu>
                                <SubMenu to='/Sitios_moviles'>
                                    G7 Sitios Móviles
                                </SubMenu>
                                <SubMenu to='/Logistica_tecnico'>
                                    Logística
                                </SubMenu>
                                <SubMenu to='/NPS'>
                                    NPS - Contraseña: 4434
                                </SubMenu>
                            </DropDownContent>
                        </DropDownLi>
                        
                        <DropDownLi>
                            <StyledSubMenu to='/PlaneacionTecnico'>
                                Puntuación
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
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
                                <SubMenu to='/OperacionesPuntuacion'>
                                    Operaciones
                                </SubMenu>
                            </DropDownContent>
                            
                        </DropDownLi>

                        <DropDownLi>
                            <StyledSubMenu to='/MantenimientoTecnico'>
                                Mantenimiento
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/MantenimientoBacklogFO'>
                                    Cumplimiento SLA FO
                                </SubMenu>
                                <SubMenu to='/MantenimientoBacklogHFC'>
                                    Cumplimiento SLA HFC
                                </SubMenu>
                                <SubMenu to='/MantenimientoPuntuacionTMRF'>
                                    Correctivo - Preventivo
                                </SubMenu>
                                <SubMenu to='/PBRB_IndicadoresMantenimiento'>
                                    Informe
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
                                {" "}
                                <SubMenu to='/GestionDeNomina'>
                                    Gestión de nómina
                                </SubMenu>
                                <SubMenu to='/ParqueAutomotor'>
                                    Parque automor
                                </SubMenu>
                                <SubMenu to='/Penalizaciones'>
                                    Penalizaciones
                                </SubMenu>
                                <SubMenu to='/Centro_de_costos'>
                                    Centros de costos
                                </SubMenu>
                                <SubMenu to='/Moviles'>
                                    Composición móviles
                                </SubMenu>
                                <SubMenu to='/Compras'>
                                    Compras
                                </SubMenu>

                            </DropDownContent>
                        </DropDownLi>

                    </Menu>
                </IconContext.Provider>
            </Wrapper>
        </Container>
    );
}

export default Navbar