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
import CorporativoFinanciero from './pages/CorporativoFinanciero';
import PlaneacionTecnico from './pages/PlaneacionTecnico';
import PlaneacionFinanciero from './pages/PlaneacionFinanciero';
import PlaneacionPuntuacion from './pages/PlaneacionPuntuacion';
import PlaneacionEmpalmes from './pages/PlaneacionEmpalmes';
import MantenimientoTecnico from './pages/MantenimientoTecnico';
import MantenimientoFinanciero from './pages/MantenimientoFinanciero';
import MantenimientoPuntuacion from './pages/MantenimientoPuntuacion';
import Capacidades from './pages/Capacidades';
import Penalizaciones from './pages/Penalizaciones';
import EstatusAlturas from './pages/EstatusAlturas';

//        <Route path='/' exact element={<Login />} />
//        <Route path='/ReportingCenter' exact element={<Login />} />
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' exact element={<PlaneacionTecnico />} />
        <Route path='/ReportingCenter' exact element={<PlaneacionTecnico />} />
        <Route path='/CorporativoFinanciero' exact element={<CorporativoFinanciero/>} />
        <Route path='/CorporativoPuntuacion' exact element={<CorporativoPuntuacion />} />
        <Route path='/ReporteCorporativo' exact element={<ReporteCorporativo />} />
        <Route path='/PlaneacionTecnico' exact element={<PlaneacionTecnico />} />
        <Route path='/PlaneacionFinanciero' exact element={<PlaneacionFinanciero />} />
        <Route path='/PlaneacionPuntuacion' exact element={<PlaneacionPuntuacion />} />
        <Route path='/PlaneacionEmpalmes' exact element={<PlaneacionEmpalmes />} />
        <Route path='/ReportePlaneacion' exact element={<ReportePlaneacion/>} />
        <Route path='/MantenimientoTecnico' exact element={<MantenimientoTecnico />} />
        <Route path='/MantenimientoFinanciero' exact element={<MantenimientoFinanciero />} />
        <Route path='/MantenimientoPuntuacion' exact element={<MantenimientoPuntuacion />} />
        <Route path='/Capacidades' exact element={<Capacidades />} />
        <Route path='/Penalizaciones' exact element={<Penalizaciones />} />
        <Route path='/EstatusAlturas' exact element={<EstatusAlturas />} />
      </Routes>
    </Router>
  );
}

export default App;