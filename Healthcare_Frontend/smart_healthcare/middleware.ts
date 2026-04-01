import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for the session token injected by the backend login controller
  const token = request.cookies.get('token')?.value;

  // We are heavily protecting these internal routes.
  // If no token exists, the user is violently redirected to login before rendering.
  if (!token) {
    // Save the original url so we can optionally return them here later
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Exactly govern which routes pass through the Bouncer
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/appointments/:path*',
    '/ai-diagnostics/:path*',
    '/ai-diagnostics',
    '/dashboard'
  ],
}
