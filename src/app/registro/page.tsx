'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  TriangleIcon,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'director', label: 'Director', description: 'Gestión general y supervisión de todas las áreas' },
  { value: 'jefe_taller', label: 'Jefe de Taller', description: 'Administración del taller y remisiones' },
  { value: 'chofer', label: 'Chofer', description: 'Transporte de material y registro de cargas' },
  { value: 'residente', label: 'Residente de Obra', description: 'Supervisión en sitio e instalaciones' },
  { value: 'marmolero', label: 'Marmolero', description: 'Instalación de piezas y asistencia' },
];

export default function RegistroPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('Por favor ingrese su nombre completo.');
      return;
    }

    if (!email) {
      setError('Por favor ingrese su correo electrónico.');
      return;
    }

    if (!selectedRole) {
      setError('Por favor seleccione un rol.');
      return;
    }

    if (!password) {
      setError('Por favor ingrese una contraseña.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este correo electrónico ya está registrado.');
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError('No se pudo crear la cuenta. Intente de nuevo.');
        setIsLoading(false);
        return;
      }

      // 2. Create user profile in users table
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        role: selectedRole,
        activo: true,
      });

      if (profileError) {
        setError('La cuenta fue creada pero hubo un error al guardar el perfil. Contacte a soporte.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Ocurrió un error inesperado. Intente de nuevo.');
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Logo & Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center">
            <TriangleIcon
              className="h-14 w-14 text-golden fill-golden/20"
              strokeWidth={1.5}
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-widest text-white">
              MÁRMOL CALIBE
            </h1>
          </div>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-marble-800/60 bg-marble-950/70 p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 border border-green-500/30">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Cuenta Creada</h2>
            <p className="text-sm text-marble-400">
              Su cuenta ha sido creada exitosamente. Revise su correo electrónico para confirmar su cuenta y luego inicie sesión.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="mt-4 h-12 w-full rounded-full bg-golden text-sm font-semibold tracking-wide text-marble-950 transition-all hover:bg-golden-light"
            >
              Ir a Iniciar Sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Logo & Branding */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center">
          <TriangleIcon
            className="h-14 w-14 text-golden fill-golden/20"
            strokeWidth={1.5}
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-widest text-white">
            MÁRMOL CALIBE
          </h1>
          <p className="mt-1 text-xs tracking-[0.25em] text-marble-400">
            CREAR NUEVA CUENTA
          </p>
        </div>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-md rounded-2xl border border-marble-800/60 bg-marble-950/70 p-8 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selector */}
          <div className="space-y-3">
            <Label className="text-[11px] font-semibold tracking-[0.2em] text-marble-400">
              SELECCIONAR ROL *
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(selectedRole === role.value ? null : role.value)}
                  className={`group relative rounded-xl border p-3 text-left transition-all ${
                    selectedRole === role.value
                      ? 'border-golden bg-golden/10'
                      : 'border-marble-700 bg-marble-900/50 hover:border-marble-500'
                  }`}
                >
                  <span
                    className={`block text-xs font-semibold tracking-wide ${
                      selectedRole === role.value
                        ? 'text-golden'
                        : 'text-marble-300 group-hover:text-marble-100'
                    }`}
                  >
                    {role.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-tight text-marble-500">
                    {role.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label
              htmlFor="nombre"
              className="text-[11px] font-semibold tracking-[0.2em] text-marble-400"
            >
              NOMBRE COMPLETO *
            </Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Juan Pérez García"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={isLoading}
              className="h-11 border-marble-700 bg-marble-900/60 text-white placeholder:text-marble-600 focus-visible:ring-golden/40"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[11px] font-semibold tracking-[0.2em] text-marble-400"
            >
              CORREO ELECTRÓNICO *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@marmolescaribe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isLoading}
              className="h-11 border-marble-700 bg-marble-900/60 text-white placeholder:text-marble-600 focus-visible:ring-golden/40"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label
              htmlFor="telefono"
              className="text-[11px] font-semibold tracking-[0.2em] text-marble-400"
            >
              TELÉFONO (OPCIONAL)
            </Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="999 123 4567"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={isLoading}
              className="h-11 border-marble-700 bg-marble-900/60 text-white placeholder:text-marble-600 focus-visible:ring-golden/40"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[11px] font-semibold tracking-[0.2em] text-marble-400"
            >
              CONTRASEÑA *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
                className="h-11 border-marble-700 bg-marble-900/60 pr-11 text-white placeholder:text-marble-600 focus-visible:ring-golden/40"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-marble-500 transition-colors hover:text-marble-300"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-[11px] font-semibold tracking-[0.2em] text-marble-400"
            >
              CONFIRMAR CONTRASEÑA *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita su contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
                className="h-11 border-marble-700 bg-marble-900/60 pr-11 text-white placeholder:text-marble-600 focus-visible:ring-golden/40"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-marble-500 transition-colors hover:text-marble-300"
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-full bg-golden text-sm font-semibold tracking-wide text-marble-950 transition-all hover:bg-golden-light disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Cuenta
              </>
            )}
          </Button>
        </form>

        {/* Link to login */}
        <div className="mt-6 text-center text-xs">
          <span className="text-marble-500">¿Ya tiene una cuenta? </span>
          <a
            href="/login"
            className="font-medium text-golden transition-colors hover:text-golden-light"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-[11px] tracking-[0.2em] text-marble-600">
        &copy; 2025 MÁRMOL CALIBE &bull; MATERIAL PREMIUM
      </p>
    </div>
  );
}
