import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/patient', '/doctor']
const authRoutes = ['/login', '/register', '/role-select']
const publicRoutes = ['/', '/login', '/register', '/role-select']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('authToken')?.value

  // If user has token and tries to access auth routes, redirect to home
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/patient/dashboard', request.url))
  }

  // If user doesn't have token and tries to access protected routes, redirect to login
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
