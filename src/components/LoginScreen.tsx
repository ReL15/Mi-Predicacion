import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { loginWithNeon } from '../services/api';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const CREDENTIALS_KEY = 'mi_predicacion_saved_credentials';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [emailOrName, setEmailOrName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load remembered credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CREDENTIALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmailOrName(parsed.email);
        if (parsed.password) setPassword(parsed.password);
        if (typeof parsed.remember === 'boolean') setRememberMe(parsed.remember);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrName.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await loginWithNeon(emailOrName.trim(), password.trim());

      // Save or clear remembered credentials based on checkbox
      if (rememberMe) {
        localStorage.setItem(
          CREDENTIALS_KEY,
          JSON.stringify({
            email: emailOrName.trim(),
            password: password.trim(),
            remember: true,
          })
        );
      } else {
        localStorage.removeItem(CREDENTIALS_KEY);
      }

      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión. Verifica tus datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E5EAF0] p-6 sm:p-7 shadow-[0_4px_20px_rgba(32,43,54,0.06)] space-y-5">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#245B85] text-white flex items-center justify-center mx-auto shadow-md shadow-[#245B85]/25">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="M6 14h7" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#202B36] tracking-tight">Mi Predicación</h1>
            <p className="text-xs text-[#7A8794] mt-0.5">
              Ingresa con tu correo y contraseña registrados
            </p>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FFDAD6]/40 border border-[#BA1A1A]/30 text-xs text-[#BA1A1A] flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Login Form: Only Email and Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#202B36] block">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A8794] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="email"
                placeholder="ej. jorge.rivera@koinia.com"
                value={emailOrName}
                onChange={(e) => setEmailOrName(e.target.value)}
                className="w-full h-12 pl-10 pr-3.5 bg-white border border-[#E5EAF0] rounded-xl text-xs text-[#202B36] placeholder-[#7A8794] focus:outline-none focus:border-[#245B85] focus:ring-1 focus:ring-[#245B85] transition-all"
                required
              />
            </div>
          </div>

          {/* Password input with toggle show/hide */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#202B36] block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A8794] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-10 pr-10 bg-white border border-[#E5EAF0] rounded-xl text-xs text-[#202B36] placeholder-[#7A8794] focus:outline-none focus:border-[#245B85] focus:ring-1 focus:ring-[#245B85] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8794] hover:text-[#202B36] p-1"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Password Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#245B85] border-[#E5EAF0] focus:ring-[#245B85] focus:ring-offset-0"
              />
              <span className="text-xs font-medium text-[#41474E]">Recordar contraseña</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] rounded-xl bg-[#245B85] text-white hover:bg-[#1B4463] font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#245B85]/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verificando credenciales...</span>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security notice */}
        <p className="text-[11px] text-[#7A8794] text-center pt-2 border-t border-[#E5EAF0]/80">
          Acceso protegido conectado con la base de datos de Neon Console.
        </p>
      </div>
    </div>
  );
};
