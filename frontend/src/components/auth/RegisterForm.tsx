'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import GoogleLoginButton from './GoogleLoginButton';
import Link from 'next/link';
import { UserRole } from '@/types';

export default function RegisterForm() {
  const { register, error, isPending } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ fullName, email, password, role });
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
          <span className="text-white font-bold text-xl">Q</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Buat Akun Baru</h1>
        <p className="text-slate-500 mt-2">Gabung dengan Quizzy dan mulai petualangan quiz-mu!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Nama Lengkap"
          type="text"
          placeholder="Nama kamu"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
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
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">Saya ingin jadi</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole(UserRole.PARTICIPANT)}
              className={`p-4 rounded-xl border-2 text-center transition-colors ${
                role === UserRole.PARTICIPANT
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                role === UserRole.PARTICIPANT ? 'bg-indigo-100' : 'bg-slate-100'
              }`}>
                <svg className={`w-5 h-5 ${role === UserRole.PARTICIPANT ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className={`font-semibold text-sm ${role === UserRole.PARTICIPANT ? 'text-indigo-700' : 'text-slate-700'}`}>Participant</p>
              <p className="text-xs text-slate-500 mt-0.5">Ikuti quiz</p>
            </button>

            <button
              type="button"
              onClick={() => setRole(UserRole.CREATOR)}
              className={`p-4 rounded-xl border-2 text-center transition-colors ${
                role === UserRole.CREATOR
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                role === UserRole.CREATOR ? 'bg-indigo-100' : 'bg-slate-100'
              }`}>
                <svg className={`w-5 h-5 ${role === UserRole.CREATOR ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className={`font-semibold text-sm ${role === UserRole.CREATOR ? 'text-indigo-700' : 'text-slate-700'}`}>Creator</p>
              <p className="text-xs text-slate-500 mt-0.5">Buat quiz</p>
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11" isLoading={isPending}>
          Buat Akun
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
        Sudah punya akun?{' '}
        <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
          Masuk
        </Link>
      </p>
    </div>
  );
}
