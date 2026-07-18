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
    </div>
  );
}
