import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import SobreBellaChain from './pages/SobreBellaChain';
import Login from './pages/Login';
import DashboardCliente from './pages/DashboardCliente';
import DashboardFuncionario from './pages/DashboardFuncionario';
import PacotesPortal from './pages/PacotesPortal';

// Componente de rota protegida
function RotaProtegida({ element, tipoUsuario }) {
  const { usuario, carregando } = useContext(AuthContext);

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (tipoUsuario && usuario.tipo !== tipoUsuario && usuario.tipo !== 'admin') {
    const rotaCorreta = usuario.tipo === 'cliente' ? '/dashboard-cliente' : usuario.tipo === 'admin' ? '/dashboard-admin' : '/dashboard-funcionario';
    return <Navigate to={rotaCorreta} replace />;
  }

  return element;
}

export default function Router() {
  const { usuario } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sobre" element={<SobreBellaChain />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pacotes" element={<RotaProtegida element={<PacotesPortal />} />} />
        <Route
          path="/dashboard-cliente"
          element={<RotaProtegida element={<PacotesPortal />} tipoUsuario="cliente" />}
        />
        <Route
          path="/dashboard-admin"
          element={<RotaProtegida element={<PacotesPortal />} tipoUsuario="admin" />}
        />
        <Route
          path="/dashboard-funcionario"
          element={<RotaProtegida element={<PacotesPortal />} tipoUsuario="funcionario" />}
        />
        <Route path="/legado-pontos" element={<RotaProtegida element={usuario?.tipo === 'cliente' ? <DashboardCliente /> : <DashboardFuncionario />} />} />
        <Route
          path="*"
          element={
            usuario ? (
              usuario.tipo === 'cliente' ? (
                <Navigate to="/dashboard-cliente" replace />
              ) : usuario.tipo === 'admin' ? (
                <Navigate to="/dashboard-admin" replace />
              ) : (
                <Navigate to="/dashboard-funcionario" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
