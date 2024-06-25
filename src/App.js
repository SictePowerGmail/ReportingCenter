import React from 'react';
import Navbar from "./components/Navbar/Navbar";
import {
  HashRouter as Router,
  Route,
  Routes
} from "react-router-dom";
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
import SMU from './pages/SMU';

//4434

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' exact element={<Inicio />} />
        <Route path='/ReportingCenter' exact element={<Inicio />} />
        <Route path='/CorporativoFinanciero' exact element={<CorporativoFinanciero/>} />
        <Route path='/CorporativoPuntuacion' exact element={<CorporativoPuntuacion />} />
        <Route path='/PlaneacionFinanciero' exact element={<PlaneacionFinanciero />} />
        <Route path='/PlaneacionPuntuacion' exact element={<PlaneacionPuntuacion />} />
        <Route path='/MantenimientoTecnico' exact element={<MantenimientoTecnico />} />
        <Route path='/MantenimientoFinanciero' exact element={<MantenimientoFinanciero />} />
        <Route path='/MantenimientoPuntuacion' exact element={<MantenimientoPuntuacion />} />
        <Route path='/MantenimientoPuntuacionTMRF' exact element={<MantenimientoPuntuacionTMRF />} />
        <Route path='/Seguimiento' exact element={<Seguimiento />} />
        <Route path='/PlaneacionFacturacion' exacte element={<PlaneacionFacturacion />} />
        <Route path='/HistoricoKPI' exacte element={<HistoricoKPI />} />
        <Route path='/OperacionesFinanciero' exacte element={<OperacionesFinanciero />} />
        <Route path='/ReingenieriaFinanciero' exacte element={<ReingenieriaFinanciero />} />
        <Route path='/Centro_de_costos' exacte element={<CentrosDeCostos />} />
        <Route path='/MantenimientoBacklogFO' exacte element={<BacklogFO />} />
        <Route path='/MantenimientoBacklogHFC' exacte element={<BacklogHFC />} />
        <Route path='/Moviles' exacte element={<Moviles />} />
        <Route path='/Mintic' exacte element={<Mintic />} />
        <Route path='/NPS' exacte element={<NPS />} />
        <Route path='/ReingenieriasPuntuacion' exacte element={<ReingenieriasPuntuacion />} />
        <Route path='/TorreDeControl' exacte element={<TorreControl />} />
        <Route path='/MantenimientoFacturacion' exacte element={<MantenimientoFacturacion />} />
        <Route path='/OperacionesFacturacion' exacte element={<OperacionesFacturacion />} />
        <Route path='/CorporativoFacturacion' exacte element={<CorporativoFacturacion />} />
        <Route path='/ConsolidadoNacionalFacturacion' exacte element={<FacturacionConsolidado />} />
        <Route path='/Compras' exacte element={<Compras />} />
        <Route path='/SeguimientoProyectos' exacte element={<SeguimientoProyectos/>} />
        <Route path='/MinticFacturacion' exacte element={<MinticFacturacion/>} />
        <Route path='/STTA' exacte element={<STTA/>} />
        <Route path='/RendimientoOperativo' exacte element={<RendimientoOperativo/>} />
        <Route path='/SeguimientoSMU' exacte element={<SeguimientoSMU/>} />
        <Route path='/SMU' exacte element={<SMU/>} />
      </Routes>
    </Router>
  );
}

export default App;