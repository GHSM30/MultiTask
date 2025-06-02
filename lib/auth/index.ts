import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// Define el tipo para el payload del token
interface TokenPayload {
  userId: string;
  email: string;
  // Agrega aquí otras propiedades que incluya tu token
  [key: string]: any; // Esto permite propiedades adicionales si es necesario
}

// Solo para uso en el servidor
export function createToken(payload: TokenPayload): string {
  if (typeof window !== 'undefined') {
    throw new Error('createToken solo puede usarse en el lado del servidor');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  if (typeof window !== 'undefined') {
    throw new Error('verifyToken solo puede usarse en el lado del servidor');
  }
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('Error al verificar token:', error);
    return null;
  }
}