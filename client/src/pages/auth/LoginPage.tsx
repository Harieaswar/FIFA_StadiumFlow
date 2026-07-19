import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Building2, AlertCircle, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { email: 'fan@stadiumflow.demo', role: 'Fan', color: 'text-indigo-400', bg: 'hover:bg-indigo-500/10' },
  { email: 'volunteer@stadiumflow.demo', role: 'Volunteer', color: 'text-teal-400', bg: 'hover:bg-teal-500/10' },
  { email: 'staff@stadiumflow.demo', role: 'Staff', color: 'text-blue-400', bg: 'hover:bg-blue-500/10' },
  { email: 'admin@stadiumflow.demo', role: 'Admin', color: 'text-purple-400', bg: 'hover:bg-purple-500/10' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Invalid email or password';
      if (msg.includes('429') || msg.includes('locked') || msg.includes('Too many')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // One-click demo login — fills and immediately submits
  const loginAsDemo = async (email: string) => {
    setError('');
    setDemoLoading(email);
    setValue('email', email);
    setValue('password', 'DemoPass123!');
    try {
      await login(email, 'DemoPass123!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Demo login failed';
      setError(msg);
    } finally {
      setDemoLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-display font-bold gradient-text">StadiumFlow AI</span>
            <p className="text-xs text-slate-500">FIFA World Cup 2026</p>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
            Intelligent Stadium<br />
            <span className="gradient-text">Operations Platform</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            AI-powered operations, navigation, and safety management for the world's greatest tournament.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🏟️', label: '80,000+ Fans Managed' },
              { icon: '🤖', label: 'Gemini AI Assistant' },
              { icon: '🌍', label: '8 Languages Supported' },
              { icon: '♿', label: 'WCAG 2.2 AA Accessible' },
            ].map(f => (
              <div key={f.label} className="card-glass p-3 rounded-xl flex items-center gap-2">
                <span className="text-xl">{f.icon}</span>
                <span className="text-xs text-slate-300 font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-sm">© 2026 StadiumFlow AI. FIFA World Cup 2026.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-display font-bold gradient-text">StadiumFlow AI</span>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-display font-bold text-slate-100 mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-6">Sign in to your StadiumFlow account</p>

            {/* Demo mode — one-click instant login */}
            <div className="mb-5 p-4 bg-indigo-950/40 border border-indigo-800/50 rounded-xl">
              <p className="text-xs text-indigo-300 font-semibold mb-3 flex items-center gap-1.5">
                <Zap size={12} className="text-indigo-400" />
                Demo Mode — One-click login:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => loginAsDemo(acc.email)}
                    disabled={!!demoLoading || isLoading}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 text-xs font-semibold transition-all ${acc.color} ${acc.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
                    type="button"
                  >
                    {demoLoading === acc.email ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : null}
                    {acc.role}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-xl flex items-start gap-2" role="alert">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-600">
                <span className="bg-slate-900 px-3">or sign in manually</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label className="input-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="input-field"
                  placeholder="you@example.com"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && <p id="email-error" className="input-error"><AlertCircle size={12} />{errors.email.message}</p>}
              </div>

              <div>
                <label className="input-label" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    className="input-field pr-11"
                    placeholder="••••••••"
                    aria-describedby={errors.password ? 'pw-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p id="pw-error" className="input-error"><AlertCircle size={12} />{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('rememberMe')} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500" />
                  <span className="text-sm text-slate-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
              </div>

              <button
                type="submit"
                disabled={isLoading || !!demoLoading}
                className="btn-primary w-full"
                aria-live="polite"
              >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
