/**
 * Ensures NextAuth env vars exist before next-auth reads process.env.
 * Avoids [next-auth][warn][NEXTAUTH_URL] / [NO_SECRET] in local development.
 */
const LOCAL_DEV_SECRET = 'assettags-local-dev-nextauth-secret';

export function ensureAuthEnv(): void {
  if (!process.env.NEXTAUTH_URL) {
    if (process.env.VERCEL_URL) {
      process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.AUTH_URL) {
      process.env.NEXTAUTH_URL = process.env.AUTH_URL.replace(/\/api\/auth\/?$/, '');
    } else {
      const port = process.env.PORT || '3000';
      const hostname = process.env.HOSTNAME || 'localhost';
      process.env.NEXTAUTH_URL = `http://${hostname}:${port}`;
    }
  }

  if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
  }
}

ensureAuthEnv();

/**
 * NextAuth encrypts the session JWT with this value.
 * If it is missing, NextAuth invents a new key on each reload, cookies fail to
 * decrypt (JWEDecryptionFailed), and the user looks signed out.
 */
export function getAuthSecret(): string {
  ensureAuthEnv();
  const configured = String(process.env.NEXTAUTH_SECRET || '').trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXTAUTH_SECRET is required in production. Set it in the environment and restart the app.'
    );
  }

  process.env.NEXTAUTH_SECRET = LOCAL_DEV_SECRET;
  return LOCAL_DEV_SECRET;
}

export function getAppBaseUrl(): string {
  ensureAuthEnv();
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}
