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

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!session) return <div className="text-center py-12 text-gray-500">Session not found</div>;

  const statusColors = {
    [SessionStatus.WAITING]: 'bg-gray-100 text-gray-700',
    [SessionStatus.LIVE]: 'bg-indigo-100 text-indigo-700',
    [SessionStatus.FINISHED]: 'bg-gray-200 text-gray-600',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
        <Button variant="ghost" onClick={() => router.back()}>Back</Button>
      </div>

      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Room Code</span>
            <span className="font-mono text-xl font-bold text-indigo-600">{session.roomCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[session.status]}`}>
              {session.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Participants</span>
            <span className="font-medium">{session.participants.length} / {session.maxParticipants}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Time per Question</span>
            <span className="font-medium">{session.questionTimeLimit}s</span>
          </div>
        </div>
      </Card>

      {session.status === SessionStatus.WAITING && (
        <Button className="w-full" onClick={() => router.push(`/quiz/${session.roomCode}`)}>
          Enter Quiz Arena
        </Button>
      )}

      {session.status === SessionStatus.FINISHED && (
        <Button className="w-full" variant="secondary" onClick={() => router.push(`/results?sessionId=${session.id}`)}>
          View Leaderboard
        </Button>
      )}
    </div>
  );
}
