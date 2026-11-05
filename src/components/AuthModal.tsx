import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoragiLogo } from './LoragiLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password, name.trim());
      } else {
        await loginWithEmail(email.trim(), password);
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      // Clean up common firebase error codes
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Invalid email or password. Please try again.');
      } else if (msg.includes('email-already-in-use')) {
        setError('An account with this email already exists.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginAsGuest(guestName || 'Lorapok Creator');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Guest login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-bio-emerald/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-bio-cyan/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bio-border">
          <div className="flex items-center gap-2.5">
            <LoragiLogo size="sm" />
            <div>
              <h3 className="text-base font-extrabold text-white">
                {mode === 'signin' ? 'Sign In to LoraGi' : 'Create Lorapok Account'}
              </h3>
              <p className="text-xs text-slate-400">Publish videos to the community gallery & studio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          {/* Google 1-Click Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-emerald/40 text-xs font-bold text-white flex items-center justify-center gap-2.5 transition-all shadow cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-bio-border" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">or with email</span>
            <div className="flex-1 h-px bg-bio-border" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Creator Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-bio-void/80 border border-bio-border focus:border-bio-emerald text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@lorapok.tech"
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-bio-void/80 border border-bio-border focus:border-bio-emerald text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-bio-void/80 border border-bio-border focus:border-bio-emerald text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-bio-rose/10 border border-bio-rose/30 flex items-start gap-2 text-xs text-bio-rose">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-bio-emerald to-bio-cyan text-bio-void font-bold text-xs tracking-wide shadow-bio-emerald hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="flex items-center justify-center text-xs text-slate-400">
            {mode === 'signin' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-bio-cyan hover:underline font-semibold"
                >
                  Create one free
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-bio-emerald hover:underline font-semibold"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

          {/* Instant Guest Mode Box */}
          <div className="p-3 rounded-2xl bg-bio-surface/40 border border-bio-border flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-bio-violet" />
                <span>Quick Guest Access</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Publish and test without entering credentials
              </p>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleGuestLogin}
              className="px-3 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-violet/40 text-[11px] font-bold text-bio-violet hover:text-white transition-all shrink-0"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-bio-border flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-bio-emerald">
            <ShieldCheck className="w-3 h-3" />
            <span>Firebase Auth Protected</span>
          </span>
          <span className="font-mono">Lorapok Labs</span>
        </div>
      </div>
    </div>
  );
};
