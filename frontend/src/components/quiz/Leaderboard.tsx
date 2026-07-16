'use client';

import Card from '@/components/ui/Card';
import { getRankBadge, formatScore } from '@/utils/formatters';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  return (
    <Card className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard</h3>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No results yet</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isCurrentUser = entry.participantId === currentUserId;
            return (
              <div
                key={entry.participantId}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isCurrentUser ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center text-lg">{getRankBadge(entry.rank)}</span>
                  <div>
                    <p className={`font-medium ${isCurrentUser ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {entry.participantName}
                      {isCurrentUser && <span className="text-xs ml-1 text-indigo-500">(You)</span>}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">{formatScore(entry.score)}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
