import React, { createContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const DEMO_USERS = [
  { id: 1, nome: 'Marina Costa', email: 'marina@bellachain.com', senha: 'marina123', tipo: 'cliente' },
  { id: 2, nome: 'Ana Silva - Cabeleireira', email: 'ana@bellachain.com', senha: 'ana123', tipo: 'funcionario' },
  { id: 3, nome: 'Administrador', email: 'admin@bellachain.com', senha: 'admin123', tipo: 'admin' }
];

const getStoredDemoUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem('bella-chain-demo-users') || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const saveStoredDemoUsers = (users) => {
  localStorage.setItem('bella-chain-demo-users', JSON.stringify(users));
};

const fallbackLogin = (email, senha) => {
  const users = [...DEMO_USERS, ...getStoredDemoUsers()];
  const usuarioEncontrado = users.find(
    (usuario) => usuario.email.toLowerCase() === String(email).trim().toLowerCase() && usuario.senha === senha
  );

  if (!usuarioEncontrado) {
    throw new Error('Email ou senha inválidos');
  }

  const usuario = {
    id: usuarioEncontrado.id,
    nome: usuarioEncontrado.nome,
    email: usuarioEncontrado.email,
    tipo: usuarioEncontrado.tipo
  };

  const token = `demo-${Date.now()}`;
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));

  return { token, tipo_usuario: usuario.tipo, usuario_id: usuario.id, nome: usuario.nome, email: usuario.email, message: 'Login realizado com sucesso' };
};

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (token) {
      verificarToken();
    } else {
      setCarregando(false);
    }
  }, []);

  const verificarToken = async () => {
    try {
      if (token?.startsWith('demo-')) {
        const dadosSalvos = JSON.parse(localStorage.getItem('usuario') || 'null');
        if (dadosSalvos) {
          setUsuario(dadosSalvos);
          setErro(null);
        } else {
          logout();
        }
        setCarregando(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
        setErro(null);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      logout();
    } finally {
      setCarregando(false);
    }
  };

  const login = async (email, senha) => {
    try {
      setErro(null);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        try {
          const demoData = fallbackLogin(email, senha);
          setToken(demoData.token);
          setUsuario({ id: demoData.usuario_id, nome: demoData.nome, email: demoData.email, tipo: demoData.tipo_usuario });
          return demoData;
        } catch (fallbackError) {
          throw new Error(data.message || fallbackError.message || 'Email ou senha inválidos');
        }
      }

      const data = await response.json();
      setToken(data.token);
      setUsuario(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data));
      return data;
    } catch (error) {
      try {
        const demoData = fallbackLogin(email, senha);
        setToken(demoData.token);
        setUsuario({ id: demoData.usuario_id, nome: demoData.nome, email: demoData.email, tipo: demoData.tipo_usuario });
        return demoData;
      } catch (fallbackError) {
        setErro(error.message || fallbackError.message || 'Email ou senha inválidos');
        throw error;
      }
    }
  };

  const registrar = async (nome, email, senha, telefone) => {
    try {
      setErro(null);
      const response = await fetch(`${API_URL}/auth/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, telefone })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const users = getStoredDemoUsers();
        const emailDuplicado = users.some((usuario) => usuario.email.toLowerCase() === String(email).trim().toLowerCase()) || DEMO_USERS.some((usuario) => usuario.email.toLowerCase() === String(email).trim().toLowerCase());

        if (emailDuplicado) {
          throw new Error('Este email já está registrado');
        }

        const novoUsuario = { id: Date.now(), nome, email, senha, tipo: 'cliente' };
        saveStoredDemoUsers([...users, novoUsuario]);
        return { id: novoUsuario.id, nome, email, tipo: 'cliente', message: 'Usuário registrado com sucesso' };
      }

      return await response.json();
    } catch (error) {
      setErro(error.message);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    setErro(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, registrar, carregando, erro, setErro }}>
      {children}
    </AuthContext.Provider>
  );
}
