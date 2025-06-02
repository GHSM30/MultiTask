import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  // Solo proteger taskArea
  if (path === '/dashboard/taskArea') {
    if (!token) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url));
    }
    // Si tiene token, permitir acceso
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/taskArea']
};