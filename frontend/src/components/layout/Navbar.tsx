'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserRole } from '@/types';
import { authService } from '@/services/auth.service';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goToProfile = async () => {
    if (user?.displayId) {
      router.push(`/profile/${user.displayId}`);
      return;
    }
    try {
      const res = await authService.getProfile();
      const displayId = res.data.displayId;
      if (displayId) {
        router.push(`/profile/${displayId}`);
      }
    } catch {}
  };

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
            {user?.role === UserRole.CREATOR && (
              <Link href="/quizzes" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                Quizzes
              </Link>
            )}
            <Link href="/results" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              Results
            </Link>
            <button onClick={goToProfile} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
              Profile
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.displayId || 'Memuat...'}</p>
                  </div>
                  <button
                    onClick={goToProfile}
                    className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm hover:bg-indigo-200 transition-colors cursor-pointer"
                  >
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </button>
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
            {user?.role === UserRole.CREATOR && (
              <Link href="/quizzes" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                Quizzes
              </Link>
            )}
            <Link href="/results" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
              Results
            </Link>
            <button onClick={() => { goToProfile(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
              Profile
            </button>
            <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
