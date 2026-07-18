'use client';

import { useAuthStore } from '@/store/authStore';
import { useQuizzes } from '@/hooks/useQuiz';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function CreatorDashboard() {
  const { user } = useAuthStore();
  const { data: quizzes, isLoading } = useQuizzes();
  const router = useRouter();

  const myQuizzes = quizzes?.filter((q) => q.creatorId === user?.id) || [];
  const totalQuestions = myQuizzes.reduce((sum, q) => sum + q.questions.length, 0);

  return (
    <div className="space-y-8">
      {/* Top Section */}
      <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-8 text-white shadow-lg shadow-indigo-200">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Creator</h1>
            <p className="text-indigo-100 mt-1">Kelola quiz dan pantau hasil</p>
            {user?.displayId && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-mono backdrop-blur-sm">
                <svg className="h-3.5 w-3.5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                </svg>
                <span className="text-indigo-100">ID: {user.displayId}</span>
              </div>
            )}
          </div>
          <Button
            size="lg"
            onClick={() => router.push('/quizzes/create')}
            className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg shadow-indigo-700/20"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Buat Quiz
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-5 text-white shadow-md shadow-indigo-200">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{myQuizzes.length}</p>
            <p className="text-sm text-indigo-100 mt-0.5">Total Quiz</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-purple-600 p-5 text-white shadow-md">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{totalQuestions}</p>
            <p className="text-sm text-purple-200 mt-0.5">Total Pertanyaan</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-5 text-white shadow-md">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-blue-200 mt-0.5">Sesi Aktif</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-emerald-600 p-5 text-white shadow-md">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-emerald-200 mt-0.5">Total Peserta</p>
          </div>
        </div>
      </div>

      {/* Quiz Saya */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Quiz Saya</h2>
        <Button variant="secondary" onClick={() => router.push('/quizzes')}>
          Lihat Semua
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-gray-400">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Memuat quiz...</span>
          </div>
        </div>
      ) : myQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myQuizzes.slice(0, 6).map((quiz) => (
            <Card key={quiz.id} variant="hover" onClick={() => router.push(`/quizzes/${quiz.id}`)}>
              <div className="flex flex-col h-full">
                <h3 className="font-bold text-gray-900 mb-2">{quiz.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{quiz.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {quiz.questions.length} pertanyaan
                  </span>
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    Milikmu
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
            <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold mb-1">Belum ada quiz</p>
          <p className="text-sm text-gray-500 mb-4">Buat quiz pertamamu sekarang!</p>
          <Button onClick={() => router.push('/quizzes/create')}>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Buat Quiz Pertama
          </Button>
        </Card>
      )}

      {/* Aksi Cepat */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="hover" onClick={() => router.push('/quizzes/create')}>
            <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                 </svg>
               </div>
              <div>
                <p className="font-semibold text-gray-900">Buat Quiz Baru</p>
                <p className="text-sm text-gray-500">Tambah pertanyaan</p>
              </div>
            </div>
          </Card>
          <Card variant="hover" onClick={() => router.push('/quizzes')}>
            <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                 </svg>
               </div>
              <div>
                <p className="font-semibold text-gray-900">Kelola Quiz</p>
                <p className="text-sm text-gray-500">Edit & hapus</p>
              </div>
            </div>
          </Card>
          <Card variant="hover" onClick={() => router.push('/results')}>
            <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
               </div>
              <div>
                <p className="font-semibold text-gray-900">Lihat Hasil</p>
                <p className="text-sm text-gray-500">Leaderboard</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
