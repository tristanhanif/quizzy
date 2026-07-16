'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginForm() {
  const { login, error, isPending } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">Q</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 mt-2">Sign in to continue to Quizzy</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700">
            {error}
          </div>
        )}
        <Input label="Email" type="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full" isLoading={isPending}>Sign In</Button>
      </form>

      <p className="text-center mt-6 text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 font-medium hover:text-indigo-700">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
