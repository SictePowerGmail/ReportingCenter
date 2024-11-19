import axios from 'axios';

const obtenerDirectores = async () => {
    try {
        const response = await axios.get('https://sicteferias.from-co.net:8120/user');
        const usuarios = response.data;

        const directores = usuarios
            .filter(usuario => usuario.rol !== 'SUPERVISION')
            .filter(usuario => usuario.rol !== 'COORDINACION')
            .filter(usuario => usuario.rol !== 'BODEGA')
            .filter(usuario => usuario.rol !== 'admin')
            .map(usuario => usuario.rol);

        
        return directores;
    } catch (error) {
        console.error("Error al obtener la lista de directores:", error);
        return [];
    }
};

let directores = [];

const cargarDirectores = async () => {
    directores = await obtenerDirectores();
};

cargarDirectores();

export const ObtenerRolUsuario = (rol) => {
    if (rol === 'SUPERVISION') {
        return "SUPERVISION";
    } else if (rol === 'COORDINACION') {
        return "COORDINACION";
    } else if (directores.includes(rol)) {
        return "DIRECTOR";
    } else if (rol === 'BODEGA') {
        return "BODEGA";
    } else if (rol === 'admin') {
        return "admin";
    } else {
        return "SIN ROL"
    }
};

const relacionPersonalDirectores = {
    'Brayan Castelblanco': "Johana Carvajal",
    'Brayan Barrera': "John Castillo",
    'Sergio Garcia': "John Castillo"
};

export const ObtenerRelacionPersonalDirectores = (usuario) => {
    return relacionPersonalDirectores[usuario];
};