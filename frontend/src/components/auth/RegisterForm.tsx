'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { UserRole } from '@/types';

export default function RegisterForm() {
  const { register, error, isPending } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ fullName, email, password, role });
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">Q</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-500 mt-2">Join Quizzy and start quizzing!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700">
            {error}
          </div>
        )}
        <Input label="Full Name" type="text" placeholder="John Doe"
          value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" type="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value={UserRole.PARTICIPANT}>Participant</option>
            <option value={UserRole.CREATOR}>Creator</option>
          </select>
        </div>

        <Button type="submit" className="w-full" isLoading={isPending}>Create Account</Button>
      </form>

      <p className="text-center mt-6 text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-700">
          Sign In
        </Link>
      </p>
    </div>
  );
}
