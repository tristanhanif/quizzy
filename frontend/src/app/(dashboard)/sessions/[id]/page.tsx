'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useSessionByRoomCode } from '@/hooks/useQuiz';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { SessionStatus } from '@/types';

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isLoading } = useSession(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        <p className="mt-4 text-sm text-gray-400">Memuat sesi...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <p className="mt-3 text-sm font-medium text-gray-400">Sesi tidak ditemukan</p>
      </div>
    );
  }

  const statusConfig = {
    [SessionStatus.WAITING]: {
      label: 'Menunggu',
      color: 'bg-amber-100 text-amber-700 ring-amber-200',
      dot: 'bg-amber-500',
    },
    [SessionStatus.LIVE]: {
      label: 'Berlangsung',
      color: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
      dot: 'bg-emerald-500',
    },
    [SessionStatus.FINISHED]: {
      label: 'Selesai',
      color: 'bg-gray-100 text-gray-600 ring-gray-200',
      dot: 'bg-gray-400',
    },
  };

  const currentStatus = statusConfig[session.status];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600 mb-4"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Detail Sesi</h1>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${currentStatus.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`} />
            {currentStatus.label}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-8 shadow-sm text-center">
        <p className="text-sm font-medium text-gray-500 mb-3">Kode Ruang</p>
        <div className="inline-flex items-center gap-3 rounded-2xl border border-indigo-200 bg-white px-8 py-4 shadow-sm">
          <span className="font-mono text-4xl font-bold tracking-[0.2em] text-indigo-600">{session.roomCode}</span>
        </div>
        <p className="mt-3 text-xs text-gray-400">Bagikan kode ini kepada peserta</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{session.participants.length}</p>
          <p className="mt-0.5 text-xs text-gray-500">Peserta</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{session.questionTimeLimit}s</p>
          <p className="mt-0.5 text-xs text-gray-500">Per Soal</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{session.maxParticipants}</p>
          <p className="mt-0.5 text-xs text-gray-500">Maks</p>
        </div>
      </div>

      {session.status === SessionStatus.WAITING && (
        <button
          onClick={() => router.push(`/quiz/${session.roomCode}`)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl active:scale-[0.98]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
          Masuk Arena
        </button>
      )}

      {session.status === SessionStatus.FINISHED && (
        <button
          onClick={() => router.push(`/results?sessionId=${session.id}`)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-6 py-4 text-base font-semibold text-indigo-700 transition-all duration-200 hover:bg-indigo-100 active:scale-[0.98]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.043-1.99.102-2.99.171A2.25 2.25 0 0 0 3 6.753V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6.753a2.25 2.25 0 0 0-1.25-2.017 48.594 48.594 0 0 0-2.99-.171M12 4.236c.996.043 1.99.102 2.99.171A2.25 2.25 0 0 1 16.5 6.753V18a2.25 2.25 0 0 1-2.25 2.25H10.5A2.25 2.25 0 0 1 8.25 18V6.753a2.25 2.25 0 0 1 1.25-2.017 48.594 48.594 0 0 1 2.99-.171M12 4.236c-.996.043-1.99.102-2.99.171A2.25 2.25 0 0 0 7.5 6.753V18a2.25 2.25 0 0 0 2.25 2.25h4.5A2.25 2.25 0 0 0 16.5 18V6.753a2.25 2.25 0 0 0-1.25-2.017 48.594 48.594 0 0 0-2.99-.171" />
          </svg>
          Lihat Leaderboard
        </button>
      )}
    </div>
  );
}
