import React from 'react';
import Navbar from "./components/Navbar/Navbar";
import {
  HashRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import ReporteCorporativo from "./pages/ReporteCorporativo";
import Login from './pages/Login';
import ReportePlaneacion from './pages/ReportePlaneacion';
import CorporativoPuntuacion from './pages/CorporativoPuntuacion';
import CorporativoKPI from './pages/CorporativoKPI';
import CorporativoFinanciero from './pages/CorporativoFinanciero';
import PlaneacionTecnico from './pages/PlaneacionTecnico';
import PlaneacionFinanciero from './pages/PlaneacionFinanciero';
import PlaneacionPuntuacion from './pages/PlaneacionPuntuacion';
import PlaneacionEmpalmes from './pages/PlaneacionEmpalmes';
import MantenimientoBacklog from './pages/MantenimientoBacklog';
import MantenimientoTecnico from './pages/MantenimientoTecnico';
import MantenimientoFinanciero from './pages/MantenimientoFinanciero';
import MantenimientoPuntuacion from './pages/MantenimientoPuntuacion';
import MantenimientoPuntuacionTMRF from './pages/MantenimientoPuntuacionTMRF';
import Capacidades from './pages/Capacidades';
import Penalizaciones from './pages/Penalizaciones';
import EstatusAlturas from './pages/EstatusAlturas';
import PBRB_IndicadoresMantenimiento from './pages/PBRB_IndicadoresMantenimiento';
import Seguimiento from './pages/Seguimiento';
import PlaneacionFacturacion from './pages/PlaneacionFacturacion';
import Inicio from './pages/Inicio';
import WhatsApp from './pages/WhatsApp';
import SMU_Financiero from './pages/SMU_Financiero';
import MercadoMasivo from './pages/MercadoMasivo';
import HistoricoKPI from './pages/HistoricoKPI';
import OperacionesFinanciero from './pages/OperacionesFinanciero';
import ReingenieriaFinanciero from './pages/ReingenieriaFinanciero';
import SMU_Tecnico from './pages/SMU_Tecnico';
import CentrosDeCostos from './pages/CentrosDeCostos';
import BacklogFO from './pages/Backlog_FO';
import Moviles from './pages/Moviles';
import Sitios_Moviles from './pages/Sitios_Moviles';
import Logistica from './pages/Logistica';
import Mintic from './pages/Mintic';


//        <Route path='/' exact element={<Login />} />
//        <Route path='/ReportingCenter' exact element={<Login />} />
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' exact element={<Inicio />} />
        <Route path='/ReportingCenter' exact element={<Inicio />} />
        <Route path='/CorporativoFinanciero' exact element={<CorporativoFinanciero/>} />
        <Route path='/CorporativoPuntuacion' exact element={<CorporativoPuntuacion />} />
        <Route path='/CorporativoKPI' exact element={<CorporativoKPI />} />
        <Route path='/ReporteCorporativo' exact element={<ReporteCorporativo />} />
        <Route path='/PlaneacionTecnico' exact element={<PlaneacionTecnico />} />
        <Route path='/PlaneacionFinanciero' exact element={<PlaneacionFinanciero />} />
        <Route path='/PlaneacionPuntuacion' exact element={<PlaneacionPuntuacion />} />
        <Route path='/PlaneacionEmpalmes' exact element={<PlaneacionEmpalmes />} />
        <Route path='/ReportePlaneacion' exact element={<ReportePlaneacion/>} />
        <Route path='/MantenimientoTecnico' exact element={<MantenimientoTecnico />} />
        <Route path='/MantenimientoFinanciero' exact element={<MantenimientoFinanciero />} />
        <Route path='/MantenimientoPuntuacion' exact element={<MantenimientoPuntuacion />} />
        <Route path='/MantenimientoPuntuacionTMRF' exact element={<MantenimientoPuntuacionTMRF />} />
        <Route path='/Capacidades' exact element={<Capacidades />} />
        <Route path='/Penalizaciones' exact element={<Penalizaciones />} />
        <Route path='/EstatusAlturas' exact element={<EstatusAlturas />} />
        <Route path='/PBRB_IndicadoresMantenimiento' exact element={<PBRB_IndicadoresMantenimiento />} />
        <Route path='/Seguimiento' exact element={<Seguimiento />} />
        <Route path='/PlaneacionFacturacion' exacte element={<PlaneacionFacturacion />} />
        <Route path='/WhatsApp' exacte element={<WhatsApp />} />
        <Route path='/MantenimientoBacklog' exacte element={<MantenimientoBacklog/>} />
        <Route path='/SMU_Financiero' exacte element={<SMU_Financiero />} />
        <Route path='/MercadoMasivo' exacte element={<MercadoMasivo />} />
        <Route path='/HistoricoKPI' exacte element={<HistoricoKPI />} />
        <Route path='/OperacionesFinanciero' exacte element={<OperacionesFinanciero />} />
        <Route path='/ReingenieriaFinanciero' exacte element={<ReingenieriaFinanciero />} />
        <Route path='/SMU_Tecnico' exacte element={<SMU_Tecnico />} />
        <Route path='/Centro_de_costos' exacte element={<CentrosDeCostos />} />
        <Route path='/MantenimientoBacklogFO' exacte element={<BacklogFO />} />
        <Route path='/Moviles' exacte element={<Moviles />} />
        <Route path='/Sitios_moviles' exacte element={<Sitios_Moviles />} />
        <Route path='/Logistica_tecnico' exacte element={<Logistica />} />
        <Route path='/Mintic' exacte element={<Mintic />} />
      </Routes>
    </Router>
  );
}

export default App;