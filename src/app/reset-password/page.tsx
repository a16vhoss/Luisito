'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  TriangleIcon,
  Mail,
  CheckCircle2,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor ingrese su correo electrónico.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/nueva`,
      });

      if (resetError) {
        setError(resetError.message);
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-golden/15 border border-golden/30">
              <Mail className="h-8 w-8 text-golden" />
            </div>
            <h2 className="text-xl font-semibold text-white">Correo Enviado</h2>
            <p className="text-sm text-marble-400">
              Se ha enviado un enlace de recuperación a{' '}
              <span className="font-medium text-marble-200">{email}</span>.
              Revise su bandeja de entrada y siga las instrucciones.
            </p>
            <a
              href="/login"
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-golden text-sm font-semibold tracking-wide text-marble-950 transition-all hover:bg-golden-light"
            >
              Volver a Iniciar Sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
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
            RECUPERAR CONTRASEÑA
          </p>
        </div>
      </div>

      {/* Reset Card */}
      <div className="w-full max-w-md rounded-2xl border border-marble-800/60 bg-marble-950/70 p-8 shadow-2xl backdrop-blur-sm">
        <p className="mb-6 text-sm text-marble-400">
          Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              autoFocus
              disabled={isLoading}
              className="h-11 border-marble-700 bg-marble-900/60 text-white placeholder:text-marble-600 focus-visible:ring-golden/40"
            />
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
                Enviando...
              </>
            ) : (
              <>
                Enviar Enlace de Recuperación
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="inline-flex items-center text-xs text-marble-500 transition-colors hover:text-golden"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Volver a Iniciar Sesión
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
