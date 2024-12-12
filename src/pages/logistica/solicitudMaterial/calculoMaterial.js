import axios from 'axios';

export const calculoMaterial = async (ciudadElgida) => {
    try {
        const responseKgprod = await axios.get('https://sicteferias.from-co.net:8120/bodega/kgprod');
        let ciudad;

        if (ciudadElgida === "Manizales") {
            ciudad = ['KGPROD_MZL'];
        } else if (ciudadElgida === "Pereira") {
            ciudad = ['KGPROD_PER'];
        } else if (ciudadElgida === "Armenia") {
            ciudad = ['KGPROD_ARM'];
        } else if (ciudadElgida === "Bogota San Cipriano Corporativo") {
            ciudad = ['KGPROD_CORP_BOG'];
        } else if (ciudadElgida === "Bogota San Cipriano Red Externa") {
            ciudad = ['KGPROD_RED_BOG'];
        } else {
            ciudad = []
        }

        const datosFiltradosKgprod = ciudad.length ? responseKgprod.data.filter(item => ciudad.includes(item.bodega)) : responseKgprod.data;

        const responseRegistrosSolicitudMaterial = await axios.get('https://sicteferias.from-co.net:8120/solicitudMaterial/RegistrosSolicitudMaterial');

        const datosFiltradosRegistrosSolicitudMaterial = responseRegistrosSolicitudMaterial.data.filter(item =>
            item.ciudad === ciudadElgida &&
            item.estadoProyecto === "Abierto" &&
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

        const datosFiltradosRegistrosSolicitudMaterialPendienteDespacho = responseRegistrosSolicitudMaterial.data.filter(item =>
            item.ciudad === ciudadElgida &&
            item.estadoProyecto === "Abierto" &&
            item.entregaBodega === "Entregado"
        );

        const dinamicaRegistrosSolicitudMaterialPendienteDespacho = datosFiltradosRegistrosSolicitudMaterialPendienteDespacho.reduce((acumulador, item) => {
            const codigo = item.codigoSapMaterial;
            const cantidad = parseInt(item.cantidadRestantePorDespacho, 10) || 0;

            if (acumulador[codigo]) {
                acumulador[codigo] += cantidad;
            } else {
                acumulador[codigo] = cantidad;
            }

            return acumulador;
        }, {});

        const responseRegistrosEntregadoSolicitudMaterial = await axios.get('https://sicteferias.from-co.net:8120/solicitudMaterial/RegistrosEntregadosSolicitudMaterial');

        const hoy = new Date().toISOString().split("T")[0];

        const datosFiltradosRegistrosEntregadoSolicitudMaterial = responseRegistrosEntregadoSolicitudMaterial.data.filter(item =>
            item.ciudad === ciudadElgida &&
            item.fechaEntrega.slice(0, 10) === hoy
        );

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

            const cantidadSolicitada = dinamicaRegistrosSolicitudMaterial[codigo] || 0;
            const cantidadEntregada = dinamicaRegistrosEntregaSolicitudMaterial[codigo] || 0;
            const cantidadPendienteDespacho = dinamicaRegistrosSolicitudMaterialPendienteDespacho[codigo] || 0;

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