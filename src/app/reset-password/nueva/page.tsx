'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
} from 'lucide-react';

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase automatically picks up the recovery token from the URL hash
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if there's already a session (in case the event already fired)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Por favor ingrese una nueva contraseña.');
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

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
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
            <h2 className="text-xl font-semibold text-white">Contraseña Actualizada</h2>
            <p className="text-sm text-marble-400">
              Su contraseña ha sido cambiada exitosamente. Ya puede iniciar sesión con su nueva contraseña.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="mt-4 h-12 w-full rounded-full bg-golden text-sm font-semibold tracking-wide text-marble-950 transition-all hover:bg-golden-light"
            >
              Iniciar Sesión
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
            NUEVA CONTRASEÑA
          </p>
        </div>
      </div>

      {/* New Password Card */}
      <div className="w-full max-w-md rounded-2xl border border-marble-800/60 bg-marble-950/70 p-8 shadow-2xl backdrop-blur-sm">
        {!sessionReady ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-golden" />
            <p className="text-sm text-marble-400">Verificando enlace de recuperación...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold tracking-[0.2em] text-marble-400"
              >
                NUEVA CONTRASEÑA
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  disabled={isLoading}
                  className="h-11 border-marble-700 bg-marble-900/60 pr-11 text-white placeholder:text-marble-600 focus-visible:ring-golden/40"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-marble-500 transition-colors hover:text-marble-300"
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
                CONFIRMAR CONTRASEÑA
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
                  Actualizando...
                </>
              ) : (
                <>
                  Cambiar Contraseña
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-[11px] tracking-[0.2em] text-marble-600">
        &copy; 2025 MÁRMOL CALIBE &bull; MATERIAL PREMIUM
      </p>
    </div>
  );
}
