'use client';

import { useQuizzes, useDeleteQuiz } from '@/hooks/useQuiz';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import QuizCard from '@/components/quiz/QuizCard';
import Button from '@/components/ui/Button';
import { UserRole } from '@/types';

export default function QuizzesPage() {
  const { user } = useAuthStore();
  const { data: quizzes, isLoading } = useQuizzes();
  const deleteQuiz = useDeleteQuiz();
  const router = useRouter();

  const isCreator = user?.role === UserRole.CREATOR;
  const myQuizzes = quizzes?.filter((q) => q.creatorId === user?.id) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola dan jelajahi quiz yang tersedia</p>
        </div>
        {isCreator && (
          <button
            onClick={() => router.push('/quizzes/create')}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.97]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Buat Quiz
          </button>
        )}
      </div>

      {isCreator && myQuizzes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quiz Saya</h2>
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              {myQuizzes.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onClick={() => router.push(`/quizzes/${quiz.id}`)}
                actions={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Hapus quiz ini?')) {
                        deleteQuiz.mutate(quiz.id);
                      }
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Hapus
                  </button>
                }
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Semua Quiz</h2>
          {!isLoading && quizzes && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {quizzes.length}
            </span>
          )}
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            <p className="mt-4 text-sm text-gray-400">Memuat quiz...</p>
          </div>
        ) : quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onClick={() => router.push(`/quizzes/${quiz.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
            <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-400">Belum ada quiz ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
