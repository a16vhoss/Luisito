'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/database.types';
import { ROLE_CONFIG } from '@/types/database.types';
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
} from 'lucide-react';

const DEMO_ROLES: UserRole[] = [
  'director',
  'jefe_taller',
  'chofer',
  'residente',
  'marmolero',
];

const ROLE_LABELS: Record<string, string> = {
  director: 'Director',
  admin: 'Admin',
  rrhh: 'RRHH',
  jefe_taller: 'Jefe Taller',
  chofer: 'Chofer',
  residente: 'Residente',
  marmolero: 'Marmolero',
};

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor ingrese su correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          setError('Credenciales inválidas. Verifique su correo y contraseña.');
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      // If a demo role is selected, store it so middleware/app can use it
      if (selectedRole) {
        localStorage.setItem('demo_role', selectedRole);
      }

      startTransition(() => {
        router.push('/');
        router.refresh();
      });
    } catch {
      setError('Ocurrió un error inesperado. Intente de nuevo.');
      setIsLoading(false);
    }
  }

  const loading = isLoading || isPending;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Logo & Branding */}
      <div className="mb-8 flex flex-col items-center gap-3">
        {/* Gold triangle logo */}
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
            SISTEMA DE GESTIÓN MONOLÍTICA
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-marble-800/60 bg-marble-950/70 p-8 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selector (Demo) */}
          <div className="space-y-3">
            <Label className="text-[11px] font-semibold tracking-[0.2em] text-marble-400">
              SELECCIONAR ROL
            </Label>
            <div className="flex flex-wrap gap-2">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() =>
                    setSelectedRole(selectedRole === role ? null : role)
                  }
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-all ${
                    selectedRole === role
                      ? 'border-golden bg-golden/15 text-golden'
                      : 'border-marble-700 bg-marble-900/50 text-marble-300 hover:border-marble-500 hover:text-marble-100'
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[11px] font-semibold tracking-[0.2em] text-marble-400"
            >
              CORREO ELECTRÓNICO
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@marmolescaribe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              className="h-11 border-marble-700 bg-marble-900/60 text-white placeholder:text-marble-600 focus-visible:ring-golden/40"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[11px] font-semibold tracking-[0.2em] text-marble-400"
            >
              CONTRASEÑA
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                className="h-11 border-marble-700 bg-marble-900/60 pr-11 text-white placeholder:text-marble-600 focus-visible:ring-golden/40"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-marble-500 transition-colors hover:text-marble-300"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
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
            disabled={loading}
            className="h-12 w-full rounded-full bg-golden text-sm font-semibold tracking-wide text-marble-950 transition-all hover:bg-golden-light disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              <>
                Iniciar Sesión
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Create Account */}
        <div className="mt-6 text-center text-xs">
          <span className="text-marble-500">¿No tiene una cuenta? </span>
          <a
            href="/registro"
            className="font-medium text-golden transition-colors hover:text-golden-light"
          >
            Crear Cuenta
          </a>
        </div>

        {/* Links */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <a
            href="/reset-password"
            className="text-marble-500 transition-colors hover:text-golden"
          >
            ¿Olvidó su Contraseña?
          </a>
          <a
            href="mailto:soporte@marmolcalibe.com"
            className="text-marble-500 transition-colors hover:text-golden"
          >
            Soporte Técnico
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
