import React, {useState} from 'react'
import { SubMenuItemLink, SubMenu, Container, LogoContainer, Menu, MenuItem, MenuItemLink, MobileIcon, Wrapper, SubMenuItem } from './Narbar.elements';
import {
    FaBars,
    FaTimes,
    FaHome,
    FaUserAlt,
    FaBriefcase,
    FaGlasses
} from "react-icons/fa";
import { IconContext } from 'react-icons';



const Navbar = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <Container>
        <Wrapper>
            <IconContext.Provider value={{ style: {fontSize: "2em"}}}>
            
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
                <MenuItem>
                    <MenuItemLink to='/Inicio'>
                        <div>
                            <FaHome />
                            Inicio
                        </div>
                    </MenuItemLink>
                </MenuItem>
                <MenuItem>
                    <MenuItemLink to='/Planeacion'>
                        <div>
                            <FaUserAlt />
                            Planeación
                        </div>
                    </MenuItemLink>
                    <SubMenu>
                        <SubMenuItem>
                            <SubMenuItemLink>Puntuación</SubMenuItemLink>
                        </SubMenuItem>
                        <SubMenuItem>
                            <SubMenuItemLink>Reporte</SubMenuItemLink>
                        </SubMenuItem>

                    </SubMenu>

                </MenuItem>
                <MenuItem>
                    <MenuItemLink to='/Corporativo'>
                        <div>
                            <FaBriefcase />
                            Corporativo
                        </div>
                    </MenuItemLink>
                    <SubMenu>
                        <SubMenuItem>
                            <SubMenuItemLink>Puntuación</SubMenuItemLink>
                        </SubMenuItem>
                        <SubMenuItem>
                            <SubMenuItemLink>Reporte</SubMenuItemLink>
                        </SubMenuItem>
                    </SubMenu>
                </MenuItem>
                <MenuItem>
                    <MenuItemLink to='/Mantenimiento'>
                        <div>
                            <FaGlasses />
                            Mantenimiento
                        </div>
                    </MenuItemLink>
                    <SubMenu>
                        <SubMenuItem>
                            <SubMenuItemLink>Puntuación</SubMenuItemLink>
                        </SubMenuItem>
                        <SubMenuItem>
                            <SubMenuItemLink>Reporte</SubMenuItemLink>
                        </SubMenuItem>
                    </SubMenu>
                </MenuItem>
                <MenuItem>
                    <MenuItemLink to='/ReporteCorporativo'>
                        <div>
                            <FaGlasses />
                            Reporte
                        </div>
                    </MenuItemLink>
                    <SubMenu>
                        <SubMenuItem>
                            <SubMenuItemLink>Puntuación</SubMenuItemLink>
                        </SubMenuItem>
                        <SubMenuItem>
                            <SubMenuItemLink>Reporte</SubMenuItemLink>
                        </SubMenuItem>
                    </SubMenu>
                </MenuItem>
            </Menu>
            </IconContext.Provider>
        </Wrapper>
    </Container>
  );
}

export default Navbar