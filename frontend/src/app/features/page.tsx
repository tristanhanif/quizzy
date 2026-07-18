'use client';

import { useRouter } from 'next/navigation';
import LandingNavbar from '@/components/landing/LandingNavbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/ui/Button';

const detailedFeatures = [
  {
    title: 'Quiz Creator',
    description: 'Buat quiz dalam hitungan menit. Tulis pertanyaan, masukkan pilihan jawaban, dan tentukan yang benar. Tersedia pilihan Multiple Choice dan True/False.',
    items: ['Unlimited pertanyaan per quiz', 'Atur poin per pertanyaan', 'Batas waktu per soal', 'Preview sebelum publish'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: 'Real-Time Multiplayer',
    description: 'Semua peserta mendapatkan pertanyaan secara bersamaan. Jawaban langsung dikirim ke server dan leaderboard diperbarui secara real-time.',
    items: ['WebSocket real-time', 'Sinkronisasi instan', 'Multiplayer unlimited', 'Reconnect otomatis'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Live Leaderboard',
    description: 'Peringkat peserta diperbarui setiap kali ada jawaban baru. Ciptakan atmosfer kompetisi yang seru dan memotivasi.',
    items: ['Ranking real-time', 'Highlight perubahan posisi', 'Detail skor per peserta', 'Riwayat performa'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Timer & Poin',
    description: 'Setiap pertanyaan punya batas waktu dan poin. Semakin cepat menjawab dengan benar, semakin tinggi kesempatan menang.',
    items: ['Countdown visual', 'Poin dinamis', 'Bonus waktu (coming soon)', 'Tidak ada batas waktu (optional)'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Dashboard & Analitik',
    description: 'Pantau semua quiz, sesi, dan hasil dalam satu dashboard yang intuitif. Lihat statistik performa dan tren belajar.',
    items: ['Overview quiz', 'Riwayat sesi', 'Hasil per peserta', 'Export data (coming soon)'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    title: 'Akses Mudah',
    description: 'Peserta cukup masukkan kode ruangan untuk join. Tidak perlu install aplikasi. Bisa diakses dari HP, laptop, atau tablet.',
    items: ['Kode ruangan unik', 'Tanpa install', 'Responsive design', 'Progressive Web App (coming soon)'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function FeaturesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">Fitur Lengkap</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900">
            Semua yang kamu butuhkan
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Dari pembuatan quiz hingga analisis hasil — Quizzy menyediakan semua fitur yang kamu butuhkan
            dalam satu platform yang mudah digunakan.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {detailedFeatures.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
              >
                <div className="flex-1">
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                  <p className="text-gray-500 leading-relaxed mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                      </div>
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                        <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                        <div className="h-32 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <span className="text-indigo-400 text-sm">Demo Preview</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="h-10 bg-indigo-100 rounded-lg" />
                          <div className="h-10 bg-gray-100 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Siap mencoba?</h2>
          <p className="text-lg text-gray-500 mb-8">
            Mulai buhat quiz pertama kamu sekarang. Gratis, tanpa kartu kredit.
          </p>
          <Button size="lg" onClick={() => router.push('/register')} className="px-8">
            Daftar Gratis
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
