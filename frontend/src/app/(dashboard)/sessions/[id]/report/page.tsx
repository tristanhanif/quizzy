'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { sessionService } from '@/services/session.service';
import { quizService } from '@/services/quiz.service';
import { resultService } from '@/services/result.service';
import type { Session, Quiz, Result, LeaderboardEntry } from '@/types';

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const sessionRes = await sessionService.findOne(id);
        const sess = sessionRes.data;
        setSession(sess);

        const [quizRes, resultsRes, leaderboardRes] = await Promise.all([
          quizService.findOne(sess.quizId),
          resultService.getSessionResults(id),
          resultService.getLeaderboard(id),
        ]);

        setQuiz(quizRes.data);
        setResults(resultsRes.data.data);
        setLeaderboard(leaderboardRes.data.data);
      } catch {
        setError('Gagal memuat laporan sesi.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        <p className="mt-4 text-sm text-gray-400">Memuat laporan...</p>
      </div>
    );
  }

  if (error || !session || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <p className="mt-3 text-sm font-medium text-gray-400">{error || 'Laporan tidak ditemukan'}</p>
      </div>
    );
  }

  const totalParticipants = results.length;
  const totalQuestions = quiz.questions.length;

  const avgScore =
    totalParticipants > 0
      ? (results.reduce((sum, r) => sum + r.score, 0) / totalParticipants).toFixed(1)
      : '0';
  const highestScore = totalParticipants > 0 ? Math.max(...results.map((r) => r.score)) : 0;

  const completedCount = results.filter((r) => r.answers.length === totalQuestions).length;
  const completionRate =
    totalParticipants > 0 ? Math.round((completedCount / totalParticipants) * 100) : 0;

  const questionAnalysis = quiz.questions.map((question, index) => {
    let correctCount = 0;
    results.forEach((r) => {
      const answer = r.answers.find((a) => a.questionId === question.questionId);
      if (answer && answer.answer === question.correctAnswer) {
        correctCount++;
      }
    });
    return {
      index: index + 1,
      text: question.text,
      correctCount,
      wrongCount: totalParticipants - correctCount,
    };
  });

  const formattedDate = new Date(session.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
        <h1 className="text-3xl font-bold text-gray-900">Laporan Sesi</h1>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Kode Ruang</p>
            <p className="font-mono text-2xl font-bold tracking-[0.15em] text-indigo-600">{session.roomCode}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">Kuis</p>
            <p className="text-lg font-semibold text-gray-900">{quiz.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
          <p className="mt-0.5 text-xs text-gray-500">Total Peserta</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
          <p className="mt-0.5 text-xs text-gray-500">Rata-rata Skor</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.043-1.99.102-2.99.171A2.25 2.25 0 0 0 3 6.753V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6.753a2.25 2.25 0 0 0-1.25-2.017 48.594 48.594 0 0 0-2.99-.171M12 4.236c.996.043 1.99.102 2.99.171A2.25 2.25 0 0 1 16.5 6.753V18a2.25 2.25 0 0 1-2.25 2.25H10.5A2.25 2.25 0 0 1 8.25 18V6.753a2.25 2.25 0 0 1 1.25-2.017 48.594 48.594 0 0 1 2.99-.171M12 4.236c-.996.043-1.99.102-2.99.171A2.25 2.25 0 0 0 7.5 6.753V18a2.25 2.25 0 0 0 2.25 2.25h4.5A2.25 2.25 0 0 0 16.5 18V6.753a2.25 2.25 0 0 0-1.25-2.017 48.594 48.594 0 0 0-2.99-.171" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{highestScore}</p>
          <p className="mt-0.5 text-xs text-gray-500">Skor Tertinggi</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
          <p className="mt-0.5 text-xs text-gray-500">Completion Rate</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada data leaderboard.</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.participantId}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                  entry.rank === 1
                    ? 'bg-amber-50 border border-amber-200'
                    : entry.rank === 2
                      ? 'bg-gray-50 border border-gray-200'
                      : entry.rank === 3
                        ? 'bg-orange-50 border border-orange-200'
                        : 'border border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    entry.rank === 1
                      ? 'bg-amber-400 text-white'
                      : entry.rank === 2
                        ? 'bg-gray-400 text-white'
                        : entry.rank === 3
                          ? 'bg-orange-400 text-white'
                          : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {entry.rank}
                </div>
                <p className="flex-1 text-sm font-medium text-gray-900">{entry.participantName}</p>
                <p className="text-sm font-bold text-indigo-600">{entry.score} poin</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Analisis Soal</h2>
        {questionAnalysis.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada data analisis.</p>
        ) : (
          <div className="space-y-3">
            {questionAnalysis.map((q) => {
              const pct = totalParticipants > 0 ? Math.round((q.correctCount / totalParticipants) * 100) : 0;
              return (
                <div key={q.index} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="text-indigo-500 font-bold">Soal {q.index}.</span> {q.text}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        pct >= 70 ? 'bg-emerald-100 text-emerald-700' : pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {q.correctCount} benar
                      </span>
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        {q.wrongCount} salah
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Daftar Peserta</h2>
        {results.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada peserta yang menyelesaikan kuis.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left font-semibold text-gray-500">Nama</th>
                  <th className="pb-3 text-right font-semibold text-gray-500">Skor</th>
                  <th className="pb-3 text-center font-semibold text-gray-500">Benar</th>
                  <th className="pb-3 text-right font-semibold text-gray-500">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {[...results]
                  .sort((a, b) => b.score - a.score)
                  .map((r) => {
                    const correctAnswers = r.answers.filter((a) => {
                      const question = quiz.questions.find((q) => q.questionId === a.questionId);
                      return question && a.answer === question.correctAnswer;
                    }).length;
                    return (
                      <tr key={r.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 font-medium text-gray-900">{r.participantName}</td>
                        <td className="py-3 text-right font-semibold text-indigo-600">{r.score}</td>
                        <td className="py-3 text-center text-gray-600">
                          {correctAnswers}/{totalQuestions}
                        </td>
                        <td className="py-3 text-right text-gray-400">
                          {new Date(r.submittedAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
