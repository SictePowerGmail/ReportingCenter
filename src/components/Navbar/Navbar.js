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
                            <StyledSubMenu to='/DropDown'>
                                Planeación
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/ReportePlaneacion'>
                                    Reporte
                                </SubMenu>
                                <SubMenu to='/Planeacion'>
                                    Puntuación
                                </SubMenu>
                            </DropDownContent>
                        </DropDownLi>

                        <DropDownLi>
                            <StyledSubMenu to='/DropDown'>
                                Corporativo
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/ReporteCorporativo'>
                                    Reporte
                                </SubMenu>
                                <SubMenu to='/Corporativo'>
                                    Puntuación
                                </SubMenu>
                            </DropDownContent>
                        </DropDownLi>

                        <DropDownLi>
                            <StyledSubMenu to='/DropDown'>
                                Mantenimiento
                            </StyledSubMenu>
                            <DropDownContent>
                                {" "}
                                <SubMenu to='/Mantenimiento'>
                                    Puntuación
                                </SubMenu>
                            </DropDownContent>
                        </DropDownLi>

                        <MenuItem>
                            <MenuItemLink to='/'>
                                <div>
                                    <FaHome />
                                    Login
                                </div>
                            </MenuItemLink>
                        </MenuItem>

                    </Menu>
                </IconContext.Provider>
            </Wrapper>
        </Container>
    );
}

export default Navbar