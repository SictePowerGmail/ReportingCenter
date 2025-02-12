import axios from 'axios';

const obtenerDirectores = async () => {
    try {
        const response = await axios.get('https://sicteferias.from-co.net:8120/user');
        const usuarios = response.data;

        const directores = usuarios
            .filter(usuario => usuario.rol !== 'SUPERVISION')
            .filter(usuario => usuario.rol !== 'COORDINACION')
            .filter(usuario => usuario.rol !== 'BODEGA')
            .filter(usuario => usuario.rol !== 'LOGISTICA')
            .filter(usuario => usuario.rol !== 'FACTURACION')
            .filter(usuario => usuario.rol !== 'admin')
            .filter(usuario => usuario.rol !== 'CAROLINA FERNANDEZ')
            .map(usuario => usuario.rol);

        return directores;
    } catch (error) {
        console.error("Error al obtener la lista de directores:", error);
        return [];
    }
};

let directores = [];

export const cargarDirectores = async () => {
    directores = await obtenerDirectores();
};

export const ObtenerRolUsuario = (rol) => {
    if (rol === 'SUPERVISION') {
        return "SUPERVISION";
    } else if (rol === 'COORDINACION') {
        return "COORDINACION";
    } else if (rol === 'BODEGA') {
        return "BODEGA";
    } else if (rol === 'LOGISTICA') {
        return "LOGISTICA";
    } else if (rol === 'CAROLINA FERNANDEZ') {
        return "CAROLINA FERNANDEZ";
    } else if (rol === 'admin') {
        return "admin";
    } else if (rol === 'FACTURACION') {
        return "FACTURACION";
    } else if (directores.includes(rol)) {
        return "DIRECTOR";
    } else {
        return "SIN ROL"
    }
};

const obtenerRelacionPersonal = async () => {
    try {
        const response = await axios.get('https://sicteferias.from-co.net:8120/solicitudMaterial/RelacionPersonal');

        return response.data;
    } catch (error) {
        console.error("Error al obtener la lista de directores:", error);
        return [];
    }
};

let RelacionPersonal = [];

export const cargarRelacionPersonal = async () => {
    RelacionPersonal = await obtenerRelacionPersonal();
};

export const ObtenerRelacionPersonalDirectores = (usuario) => {
    const registro = RelacionPersonal.find(item => item.coordinador === usuario || item.supervisor === usuario);
    return registro ? registro.director : null;
};

export const ObtenerRelacionCiudadBodega = (usuario) => {
    const registro = RelacionPersonal.find(item => item.bodega === usuario);
    return registro ? registro.ciudad : null;
};

export const ObtenerRelacionCiudadFacturacion = (usuario) => {
    const registros = RelacionPersonal.filter(item => item.facturacion === usuario);
    return registros.length > 0 ? registros.map(item => item.ciudad) : [];
};

export const ObtenerRelacionCoordinadorAnalistaLogistica = (usuario) => {
    const registros = RelacionPersonal.filter(item => item.coordinador === usuario || item.supervisor === usuario)
    return registros.length > 0 ? registros.map(item => item.analistaLogistica) : [];
};