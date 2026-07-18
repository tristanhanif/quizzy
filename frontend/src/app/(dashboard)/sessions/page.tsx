'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useJoinSession } from '@/hooks/useQuiz';

export default function SessionsPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const joinSession = useJoinSession();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await joinSession.mutateAsync(roomCode.toUpperCase());
      if (result.data.isValid) {
        router.push(`/quiz/${roomCode.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Failed to join session:', err);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015A3.001 3.001 0 0 0 21 9.349m0 0a3.001 3.001 0 0 0-3.75-.615A2.993 2.993 0 0 0 15 7.5a2.993 2.993 0 0 0-2.25 1.016A2.993 2.993 0 0 0 10.5 7.5c-.896 0-1.7.393-2.25 1.015A3.001 3.001 0 0 0 6 9.349" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Gabung Sesi Quiz</h1>
          <p className="mt-2 text-sm text-gray-500">Masukkan kode ruang untuk bergabung</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kode Ruang</label>
              <input
                type="text"
                placeholder="ABC123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-center font-mono text-2xl font-bold tracking-[0.3em] text-gray-900 uppercase placeholder-gray-300 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="mt-2 text-center text-xs text-gray-400">Masukkan 6 karakter kode ruang</p>
            </div>
            {joinSession.isError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                Sesi tidak ditemukan atau sudah berakhir.
              </div>
            )}
            <button
              type="submit"
              disabled={joinSession.isPending || roomCode.length < 6}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joinSession.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Bergabung...
                </span>
              ) : (
                'Gabung'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
