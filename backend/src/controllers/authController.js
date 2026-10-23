import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isDemoLoginEnabled, requireJwtSecret } from '../config/security.js';
import { createRecoveryLink, createRecoveryToken, hashToken, validatePasswordStrength } from '../utils/passwordRecovery.js';

dotenv.config();

const JWT_SECRET = requireJwtSecret();
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório.' });
    }

    const [usuarios] = await db.query(
      `SELECT id, nome, email FROM usuarios WHERE email = ?`,
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(200).json({
        message: 'Se o email estiver cadastrado, um link de recuperação será enviado.'
      });
    }

    const usuario = usuarios[0];

    const token = createRecoveryToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await db.transaction(async (tx) => {
      await tx.query('DELETE FROM password_reset_tokens WHERE usuario_id = ?', [usuario.id]);
      await tx.query(
        `INSERT INTO password_reset_tokens (usuario_id, token_hash, expires_at, usado) VALUES (?, ?, ?, FALSE)`,
        [usuario.id, tokenHash, expiresAt]
      );
    });

    const recoveryLink = createRecoveryLink(token);
    console.log(`Link de recuperação para ${email}: ${recoveryLink}`);

    return res.status(200).json({
      message: 'Se o email estiver cadastrado, um link de recuperação será enviado.',
      ...(process.env.NODE_ENV !== 'production' ? { recoveryLink, recoveryToken: token } : {})
    });
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    return res.status(500).json({
      message: 'Erro ao processar a recuperação de senha.',
      error: error.message
    });
  }
};

export const validarTokenRecuperacaoSenha = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token é obrigatório.' });
    }

    const tokenHash = hashToken(token);
    const [tokens] = await db.query(
      `SELECT id, usuario_id, expires_at, usado FROM password_reset_tokens WHERE token_hash = ?`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Token inválido ou não encontrado.' });
    }

    const registro = tokens[0];
    const expirou = new Date(registro.expires_at) < new Date();

    if (registro.usado || expirou) {
      return res.status(400).json({ message: 'Token expirado ou já utilizado.' });
    }

    return res.status(200).json({
      valid: true,
      usuario_id: registro.usuario_id,
      message: 'Token válido.'
    });
  } catch (error) {
    console.error('Erro ao validar token de recuperação:', error);
    return res.status(500).json({
      message: 'Erro ao validar o token de recuperação.',
      error: error.message
    });
  }
};

export const redefinirSenha = async (req, res) => {
  try {
    const { token, senha_nova } = req.body;

    if (!token || !senha_nova) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }

    try {
      validatePasswordStrength(senha_nova);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const tokenHash = hashToken(token);
    const resultado = await db.transaction(async (tx) => {
      const [tokens] = await tx.query(
        `SELECT id, usuario_id, expires_at, usado FROM password_reset_tokens WHERE token_hash = ? FOR UPDATE`,
        [tokenHash]
      );
      if (tokens.length === 0) return { error: 'Token inválido ou não encontrado.' };

      const registro = tokens[0];
      if (registro.usado || new Date(registro.expires_at) < new Date()) {
        return { error: 'Token expirado ou já utilizado.' };
      }

      const senhaHash = await bcrypt.hash(senha_nova, 10);
      await tx.query('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, registro.usuario_id]);
      await tx.query(
        'UPDATE password_reset_tokens SET usado = TRUE WHERE id = ? AND usado = FALSE',
        [registro.id]
      );
      return { success: true };
    });

    if (resultado.error) return res.status(400).json({ message: resultado.error });

    return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);

    if (error.message && /mínimo de 8 caracteres|no mínimo|minúscula|maiúscula|número/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: 'Erro ao redefinir a senha.',
      error: error.message
    });
  }
};

// Registrar novo usuário
export const registrar = async (req, res) => {
  try {
    const { nome, email, senha, telefone, cpf } = req.body;
    // Public registration cannot create privileged accounts.
    const tipoUsuario = 'cliente';
    const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : '';

    // Validar campos obrigatórios
    if (typeof nome !== 'string' || !nome.trim() || !emailNormalizado || typeof senha !== 'string') {
      return res.status(400).json({ 
        message: 'Nome, email e senha são obrigatórios' 
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      return res.status(400).json({ message: 'Email inválido.' });
    }
    try {
      validatePasswordStrength(senha);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Verificar se email já existe
    const [usuariosExistentes] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [emailNormalizado]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(400).json({ 
        message: 'Este email já está registrado' 
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuarioId = await db.transaction(async (tx) => {
      const [resultado] = await tx.query(
        `INSERT INTO usuarios (nome, email, senha, telefone, cpf, tipo, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ativo')`,
        [nome.trim(), emailNormalizado, senhaHash, telefone || null, cpf || null, tipoUsuario]
      );

      await tx.query(
        `INSERT INTO clientes (usuario_id, saldo_pontos, categoria, total_gasto, total_pontos_ganhos, total_pontos_resgatados)
         VALUES (?, 0, 'Bronze', 0, 0, 0)`,
        [resultado.insertId]
      );

      return resultado.insertId;
    });

    res.status(201).json({
      id: usuarioId,
      nome: nome.trim(),
      email: emailNormalizado,
      tipo: tipoUsuario,
      message: 'Usuário registrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao registrar usuário',
      error: error.message 
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validar campos
    if (!email || !senha) {
      return res.status(400).json({ 
        message: 'Email e senha são obrigatórios' 
      });
    }

    const credenciaisTeste = {
      'admin@bellachain.com': { senha: 'admin123', nome: 'Administrador', tipo: 'admin' },
      'ana@bellachain.com': { senha: 'ana123', nome: 'Ana Silva - Cabeleireira', tipo: 'funcionario' },
      'marina@bellachain.com': { senha: 'marina123', nome: 'Marina Costa', tipo: 'cliente' },
      'juliana@bellachain.com': { senha: 'juliana123', nome: 'Juliana Oliveira', tipo: 'cliente' },
      'carla@bellachain.com': { senha: 'carla123', nome: 'Carla Ferreira', tipo: 'cliente' },
      'daniela@bellachain.com': { senha: 'daniela123', nome: 'Daniela Mendes', tipo: 'cliente' }
    };

    const emailNormalizado = String(email).trim().toLowerCase();
    const usuarioDemo = credenciaisTeste[emailNormalizado];

    if (isDemoLoginEnabled() && usuarioDemo && usuarioDemo.senha === String(senha)) {
      const usuarioIdDemo = Date.now();
      const token = jwt.sign(
        {
          id: usuarioIdDemo,
          email: emailNormalizado,
          tipo: usuarioDemo.tipo,
          nome: usuarioDemo.nome,
          demo: true
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      return res.json({
        token,
        tipo_usuario: usuarioDemo.tipo,
        usuario_id: usuarioIdDemo,
        nome: usuarioDemo.nome,
        email: emailNormalizado,
        message: 'Login realizado com sucesso'
      });
    }

    // Buscar usuário
    const [usuarios] = await db.query(
      `SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = ?`,
      [emailNormalizado]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ 
        message: 'Email ou senha inválidos' 
      });
    }

    const usuario = usuarios[0];

    // Comparar senha
    let senhaValida = false;
    try {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } catch (error) {
      console.warn('Falha ao comparar senha com bcrypt:', error.message);
    }

    // Compatibilidade com dados de teste antigos do projeto
    if (!senhaValida && isDemoLoginEnabled() && credenciaisTeste[usuario.email]?.senha === String(senha)) {
      senhaValida = true;
    }

    if (!senhaValida) {
      return res.status(401).json({ 
        message: 'Email ou senha inválidos' 
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        nome: usuario.nome
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.json({
      token,
      tipo_usuario: usuario.tipo,
      usuario_id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ 
      message: 'Erro ao fazer login',
      error: error.message 
    });
  }
};

// Verificar token e retornar dados do usuário
export const me = async (req, res) => {
  try {
    if (req.usuario.demo === true) {
      return res.json({
        id: req.usuario.id,
        nome: req.usuario.nome,
        email: req.usuario.email,
        tipo: req.usuario.tipo,
        demo: true,
      });
    }

    const usuario_id = req.usuario.id;

    const [usuarios] = await db.query(
      `SELECT id, nome, email, tipo, telefone, cpf FROM usuarios WHERE id = ?`,
      [usuario_id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado' 
      });
    }

    const usuario = usuarios[0];

    // Se é cliente, buscar dados adicionais
    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar dados do usuário',
      error: error.message 
    });
  }
};

// Logout (apenas lógica, o token é descartado no frontend)
export const logout = async (req, res) => {
  try {
    res.json({ 
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({ 
      message: 'Erro ao fazer logout',
      error: error.message 
    });
  }
};

// Alterar senha
export const alterarSenha = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { senha_atual, senha_nova } = req.body;

    if (!senha_atual || !senha_nova) {
      return res.status(400).json({ 
        message: 'Senha atual e nova são obrigatórias' 
      });
    }

    // Buscar usuário
    const [usuarios] = await db.query(
      `SELECT id, senha FROM usuarios WHERE id = ?`,
      [usuario_id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado' 
      });
    }

    const usuario = usuarios[0];

    // Comparar senha atual
    const senhaValida = await bcrypt.compare(senha_atual, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ 
        message: 'Senha atual inválida' 
      });
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(senha_nova, 10);

    // Atualizar senha
    await db.query(
      `UPDATE usuarios SET senha = ? WHERE id = ?`,
      [senhaHash, usuario_id]
    );

    res.json({ 
      message: 'Senha alterada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ 
      message: 'Erro ao alterar senha',
      error: error.message 
    });
  }
};
