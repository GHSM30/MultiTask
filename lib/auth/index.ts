import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// Define el tipo base para el payload del token
interface BaseTokenPayload {
  userId: string;
  email: string;
  iat?: number; // Fecha de emisión (opcional)
  exp?: number; // Fecha de expiración (opcional)
}

// Tipo para propiedades adicionales dinámicas
type ExtendedTokenPayload = BaseTokenPayload & Record<string, unknown>;

// Solo para uso en el servidor
export function createToken(payload: ExtendedTokenPayload): string {
  if (typeof window !== 'undefined') {
    throw new Error('createToken solo puede usarse en el lado del servidor');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export async function verifyToken(token: string): Promise<ExtendedTokenPayload | null> {
  if (typeof window !== 'undefined') {
    throw new Error('verifyToken solo puede usarse en el lado del servidor');
  }
  try {
    return jwt.verify(token, JWT_SECRET) as ExtendedTokenPayload;
  } catch (error) {
    console.error('Error al verificar token:', error);
    return null;
  }
}