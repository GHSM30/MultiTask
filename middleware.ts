import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedRoutes = [
    '/dashboard/taskArea',
  ];

  // Verifica si la ruta actual está protegida
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  if (isProtectedRoute) {
    // 1. Intenta obtener el token del header 'Authorization'
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    // 2. Si no hay token en headers, redirige a login
    if (!token) {
      const loginUrl = new URL('/dashboard/login', request.url);
      loginUrl.searchParams.set('from', path);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Opcional: Verifica validez del token aquí si es necesario
    // (requeriría una función de validación JWT)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login/registro
     * - archivos estáticos en /public
     */
    '/((?!_next/static|_next/image|favicon.ico|dashboard/login|dashboard/registro|api/auth|images|icons).*)',
  ],
};