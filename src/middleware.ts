import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Role to home page mapping
const ROLE_HOME: Record<string, string> = {
  director: '/director/dashboard',
  admin: '/admin/dashboard',
  rrhh: '/rrhh/personal',
  jefe_taller: '/taller/dashboard',
  residente: '/obra/dashboard',
  chofer: '/chofer/cargas',
  marmolero: '/marmolero/asistencia',
};

// Route prefix to required role
const ROUTE_ROLE_MAP: Record<string, string> = {
  '/director': 'director',
  '/admin': 'admin',
  '/rrhh': 'rrhh',
  '/taller': 'jefe_taller',
  '/obra': 'residente',
  '/chofer': 'chofer',
  '/marmolero': 'marmolero',
};

const PUBLIC_ROUTES = ['/login', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No user → allow public routes, redirect others to login
  if (!user) {
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // User logged in → get role
  if (pathname === '/login' || pathname === '/') {
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

    const home = ROLE_HOME[userData.role] || '/login';
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  // Check role-based access
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
        return NextResponse.redirect(url);
      }

      // Director has access to everything
      if (userData.role === 'director') {
        return supabaseResponse;
      }

      // Wrong role → redirect to own home
      if (userData.role !== requiredRole) {
        const home = ROLE_HOME[userData.role] || '/login';
        const url = request.nextUrl.clone();
        url.pathname = home;
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
