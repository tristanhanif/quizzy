'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ParticipantDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');

  const handleJoin = () => {
    if (roomCode.length === 6) {
      router.push(`/quiz/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-indigo-600 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Halo, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-indigo-200 mt-1">Siap untuk quiz berikutnya?</p>
            {user?.displayId && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-mono">
                <svg className="h-4 w-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
                <span className="text-indigo-100">{user.displayId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Quiz Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-8 text-white shadow-lg shadow-indigo-200">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium mb-3 backdrop-blur-sm">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Masuk Quiz
            </div>
            <p className="text-xl font-bold mb-1">Punya kode ruangan?</p>
            <p className="text-indigo-100 text-sm">
              Masukkan kode 6 digit dari host untuk join quiz
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full md:w-48 px-5 py-3.5 rounded-xl border-0 bg-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50 text-center font-mono text-xl tracking-[0.3em] backdrop-blur-sm"
              maxLength={6}
            />
            <Button
              size="lg"
              onClick={handleJoin}
              disabled={roomCode.length < 6}
              className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg shadow-indigo-700/20 font-bold"
            >
              Gabung
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Quiz Diikuti</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-purple-500" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Total Skor</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500">Peringkat Terbaik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mulai Sekarang */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Mulai Sekarang</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card variant="hover" onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="ABC123"]')?.focus()}>
            <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Masukkan Kode</p>
                <p className="text-sm text-gray-500">Gabung quiz dengan kode ruangan</p>
              </div>
            </div>
          </Card>
          <Card variant="hover" onClick={() => router.push('/results')}>
            <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Lihat Hasil</p>
                <p className="text-sm text-gray-500">Cek skor & leaderboard</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Upgrade Prompt */}
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-gray-900 font-semibold mb-1">Mau jadi Creator?</p>
        <p className="text-sm text-gray-500 mb-3">Buat quiz sendiri dan bagikan ke orang lain</p>
        <p className="text-xs text-gray-400">Hubungi admin untuk upgrade akunmu</p>
      </div>
    </div>
  );
}
