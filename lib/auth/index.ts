import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// Solo para uso en el servidor
export function createToken(payload: object): string {
  if (typeof window !== 'undefined') {
    throw new Error('createToken solo puede usarse en el lado del servidor');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export async function verifyToken(token: string): Promise<any> {
  if (typeof window !== 'undefined') {
    throw new Error('verifyToken solo puede usarse en el lado del servidor');
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error al verificar token:', error);
    return null;
  }
}