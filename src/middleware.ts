import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ROLE_HOME: Record<string, string> = {
  director: '/director/dashboard',
  admin: '/admin/dashboard',
  rrhh: '/rrhh/personal',
  jefe_taller: '/taller/dashboard',
  residente: '/obra/dashboard',
  chofer: '/chofer/cargas',
  marmolero: '/marmolero/asistencia',
};

const ROUTE_ROLE_MAP: Record<string, string> = {
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

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in
  if (!user) {
    if (pathname === '/login' || pathname === '/reset-password' || pathname === '/registro') {
      return response;
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in, on login or root → redirect to role home
  if (pathname === '/login' || pathname === '/') {
    const { data: userData } = await supabase
      .from('users')
      .select('role, activo')
      .eq('id', user.id)
      .single();

    if (!userData || !userData.activo) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?error=Cuenta+desactivada', request.url));
    }

    const home = ROLE_HOME[userData.role] || '/login';
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Check role access on protected routes
  for (const [prefix, requiredRole] of Object.entries(ROUTE_ROLE_MAP)) {
    if (pathname.startsWith(prefix)) {
      const { data: userData } = await supabase
        .from('users')
        .select('role, activo')
        .eq('id', user.id)
        .single();

      if (!userData || !userData.activo) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (userData.role === 'director') return response;

      if (userData.role !== requiredRole) {
        const home = ROLE_HOME[userData.role] || '/login';
        return NextResponse.redirect(new URL(home, request.url));
      }
      break;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
