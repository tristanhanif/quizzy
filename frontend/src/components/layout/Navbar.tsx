'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { UserRole } from '@/types';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const setUser = useAuthStore((s) => s.setUser);
  const fetchedProfileRef = useRef(false);

  const isParticipant = user?.role === UserRole.PARTICIPANT;

  useEffect(() => {
    if (!user) return;
    if (user.displayId) return;
    if (fetchedProfileRef.current) return;
    fetchedProfileRef.current = true;
    async function fetchProfile() {
      try {
        const res = await authService.getProfile();
        if (res.data) {
          setUser({
            ...res.data,
            name: res.data.fullName || res.data.name || user!.name,
            picture: res.data.picture || user!.picture,
          } as any);
        }
      } catch {
        fetchedProfileRef.current = false;
      }
    }
    fetchProfile();
  }, [user, setUser]);

  useEffect(() => {
    if (!user || !isParticipant) return;
    async function loadPending() {
      try {
        const res = await userService.getPendingMutuals();
        setPendingCount(res.data?.data?.length || 0);
      } catch {
        // ignore
      }
    }
    loadPending();
  }, [user, isParticipant]);

  const profileHref = user?.displayId ? `/profile/${user.displayId}` : '#';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Quizzy</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              Dashboard
            </Link>
            {isParticipant && (
              <>
                <Link href="/dashboard/history" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  Riwayat
                </Link>
                <Link href="/dashboard/friends" className="relative px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  Teman
                  {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {user?.role === UserRole.CREATOR && (
              <Link href="/quizzes" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                Quizzes
              </Link>
            )}
            {user?.role === UserRole.CREATOR && (
              <Link href="/dashboard/sessions" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                Sesi
              </Link>
            )}
            {user?.role === UserRole.ADMIN && (
              <Link href="/dashboard/admin" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                Admin Panel
              </Link>
            )}
            <Link href="/results" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              Results
            </Link>
            {user?.displayId && (
              <Link href={profileHref} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                Profile
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    {user.displayId && (
                      <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">
                        <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                        </svg>
                        {user.displayId}
                      </div>
                    )}
                  </div>
                  {user.displayId ? (
                    <Link
                      href={profileHref}
                      className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm hover:bg-indigo-200 transition-colors"
                    >
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Link>
                  ) : (
                    <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="hidden md:inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1">
            <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            {isParticipant && (
              <>
                <Link href="/dashboard/history" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Riwayat
                </Link>
                <Link href="/dashboard/friends" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  <span>Teman</span>
                  {pendingCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {user?.role === UserRole.CREATOR && (
              <Link href="/quizzes" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                Quizzes
              </Link>
            )}
            {user?.role === UserRole.CREATOR && (
              <Link href="/dashboard/sessions" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                Sesi
              </Link>
            )}
            {user?.role === UserRole.ADMIN && (
              <Link href="/dashboard/admin" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                Admin Panel
              </Link>
            )}
            <Link href="/results" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
              Results
            </Link>
            {user?.displayId && (
              <Link href={profileHref} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                Profile
              </Link>
            )}
            <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
