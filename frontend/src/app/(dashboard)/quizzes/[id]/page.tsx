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

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!quiz) return <div className="text-center py-12 text-gray-500">Quiz not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        <Button variant="ghost" onClick={() => router.back()}>Back</Button>
      </div>

      <Card>
        <p className="text-gray-600 mb-4">{quiz.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{quiz.questions.length} questions</span>
          <span>Created {formatDate(quiz.createdAt)}</span>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions</h2>
        <div className="space-y-4">
          {quiz.questions.map((q, index) => (
            <Card key={q.questionId}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-indigo-600">Q{index + 1}</span>
                <span className="text-xs text-gray-500">{q.points} pts | {q.timeLimit}s</span>
              </div>
              <p className="text-gray-900 mb-3">{q.text}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.choices.map((choice, ci) => (
                  <div
                    key={ci}
                    className={`p-2 rounded-lg text-sm ${
                      choice === q.correctAnswer
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {String.fromCharCode(65 + ci)}. {choice}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {isCreator && isOwner && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Start Session</h3>
          <div className="flex items-center gap-4">
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time per question (sec)</label>
              <input
                type="number"
                min={5}
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button onClick={handleCreateSession} isLoading={createSession.isPending} className="mt-5">
              Create Room
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
