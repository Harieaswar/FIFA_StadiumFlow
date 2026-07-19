import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Building2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

const passwordSchema = z.string()
  .min(10, 'At least 10 characters')
  .regex(/[A-Z]/, 'One uppercase letter')
  .regex(/[a-z]/, 'One lowercase letter')
  .regex(/[0-9]/, 'One number')
  .regex(/[^A-Za-z0-9]/, 'One special character');

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Valid email required'),
  role: z.enum(['fan', 'volunteer', 'staff']),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Medium', color: 'bg-amber-500' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'fan' },
  });

  const strength = getPasswordStrength(password);

  const requirements = [
    { label: '10+ characters', met: password.length >= 10 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);
    try {
      await signup(data.email, data.password, data.displayName, data.role);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'Unable to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-display font-bold gradient-text text-lg">StadiumFlow AI</span>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-display font-bold text-slate-100 mb-1">Create account</h2>
          <p className="text-slate-400 text-sm mb-6">Join StadiumFlow AI for FIFA World Cup 2026</p>

          <div className="mb-4 p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl">
            <p className="text-xs text-amber-300">🎭 Demo Mode: New accounts are created in memory and reset on server restart.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-xl flex items-start gap-2" role="alert">
              <AlertCircle size={16} className="text-red-400 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="input-label" htmlFor="displayName">Full Name</label>
              <input id="displayName" {...register('displayName')} className="input-field" placeholder="Alex Rivera" />
              {errors.displayName && <p className="input-error"><AlertCircle size={12} />{errors.displayName.message}</p>}
            </div>

            <div>
              <label className="input-label" htmlFor="email-signup">Email</label>
              <input id="email-signup" type="email" {...register('email')} className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="input-error"><AlertCircle size={12} />{errors.email.message}</p>}
            </div>

            <div>
              <label className="input-label" htmlFor="role">Role</label>
              <select id="role" {...register('role')} className="input-field">
                <option value="fan">Fan</option>
                <option value="volunteer">Volunteer</option>
                <option value="staff">Venue Staff</option>
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="password-signup">Password</label>
              <div className="relative">
                <input
                  id="password-signup"
                  type={showPw ? 'text' : 'password'}
                  {...register('password', { onChange: e => setPassword(e.target.value) })}
                  className="input-field pr-11"
                  placeholder="Min. 10 characters"
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" aria-label={showPw ? 'Hide' : 'Show'}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="input-error"><AlertCircle size={12} />{errors.password.message}</p>}

              {/* Strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full transition-all', strength.color)} style={{ width: `${(strength.score / 5) * 100}%` }} />
                    </div>
                    <span className={clsx('text-xs font-medium', strength.label === 'Strong' ? 'text-emerald-400' : strength.label === 'Medium' ? 'text-amber-400' : 'text-red-400')}>
                      {strength.label}
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 gap-1 mt-2">
                    {requirements.map(r => (
                      <li key={r.label} className={clsx('text-xs flex items-center gap-1', r.met ? 'text-emerald-400' : 'text-slate-500')}>
                        <CheckCircle size={10} className={r.met ? 'text-emerald-400' : 'text-slate-700'} />{r.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} {...register('confirmPassword')} className="input-field pr-11" placeholder="Repeat password" />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" aria-label={showConfirm ? 'Hide' : 'Show'}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="input-error"><AlertCircle size={12} />{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
