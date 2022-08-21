import React, { useState } from 'react'
import {
    Container,
    LogoContainer,
    Menu, MenuItem,
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
                            Sicte
                        </p>
                        <p>
                            Centro de reportes
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
                                <SubMenu to='/PlaneacionEmpalmes'>
                                    Empalmes
                                </SubMenu>
                                <SubMenu to='/ReportePlaneacion'>
                                    Reporte
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
                                <SubMenu to='/ReporteCorporativo'>
                                    Reporte
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
                            </DropDownContent>
                        </DropDownLi>

                        <DropDownLi>
                            <StyledSubMenu to='/Capacidades'>
                                Dirección
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/Capacidades'>
                                    Capacidades
                                </SubMenu>
                                <SubMenu to='/Penalizaciones'>
                                    Penalizaciones
                                </SubMenu>
                                <SubMenu to='/EstatusAlturas'>
                                    Estatus alturas
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