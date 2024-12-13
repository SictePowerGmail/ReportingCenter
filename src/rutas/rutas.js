import React, { useEffect } from "react";
import { HashRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { initGA, logPageView } from "../analytics";
import Navbar from "../components/Navbar/navbar";
/* Menu Usuario */
import BasesDeDatos from "../pages/menuUsuario/BasesDeDatos";
/* Inicio */
import Inicio from '../pages/inicio/Inicio';
/* Reportes */
import Capacidades from '../pages/reportes/capacidades/Capacidades'
import SupervisionLogin from '../pages/reportes/supervision/supervisionLogin'
import SupervisionPrincipal from "../pages/reportes/supervision/supervisionPrincipal";
import SupervisionAgregar from "../pages/reportes/supervision/supervisionAgregar";
/* Facturacion */
import FacturacionConsolidado from '../pages/facturacion/FacturacionConsolidado';
import PlaneacionFacturacion from '../pages/facturacion/PlaneacionFacturacion';
import SeguimientoProyectos from '../pages/facturacion/SeguimientoProyectos';
import CorporativoFacturacion from '../pages/facturacion/CorporativoFacturacion';
import MantenimientoFacturacion from '../pages/facturacion/MantenmimientoFacturacion';
import OperacionesFacturacion from '../pages/facturacion/OperacionesFacturacion';
import MinticFacturacion from '../pages/facturacion/MinticFacturacion';
import SMU from '../pages/facturacion/SMU';
/* Produccion */
import RendimientoOperativo from '../pages/produccion/RendimientoOperativo';
import PlaneacionFinanciero from '../pages/produccion/PlaneacionFinanciero';
import CorporativoFinanciero from '../pages/produccion/CorporativoFinanciero';
import MantenimientoFinanciero from '../pages/produccion/MantenimientoFinanciero';
import ReingenieriaFinanciero from '../pages/produccion/ReingenieriaFinanciero';
import OperacionesFinanciero from '../pages/produccion/OperacionesFinanciero';
/* Indicadores */
import HistoricoKPI from '../pages/indicadores/HistoricoKPI';
import MantenimientoTecnico from '../pages/indicadores/MantenimientoTecnico';
import Mintic from '../pages/indicadores/Mintic';
import NPS from '../pages/indicadores/NPS';
/* Puntuacion */
import PlaneacionPuntuacion from '../pages/puntuacion/PlaneacionPuntuacion';
import CorporativoPuntuacion from '../pages/puntuacion/CorporativoPuntuacion';
import MantenimientoPuntuacion from '../pages/puntuacion/MantenimientoPuntuacion';
import ReingenieriasPuntuacion from '../pages/puntuacion/ReingenieriasPuntuacion';
/* Operacion */
import BacklogFO from '../pages/operacion/Backlog_FO';
import BacklogHFC from '../pages/operacion/Backlog_HFC';
import MantenimientoPuntuacionTMRF from '../pages/operacion/MantenimientoPuntuacionTMRF';
import Seguimiento from '../pages/operacion/Seguimiento';
import SeguimientoOperaciones from "../pages/operacion/SeguimientoOperaciones";
import SeguimientoOperacionesMovil from "../pages/operacion/SeguimientoOperacionesMovil";
import SeguimientoSMU from '../pages/operacion/SeguimientoSMU';
import SeguimientoSMUMovil from '../pages/operacion/SeguimientoSMUMovil';
import SMU_Tecnico from '../pages/operacion/SMU_Tecnico';
import TorreControl from '../pages/operacion/TorreControl';
/* Logistica */
import EquiposMovilesR2 from "../pages/logistica/EquiposMovilesR2";
import EquiposMovilesR4 from "../pages/logistica/EquiposMovilesR4";
import ConsumosOperaciones from "../pages/logistica/ConsumosOperaciones";
import DesmonteMantenimiento from "../pages/logistica/DesmonteMantenimiento";
import MaterialLogin from "../pages/logistica/solicitudMaterial/materialLogin";
import MaterialPrincipal from "../pages/logistica/solicitudMaterial/materialPrincipal";
import MaterialAgregar from "../pages/logistica/solicitudMaterial/materialAgregar";
import ReporteMaterialLogin from "../pages/logistica/reporteMaterialTecnico/reporteMaterialLogin";
import ReporteMaterialPrincipal from "../pages/logistica/reporteMaterialTecnico/reporteMaterialPrincipal";
import ReporteMaterialAgregar from "../pages/logistica/reporteMaterialTecnico/reporteMaterialAgregar";
/* Direccion */
import Penalizaciones from '../pages/direccion/Penalizaciones';
import CentrosDeCostos from '../pages/direccion/CentrosDeCostos';
import Moviles from '../pages/direccion/Moviles';
import Compras from '../pages/direccion/Compras';
/* SSTA */
import SSTA from '../pages/ssta/SSTA';
import CursosDeAlturas from "../pages/ssta/CursosDeAlturas";
import EntregasPendientesDotacion from "../pages/ssta/EntregasPendientesDotacion";
/* Recuperar Contraseña */
import RecuperarContraseña from "../pages/recuperarContraseña/recuperarContraseña";

function RutasApp() {
    const location = useLocation();

    useEffect(() => {
        initGA();
        logPageView();
    }, []);

    useEffect(() => {
        logPageView();
        const pageTitle = getPageTitle(location.pathname);
        document.title = pageTitle;
    }, [location]);

    const getPageTitle = (pathname) => {
        switch (pathname) {
            /* Menu Usuario */
            case '/BasesDeDatos':
                return 'Bases De Datos';
            /* Inicio */
            case '/':
                return 'Reporting Center';
            case '/ReportingCenter':
                return 'Reporting Center';
            /* Reportes */
            case '/Capacidades':
                return 'Capacidades';
            case '/SupervisionLogin':
                return 'Supervisión';
            case '/SupervisionPrincipal':
                return 'Supervisión';
            case '/SupervisionAgregar':
                return 'Supervisión';
            /* Facturacion */
            case '/ConsolidadoNacionalFacturacion':
                return 'Consolidado Nacional Facturacion';
            case '/PlaneacionFacturacion':
                return 'Planeacion Facturacion';
            case '/SeguimientoProyectos':
                return 'Seguimiento Proyectos Facturacion';
            case '/CorporativoFacturacion':
                return 'Corporativo Facturacion';
            case '/MantenimientoFacturacion':
                return 'Mantenimiento Facturacion';
            case '/OperacionesFacturacion':
                return 'Operaciones Facturacion';
            case '/MinticFacturacion':
                return 'Mintic Facturacion';
            case '/SMU':
                return 'SMU Facturacion';
            /* Produccion */
            case '/RendimientoOperativo':
                return 'Rendimiento Operativo';
            case '/PlaneacionFinanciero':
                return 'Planeacion Financiero';
            case '/CorporativoFinanciero':
                return 'Corporativo Financiero';
            case '/MantenimientoFinanciero':
                return 'Mantenimiento Financiero';
            case '/ReingenieriaFinanciero':
                return 'Reingenieria Financiero';
            case '/OperacionesFinanciero':
                return 'Operaciones Financiero';
            /* Indicadores */
            case '/HistoricoKPI':
                return 'Historico KPI';
            case '/MantenimientoTecnico':
                return 'Mantenimiento Tecnico';
            case '/Mintic':
                return 'Mintic';
            case '/NPS':
                return 'NPS';
            /* Puntuacion */
            case '/PlaneacionPuntuacion':
                return 'Planeacion Puntuacion';
            case '/CorporativoPuntuacion':
                return 'Corporativo Puntuacion';
            case '/MantenimientoPuntuacion':
                return 'Mantenimiento Puntuacion';
            case '/ReingenieriasPuntuacion':
                return 'Reingenierias Puntuacion';
            /* Operacion */
            case '/MantenimientoBacklogFO':
                return 'Mantenimiento Backlog FO';
            case '/MantenimientoBacklogHFC':
                return 'Mantenimiento Backlog HFC';
            case '/MantenimientoPuntuacionTMRF':
                return 'Mantenimiento Puntuacion TMRF';
            case '/Seguimiento':
                return 'Seguimiento';
            case '/SeguimientoOperaciones':
                return 'Seguimiento Operaciones';
            case '/SeguimientoOperacionesMovil':
                return 'Seguimiento Operaciones Movil';
            case '/SeguimientoSMU':
                return 'Seguimiento SMU';
            case '/SeguimientoSMUMovil':
                return 'Seguimiento SMU Movil';
            case '/SMU_Tecnico':
                return 'SMU Tecnico';
            case '/TorreDeControl':
                return 'Torre De Control';
            /* Logistica */
            case '/EquiposMovilesR2':
                return 'Equipos Moviles R2';
            case '/EquiposMovilesR4':
                return 'Equipos Moviles R4';
            case '/ConsumosOperaciones':
                return 'ConsumosOperaciones';
            case '/DesmonteMantenimiento':
                return 'DesmonteMantenimiento';
            case '/MaterialLogin':
                return 'Solicitud Materiales';
            case '/MaterialPrincipal':
                return 'Solicitud Materiales';
            case '/MaterialAgregar':
                return 'Solicitud Materiales'
            case '/ReporteMaterialLogin':
                return 'Reporte Materiales Tecnico';
            case '/ReporteMaterialPrincipal':
                return 'Reporte Materiales Tecnico';
            case '/ReporteMaterialAgregar':
                return 'Reporte Materiales Tecnico'
            /* Direccion */
            case '/Penalizaciones':
                return 'Penalizaciones';
            case '/Centro_de_costos':
                return 'Centro_de_costos';
            case '/Moviles':
                return 'Moviles';
            case '/Compras':
                return 'Compras';
            /* SSTA */
            case '/SSTA':
                return 'SSTA';
            case '/CursosDeAlturas':
                return 'CursosDeAlturas';
            case '/EntregasPendientesDotacion':
                return 'EntregasPendientesDotacion'
            /* Recuperar Contrasena */
            case '/RecuperarContrasena':
                return 'RecuperarContrasena';
            default:
                return 'Validar';
        }
    };

    return (
        <>
            <Navbar />
            <Routes>
                {/* Menu Usuario */}
                <Route path='/BasesDeDatos' exact element={<BasesDeDatos />} />
                {/* Inicio */}
                <Route path='/' exact element={<Inicio />} />
                <Route path='/ReportingCenter' exact element={<Inicio />} />
                {/* Reportes */}
                <Route path='/Capacidades' exacte element={<Capacidades />} />
                <Route path='/SupervisionLogin' exacte element={<SupervisionLogin />} />
                <Route path='/SupervisionPrincipal' exacte element={<SupervisionPrincipal />} />
                <Route path='/SupervisionAgregar' exacte element={<SupervisionAgregar />} />
                {/* Facturacion */}
                <Route path='/ConsolidadoNacionalFacturacion' exacte element={<FacturacionConsolidado />} />
                <Route path='/PlaneacionFacturacion' exacte element={<PlaneacionFacturacion />} />
                <Route path='/SeguimientoProyectos' exacte element={<SeguimientoProyectos />} />
                <Route path='/CorporativoFacturacion' exacte element={<CorporativoFacturacion />} />
                <Route path='/MantenimientoFacturacion' exacte element={<MantenimientoFacturacion />} />
                <Route path='/OperacionesFacturacion' exacte element={<OperacionesFacturacion />} />
                <Route path='/MinticFacturacion' exacte element={<MinticFacturacion />} />
                <Route path='/SMU' exacte element={<SMU />} />
                {/* Produccion */}
                <Route path='/RendimientoOperativo' exacte element={<RendimientoOperativo />} />
                <Route path='/PlaneacionFinanciero' exact element={<PlaneacionFinanciero />} />
                <Route path='/CorporativoFinanciero' exact element={<CorporativoFinanciero />} />
                <Route path='/MantenimientoFinanciero' exact element={<MantenimientoFinanciero />} />
                <Route path='/ReingenieriaFinanciero' exacte element={<ReingenieriaFinanciero />} />
                <Route path='/OperacionesFinanciero' exacte element={<OperacionesFinanciero />} />
                {/* Indicadores */}
                <Route path='/HistoricoKPI' exacte element={<HistoricoKPI />} />
                <Route path='/MantenimientoTecnico' exact element={<MantenimientoTecnico />} />
                <Route path='/Mintic' exacte element={<Mintic />} />
                <Route path='/NPS' exacte element={<NPS />} />
                {/* Puntuacion */}
                <Route path='/PlaneacionPuntuacion' exact element={<PlaneacionPuntuacion />} />
                <Route path='/CorporativoPuntuacion' exact element={<CorporativoPuntuacion />} />
                <Route path='/MantenimientoPuntuacion' exact element={<MantenimientoPuntuacion />} />
                <Route path='/ReingenieriasPuntuacion' exacte element={<ReingenieriasPuntuacion />} />
                {/* Operacion */}
                <Route path='/MantenimientoBacklogFO' exacte element={<BacklogFO />} />
                <Route path='/MantenimientoBacklogHFC' exacte element={<BacklogHFC />} />
                <Route path='/MantenimientoPuntuacionTMRF' exact element={<MantenimientoPuntuacionTMRF />} />
                <Route path='/Seguimiento' exact element={<Seguimiento />} />
                <Route path='/SeguimientoOperaciones' exacte element={<SeguimientoOperaciones />} />
                <Route path='/SeguimientoOperacionesMovil' exacte element={<SeguimientoOperacionesMovil />} />
                <Route path='/SeguimientoSMU' exacte element={<SeguimientoSMU />} />
                <Route path='/SeguimientoSMUMovil' exacte element={<SeguimientoSMUMovil />} />
                <Route path='/SMU_Tecnico' exacte element={<SMU_Tecnico />} />
                <Route path='/TorreDeControl' exacte element={<TorreControl />} />
                {/* Logistica */}
                <Route path='/EquiposMovilesR2' exacte element={<EquiposMovilesR2 />} />
                <Route path='/EquiposMovilesR4' exacte element={<EquiposMovilesR4 />} />
                <Route path='/ConsumosOperaciones' exacte element={<ConsumosOperaciones />} />
                <Route path='/DesmonteMantenimiento' exacte element={<DesmonteMantenimiento />} />
                <Route path='/MaterialLogin' exacte element={<MaterialLogin />} />
                <Route path='/MaterialPrincipal' exacte element={<MaterialPrincipal />} />
                <Route path='/MaterialAgregar' exacte element={<MaterialAgregar />} />
                <Route path='/ReporteMaterialLogin' exacte element={<ReporteMaterialLogin />} />
                <Route path='/ReporteMaterialPrincipal' exacte element={<ReporteMaterialPrincipal />} />
                <Route path='/ReporteMaterialAgregar' exacte element={<ReporteMaterialAgregar />} />
                {/* Direccion */}
                <Route path='/Penalizaciones' exacte element={<Penalizaciones />} />
                <Route path='/Centro_de_costos' exacte element={<CentrosDeCostos />} />
                <Route path='/Moviles' exacte element={<Moviles />} />
                <Route path='/Compras' exacte element={<Compras />} />
                {/* SSTA */}
                <Route path='/SSTA' exacte element={<SSTA />} />
                <Route path='/CursosDeAlturas' exacte element={<CursosDeAlturas />} />
                <Route path='/EntregasPendientesDotacion' exacte element={<EntregasPendientesDotacion />} />
                {/* Recuperar Contraseña */}
                <Route path='/RecuperarContrasena' exacte element={<RecuperarContraseña />} />
            </Routes>
        </>
    );
}

export default function Rutas() {
    return (
        <Router>
            <RutasApp />
        </Router>
    );
}