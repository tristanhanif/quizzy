'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/admin/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const raw = await res.json();
      const data = raw.data ?? raw;

      if (!res.ok || !data.isValid) {
        setError('Email ini bukan akun admin yang terdaftar.');
        return;
      }

      setStep('pin');
    } catch {
      setError('Gagal memverifikasi email. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });

      const raw = await res.json();
      const data = raw.data ?? raw;

      if (!res.ok) {
        setError(data.message || 'PIN admin salah. Akses ditolak.');
        return;
      }

      // Store auth data
      setAuth(data.user, data.accessToken);
      router.push('/dashboard/admin');
    } catch {
      setError('Gagal login. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Kembali ke Login
        </Link>
        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6">
          <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Access</h1>
        <p className="text-slate-500 mt-2">Akses khusus admin Quizzy. Verifikasi identitas diperlukan.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          step === 'email' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current text-white text-[10px] font-bold">1</span>
          Email
        </div>
        <div className="flex-1 h-px bg-slate-200" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          step === 'pin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'
        }`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current text-white text-[10px] font-bold">2</span>
          PIN
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Admin</label>
            <input
              type="email"
              placeholder="admin@quizzy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi Email'}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">PIN Admin</label>
            <p className="text-xs text-slate-500 mb-2">Masukkan 6 digit PIN untuk <span className="font-medium text-slate-700">{email}</span></p>
            <input
              type="password"
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 font-mono text-2xl tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || pin.length < 6}
            className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memverifikasi...' : 'Masuk sebagai Admin'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('email'); setPin(''); setError(''); }}
            className="w-full h-11 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Ganti Email
          </button>
        </form>
      )}

      <p className="text-center mt-8 text-xs text-slate-400">
        Hanya user admin yang terdaftar yang dapat mengakses halaman ini.
      </p>
    </div>
  );
}
