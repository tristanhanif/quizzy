'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function OnboardingPage() {
  const { user } = useAuthStore();
  const { setRole, isPending, error } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.replace('/login');
    else if (user.role !== null) router.replace('/dashboard');
  }, [user, router]);

  if (!user || user.role !== null) return null;

  const handleContinue = async () => {
    if (!selectedRole) return;
    await setRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">Q</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Pilih Peranmu</h1>
          <p className="text-slate-500 mt-2">Agar kami bisa menyesuaikan pengalaman kamu</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setSelectedRole('CREATOR')}
            className={`p-6 rounded-xl border-2 text-left transition-colors ${
              selectedRole === 'CREATOR'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              selectedRole === 'CREATOR' ? 'bg-indigo-100' : 'bg-slate-100'
            }`}>
              <svg className={`w-6 h-6 ${selectedRole === 'CREATOR' ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Creator</h3>
            <p className="text-sm text-slate-500">Buat quiz, kelola sesi, dan pantau hasil</p>
          </button>

          <button
            onClick={() => setSelectedRole('PARTICIPANT')}
            className={`p-6 rounded-xl border-2 text-left transition-colors ${
              selectedRole === 'PARTICIPANT'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              selectedRole === 'PARTICIPANT' ? 'bg-indigo-100' : 'bg-slate-100'
            }`}>
              <svg className={`w-6 h-6 ${selectedRole === 'PARTICIPANT' ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Participant</h3>
            <p className="text-sm text-slate-500">Ikuti quiz, raih skor tertinggi</p>
          </button>

          <button
            onClick={() => setSelectedRole('ADMIN')}
            className={`p-6 rounded-xl border-2 text-left transition-colors ${
              selectedRole === 'ADMIN'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              selectedRole === 'ADMIN' ? 'bg-indigo-100' : 'bg-slate-100'
            }`}>
              <svg className={`w-6 h-6 ${selectedRole === 'ADMIN' ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Admin</h3>
            <p className="text-sm text-slate-500">Kelola platform dan pengguna</p>
          </button>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleContinue}
          disabled={!selectedRole || isPending}
          isLoading={isPending}
        >
          {selectedRole ? 'Lanjutkan' : 'Pilih peran terlebih dahulu'}
        </Button>
      </div>
    </div>
  );
}
