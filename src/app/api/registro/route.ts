import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

const VALID_ROLES = ['director', 'jefe_taller', 'chofer', 'residente', 'marmolero'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, password, role } = body;

    // Validations
    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido.' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'El correo electrónico es requerido.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Rol inválido.' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Create auth user with service role (bypasses email confirmation)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'Este correo electrónico ya está registrado.' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'No se pudo crear la cuenta.' }, { status: 500 });
    }

    // 2. Insert user profile (service role bypasses RLS)
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      nombre: nombre.trim(),
      telefono: telefono?.trim() || null,
      role,
      activo: true,
    });

    if (profileError) {
      // Rollback: delete auth user if profile insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Error al crear el perfil. Intente de nuevo.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error inesperado del servidor.' }, { status: 500 });
  }
}
