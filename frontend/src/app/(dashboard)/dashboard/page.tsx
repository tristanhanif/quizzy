'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useQuizzes } from '@/hooks/useQuiz';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { UserRole } from '@/types';

function JoinSessionForm() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        placeholder="Enter room code..."
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        maxLength={6}
      />
      <Button
        onClick={() => roomCode && router.push(`/quiz/${roomCode}`)}
        disabled={roomCode.length < 6}
      >
        Join Quiz
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: quizzes, isLoading } = useQuizzes();
  const router = useRouter();

  const isCreator = user?.role === UserRole.CREATOR;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500 mt-1">
          {isCreator ? 'Manage your quizzes and sessions' : 'Join a quiz and start learning!'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <p className="text-3xl font-bold text-indigo-600">{quizzes?.length || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Quizzes</p>
        </Card>
        {isCreator && (
          <>
            <Card className="text-center">
              <p className="text-3xl font-bold text-indigo-600">
                {quizzes?.filter((q) => q.creatorId === user?.id).length || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">My Quizzes</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-indigo-600">0</p>
              <p className="text-sm text-gray-500 mt-1">Active Sessions</p>
            </Card>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Available Quizzes</h2>
        {isCreator && (
          <Button onClick={() => router.push('/quizzes/create')}>
            Create Quiz
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading quizzes...</div>
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} variant="hover" onClick={() => router.push(`/quizzes/${quiz.id}`)}>
              <h3 className="font-semibold text-gray-900 mb-2">{quiz.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{quiz.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{quiz.questions.length} questions</span>
                {isCreator && quiz.creatorId === user?.id && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Yours</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-500">No quizzes available yet.</p>
          {isCreator && (
            <Button className="mt-4" onClick={() => router.push('/quizzes/create')}>
              Create Your First Quiz
            </Button>
          )}
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Join</h2>
        <Card>
          <JoinSessionForm />
        </Card>
      </div>
    </div>
  );
}
