'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { UserRole } from '@/types';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Quizzy</span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
                {(user.role === UserRole.ADMIN || user.role === UserRole.CREATOR) && (
                  <Link href="/quizzes" className="text-sm text-gray-600 hover:text-gray-900">Quizzes</Link>
                )}
                <Link href="/results" className="text-sm text-gray-600 hover:text-gray-900">Results</Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
