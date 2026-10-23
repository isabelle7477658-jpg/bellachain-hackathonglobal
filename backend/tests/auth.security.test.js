import test from 'node:test';
import assert from 'node:assert/strict';

const securityModulePath = '../src/config/security.js';
const recoveryModulePath = '../src/utils/passwordRecovery.js';

async function loadSecurityModule() {
  return import(securityModulePath);
}

async function loadRecoveryModule() {
  return import(recoveryModulePath);
}

test('deve exigir JWT_SECRET em produção', async () => {
  const previousEnv = { ...process.env };
  process.env.NODE_ENV = 'production';
  delete process.env.JWT_SECRET;

  try {
    const { requireJwtSecret } = await loadSecurityModule();
    assert.throws(() => requireJwtSecret(), /JWT_SECRET/i);
  } finally {
    process.env = previousEnv;
  }
});

test('deve desabilitar fallback demo em produção', async () => {
  const previousEnv = { ...process.env };
  process.env.NODE_ENV = 'production';
  delete process.env.ENABLE_DEMO_LOGIN;

  try {
    const { isDemoLoginEnabled } = await loadSecurityModule();
    assert.equal(isDemoLoginEnabled(), false);
  } finally {
    process.env = previousEnv;
  }
});

test('deve gerar token de recuperação válido', async () => {
  const { createRecoveryToken, hashToken } = await loadRecoveryModule();

  const token = createRecoveryToken();

  assert.equal(typeof token, 'string');
  assert.ok(token.length >= 32);
  assert.match(hashToken(token), /^[a-f0-9]{64}$/i);
});

test('deve rejeitar senha fraca', async () => {
  const { validatePasswordStrength } = await loadRecoveryModule();

  assert.throws(() => validatePasswordStrength('123456'), /mínimo de 8 caracteres/i);
  assert.doesNotThrow(() => validatePasswordStrength('Bella@1234'));
});

test('deve permitir admin em qualquer perfil autorizado', async () => {
  const { autorizarPor } = await import('../src/middleware/authMiddleware.js');

  const req = { usuario: { tipo: 'admin' } };
  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };
  let nextCalled = false;

  const next = () => {
    nextCalled = true;
  };

  autorizarPor('cliente', 'funcionario')(req, res, next);

  assert.equal(res.statusCode, null);
  assert.equal(nextCalled, true);
});

test('deve gerar par de tokens com access e refresh', async () => {
  const { createTokenPair } = await import('../src/utils/authTokens.js');

  const tokens = createTokenPair({ id: 9, email: 'admin@bellachain.com', tipo: 'admin', nome: 'Administrador' });

  assert.ok(tokens.accessToken);
  assert.ok(tokens.refreshToken);
  assert.notEqual(tokens.accessToken, tokens.refreshToken);
  assert.match(tokens.accessToken, /^eyJ/);
  assert.match(tokens.refreshToken, /^eyJ/);
});
