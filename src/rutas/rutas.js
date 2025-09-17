import React, { useEffect } from "react";
import { HashRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { initGA, logPageView } from "../analytics";
import Navbar from "../components/navbar/navbar";
/* Menu Usuario */
import BasesDeDatos from "../pages/menuUsuario/BasesDeDatos";
import ControlUsuarios from "../pages/menuUsuario/ControlUsuarios";
/* Inicio */
import Inicio from '../pages/inicio/Inicio';
/* Login */
import Login from "../pages/loginAplicativos/login";
/* Aplicativos */
import Capacidades from "../pages/aplicativos/capacidades/Capacidades";
import SupervisionPrincipal from "../pages/aplicativos/supervision/supervisionPrincipal";
import SupervisionFormularioClaro from "../pages/aplicativos/supervision/supervisionFormularioClaro";
import SupervisionFormularioEnelIntegral from "../pages/aplicativos/supervision/supervisionFormularioEnelIntegral";
import SupervisionFormularioEnelAmbiental from "../pages/aplicativos/supervision/supervisionFormularioEnelAmbiental";
import SupervisionFormularioEnelBotiquin from "../pages/aplicativos/supervision/supervisionFormularioEnelBotiquin";
import SupervisionFormularioEnelElementosEmergencia from "../pages/aplicativos/supervision/supervisionFormularioEnelElementosEmergencia";
import MaterialPrincipal from "../pages/aplicativos/solicitudMaterial/materialPrincipal";
import MaterialAgregar from "../pages/aplicativos/solicitudMaterial/materialAgregar";
import ReporteMaterialPrincipal from "../pages/aplicativos/reporteMaterialFerretero/reporteMaterialPrincipal";
import ReporteMaterialAgregar from "../pages/aplicativos/reporteMaterialFerretero/reporteMaterialAgregar";
import ChatBot from "../pages/aplicativos/chatbot/ChatBot";
import Carnetizacion from "../pages/aplicativos/carnetizacion/Carnetizacion";
import AlumbradoPublico from "../pages/aplicativos/alumbradoPublico/AlumbradoPublico";
import AlumbradoPublicoDetalle from "../pages/aplicativos/alumbradoPublico/AlumbradoPublicoDetalle";
import Encuentas from "../pages/aplicativos/encuentas/encuentas";
import GestionOts from "../pages/aplicativos/gestionOts/gestionOts";
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
/* Productividad */
import ProductividadNacional from '../pages/produccion/ProductividadNacional';
import PlaneacionFinanciero from '../pages/produccion/PlaneacionFinanciero';
import CorporativoFinanciero from '../pages/produccion/CorporativoFinanciero';
import MantenimientoFinanciero from '../pages/produccion/MantenimientoFinanciero';
import ReingenieriaFinanciero from '../pages/produccion/ReingenieriaFinanciero';
import OperacionesFinanciero from '../pages/produccion/OperacionesFinanciero';
/* Indicadores */
import HistoricoKPI from '../pages/indicadores/HistoricoKPI';
import MantenimientoTecnico from '../pages/indicadores/MantenimientoTecnico';
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
import SeguimientoOperacionesCentro from "../pages/operacion/SeguimientoOperacionesCentro";
import SeguimientoOperacionesNorte from "../pages/operacion/SeguimientoOperacionesNorte";
import SeguimientoSMU from '../pages/operacion/SeguimientoSMU';
import SMU_Tecnico from '../pages/operacion/SMU_Tecnico';
import EnelCronograma from "../pages/operacion/EnelCronograma";
import OperacionesFormacion from "../pages/operacion/OperacionesFormacion";
/* Logistica */
import EquiposMoviles from "../pages/logistica/EquiposMoviles";
import DesmonteMantenimiento from "../pages/logistica/DesmonteMantenimiento";
import InventariosMaterialPrincipal from "../pages/logistica/inventarios/inventariosMaterialPrincipal";
import InventariosMaterialAgregar from "../pages/logistica/inventarios/inventariosMaterialAgregar";
import EstadoProyectosR4 from "../pages/logistica/EstadoProyectosR4";
import Activos from "../pages/logistica/Activos";
import ReporteSicte from "../pages/logistica/ReporteSicte";
import CriticidadEquipos from "../pages/logistica/CriticidadEquipos";
import EnelControlMateriales from "../pages/logistica/EnelControlMateriales";
/* Direccion */
import Penalizaciones from '../pages/direccion/Penalizaciones';
import CentrosDeCostos from '../pages/direccion/CentrosDeCostos';
import ComposicionMoviles from '../pages/direccion/ComposicionMoviles';
import Compras from '../pages/direccion/Compras';
import CapacidadesTablero from "../pages/direccion/CapacidadesTablero";
/* HSEQ */
import SSTA from '../pages/hseq/SSTA';
import CursosDeAlturas from "../pages/hseq/CursosDeAlturas";
import EntregasPendientesDotacion from "../pages/hseq/EntregasPendientesDotacion";
import UbicacionDeActividades from "../pages/hseq/UbicacionDeActividades";
import InspeccionesEnel from "../pages/hseq/InspeccionesEnel";
import COPASST from "../pages/hseq/COPASST";
/* Parque Automotor */
import Moviles from "../pages/parqueAutomotor/Moviles";
import GestionMantenimientos from "../pages/parqueAutomotor/GestionMantenimientos";
/* Recuperar Contraseña */
import RecuperarContraseña from "../pages/recuperarContraseña/recuperarContraseña";
import { getPageTitle } from "./pageTitles";
/* Gestion Humana */
import IndicadoresChatbot from "../pages/gestionHumana/IndicadoresChatbot";

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
                    {/* Aplicativos */}
                    <Route path='/Capacidades' exacte element={<Capacidades />} />
                    <Route path='/SupervisionPrincipal' exacte element={<SupervisionPrincipal />} />
                    <Route path='/SupervisionFormularioEnelIntegral' exacte element={<SupervisionFormularioEnelIntegral />} />
                    <Route path='/SupervisionFormularioEnelAmbiental' exacte element={<SupervisionFormularioEnelAmbiental />} />
                    <Route path='/SupervisionFormularioEnelBotiquin' exacte element={<SupervisionFormularioEnelBotiquin />} />
                    <Route path='/SupervisionFormularioEnelElementosEmergencia' exacte element={<SupervisionFormularioEnelElementosEmergencia />} />
                    <Route path='/SupervisionFormularioClaro' exacte element={<SupervisionFormularioClaro />} />
                    <Route path='/MaterialPrincipal' exacte element={<MaterialPrincipal />} />
                    <Route path='/MaterialAgregar' exacte element={<MaterialAgregar />} />
                    <Route path='/ReporteMaterialPrincipal' exacte element={<ReporteMaterialPrincipal />} />
                    <Route path='/ReporteMaterialAgregar' exacte element={<ReporteMaterialAgregar />} />
                    <Route path='/ChatBot' exacte element={<ChatBot />} />
                    <Route path='/Carnetizacion' exacte element={<Carnetizacion />} />
                    <Route path='/AlumbradoPublico' exacte element={<AlumbradoPublico />} />
                    <Route path='/AlumbradoPublicoDetalle' exacte element={<AlumbradoPublicoDetalle />} />
                    <Route path='/Encuentas' exacte element={<Encuentas />} />
                    <Route path='/GestionOts' exacte element={<GestionOts />} />
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
                    {/* Productividad */}
                    <Route path='/ProductividadNacional' exacte element={<ProductividadNacional />} />
                    <Route path='/PlaneacionFinanciero' exact element={<PlaneacionFinanciero />} />
                    <Route path='/CorporativoFinanciero' exact element={<CorporativoFinanciero />} />
                    <Route path='/MantenimientoFinanciero' exact element={<MantenimientoFinanciero />} />
                    <Route path='/ReingenieriaFinanciero' exacte element={<ReingenieriaFinanciero />} />
                    <Route path='/OperacionesFinanciero' exacte element={<OperacionesFinanciero />} />
                    {/* Indicadores */}
                    <Route path='/HistoricoKPI' exacte element={<HistoricoKPI />} />
                    <Route path='/MantenimientoTecnico' exact element={<MantenimientoTecnico />} />
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
                    <Route path='/OperacionesFormacion' exact element={<OperacionesFormacion />} />
                    <Route path='/SeguimientoOperacionesCentro' exacte element={<SeguimientoOperacionesCentro />} />
                    <Route path='/SeguimientoOperacionesNorte' exacte element={<SeguimientoOperacionesNorte />} />
                    <Route path='/SeguimientoSMU' exacte element={<SeguimientoSMU />} />
                    <Route path='/SMU_Tecnico' exacte element={<SMU_Tecnico />} />
                    <Route path='/EnelCronograma' exacte element={<EnelCronograma />} />
                    {/* Logistica */}
                    <Route path='/EquiposMoviles' exacte element={<EquiposMoviles />} />
                    <Route path='/DesmonteMantenimiento' exacte element={<DesmonteMantenimiento />} />
                    <Route path='/InventariosMaterialPrincipal' exacte element={<InventariosMaterialPrincipal />} />
                    <Route path='/InventariosMaterialAgregar' exacte element={<InventariosMaterialAgregar />} />
                    <Route path='/EstadoProyectosR4' exacte element={<EstadoProyectosR4 />} />
                    <Route path='/Activos' exacte element={<Activos />} />
                    <Route path='/ReporteSicte' exacte element={<ReporteSicte />} />
                    <Route path='/CriticidadEquipos' exacte element={<CriticidadEquipos />} />
                    <Route path='/EnelControlMateriales' exacte element={<EnelControlMateriales />} />
                    {/* Direccion */}
                    <Route path='/Penalizaciones' exacte element={<Penalizaciones />} />
                    <Route path='/Centro_de_costos' exacte element={<CentrosDeCostos />} />
                    <Route path='/ComposicionMoviles' exacte element={<ComposicionMoviles />} />
                    <Route path='/Compras' exacte element={<Compras />} />
                    <Route path='/CapacidadesTablero' exacte element={<CapacidadesTablero />} />
                    {/* HSEQ */}
                    <Route path='/SSTA' exacte element={<SSTA />} />
                    <Route path='/CursosDeAlturas' exacte element={<CursosDeAlturas />} />
                    <Route path='/EntregasPendientesDotacion' exacte element={<EntregasPendientesDotacion />} />
                    <Route path='/UbicacionDeActividades' exacte element={<UbicacionDeActividades />} />
                    <Route path='/InspeccionesEnel' exacte element={<InspeccionesEnel />} />
                    <Route path='/COPASST' exacte element={<COPASST />} />
                    {/* Parque Automotor */}
                    <Route path='/Moviles' exacte element={<Moviles />} />
                    <Route path='/GestionMantenimientos' exacte element={<GestionMantenimientos />} />
                    {/* Gestion Humana */}
                    <Route path='/IndicadoresChatbot' exacte element={<IndicadoresChatbot />} />
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