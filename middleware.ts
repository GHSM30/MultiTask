import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // No realiza ninguna acción, permite todas las solicitudes
  return NextResponse.next();
}

// Matcher vacío para no aplicar a ninguna ruta
export const config = {
  matcher: []
};