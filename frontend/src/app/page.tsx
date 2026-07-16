'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-white font-bold text-3xl">Q</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Quizzy</h1>
          <p className="text-gray-500 mt-2">Interactive Real-Time Quiz Platform</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" onClick={() => router.push('/login')}>
            Sign In
          </Button>
          <Button size="lg" variant="secondary" onClick={() => router.push('/register')}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
