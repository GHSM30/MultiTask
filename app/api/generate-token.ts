// pages/api/generate-token.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createToken } from '@/lib/auth';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ error: 'Datos de usuario requeridos' });
    }

    const token = createToken(user);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error al generar token:', error);
    res.status(500).json({ error: 'Error al generar token' });
  }
}