'use client';

import { useState } from 'react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  /** Pre-fill the email field — useful when shown after a booking */
  defaultEmail?: string;
  onClose: () => void;
}

type Mode = 'signin' | 'signup';

export function AuthModal({ defaultEmail = '', onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function friendlyError(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        await signUp(email, password, name);
      }
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'signin' ? 'Sign in' : 'Create account'}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-ink">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-ink-muted mt-0.5">
              {mode === 'signin' ? 'Sign in to see your orders.' : 'Track all your Denz bookings.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1.5 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (sign up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                autoFocus
                required
                className="w-full border border-ink-faint/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus={mode === 'signin'}
              required
              className="w-full border border-ink-faint/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Minimum 6 characters' : '••••••••'}
                required
                className="w-full border border-ink-faint/40 rounded-xl px-4 py-3 pr-11 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors cursor-pointer"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-ink-muted mt-4">
          {mode === 'signin' ? (
            <>
              No account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className="text-brand font-semibold hover:underline cursor-pointer"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); }}
                className="text-brand font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
