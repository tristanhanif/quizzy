'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import GoogleLoginButton from './GoogleLoginButton';
import Link from 'next/link';

export default function LoginForm() {
  const { login, error, isPending } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
          <span className="text-white font-bold text-xl">Q</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Masuk ke Quizzy</h1>
        <p className="text-slate-500 mt-2">Selamat datang kembali! Silakan masuk ke akunmu.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full h-11" isLoading={isPending}>
          Masuk
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-400">atau</span>
        </div>
      </div>

      <GoogleLoginButton />

      <p className="text-center mt-8 text-sm text-slate-500">
        Belum punya akun?{' '}
        <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
          Daftar sekarang
        </Link>
      </p>

      <div className="mt-4 text-center">
        <Link href="/admin-login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Apakah anda seorang admin?
        </Link>
      </div>
    </div>
  );
}
