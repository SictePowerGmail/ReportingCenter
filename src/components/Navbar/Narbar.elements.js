import styled from "styled-components";

export const PowerBi = styled.iframe`
    align-items: center;
    display: flex;
    justify-content: center;
    overflow: hidden;    
    height: calc(100vh - 40px);
    width: 100%;
    padding-left: 40px;
    
    @media screen and (max-width: 600px) {
        padding-left: 0px;
    }
`;

export const PowerBiPrivate = styled.iframe`
    align-items: center;
    display: flex;
    justify-content: center;
    overflow: hidden;
    height: calc(100vh - 40px);
    width: 100%;
    padding-left: 40px;

    @media screen and (max-width: 600px) {
        padding-left: 0px;
    }
`;