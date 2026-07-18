'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz, useCreateSession } from '@/hooks/useQuiz';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { UserRole } from '@/types';
import { formatDate } from '@/utils/formatters';
import { useState } from 'react';

export default function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: quiz, isLoading } = useQuiz(id);
  const createSession = useCreateSession();
  const [timeLimit, setTimeLimit] = useState(30);

  const isCreator = user?.role === UserRole.CREATOR;
  const isOwner = quiz?.creatorId === user?.id;

  const handleCreateSession = async () => {
    try {
      const result = await createSession.mutateAsync({
        quizId: id,
        questionTimeLimit: timeLimit,
      });
      router.push(`/quiz/${result.data.roomCode}`);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        <p className="mt-4 text-sm text-gray-400">Memuat quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <p className="mt-3 text-sm font-medium text-gray-400">Quiz tidak ditemukan</p>
      </div>
    );
  }

  const choiceLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
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
        <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-gray-600 leading-relaxed">{quiz.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
            {quiz.questions.length} pertanyaan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Dibuat {formatDate(quiz.createdAt)}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shadow-indigo-200">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Pertanyaan</h2>
        </div>
        <div className="space-y-4">
          {quiz.questions.map((q, index) => (
            <div key={q.questionId} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                   <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm shadow-indigo-200">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">Pertanyaan {index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{q.points} poin</span>
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{q.timeLimit}s</span>
                </div>
              </div>
              <p className="text-gray-900 mb-3 leading-relaxed">{q.text}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {q.choices.map((choice, ci) => (
                  <div
                    key={ci}
                    className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                      choice === q.correctAnswer
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border border-gray-100'
                    }`}
                  >
                    <span className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      choice === q.correctAnswer
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {choiceLabels[ci]}
                    </span>
                    <span className="truncate">{choice}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isCreator && isOwner && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Mulai Sesi</h3>
          </div>
          <div className="flex items-end gap-4">
            <div className="w-44">
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu per pertanyaan (detik)</label>
              <input
                type="number"
                min={5}
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
            <button
              onClick={handleCreateSession}
              disabled={createSession.isPending}
               className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.97] disabled:opacity-50"
            >
              {createSession.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015A3.001 3.001 0 0 0 21 9.349m0 0a3.001 3.001 0 0 0-3.75-.615A2.993 2.993 0 0 0 15 7.5a2.993 2.993 0 0 0-2.25 1.016A2.993 2.993 0 0 0 10.5 7.5c-.896 0-1.7.393-2.25 1.015A3.001 3.001 0 0 0 6 9.349" />
                </svg>
              )}
              Buat Ruang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
