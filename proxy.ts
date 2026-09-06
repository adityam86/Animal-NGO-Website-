import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check if trying to access /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('ayudar_admin_session');
    
    // If no valid session cookie, redirect to login
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Check if trying to access /login while already logged in
  if (request.nextUrl.pathname === '/login') {
    const sessionCookie = request.cookies.get('ayudar_admin_session');
    if (sessionCookie && sessionCookie.value === 'authenticated') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
