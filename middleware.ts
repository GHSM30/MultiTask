import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Si no hay token y está intentando acceder a dashboard
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si tiene token y está en login/register
  if (token && (pathname === '/login' || pathname === '/registro')) {
    return NextResponse.redirect(new URL('/dashboard/taskArea', request.url))
  }

  return NextResponse.next()
}