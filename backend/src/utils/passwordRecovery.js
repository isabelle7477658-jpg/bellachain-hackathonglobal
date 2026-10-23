import crypto from 'crypto';

export function createRecoveryToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token).trim()).digest('hex');
}

export function validatePasswordStrength(password) {
  if (typeof password !== 'string') {
    throw new Error('Senha inválida.');
  }

  if (password.length < 8) {
    throw new Error('A senha deve ter mínimo de 8 caracteres.');
  }

  if (!/[a-z]/.test(password)) {
    throw new Error('A senha deve conter pelo menos uma letra minúscula.');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('A senha deve conter pelo menos uma letra maiúscula.');
  }

  if (!/\d/.test(password)) {
    throw new Error('A senha deve conter pelo menos um número.');
  }

  return true;
}

export function createRecoveryLink(token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/login?reset=true&token=${encodeURIComponent(token)}`;
}
