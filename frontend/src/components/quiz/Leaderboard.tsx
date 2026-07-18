'use client';

import { getRankBadge, formatScore } from '@/utils/formatters';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
            <p className="text-sm text-gray-500">Peringkat pemain</p>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Belum ada hasil</p>
          <p className="text-sm text-gray-400 mt-1">Hasil quiz akan muncul di sini</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.participantId === currentUserId;
            const isFirst = entry.rank === 1;
            return (
              <div
                key={entry.participantId}
                className={`flex items-center justify-between px-6 py-4 transition-colors ${
                  isCurrentUser
                    ? 'bg-indigo-50/70 border-l-4 border-l-indigo-500'
                    : index === 0
                    ? 'bg-amber-50/30'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    isFirst
                       ? 'bg-amber-500 text-white shadow-sm'
                       : entry.rank === 2
                       ? 'bg-gray-400 text-white'
                       : entry.rank === 3
                       ? 'bg-orange-400 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className="font-bold text-sm">{entry.rank}</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${isCurrentUser ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {entry.participantName}
                    </p>
                    {isCurrentUser && (
                      <p className="text-xs text-indigo-500 font-medium">Kamu</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatScore(entry.score)}</p>
                  <p className="text-xs text-gray-400">skor</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
