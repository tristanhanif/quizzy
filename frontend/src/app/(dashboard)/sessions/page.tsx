'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useJoinSession } from '@/hooks/useQuiz';

export default function SessionsPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const joinSession = useJoinSession();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await joinSession.mutateAsync(roomCode.toUpperCase());
      if (result.data.isValid) {
        router.push(`/quiz/${roomCode.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Failed to join session:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Join Quiz Session</h1>

      <Card>
        <form onSubmit={handleJoin} className="space-y-4">
          <Input
            label="Room Code"
            placeholder="ABC123"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
          />
          {joinSession.isError && (
            <p className="text-sm text-gray-600">Session not found or already ended.</p>
          )}
          <Button type="submit" className="w-full" isLoading={joinSession.isPending} disabled={roomCode.length < 6}>
            Join Session
          </Button>
        </form>
      </Card>
    </div>
  );
}
