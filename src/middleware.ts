import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { ROLE_CONFIG, type UserRole } from '@/types/database.types';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/reset-password'];

// Map route prefixes to roles
const ROUTE_ROLE_MAP: Record<string, UserRole> = {
  '/director': 'director',
  '/admin': 'admin',
  '/rrhh': 'rrhh',
  '/taller': 'jefe_taller',
  '/obra': 'residente',
  '/chofer': 'chofer',
  '/marmolero': 'marmolero',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const { supabase, user, supabaseResponse } = await updateSession(request);

  // If no user and trying to access protected route
  if (!user) {
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in and on login page, redirect to their dashboard
  if (pathname === '/login' || pathname === '/') {
    // Get user role from the users table
    const { data: userData } = await supabase
      .from('users')
      .select('role, activo')
      .eq('id', user.id)
      .single();

    if (!userData || !userData.activo) {
      // User is inactive, sign out and redirect to login
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'Cuenta desactivada');
      return NextResponse.redirect(url);
    }

    const roleConfig = ROLE_CONFIG[userData.role as UserRole];
    if (roleConfig) {
      const url = request.nextUrl.clone();
      url.pathname = roleConfig.home;
      return NextResponse.redirect(url);
    }
  }

  // Check if user is accessing the correct role routes
  for (const [prefix, requiredRole] of Object.entries(ROUTE_ROLE_MAP)) {
    if (pathname.startsWith(prefix)) {
      const { data: userData } = await supabase
        .from('users')
        .select('role, activo')
        .eq('id', user.id)
        .single();

      if (!userData || !userData.activo) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'Cuenta desactivada');
        return NextResponse.redirect(url);
      }

      const userRole = userData.role as UserRole;

      // Director has access to everything
      if (userRole === 'director') {
        return supabaseResponse;
      }

      // Check if user has the required role for this route
      if (userRole !== requiredRole) {
        const roleConfig = ROLE_CONFIG[userRole];
        const url = request.nextUrl.clone();
        url.pathname = roleConfig.home;
        return NextResponse.redirect(url);
      }

      break;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
