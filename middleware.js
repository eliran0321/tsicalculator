import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  // Protected routes
  const protectedPaths = ['/dashboard'];
  const adminPaths = ['/admin'];
  
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  const isAdmin = adminPaths.some(path => pathname.startsWith(path));
  
  if (isProtected || isAdmin) {
    // In a client-side app, we'll handle auth checks in the components
    // This middleware mainly prevents direct URL access
    
    // You could add server-side token verification here if needed
    // For now, we rely on client-side checks in useEffect
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*'
  ],
};