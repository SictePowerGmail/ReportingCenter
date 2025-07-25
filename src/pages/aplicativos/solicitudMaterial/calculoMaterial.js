import { useRef } from 'react';
import axios from 'axios';

const cacheRegistrosSolicitudMaterial = { data: null };
const cacheRegistrosEntregadoSolicitudMaterial = { data: null };

export const calculoMaterial = async (ciudadElgida, dataKgprod) => {

    try {
        let ciudad;

        if (ciudadElgida === "Manizales") {
            ciudad = ['KGPROD_MZL'];
        } else if (ciudadElgida === "Pereira Operaciones") {
            ciudad = ['KGPROD_PER'];
        } else if (ciudadElgida === "Armenia") {
            ciudad = ['KGPROD_ARM'];
        } else if (ciudadElgida === "Bogota San Cipriano Corporativo") {
            ciudad = ['KGPROD_CORP_BOG'];
        } else if (ciudadElgida === "Bogota San Cipriano Red Externa") {
            ciudad = ['KGPROD_RED_BOG'];
        } else if (ciudadElgida === "Pereira Corporativo Red Externa") {
            ciudad = ['KGPROD_PER_FO-HFC'];
        } else {
            ciudad = []
        }

        const datosFiltradosKgprod = ciudad.length ? dataKgprod.filter(item => ciudad.includes(item.Bodega)) : dataKgprod;

        if (cacheRegistrosSolicitudMaterial.data) {
            console.log("Usando datos en caché");
        } else {
            console.log("Haciendo petición a la API");
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/solicitudMaterial/registros`);
            cacheRegistrosSolicitudMaterial.data = response.data;
        }

        const datosFiltradosRegistrosSolicitudMaterial = cacheRegistrosSolicitudMaterial.data.filter(item =>
            item.ciudad === ciudadElgida &&
            item.estadoProyecto === "Abierto" &&
            item.aprobacionAnalista !== "Rechazado" &&
            item.aprobacionDirector !== "Rechazado" &&
            item.aprobacionDireccionOperacion !== "Rechazado" &&
            item.entregaBodega !== "Entregado"
        );

        const dinamicaRegistrosSolicitudMaterial = datosFiltradosRegistrosSolicitudMaterial.reduce((acumulador, item) => {
            const codigo = item.codigoSapMaterial;
            const cantidad = parseInt(item.cantidadSolicitadaMaterial, 10) || 0;

            if (acumulador[codigo]) {
                acumulador[codigo] += cantidad;
            } else {
                acumulador[codigo] = cantidad;
            }

            return acumulador;
        }, {});

        const datosFiltradosRegistrosSolicitudMaterialPendienteDespacho = cacheRegistrosSolicitudMaterial.data.filter(item =>
            item.ciudad === ciudadElgida &&
            item.estadoProyecto === "Abierto" &&
            item.entregaBodega === "Entregado"
        );

        const dinamicaRegistrosSolicitudMaterialPendienteDespacho = datosFiltradosRegistrosSolicitudMaterialPendienteDespacho.reduce((acumulador, item) => {
            const codigo = item.codigoSapMaterial;
            let cantidad = parseInt(item.cantidadRestantePorDespacho, 10) || 0;

            cantidad = Math.max(0, cantidad);

            if (acumulador[codigo]) {
                acumulador[codigo] += cantidad;
            } else {
                acumulador[codigo] = cantidad;
            }

            return acumulador;
        }, {});

        if (cacheRegistrosEntregadoSolicitudMaterial.data) {
            console.log("Usando datos en caché");
        } else {
            console.log("Haciendo petición a la API");
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/solicitudMaterial/registrosEntregados`);
            cacheRegistrosEntregadoSolicitudMaterial.data = response.data;
        }

        const datosFiltradosRegistrosEntregadoSolicitudMaterial = cacheRegistrosEntregadoSolicitudMaterial.data.filter(item => {
            if (item.ciudad !== ciudadElgida) return false;

            const fechaEntrega = new Date(item.fechaEntrega + ":00");

            const ultimaFechaDescarga = new Date(Math.max(...datosFiltradosKgprod.map(d => new Date(d['Fecha descarga']).getTime())));

            return fechaEntrega > ultimaFechaDescarga;
        });

        const dinamicaRegistrosEntregaSolicitudMaterial = datosFiltradosRegistrosEntregadoSolicitudMaterial.reduce((acumulador, item) => {
            const codigo = item.codigoSapMaterial;
            const cantidad = parseInt(item.cantidadSolicitadaMaterial, 10) || 0;

            if (acumulador[codigo]) {
                acumulador[codigo] += cantidad;
            } else {
                acumulador[codigo] = cantidad;
            }

            return acumulador;
        }, {});

        const datosRestados = datosFiltradosKgprod.map(itemKgprod => {
            const codigo = itemKgprod.codigo;
            const cantidadDisponible = parseInt(itemKgprod.candisp, 10) || 0;
            const cantidadSolicitada = Math.max(0, dinamicaRegistrosSolicitudMaterial[codigo] || 0);
            const cantidadEntregada = Math.max(0, dinamicaRegistrosEntregaSolicitudMaterial[codigo] || 0);
            const cantidadPendienteDespacho = Math.max(0, dinamicaRegistrosSolicitudMaterialPendienteDespacho[codigo] || 0);

            const nuevaCantidad = cantidadDisponible - cantidadSolicitada - cantidadEntregada - cantidadPendienteDespacho;

            return {
                ...itemKgprod,
                cantidadRestada: nuevaCantidad,
                cantidadSolicitada,
                cantidadEntregada,
                cantidadDisponible,
                cantidadPendienteDespacho
            };
        });

        return datosRestados
    } catch (error) {
        console.log(error)
    }
}