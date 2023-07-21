import React, { useState } from 'react'
import {
    Container,
    LogoContainer,
    Menu,
    MenuItemLink,
    MobileIcon,
    Wrapper,
    DropDownContent,
    DropDownLi,
    StyledSubMenu,
    SubMenu
} from './Narbar.elements';
import {
    FaBars,
    FaTimes,
    FaHome
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
                                    Mantenimiento
                                </SubMenu>
                                <SubMenu to='/PlaneacionTecnico'>
                                    Planeación
                                </SubMenu>
                                <SubMenu to='/CorporativoKPI'>
                                    Corporativo
                                </SubMenu>
                                <SubMenu to='/MercadoMasivo'>
                                    Mercado masivo
                                </SubMenu>
                                <SubMenu to='/SMU_Tecnico'>
                                    SMU
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
                            <StyledSubMenu to='/Mantenimiento'>
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



                    </Menu>
                </IconContext.Provider>
            </Wrapper>
        </Container>
    );
}
/*
<MenuItem>
<MenuItemLink to='/'>
    <div>
        <FaHome />
        Login
    </div>
</MenuItemLink>
</MenuItem>
*/

export default Navbar