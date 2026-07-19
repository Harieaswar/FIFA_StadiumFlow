import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const schema = z.object({ email: z.string().email('Valid email required') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSent(true);
    } catch {
      // Still show success to avoid email enumeration
      setSent(true);
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
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-900/20 border border-emerald-700/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">If an account exists with that email, we've sent a password reset link.</p>
              <Link to="/login" className="btn-primary">
                <ArrowLeft size={16} /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm mb-6">
                <ArrowLeft size={14} /> Back to login
              </Link>
              <h2 className="text-2xl font-display font-bold text-slate-100 mb-1">Reset password</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-xl flex items-start gap-2" role="alert">
                  <AlertCircle size={16} className="text-red-400" /><p className="text-sm text-red-300">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                  <label className="input-label" htmlFor="reset-email">Email address</label>
                  <input id="reset-email" type="email" {...register('email')} className="input-field" placeholder="you@example.com" />
                  {errors.email && <p className="input-error"><AlertCircle size={12} />{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
