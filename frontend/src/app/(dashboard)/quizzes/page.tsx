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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
        {isCreator && (
          <Button onClick={() => router.push('/quizzes/create')}>Create Quiz</Button>
        )}
      </div>

      {isCreator && myQuizzes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onClick={() => router.push(`/quizzes/${quiz.id}`)}
                actions={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this quiz?')) {
                        deleteQuiz.mutate(quiz.id);
                      }
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Delete
                  </button>
                }
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Quizzes</h2>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onClick={() => router.push(`/quizzes/${quiz.id}`)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">No quizzes found.</p>
        )}
      </div>
    </div>
  );
}
