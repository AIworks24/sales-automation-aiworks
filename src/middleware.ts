import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths - always allow
  const isPublicPath = 
    path === '/' ||
    path === '/login' ||
    path === '/signup' ||
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') // Allow static files
    ;

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for Supabase session cookies
  const hasSession = 
    request.cookies.has('sb-access-token') ||
    request.cookies.has('sb-refresh-token') ||
    // Check for different cookie formats Supabase might use
    Array.from(request.cookies.getAll()).some(cookie => 
      cookie.name.includes('sb') || cookie.name.includes('supabase')
    );

  // If no session and trying to access dashboard, redirect to login
  if (!hasSession && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};