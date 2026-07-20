'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { resultService } from '@/services/result.service';
import { sessionService } from '@/services/session.service';
import { formatDate } from '@/utils/formatters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Result, Session } from '@/types';

interface ResultWithSession extends Result {
  session?: Session;
}

export default function HistoryPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [results, setResults] = useState<ResultWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function loadHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await resultService.getUserResults(user!.id);
        const rawResults = res.data?.data || [];

        const enrichedResults = await Promise.all(
          rawResults.map(async (r) => {
            try {
              const sessionRes = await sessionService.findOne(r.sessionId);
              return { ...r, session: sessionRes.data };
            } catch {
              return r;
            }
          })
        );

        enrichedResults.sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );

        setResults(enrichedResults);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memuat riwayat kuis';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user?.id]);

  const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
  const avgScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Memuat riwayat..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-600 transition-all group mb-4"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Kuis</h1>
        <p className="mt-1 text-sm text-gray-500">Semua kuis yang pernah kamu ikuti</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{results.length}</p>
          <p className="text-sm text-slate-500">Total Kuis Diikuti</p>
        </div>
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{totalScore.toLocaleString('id-ID')}</p>
          <p className="text-sm text-slate-500">Total Skor</p>
        </div>
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{avgScore}</p>
          <p className="text-sm text-slate-500">Rata-rata Skor</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200/60 rounded-xl text-sm text-red-700">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Results List */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Belum ada riwayat</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-sm text-center">
            Kamu belum pernah mengikuti kuis. Gabung sesi kuis untuk mulai bermain!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => router.push(`/results?sessionId=${result.sessionId}`)}
              className="group w-full flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-colors text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 shrink-0">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {result.session?.roomCode
                    ? `Sesi ${result.session.roomCode}`
                    : `Sesi ${result.sessionId.slice(0, 8)}...`}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {formatDate(result.submittedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                    </svg>
                    {result.answers?.length || 0} soal
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-indigo-600">{result.score}</p>
                <p className="text-[11px] text-slate-400">poin</p>
              </div>
              <svg className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
