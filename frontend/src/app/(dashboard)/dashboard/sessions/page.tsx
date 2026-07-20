'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sessionService } from '@/services/session.service';
import { SessionStatus } from '@/types';

interface CreatorSession {
  id: string;
  quizId: string;
  quizTitle: string;
  roomCode: string;
  status: SessionStatus;
  participantCount: number;
  maxParticipants: number;
  createdAt: string;
}

function statusBadge(status: SessionStatus) {
  switch (status) {
    case SessionStatus.WAITING:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Menunggu
        </span>
      );
    case SessionStatus.LIVE:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      );
    case SessionStatus.FINISHED:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Selesai
        </span>
      );
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function CreatorSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CreatorSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await sessionService.getMine();
        setSessions(res.data?.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeCount = sessions.filter((s) => s.status === SessionStatus.LIVE).length;
  const finishedCount = sessions.filter((s) => s.status === SessionStatus.FINISHED).length;
  const totalParticipants = sessions.reduce((sum, s) => sum + s.participantCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sesi Saya</h1>
          <p className="text-sm text-slate-500">Daftar sesi quiz yang pernah kamu buat</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
          <p className="text-sm text-slate-500">Total Sesi</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-sm text-slate-500">Sesi Aktif</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-500">{finishedCount}</p>
          <p className="text-sm text-slate-500">Selesai</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-indigo-600">{totalParticipants}</p>
          <p className="text-sm text-slate-500">Total Peserta</p>
        </div>
      </div>

      {/* Session List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-100" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-50 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 shrink-0">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {session.quizTitle || 'Quiz'}
                    </h3>
                    {statusBadge(session.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{session.roomCode}</span>
                    <span>{session.participantCount} peserta</span>
                    <span>{formatDate(session.createdAt)} · {formatTime(session.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {session.status === SessionStatus.LIVE && (
                    <button
                      onClick={() => router.push(`/quiz/${session.roomCode}`)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Masuk
                    </button>
                  )}
                  {session.status === SessionStatus.FINISHED && (
                    <>
                      <button
                        onClick={() => router.push(`/sessions/${session.id}/leaderboard`)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        Leaderboard
                      </button>
                      <button
                        onClick={() => router.push(`/sessions/${session.id}/report`)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Laporan
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Belum ada sesi</h3>
          <p className="text-sm text-slate-500 mb-5">
            Mulai buat quiz lalu start sesi untuk melihat riwayat di sini.
          </p>
          <button
            onClick={() => router.push('/quizzes')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            Lihat Quiz Saya
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-slate-400">Quizzy v1.0 — Platform Quiz Interaktif Real-Time</p>
      </div>
    </div>
  );
}
