'use client';

const steps = [
  {
    step: '01',
    title: 'Buat Quiz',
    description: 'Isi judul, deskripsi, dan pertanyaan-pertanyaan. Pilih jenis pertanyaan dan tentukan jawaban yang benar.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Bagikan Kode',
    description: 'Dapatkan kode ruangan unik dan bagikan ke peserta. Mereka tinggal masukin kode untuk join.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Mulai Quiz',
    description: 'Klik "Start Quiz" dan pertanyaan akan muncul untuk semua peserta secara bersamaan.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Lihat Hasil',
    description: 'Setelah quiz selesai, langsung lihat leaderboard dan analisis jawaban setiap peserta.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">Cara Kerja</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
            Mulai dalam 4 langkah mudah
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Tidak perlu pengaturan rumit. Langsung pakai dan rasakan sensasi quiz-nya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
              )}
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  <div className="text-indigo-600">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
