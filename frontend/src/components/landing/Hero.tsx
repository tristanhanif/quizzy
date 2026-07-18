'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-indigo-50/40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-100 rounded-full blur-3xl opacity-30 -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Real-Time Interactive Quizzes
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
            Quiz Seru bareng{' '}
            <span className="text-indigo-600">Quizzy</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Buat quiz interaktif, adu pengetahuan secara real-time, dan pantau hasilnya langsung.
            Cocok untuk sekolah, kantor, atau sekadar kumpul bareng teman.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.push('/register')} className="w-full sm:w-auto text-base px-8 py-3">
              Mulai Gratis
            </Button>
            <Button size="lg" variant="secondary" onClick={() => router.push('/features')} className="w-full sm:w-auto text-base px-8 py-3">
              Lihat Fitur
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Gratis selamanya
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Tanpa kartu kredit
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Setup instan
            </div>
          </div>
        </div>

        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <span className="ml-4 text-sm text-gray-400 font-mono">quizzy.app/quiz/ABC123</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-xl">Q</span>
                </div>
                <p className="font-semibold text-gray-900">Question 3/10</p>
                <p className="text-sm text-gray-500 mt-1">Apa ibu kota Indonesia?</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-indigo-600 mb-1">00:15</p>
                <p className="text-sm text-gray-500">Sisa waktu</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-sm font-medium text-gray-500 mb-3">Leaderboard</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">Andi</span>
                    <span className="font-semibold text-indigo-600">300</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">Budi</span>
                    <span className="font-semibold text-gray-600">250</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">Citra</span>
                    <span className="font-semibold text-gray-600">200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
