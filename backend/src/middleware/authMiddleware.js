import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { requireJwtSecret } from '../config/security.js';

dotenv.config();

const JWT_SECRET = requireJwtSecret();

// Middleware para autenticar JWT
export const autenticar = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({ 
        message: 'Token não fornecido' 
      });
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Formato de token inválido' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Token inválido ou expirado',
      error: error.message
    });
  }
};

// Middleware para verificar tipo de usuário
export const autorizarPor = (...tipos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        message: 'Usuário não autenticado' 
      });
    }

    const temPermissao = req.usuario.tipo === 'admin' || tipos.includes(req.usuario.tipo);

    if (!temPermissao) {
      return res.status(403).json({ 
        message: 'Acesso negado. Você não tem permissão para esta ação.',
        tipo_usuario: req.usuario.tipo,
        tipos_permitidos: tipos
      });
    }

    next();
  };
};

// Middleware para tratamento de erros
export const tratarErro = (err, req, res, next) => {
  console.error('Erro:', err);

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Token inválido' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expirado' 
    });
  }

  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
