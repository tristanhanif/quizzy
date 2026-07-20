'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useQuizzes } from '@/hooks/useQuiz';
import { useRouter } from 'next/navigation';
import { resultService } from '@/services/result.service';
import { userService } from '@/services/user.service';
import { sessionService } from '@/services/session.service';
import { formatDate } from '@/utils/formatters';
import { UserRole, SessionStatus } from '@/types';
import type { Result, MutualUser } from '@/types';

function JoinSessionForm() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder="KODE 6 DIGIT"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 font-mono text-xl tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        maxLength={6}
      />
      <button
        onClick={() => roomCode.length === 6 && router.push(`/quiz/${roomCode}`)}
        disabled={roomCode.length < 6}
        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Gabung
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, iconBg }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, subtitle, onClick, iconBg }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  iconBg: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-colors text-left w-full"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</p>
          <p className="text-sm text-slate-500 truncate">{subtitle}</p>
        </div>
        <svg className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: quizzes, isLoading } = useQuizzes();
  const router = useRouter();
  const [greeting, setGreeting] = useState('Selamat Datang');
  const [myResults, setMyResults] = useState<Result[]>([]);
  const [myMutuals, setMyMutuals] = useState<MutualUser[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [mySessions, setMySessions] = useState<any[]>([]);

  const isParticipant = user?.role !== UserRole.CREATOR && user?.role !== UserRole.ADMIN;
  const isCreator = user?.role === UserRole.CREATOR;
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  useEffect(() => {
    if (!user || !isParticipant) return;
    async function loadParticipantData() {
      setStatsLoading(true);
      try {
        const [resultsRes, mutualsRes, pendingRes] = await Promise.allSettled([
          resultService.getUserResults(user!.id),
          userService.getMyMutuals(),
          userService.getPendingMutuals(),
        ]);
        if (resultsRes.status === 'fulfilled') setMyResults(resultsRes.value.data?.data || []);
        if (mutualsRes.status === 'fulfilled') setMyMutuals(mutualsRes.value.data?.data || []);
        if (pendingRes.status === 'fulfilled') setPendingCount(pendingRes.value.data?.data?.length || 0);
      } catch {
        // ignore
      } finally {
        setStatsLoading(false);
      }
    }
    loadParticipantData();
  }, [user?.id, isParticipant]);

  useEffect(() => {
    if (!user || !isCreator) return;
    async function loadCreatorData() {
      try {
        const sessionsRes = await sessionService.getMine();
        setMySessions(sessionsRes.data?.data || []);
      } catch {
        // ignore
      }
    }
    loadCreatorData();
  }, [user?.id, isCreator]);

  const myQuizzes = quizzes?.filter((q: any) => q.creatorId === user?.id) || [];
  const totalQuestions = myQuizzes.reduce((sum: number, q: any) => sum + (q.questions?.length || 0), 0);
  const activeSessions = mySessions.filter((s: any) => s.status === SessionStatus.LIVE).length;
  const totalParticipants = mySessions.reduce((sum: number, s: any) => sum + (s.participantCount || 0), 0);

  const participantStats = isParticipant ? {
    quizzesPlayed: myResults.length,
    totalScore: myResults.reduce((sum, r) => sum + (r.score || 0), 0),
    bestRank: myResults.length > 0 ? Math.min(...myResults.map(() => 1)) : 0,
  } : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-indigo-600 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {greeting}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-indigo-200 mt-1">
              {isAdmin ? 'Kelola platform dan pantau pengguna' : isCreator ? 'Kelola quiz dan pantau sesi aktifmu' : 'Siap untuk mengikuti quiz berikutnya?'}
            </p>
            {user?.displayId && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-mono">
                <svg className="h-4 w-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
                <span className="text-indigo-100">{user.displayId}</span>
              </div>
            )}
          </div>
          {(isCreator || isAdmin) && (
            <button
              onClick={() => router.push('/quizzes/create')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Buat Quiz Baru
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin ? (
          <>
            <StatCard value={quizzes?.length || 0} label="Total Quiz" iconBg="bg-indigo-50" icon={
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            } />
            <StatCard value="0" label="Sesi Aktif" iconBg="bg-slate-100" icon={
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            } />
            <StatCard value="-" label="Total Pengguna" iconBg="bg-indigo-50" icon={
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            } />
            <StatCard value="-" label="Total Kategori" iconBg="bg-slate-100" icon={
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            } />
          </>
        ) : isCreator ? (
          <>
            <StatCard value={myQuizzes.length} label="Quiz Saya" iconBg="bg-indigo-50" icon={
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            } />
            <StatCard value={totalQuestions} label="Total Soal" iconBg="bg-slate-100" icon={
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            } />
            <StatCard value={mySessions.length} label="Sesi Dibuat" iconBg="bg-indigo-50" icon={
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            } />
            <StatCard value={totalParticipants} label="Total Peserta" iconBg="bg-slate-100" icon={
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            } />
          </>
        ) : (
          <>
            <StatCard value={statsLoading ? '...' : participantStats?.quizzesPlayed || 0} label="Quiz Diikuti" iconBg="bg-indigo-50" icon={
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            } />
            <StatCard value={statsLoading ? '...' : participantStats?.totalScore || 0} label="Total Skor" iconBg="bg-slate-100" icon={
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
              </svg>
            } />
            <StatCard value={statsLoading ? '...' : participantStats?.bestRank ? `#${participantStats.bestRank}` : '-'} label="Peringkat Terbaik" iconBg="bg-indigo-50" icon={
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            } />
            <StatCard value={statsLoading ? '...' : myMutuals.length} label="Teman" iconBg="bg-slate-100" icon={
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            } />
          </>
        )}
      </div>

      {/* Quick Join - Participant */}
      {!isCreator && !isAdmin && (
        <div className="bg-indigo-600 rounded-xl p-6 text-white">
          <p className="text-sm font-semibold text-indigo-200 mb-1">Masuk Quiz</p>
          <p className="text-lg font-bold mb-4">Punya kode ruangan? Masukkan di bawah ini</p>
          <JoinSessionForm />
        </div>
      )}

      {/* Quiz Tersedia */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Quiz Tersedia</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isLoading ? '' : `${quizzes?.length || 0} quiz ditemukan`}
            </p>
          </div>
          {(isCreator || isAdmin) && (
            <button
              onClick={() => router.push('/quizzes/create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Buat Quiz
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-white border border-slate-200 p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-100" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-50 rounded w-full" />
                  <div className="h-3 bg-slate-50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz: any) => (
              <button
                key={quiz.id}
                onClick={() => router.push(`/quizzes/${quiz.id}`)}
                className="group bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 shrink-0">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{quiz.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{quiz.description || 'Tidak ada deskripsi'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm text-slate-500">
                    {quiz.questions?.length || 0} soal
                  </span>
                  {isCreator && quiz.creatorId === user?.id && (
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                      Milikmu
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Belum ada quiz</h3>
            <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
              {(isCreator || isAdmin) ? 'Mulai buat quiz pertamamu!' : 'Tunggu creator membuat quiz baru.'}
            </p>
            {(isCreator || isAdmin) && (
              <button
                onClick={() => router.push('/quizzes/create')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Buat Quiz Pertama
              </button>
            )}
          </div>
        )}
      </div>

      {/* Aksi Cepat */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isAdmin ? (
            <>
              <QuickActionCard
                title="Admin Panel"
                subtitle="Kelola pengguna & lihat statistik"
                onClick={() => router.push('/dashboard/admin')}
                iconBg="bg-indigo-50"
                icon={<svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
              />
              <QuickActionCard
                title="Buat Quiz Baru"
                subtitle="Tambah pertanyaan & mulai sesi"
                onClick={() => router.push('/quizzes/create')}
                iconBg="bg-slate-100"
                icon={<svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}
              />
              <QuickActionCard
                title="Lihat Hasil"
                subtitle="Leaderboard & statistik"
                onClick={() => router.push('/results')}
                iconBg="bg-indigo-50"
                icon={<svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
              />
            </>
          ) : isCreator ? (
            <>
              <QuickActionCard
                title="Buat Quiz Baru"
                subtitle="Tambah pertanyaan & mulai sesi"
                onClick={() => router.push('/quizzes/create')}
                iconBg="bg-indigo-50"
                icon={<svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}
              />
              <QuickActionCard
                title="Kelola Quiz"
                subtitle="Edit, hapus, & mulai sesi"
                onClick={() => router.push('/quizzes')}
                iconBg="bg-slate-100"
                icon={<svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
              <QuickActionCard
                title="Riwayat Sesi"
                subtitle={`${mySessions.length} sesi pernah dibuat`}
                onClick={() => router.push('/dashboard/sessions')}
                iconBg="bg-emerald-50"
                icon={<svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <QuickActionCard
                title="Lihat Hasil"
                subtitle="Leaderboard & statistik"
                onClick={() => router.push('/results')}
                iconBg="bg-indigo-50"
                icon={<svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
              />
            </>
          ) : (
            <>
              <QuickActionCard
                title="Masukkan Kode"
                subtitle="Gabung quiz dengan kode ruangan"
                onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="KODE 6 DIGIT"]')?.focus()}
                iconBg="bg-indigo-50"
                icon={<svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>}
              />
              <QuickActionCard
                title="Riwayat Kuis"
                subtitle="Lihat kuis yang pernah diikuti"
                onClick={() => router.push('/dashboard/history')}
                iconBg="bg-slate-100"
                icon={<svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <QuickActionCard
                title="Teman"
                subtitle={`${myMutuals.length} teman${pendingCount > 0 ? ` · ${pendingCount} request pending` : ''}`}
                onClick={() => router.push('/dashboard/friends')}
                iconBg="bg-indigo-50"
                icon={<svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
              />
              <QuickActionCard
                title="Lihat Hasil"
                subtitle="Cek skor & leaderboard"
                onClick={() => router.push('/results')}
                iconBg="bg-slate-100"
                icon={<svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
              />
              <QuickActionCard
                title="Profil Saya"
                subtitle="Edit profil & lihat ID"
                onClick={() => user?.displayId && router.push(`/profile/${user.displayId}`)}
                iconBg="bg-indigo-50"
                icon={<svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
              />
            </>
          )}
        </div>
      </div>

      {/* Quiz Terbaru - Creator */}
      {(isCreator || isAdmin) && myQuizzes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Quiz Terbaru</h2>
            <button
              onClick={() => router.push('/quizzes')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
            >
              Lihat Semua
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myQuizzes.slice(0, 4).map((quiz: any) => (
              <button
                key={quiz.id}
                onClick={() => router.push(`/quizzes/${quiz.id}`)}
                className="group flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 shrink-0">
                  <span className="text-indigo-600 font-bold text-sm">{quiz.questions?.length || 0}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{quiz.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-1">{quiz.description || 'Tidak ada deskripsi'}</p>
                </div>
                <svg className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sesi Terbaru - Creator */}
      {(isCreator || isAdmin) && mySessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Sesi Terbaru</h2>
            <button
              onClick={() => router.push('/dashboard/sessions')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
            >
              Lihat Semua
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            {mySessions.slice(0, 4).map((session: any) => (
              <div
                key={session.id}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 shrink-0">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 line-clamp-1">{session.quizTitle || 'Quiz'}</h4>
                    {session.status === SessionStatus.LIVE && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    )}
                    {session.status === SessionStatus.FINISHED && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        Selesai
                      </span>
                    )}
                    {session.status === SessionStatus.WAITING && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Menunggu
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{session.roomCode}</span>
                    <span>{session.participantCount} peserta</span>
                    <span>{formatDate(session.createdAt)}</span>
                  </div>
                </div>
                {session.status === SessionStatus.LIVE && (
                  <button
                    onClick={() => router.push(`/quiz/${session.roomCode}`)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shrink-0"
                  >
                    Masuk
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat Terakhir - Participant */}
      {isParticipant && myResults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Riwayat Terakhir</h2>
            <button
              onClick={() => router.push('/dashboard/history')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
            >
              Lihat Semua
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myResults.slice(0, 4).map((result) => (
              <button
                key={result.id}
                onClick={() => router.push(`/results?sessionId=${result.sessionId}`)}
                className="group flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 shrink-0">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {result.participantName || 'Quiz'}
                  </h4>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    Skor: {result.score} · {formatDate(result.submittedAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-indigo-600">{result.score}</p>
                  <p className="text-[11px] text-slate-400">poin</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-4 pb-2">
        <p className="text-xs text-slate-400">Quizzy v1.0 — Platform Quiz Interaktif Real-Time</p>
      </div>
    </div>
  );
}
