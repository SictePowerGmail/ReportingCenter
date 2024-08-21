import React, { useEffect } from "react";
import { initGA, logPageView } from "./analytics";
import Navbar from "./components/Navbar/Navbar";
import { HashRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import CorporativoPuntuacion from './pages/CorporativoPuntuacion';
import CorporativoFinanciero from './pages/CorporativoFinanciero';
import PlaneacionFinanciero from './pages/PlaneacionFinanciero';
import PlaneacionPuntuacion from './pages/PlaneacionPuntuacion';
import MantenimientoTecnico from './pages/MantenimientoTecnico';
import MantenimientoFinanciero from './pages/MantenimientoFinanciero';
import MantenimientoPuntuacion from './pages/MantenimientoPuntuacion';
import MantenimientoPuntuacionTMRF from './pages/MantenimientoPuntuacionTMRF';
import Seguimiento from './pages/Seguimiento';
import PlaneacionFacturacion from './pages/PlaneacionFacturacion';
import Inicio from './pages/Inicio';
import HistoricoKPI from './pages/HistoricoKPI';
import OperacionesFinanciero from './pages/OperacionesFinanciero';
import ReingenieriaFinanciero from './pages/ReingenieriaFinanciero';
import CentrosDeCostos from './pages/CentrosDeCostos';
import BacklogFO from './pages/Backlog_FO';
import Moviles from './pages/Moviles';
import Mintic from './pages/Mintic';
import NPS from './pages/NPS';
import BacklogHFC from './pages/Backlog_HFC';
import ReingenieriasPuntuacion from './pages/ReingenieriasPuntuacion';
import TorreControl from './pages/TorreControl';
import MantenimientoFacturacion from './pages/MantenmimientoFacturacion';
import OperacionesFacturacion from './pages/OperacionesFacturacion';
import CorporativoFacturacion from './pages/CorporativoFacturacion';
import FacturacionConsolidado from './pages/FacturacionConsolidado';
import Compras from './pages/Compras';
import SeguimientoProyectos from './pages/SeguimientoProyectos';
import MinticFacturacion from './pages/MinticFacturacion';
import STTA from './pages/STTA';
import RendimientoOperativo from './pages/RendimientoOperativo';
import SeguimientoSMU from './pages/SeguimientoSMU';
import SeguimientoSMUMovil from './pages/SeguimientoSMUMovil';
import SMU from './pages/SMU';
import Capacidades from './pages/Capacidades'
import SMU_Tecnico from './pages/SMU_Tecnico';
import Penalizaciones from './pages/Penalizaciones';
import SupervisionLogin from './supervision/SupervisionLogin'
import SupervisionPrincipal from "./supervision/SupervisionPrincipal";
import SupervisionAgregar from "./supervision/SupervisionAgregar";
import SeguimientoOperaciones from "./pages/SeguimientoOperaciones";
import SeguimientoOperacionesMovil from "./pages/SeguimientoOperacionesMovil";
import EquiposMovilesR2 from "./pages/EquiposMovilesR2";
import EquiposMovilesR4 from "./pages/EquiposMovilesR4";

//4434

function App() {
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
      /* Direccion */
      case '/Penalizaciones':
        return 'Penalizaciones';
      case '/Centro_de_costos':
        return 'Centro_de_costos';
      case '/Moviles':
        return 'Moviles';
      case '/Compras':
        return 'Compras';
      case '/STTA':
        return 'STTA';
      default:
        return 'Validar';
    }
  };

  return (
    <>
      <Navbar />
      <Routes>
        {/* Inicio */}
        <Route path='/' exact element={<Inicio />} />
        <Route path='/ReportingCenter' exact element={<Inicio />} />
        {/* Reportes */}
        <Route path='/Capacidades' exacte element={<Capacidades/>} />
        <Route path='/SupervisionLogin' exacte element={<SupervisionLogin/>} />
        <Route path='/SupervisionPrincipal' exacte element={<SupervisionPrincipal/>} />
        <Route path='/SupervisionAgregar' exacte element={<SupervisionAgregar/>} />
        {/* Facturacion */}
        <Route path='/ConsolidadoNacionalFacturacion' exacte element={<FacturacionConsolidado />} />
        <Route path='/PlaneacionFacturacion' exacte element={<PlaneacionFacturacion />} />
        <Route path='/SeguimientoProyectos' exacte element={<SeguimientoProyectos/>} />
        <Route path='/CorporativoFacturacion' exacte element={<CorporativoFacturacion />} />
        <Route path='/MantenimientoFacturacion' exacte element={<MantenimientoFacturacion />} />
        <Route path='/OperacionesFacturacion' exacte element={<OperacionesFacturacion />} />
        <Route path='/MinticFacturacion' exacte element={<MinticFacturacion/>} />
        <Route path='/SMU' exacte element={<SMU/>} />
        {/* Produccion */}
        <Route path='/RendimientoOperativo' exacte element={<RendimientoOperativo/>} />
        <Route path='/PlaneacionFinanciero' exact element={<PlaneacionFinanciero />} />
        <Route path='/CorporativoFinanciero' exact element={<CorporativoFinanciero/>} />
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
        <Route path='/SeguimientoOperaciones' exacte element={<SeguimientoOperaciones/>} />
        <Route path='/SeguimientoOperacionesMovil' exacte element={<SeguimientoOperacionesMovil/>} />
        <Route path='/SeguimientoSMU' exacte element={<SeguimientoSMU/>} />
        <Route path='/SeguimientoSMUMovil' exacte element={<SeguimientoSMUMovil/>} />
        <Route path='/SMU_Tecnico' exacte element={<SMU_Tecnico/>} />
        <Route path='/TorreDeControl' exacte element={<TorreControl />} />
        {/* Logistica */}
        <Route path='/EquiposMovilesR2' exacte element={<EquiposMovilesR2/>} />
        <Route path='/EquiposMovilesR4' exacte element={<EquiposMovilesR4/>} />
        {/* Direccion */}
        <Route path='/Penalizaciones' exacte element={<Penalizaciones/>} />
        <Route path='/Centro_de_costos' exacte element={<CentrosDeCostos />} />
        <Route path='/Moviles' exacte element={<Moviles />} />
        <Route path='/Compras' exacte element={<Compras />} />
        <Route path='/STTA' exacte element={<STTA/>} />
      </Routes>
    </>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}