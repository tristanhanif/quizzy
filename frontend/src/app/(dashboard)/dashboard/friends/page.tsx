'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';
import { UserRole } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { MutualUser } from '@/types';

interface PendingRequest {
  id: string;
  userId: string;
  userName: string;
  userDisplayId: string;
  userPicture?: string;
  requestedAt: string;
}

export default function FriendsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<'friends' | 'pending' | 'search'>('friends');
  const [friends, setFriends] = useState<MutualUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ id: string; name: string; displayId: string; role: string; picture?: string } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [friendsRes, pendingRes] = await Promise.allSettled([
        userService.getMyMutuals(),
        userService.getPendingMutuals(),
      ]);
      if (friendsRes.status === 'fulfilled') setFriends(friendsRes.value.data?.data || []);
      if (pendingRes.status === 'fulfilled') setPendingRequests(pendingRes.value.data?.data || []);
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await userService.searchByDisplayId(searchQuery.trim());
      setSearchResult(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'User tidak ditemukan';
      setSearchError(message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (targetDisplayId: string) => {
    setActionLoading(targetDisplayId);
    try {
      await userService.sendMutualRequest(targetDisplayId);
      await loadData();
      setSearchResult(null);
      setSearchQuery('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mengirim request';
      alert(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (mutualId: string) => {
    setActionLoading(mutualId);
    try {
      await userService.acceptMutualRequest(mutualId);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menerima request';
      alert(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (mutualId: string) => {
    setActionLoading(mutualId);
    try {
      await userService.declineMutualRequest(mutualId);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menolak request';
      alert(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (mutualId: string) => {
    if (!confirm('Hapus pertemanan ini?')) return;
    setActionLoading(mutualId);
    try {
      await userService.removeMutual(mutualId);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus teman';
      alert(message);
    } finally {
      setActionLoading(null);
    }
  };

  const goToProfile = (displayId: string) => {
    router.push(`/profile/${displayId}`);
  };

  const tabs = [
    { key: 'friends' as const, label: 'Teman', count: friends.length },
    { key: 'pending' as const, label: 'Request', count: pendingRequests.length },
    { key: 'search' as const, label: 'Cari User' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-600 transition-all group mb-4"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Teman</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola pertemanan dan temukan pengguna baru</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                tab === t.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200/60 rounded-xl text-sm text-red-700">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="md" text="Memuat..." />
        </div>
      )}

      {/* Friends Tab */}
      {!loading && tab === 'friends' && (
        <>
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Belum ada teman</h3>
              <p className="text-sm text-slate-500 mb-5 max-w-sm text-center">
                Cari pengguna lain dan mulai pertemanan!
              </p>
              <button
                onClick={() => setTab('search')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Cari User
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors"
                >
                  <button
                    onClick={() => goToProfile(friend.displayId)}
                    className="shrink-0"
                  >
                    {friend.picture ? (
                      <img
                        src={friend.picture}
                        alt={friend.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-slate-100">
                        {friend.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => goToProfile(friend.displayId)}
                      className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 text-left"
                    >
                      {friend.name}
                    </button>
                    <p className="text-xs text-slate-400 font-mono">{friend.displayId}</p>
                  </div>
                  <button
                    onClick={() => goToProfile(friend.displayId)}
                    className="shrink-0 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Lihat Profil"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const mutualId = (friend as MutualUser & { mutualId?: string }).mutualId;
                      if (mutualId) handleRemove(mutualId);
                    }}
                    disabled={actionLoading === friend.id}
                    className="shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Hapus Teman"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pending Tab */}
      {!loading && tab === 'pending' && (
        <>
          {pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Tidak ada request pending</h3>
              <p className="text-sm text-slate-500">Semua request pertemanan sudah ditangani</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-5"
                >
                  <button onClick={() => goToProfile(req.userDisplayId)} className="shrink-0">
                    {req.userPicture ? (
                      <img
                        src={req.userPicture}
                        alt={req.userName}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-slate-100">
                        {req.userName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => goToProfile(req.userDisplayId)}
                      className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 text-left"
                    >
                      {req.userName}
                    </button>
                    <p className="text-xs text-slate-400">Mengirim permintaan pertemanan</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={actionLoading === req.id}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === req.id ? '...' : 'Terima'}
                    </button>
                    <button
                      onClick={() => handleDecline(req.id)}
                      disabled={actionLoading === req.id}
                      className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Search Tab */}
      {!loading && tab === 'search' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <form onSubmit={handleSearch} className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Display ID</label>
                <input
                  type="text"
                  placeholder="Masukkan Display ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono tracking-wider text-gray-900 placeholder-gray-300 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim() || searchLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                )}
                Cari
              </button>
            </form>
          </div>

          {searchError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200/60 rounded-xl text-sm text-red-700">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {searchError}
            </div>
          )}

          {searchResult && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <button onClick={() => goToProfile(searchResult.displayId)} className="shrink-0">
                  {searchResult.picture ? (
                    <img
                      src={searchResult.picture}
                      alt={searchResult.name}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-slate-100">
                      {searchResult.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => goToProfile(searchResult.displayId)}
                    className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 text-left text-lg"
                  >
                    {searchResult.name}
                  </button>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 font-mono">{searchResult.displayId}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      searchResult.role === 'CREATOR'
                        ? 'bg-violet-50 text-violet-600'
                        : searchResult.role === 'ADMIN'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-sky-50 text-sky-600'
                    }`}>
                      {searchResult.role === 'CREATOR' ? 'Creator' : searchResult.role === 'ADMIN' ? 'Admin' : 'Player'}
                    </span>
                  </div>
                </div>
                {searchResult.id !== user?.id && (
                  <button
                    onClick={() => handleSendRequest(searchResult.displayId)}
                    disabled={actionLoading === searchResult.displayId}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === searchResult.displayId ? '...' : 'Tambah Teman'}
                  </button>
                )}
              </div>
            </div>
          )}

          {!searchLoading && !searchResult && !searchError && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12">
              <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="mt-3 text-sm font-medium text-gray-400">Masukkan Display ID untuk mencari pengguna</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
