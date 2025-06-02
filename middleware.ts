import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Solo para rutas protegidas
  if (path.startsWith('/dashboard')) {
    // Intenta obtener el token de las cookies primero
    const cookieToken = request.cookies.get('token')?.value;
    
    // Si no hay cookie, verifica localStorage via headers
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.split(' ')[1];
    
    if (!cookieToken && !headerToken) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url));
    }
  }

  return NextResponse.next();
}