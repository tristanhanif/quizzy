'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { UserRole } from '@/types';

type AdminTab = 'overview' | 'users' | 'quizzes' | 'system' | 'logs';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcast, setBroadcast] = useState({ active: false, message: '' });
  const [broadcastInput, setBroadcastInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      router.replace('/dashboard');
    }
  }, [user?.role, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData, quizzesData, sessionsData, maintenanceData, broadcastData] = await Promise.allSettled([
          adminService.getStats(),
          adminService.getAllUsers(),
          adminService.getAllQuizzes(),
          adminService.getActiveSessions(),
          adminService.getMaintenanceMode(),
          adminService.getBroadcast(),
        ]);
        if (statsData.status === 'fulfilled') {
          const payload = statsData.value?.data || statsData.value;
          setStats(payload);
        }
        if (usersData.status === 'fulfilled') {
          const payload = usersData.value?.data || usersData.value;
          setUsers(Array.isArray(payload) ? payload : []);
        }
        if (quizzesData.status === 'fulfilled') {
          const payload = quizzesData.value?.data || quizzesData.value;
          setQuizzes(Array.isArray(payload) ? payload : []);
        }
        if (sessionsData.status === 'fulfilled') {
          const payload = sessionsData.value?.data || sessionsData.value;
          setActiveSessions(payload?.count || 0);
        }
        if (maintenanceData.status === 'fulfilled') {
          const payload = maintenanceData.value?.data || maintenanceData.value;
          setMaintenanceMode(payload?.enabled || false);
        }
        if (broadcastData.status === 'fulfilled') {
          const payload = broadcastData.value?.data || broadcastData.value;
          setBroadcast(payload || { active: false, message: '' });
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === UserRole.ADMIN) {
      fetchData();
    }
  }, [user?.role]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Hapus pengguna "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setActionLoading(userId);
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal menghapus pengguna');
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (!confirm(`Hapus quiz "${quizTitle}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setActionLoading(quizId);
    try {
      await adminService.forceDeleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal menghapus quiz');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleMaintenance = async () => {
    const newValue = !maintenanceMode;
    setActionLoading('maintenance');
    try {
      await adminService.toggleMaintenanceMode(newValue);
      setMaintenanceMode(newValue);
    } catch (err: any) {
      alert('Gagal mengubah maintenance mode');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastInput.trim()) return;
    setActionLoading('broadcast');
    try {
      await adminService.sendBroadcast(broadcastInput);
      setBroadcast({ active: true, message: broadcastInput });
      setBroadcastInput('');
    } catch (err: any) {
      alert('Gagal mengirim broadcast');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearBroadcast = async () => {
    setActionLoading('broadcast');
    try {
      await adminService.clearBroadcast();
      setBroadcast({ active: false, message: '' });
    } catch (err: any) {
      alert('Gagal menghapus broadcast');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== UserRole.ADMIN) return null;

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users', count: users.length },
    { id: 'quizzes', label: 'Quizzes', count: quizzes.length },
    { id: 'system', label: 'System' },
    { id: 'logs', label: 'Logs' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <p className="text-slate-400">Kendali penuh atas platform Quizzy</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-mono">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-slate-300">Super Admin Mode</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-slate-500">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">{stats?.totalQuizzes || 0}</p>
                  <p className="text-sm text-slate-500">Total Quizzes</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">{stats?.totalSessions || 0}</p>
                  <p className="text-sm text-slate-500">Total Sessions</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">{activeSessions}</p>
                  <p className="text-sm text-slate-500">Active Now</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users by Role */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Users by Role</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{stats?.usersByRole?.admin || 0}</p>
                <p className="text-sm text-slate-500">Admin</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{stats?.usersByRole?.creator || 0}</p>
                <p className="text-sm text-slate-500">Creator</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-700">{stats?.usersByRole?.participant || 0}</p>
                <p className="text-sm text-slate-500">Participant</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Display ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Provider</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">{u.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{u.displayId || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-slate-900 text-white' :
                        u.role === 'CREATOR' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.provider}</td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={actionLoading === u.id}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === u.id ? '...' : 'Hapus'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-12 text-center text-slate-500">Tidak ada pengguna</div>
          )}
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Quiz</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Creator</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Soal</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Visibilitas</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizzes.map((q: any) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{q.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{q.description || 'Tanpa deskripsi'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{q.creatorName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{q.questionCount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        q.isPublic ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {q.isPublic ? 'Publik' : 'Privat'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleForceDeleteQuiz(q.id, q.title)}
                        disabled={actionLoading === q.id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === q.id ? '...' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {quizzes.length === 0 && (
            <div className="p-12 text-center text-slate-500">Tidak ada quiz</div>
          )}
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Maintenance Mode</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {maintenanceMode
                    ? 'Server sedang dalam perbaikan. Semua sesi aktif dihentikan.'
                    : 'Semua layanan berjalan normal.'}
                </p>
              </div>
              <button
                onClick={handleToggleMaintenance}
                disabled={actionLoading === 'maintenance'}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  maintenanceMode ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
                  maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            {maintenanceMode && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <p className="text-sm text-indigo-700 font-medium">
                  ⚠️ Maintenance mode aktif. Semua pengguna melihat halaman "Server sedang dalam perbaikan".
                </p>
              </div>
            )}
          </div>

          {/* Broadcast */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Global Broadcast</h3>
            <p className="text-sm text-slate-500 mb-4">Kirim pengumuman ke semua pengguna yang sedang online.</p>
            
            {broadcast.active && (
              <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-600 mb-0.5">Broadcast Aktif</p>
                  <p className="text-sm text-indigo-900">{broadcast.message}</p>
                </div>
                <button
                  onClick={handleClearBroadcast}
                  disabled={actionLoading === 'broadcast'}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Hapus
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Pesan broadcast..."
                value={broadcastInput}
                onChange={(e) => setBroadcastInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                onClick={handleSendBroadcast}
                disabled={actionLoading === 'broadcast' || !broadcastInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">System Logs</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Log error dan aktivitas backend akan ditampilkan di sini. Fitur ini membutuhkan integrasi dengan logging backend.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-slate-400">Quizzy Admin Panel v1.0</p>
      </div>
    </div>
  );
}
