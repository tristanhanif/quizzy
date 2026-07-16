'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLeaderboard } from '@/hooks/useQuiz';
import { useAuthStore } from '@/store/authStore';
import Leaderboard from '@/components/quiz/Leaderboard';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get('sessionId') || '';
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [queryId, setQueryId] = useState(initialSessionId);
  const { data: leaderboard, isLoading } = useLeaderboard(queryId);
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Results & Leaderboard</h1>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQueryId(sessionId);
          }}
          className="flex items-end gap-4"
        >
          <div className="flex-1">
            <Input
              label="Session ID"
              placeholder="Enter session ID..."
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!sessionId}>
            Search
          </Button>
        </form>
      </Card>

      {queryId && (
        isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading leaderboard...</div>
        ) : leaderboard ? (
          <Leaderboard entries={leaderboard} currentUserId={user?.id} />
        ) : (
          <p className="text-center py-12 text-gray-500">No results found for this session.</p>
        )
      )}
    </div>
  );
}
