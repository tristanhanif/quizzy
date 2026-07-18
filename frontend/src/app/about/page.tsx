'use client';

import LandingNavbar from '@/components/landing/LandingNavbar';
import Footer from '@/components/landing/Footer';

const team = [
  {
    name: 'Tim Quizzy',
    role: 'Founders',
    description: 'Kami percaya bahwa belajar harusnya menyenangkan. Quizzy hadir untuk membuat proses belajar jadi lebih interaktif dan seru.',
    avatar: 'Q',
  },
];

const values = [
  {
    title: 'Simpel',
    description: 'Kami percaya yang terbaik adalah yang paling mudah dipakai. Tanpa ribet, langsung jalan.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Real-Time',
    description: 'Semua terjadi secara instan. Jawaban, skor, dan leaderboard update tanpa delay.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Gratis',
    description: 'Semua fitur utama tersedia gratis. Kami percaya akses pendidikan tidak seharusnya dibatasi.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">Tentang Quizzy</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900">
            Membuat belajar jadi lebih seru
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Quizzy lahir dari keinginan sederhana: membuat proses belajar dan mengajar jadi lebih interaktif.
            Kami yakin bahwa ketika belajar menyenangkan, ilmu akan lebih mudah terserap dan diingat.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Nilai-Nilai Kami</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-5">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 font-bold text-2xl">
              Q
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Misi Kami</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Menjadi platform quiz nomor satu di Indonesia yang mudah diakses oleh siapa saja —
              dari guru di sekolah dasar, mahasiswa, hingga perusahaan yang ingin training karyawannya
              jadi lebih engaging.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
