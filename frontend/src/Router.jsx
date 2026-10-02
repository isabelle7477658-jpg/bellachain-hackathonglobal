import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DashboardCliente from './pages/DashboardCliente';
import DashboardFuncionario from './pages/DashboardFuncionario';

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
    // Redirecionar para o dashboard apropriado
    return <Navigate to={usuario.tipo === 'cliente' ? '/dashboard-cliente' : '/dashboard-funcionario'} replace />;
  }

  return element;
}

export default function Router() {
  const { usuario } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard-cliente"
          element={<RotaProtegida element={<DashboardCliente />} tipoUsuario="cliente" />}
        />
        <Route
          path="/dashboard-funcionario"
          element={<RotaProtegida element={<DashboardFuncionario />} tipoUsuario="funcionario" />}
        />
        <Route
          path="*"
          element={
            usuario ? (
              usuario.tipo === 'cliente' ? (
                <Navigate to="/dashboard-cliente" replace />
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
