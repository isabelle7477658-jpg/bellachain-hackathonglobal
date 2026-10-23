export function isDemoLoginEnabled() {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  const configuredValue = process.env.ENABLE_DEMO_LOGIN;
  if (configuredValue !== undefined) {
    return ['true', '1', 'yes', 'on'].includes(configuredValue.trim().toLowerCase());
  }

  return true;
}

export function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET is required. Configure a secure secret before starting the server.');
  }

  return secret.trim();
}
