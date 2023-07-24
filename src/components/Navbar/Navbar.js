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
                            Centro de control de operaciones técnicas
                        </p>
                    </LogoContainer>
                    <MobileIcon onClick={() => setShowMobileMenu(!showMobileMenu)}>
                        {
                            showMobileMenu ? <FaTimes /> : <FaBars />
                        }
                    </MobileIcon>
                    <Menu open={showMobileMenu}>

                    <DropDownLi>
                            <StyledSubMenu to='/PlaneacionFinanciero'>
                                Producción
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/PlaneacionFinanciero'>
                                    Planeación
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
                                <SubMenu to='/SMU_Financiero'>
                                    SMU
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
                                <SubMenu to='/PlaneacionTecnico'>
                                    G6 Proyectos
                                </SubMenu>
                                <SubMenu to='/HistoricoKPI'>
                                    Histórico KPI 
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
                                    Planeación
                                </SubMenu>
                                <SubMenu to='/CorporativoPuntuacion'>
                                    Corporativo
                                </SubMenu>
                                <SubMenu to='/MantenimientoPuntuacion'>
                                    Mantenimiento
                                </SubMenu>
                            </DropDownContent>
                        </DropDownLi>

                        <DropDownLi>
                            <StyledSubMenu to='/MantenimientoTecnico'>
                                Mantenimiento
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/MantenimientoTecnico'>
                                    Técnico
                                </SubMenu>
                                <SubMenu to='/MantenimientoFinanciero'>
                                    Financiero
                                </SubMenu>
                                <SubMenu to='/MantenimientoPuntuacion'>
                                    Puntuación
                                </SubMenu>
                                <SubMenu to='/MantenimientoPuntuacionTMRF'>
                                    Correctivo - Preventivo
                                </SubMenu>
                                <SubMenu to='/PlaneacionEmpalmes'>
                                    Torre de control
                                </SubMenu>
                                <SubMenu to='/PBRB_IndicadoresMantenimiento'>
                                    Informe
                                </SubMenu>
                                <SubMenu to='/Seguimiento'>
                                    Seguimiento
                                </SubMenu>
                            </DropDownContent>
                        </DropDownLi>

                        <DropDownLi>
                            <StyledSubMenu to='/Penalizaciones'>
                                Dirección
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/Penalizaciones'>
                                    Penalizaciones
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