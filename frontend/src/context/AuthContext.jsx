import React, { createContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const DEMO_LOGIN_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_LOGIN !== 'false';

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

const persistSession = (authToken, userData) => {
  if (!authToken) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    return;
  }

  localStorage.setItem('token', authToken);
  if (userData) {
    localStorage.setItem('usuario', JSON.stringify(userData));
  }
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

const parseJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  if (token.startsWith('demo-')) return false;

  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;

  return Date.now() >= payload.exp * 1000;
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
  const [usuario, setUsuario] = useState(() => {
    try {
      const storedUsuario = localStorage.getItem('usuario');
      return storedUsuario ? JSON.parse(storedUsuario) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        logout();
        setCarregando(false);
        return;
      }

      verificarToken();
    } else {
      clearSession();
      setCarregando(false);
    }
  }, []);

  const verificarToken = async () => {
    try {
      if (isTokenExpired(token)) {
        logout();
        setCarregando(false);
        return;
      }

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
        if (!DEMO_LOGIN_ENABLED) {
          throw new Error(data.message || 'Email ou senha inválidos');
        }

        try {
          const demoData = fallbackLogin(email, senha);
          const userData = { id: demoData.usuario_id, nome: demoData.nome, email: demoData.email, tipo: demoData.tipo_usuario };
          setToken(demoData.token);
          setUsuario(userData);
          persistSession(demoData.token, userData);
          return demoData;
        } catch (fallbackError) {
          throw new Error(data.message || fallbackError.message || 'Email ou senha inválidos');
        }
      }

      const data = await response.json();
      const userData = { id: data.usuario_id, nome: data.nome, email: data.email, tipo: data.tipo_usuario };
      setToken(data.token);
      setUsuario(userData);
      persistSession(data.token, userData);
      return data;
    } catch (error) {
      if (!DEMO_LOGIN_ENABLED) {
        setErro(error.message || 'Email ou senha inválidos');
        throw error;
      }

      try {
        const demoData = fallbackLogin(email, senha);
        const userData = { id: demoData.usuario_id, nome: demoData.nome, email: demoData.email, tipo: demoData.tipo_usuario };
        setToken(demoData.token);
        setUsuario(userData);
        persistSession(demoData.token, userData);
        return demoData;
      } catch (fallbackError) {
        setErro(error.message || fallbackError.message || 'Email ou senha inválidos');
        throw error;
      }
    }
  };

  const registrar = async (nome, email, senha, telefone, tipo = 'cliente') => {
    try {
      setErro(null);
      const response = await fetch(`${API_URL}/auth/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, telefone, tipo })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const users = getStoredDemoUsers();
        const emailDuplicado = users.some((usuario) => usuario.email.toLowerCase() === String(email).trim().toLowerCase()) || DEMO_USERS.some((usuario) => usuario.email.toLowerCase() === String(email).trim().toLowerCase());

        if (emailDuplicado) {
          throw new Error('Este email já está registrado');
        }

        const novoUsuario = { id: Date.now(), nome, email, senha, tipo };
        saveStoredDemoUsers([...users, novoUsuario]);
        return { id: novoUsuario.id, nome, email, tipo, message: 'Usuário registrado com sucesso' };
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
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, registrar, carregando, erro, setErro }}>
      {children}
    </AuthContext.Provider>
  );
}
