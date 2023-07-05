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
                            <StyledSubMenu to='/PlaneacionTecnico'>
                                Planeación
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/PlaneacionTecnico'>
                                    Técnico
                                </SubMenu>
                                <SubMenu to='/PlaneacionFinanciero'>
                                    Financiero
                                </SubMenu>
                                <SubMenu to='/PlaneacionPuntuacion'>
                                    Puntuación
                                </SubMenu>
                                
                            </DropDownContent>
                        </DropDownLi>

                        <DropDownLi>
                            <StyledSubMenu to='/CorporativoFinanciero'>
                                Corporativo
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}

                                <SubMenu to='/CorporativoFinanciero'>
                                    Financiero
                                </SubMenu>
                                <SubMenu to='/CorporativoPuntuacion'>
                                    Puntuación
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

                            </DropDownContent>
                        </DropDownLi>

                        <DropDownLi>
                            <StyledSubMenu to='/Capacidades'>
                                Dirección
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/Seguimiento'>
                                    Seguimiento
                                </SubMenu>
                                <SubMenu to='/Capacidades'>
                                    Capacidades
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