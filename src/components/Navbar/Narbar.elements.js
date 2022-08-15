import styled from "styled-components";
import { Link } from 'react-router-dom';

export const Container = styled.div`
    width: 100%;
    height: 50px;
    background-color: #23394d; ;
    `;

export const Wrapper = styled.div`
    width: 100%;
    max-width: 1300px;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: auto;
    `;

export const LogoContainer = styled.div`
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    font.size: 1.2rem;
    font-family: sans-serif;

    p {
        &:nth-child(1){
            font-size: 1.5rem;
            font-weight: 500;
            color: #fff;
        }

        &:nth-child(2){
            margin-left: 15px;
            color: #e07924;
        }
    }

    svg{
        fill: #e07924;
        margin-right: 0.5rem;
    }
    `;

export const Menu = styled.ul`
    height: 100%;
    display: flex;
    justify-content: space-between;
    list-style: none;

    @media screen and (max-width: 960px) {
        background-color: #23394d;
        position: absolute;
        top: 70px;
        left: ${({open})=> open ? "0" : "-100%"};
        width: 100%;
        height: 90vh;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        transition: 0.5s all ease;
    }
    `;

export const MenuItem = styled.li`
    height: 100%;
    

    @media screen and (max-width: 960px) {
        width: 100%;
        height: 70px;
        display: flex;
        justify-content: center;
        align-items:center;
    }
    `;

export const MenuItemLink = styled(Link)`
    text-decoration:none;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0.5rem 2.5rem;
    color: #64b2ff;
    font-family: sans-serif;
    font-size: 1rem;
    font-weight: 300;
    cursor: pointer;
    transition: 0.5s all ease;

    &:hover {
        color: #fff;
        background-color: #e0792a;
        transition: 0.5s all ease;

        div{
            svg{
                fill: #23394d;
            }
        }
    }

    div{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        svg{
            display: none;
            fill: #e0792a;
            margin-right: 0.5rem;
        }
    }



    @media screen and (max-width: 960px){
        width: 100%;

        div{
            width: 30%;
            justify-content: left;

            svg{
                display: flex;
            }
        }
    }
    `;

    export const MobileIcon = styled.div`
        display: none;
        @media screen and (max-width: 960px){
            display: flex;
            align-items: center;
            cursor: pointer;

            svg {
                fill: #e07924;
                margin-right: 0.5rem;
            }
        }
        `;

    export const PowerBi = styled.iframe`
    height: calc(100vh - 10px);
    width: 100%;
    `;

    export const DropDownContent = styled.div`
    display: none;
    position: absolute;
    min-width: 131px;
    z-index: 1;
`;

export const DropDownLi = styled.li`

    display: inline-block;
    &:hover ${DropDownContent} {
        display: block;
    }
`;

export const StyledSubMenu = styled(Link)`
    display: inline-block;
    text-align: center;
    text-decoration: none;
    color: #64b2ff;
    padding: 13px;
    min-width: 131px;
    font.size: 1.2rem;
    font-family: sans-serif;
    &:hover {
        color: #fff;
        background-color: #e0792a;
        transition: 0.5s all ease;

        div{
            svg{
                fill: #23394d;
            }
        }
    }
`;

export const SubMenu = styled(Link)`
    text-decoration: none;
    display: block;
    text-align: left;
    background-color: #23394d;
    padding: 10px;
    color: #64b2ff;
    font.size: 1.2rem;
    font-family: sans-serif;

    &:hover {
        color: #fff;
        background-color: #e0792a;
        transition: 0.5s all ease;

        div{
            svg{
                fill: #23394d;
            }
        }
    }
`;