import React from 'react';
import Navbar from "./components/Navbar/Navbar";
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
//import Login from "./components/Login/Login";
import Corporativo from "./pages/Corporativo";
import Planeacion from "./pages/Planeacion";
import Mantenimiento from "./pages/Mantenimiento";
import ReporteCorporativo from "./pages/ReporteCorporativo";
import Inicio from './pages/Inicio';
import Login from './pages/Login';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' exact element={<Login />} />
        <Route path='/ReportingCenter' exact element={<Login />} />
        <Route path='/Planeacion' exact element={<Planeacion />} />
        <Route path='/Corporativo' exact element={<Corporativo />} />
        <Route path='/Mantenimiento' exact element={<Mantenimiento />} />
        <Route path='/ReporteCorporativo' exact element={<ReporteCorporativo />} />
      </Routes>
    </Router>
  );
}

export default App;