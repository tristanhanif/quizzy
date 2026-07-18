'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLeaderboard } from '@/hooks/useQuiz';
import { useAuthStore } from '@/store/authStore';
import Leaderboard from '@/components/quiz/Leaderboard';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get('sessionId') || '';
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [queryId, setQueryId] = useState(initialSessionId);
  const { data: leaderboard, isLoading } = useLeaderboard(queryId);
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hasil & Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">Cari hasil berdasarkan sesi quiz</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQueryId(sessionId);
          }}
          className="flex items-end gap-4"
        >
          <div className="flex-1">
            <Input
              label="ID Sesi"
              placeholder="Masukkan ID sesi..."
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!sessionId}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed mb-[1px]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Cari
          </button>
        </form>
      </div>

      {queryId && (
        isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            <p className="mt-4 text-sm text-gray-400">Memuat leaderboard...</p>
          </div>
        ) : leaderboard ? (
          <Leaderboard entries={leaderboard} currentUserId={user?.id} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
            <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-400">Tidak ada hasil ditemukan untuk sesi ini</p>
          </div>
        )
      )}

      {!queryId && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
          <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-400">Masukkan ID sesi untuk melihat hasil</p>
        </div>
      )}
    </div>
  );
}
