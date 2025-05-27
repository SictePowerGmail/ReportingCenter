import React, { useEffect } from "react";
import { HashRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { initGA, logPageView } from "../analytics";
import Navbar from "../components/Navbar/Navbar"
/* Menu Usuario */
import BasesDeDatos from "../pages/menuUsuario/BasesDeDatos";
import ControlUsuarios from "../pages/menuUsuario/ControlUsuarios";
/* Inicio */
import Inicio from '../pages/inicio/Inicio';
/* Login */
import Login from "../pages/loginAplicativos/login";
/* Reportes */
import Capacidades from "../pages/reportes/capacidades/Capacidades";
import SupervisionPrincipal from "../pages/reportes/supervision/supervisionPrincipal";
import SupervisionAgregar from "../pages/reportes/supervision/supervisionAgregar";
/* Facturacion */
import FacturacionConsolidado from '../pages/facturacion/FacturacionConsolidado';
import ProyectosFacturacion from "../pages/facturacion/ProyectosFacturacion";
import CorporativoFacturacion from '../pages/facturacion/CorporativoFacturacion';
import MantenimientoFacturacion from '../pages/facturacion/MantenmimientoFacturacion';
import OperacionesFacturacion from '../pages/facturacion/OperacionesFacturacion';
import MinticFacturacion from '../pages/facturacion/MinticFacturacion';
import SMU from '../pages/facturacion/SMU';
import ImplementacionesFacturacion from "../pages/facturacion/ImplementacionesFacturacion";
import MedicionesFacturacion from "../pages/facturacion/MedicionesFacturacion";
import ObraCivilFacturacion from "../pages/facturacion/ObraCivilFacturacion";
/* Produccion */
import ProductividadNacional from '../pages/produccion/ProductividadNacional';
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
import G2G8MasivoCentro from "../pages/indicadores/G2G8MasivoCentro";
/* Puntuacion */
import PlaneacionPuntuacion from '../pages/puntuacion/PlaneacionPuntuacion';
import CorporativoPuntuacion from '../pages/puntuacion/CorporativoPuntuacion';
import MantenimientoPuntuacion from '../pages/puntuacion/MantenimientoPuntuacion';
import ReingenieriasPuntuacion from '../pages/puntuacion/ReingenieriasPuntuacion';
/* Operacion */
import BacklogFO from '../pages/operacion/Backlog_FO';
import BacklogHFC from '../pages/operacion/Backlog_HFC';
import MantenimientoPuntuacionTMRF from '../pages/operacion/MantenimientoPuntuacionTMRF';
import RecursoOperaciones from "../pages/operacion/RecursoOperaciones";
import Seguimiento from '../pages/operacion/Seguimiento';
import SeguimientoOperacionesCentro from "../pages/operacion/SeguimientoOperacionesCentro";
import SeguimientoOperacionesNorte from "../pages/operacion/SeguimientoOperacionesNorte";
import SeguimientoSMU from '../pages/operacion/SeguimientoSMU';
import SMU_Tecnico from '../pages/operacion/SMU_Tecnico';
import TorreControl from '../pages/operacion/TorreControl';
/* Logistica */
import EquiposMoviles from "../pages/logistica/EquiposMoviles";
import ConsumosOperaciones from "../pages/logistica/ConsumosOperaciones";
import DesmonteMantenimiento from "../pages/logistica/DesmonteMantenimiento";
import MaterialPrincipal from "../pages/logistica/solicitudMaterial/materialPrincipal";
import MaterialAgregar from "../pages/logistica/solicitudMaterial/materialAgregar";
import ReporteMaterialPrincipal from "../pages/logistica/reporteMaterialFerretero/reporteMaterialPrincipal";
import ReporteMaterialAgregar from "../pages/logistica/reporteMaterialFerretero/reporteMaterialAgregar";
import InventariosMaterialPrincipal from "../pages/logistica/inventarios/inventariosMaterialPrincipal";
import InventariosMaterialAgregar from "../pages/logistica/inventarios/inventariosMaterialAgregar";
import EstadoProyectosR4 from "../pages/logistica/EstadoProyectosR4";
import Activos from "../pages/logistica/Activos";
/* Direccion */
import Penalizaciones from '../pages/direccion/Penalizaciones';
import CentrosDeCostos from '../pages/direccion/CentrosDeCostos';
import ComposicionMoviles from '../pages/direccion/ComposicionMoviles';
import Compras from '../pages/direccion/Compras';
import CapacidadesTablero from "../pages/direccion/CapacidadesTablero";
/* SSTA */
import SSTA from '../pages/ssta/SSTA';
import CursosDeAlturas from "../pages/ssta/CursosDeAlturas";
import EntregasPendientesDotacion from "../pages/ssta/EntregasPendientesDotacion";
import UbicacionDeActividades from "../pages/ssta/UbicacionDeActividades";
/* Parque Automotor */
import Moviles from "../pages/parqueAutomotor/Moviles";
/* Gestion Humana */
import ChatBot from "../pages/gestionHumana/ChatBot";
import Carnetizacion from "../pages/gestionHumana/Carnetizacion";
/* Recuperar Contraseña */
import RecuperarContraseña from "../pages/recuperarContraseña/recuperarContraseña";
import { getPageTitle } from "./pageTitles";

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

    return (
        <>
            <Routes>
                <Route path='/' exact element={<Navbar />} >
                    {/* Menu Usuario */}
                    <Route path='/BasesDeDatos' exact element={<BasesDeDatos />} />
                    <Route path='/ControlUsuarios' exact element={<ControlUsuarios />} />
                    {/* Inicio */}
                    <Route path='/' exact element={<Inicio />} />
                    <Route path='/ReportingCenter' exact element={<Inicio />} />
                    {/* Login */}
                    <Route path='/Login' exact element={<Login />} />
                    {/* Reportes */}
                    <Route path='/Capacidades' exacte element={<Capacidades />} />
                    <Route path='/SupervisionPrincipal' exacte element={<SupervisionPrincipal />} />
                    <Route path='/SupervisionAgregar' exacte element={<SupervisionAgregar />} />
                    {/* Facturacion */}
                    <Route path='/ConsolidadoNacionalFacturacion' exacte element={<FacturacionConsolidado />} />
                    <Route path='/Proyectos' exacte element={<ProyectosFacturacion />} />
                    <Route path='/CorporativoFacturacion' exacte element={<CorporativoFacturacion />} />
                    <Route path='/MantenimientoFacturacion' exacte element={<MantenimientoFacturacion />} />
                    <Route path='/OperacionesFacturacion' exacte element={<OperacionesFacturacion />} />
                    <Route path='/MinticFacturacion' exacte element={<MinticFacturacion />} />
                    <Route path='/SMU' exacte element={<SMU />} />
                    <Route path='/ImplementacionesFacturacion' exacte element={<ImplementacionesFacturacion />} />
                    <Route path='/MedicionesFacturacion' exacte element={<MedicionesFacturacion />} />
                    <Route path='/ObraCivilFacturacion' exacte element={<ObraCivilFacturacion />} />
                    {/* Produccion */}
                    <Route path='/ProductividadNacional' exacte element={<ProductividadNacional />} />
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
                    <Route path='/G2G8MasivoCentro' exacte element={<G2G8MasivoCentro />} />
                    {/* Puntuacion */}
                    <Route path='/PlaneacionPuntuacion' exact element={<PlaneacionPuntuacion />} />
                    <Route path='/CorporativoPuntuacion' exact element={<CorporativoPuntuacion />} />
                    <Route path='/MantenimientoPuntuacion' exact element={<MantenimientoPuntuacion />} />
                    <Route path='/ReingenieriasPuntuacion' exacte element={<ReingenieriasPuntuacion />} />
                    {/* Operacion */}
                    <Route path='/MantenimientoBacklogFO' exacte element={<BacklogFO />} />
                    <Route path='/MantenimientoBacklogHFC' exacte element={<BacklogHFC />} />
                    <Route path='/MantenimientoPuntuacionTMRF' exact element={<MantenimientoPuntuacionTMRF />} />
                    <Route path='/RecursoOperaciones' exact element={<RecursoOperaciones />} />
                    <Route path='/Seguimiento' exact element={<Seguimiento />} />
                    <Route path='/SeguimientoOperacionesCentro' exacte element={<SeguimientoOperacionesCentro />} />
                    <Route path='/SeguimientoOperacionesNorte' exacte element={<SeguimientoOperacionesNorte />} />
                    <Route path='/SeguimientoSMU' exacte element={<SeguimientoSMU />} />
                    <Route path='/SMU_Tecnico' exacte element={<SMU_Tecnico />} />
                    <Route path='/TorreDeControl' exacte element={<TorreControl />} />
                    {/* Logistica */}
                    <Route path='/EquiposMoviles' exacte element={<EquiposMoviles />} />
                    <Route path='/ConsumosOperaciones' exacte element={<ConsumosOperaciones />} />
                    <Route path='/DesmonteMantenimiento' exacte element={<DesmonteMantenimiento />} />
                    <Route path='/MaterialPrincipal' exacte element={<MaterialPrincipal />} />
                    <Route path='/MaterialAgregar' exacte element={<MaterialAgregar />} />
                    <Route path='/ReporteMaterialPrincipal' exacte element={<ReporteMaterialPrincipal />} />
                    <Route path='/ReporteMaterialAgregar' exacte element={<ReporteMaterialAgregar />} />
                    <Route path='/InventariosMaterialPrincipal' exacte element={<InventariosMaterialPrincipal />} />
                    <Route path='/InventariosMaterialAgregar' exacte element={<InventariosMaterialAgregar />} />
                    <Route path='/EstadoProyectosR4' exacte element={<EstadoProyectosR4 />} />
                    <Route path='/Activos' exacte element={<Activos />} />
                    {/* Direccion */}
                    <Route path='/Penalizaciones' exacte element={<Penalizaciones />} />
                    <Route path='/Centro_de_costos' exacte element={<CentrosDeCostos />} />
                    <Route path='/ComposicionMoviles' exacte element={<ComposicionMoviles />} />
                    <Route path='/Compras' exacte element={<Compras />} />
                    <Route path='/CapacidadesTablero' exacte element={<CapacidadesTablero />} />
                    {/* SSTA */}
                    <Route path='/SSTA' exacte element={<SSTA />} />
                    <Route path='/CursosDeAlturas' exacte element={<CursosDeAlturas />} />
                    <Route path='/EntregasPendientesDotacion' exacte element={<EntregasPendientesDotacion />} />
                    <Route path='/UbicacionDeActividades' exacte element={<UbicacionDeActividades />} />
                    {/* Parque Automotor */}
                    <Route path='/Moviles' exacte element={<Moviles />} />
                    {/* Gestion Humana */}
                    <Route path='/ChatBot' exacte element={<ChatBot />} />
                    <Route path='/Carnetizacion' exacte element={<Carnetizacion />} />
                    {/* Recuperar Contraseña */}
                    <Route path='/RecuperarContrasena' exacte element={<RecuperarContraseña />} />
                </Route>
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