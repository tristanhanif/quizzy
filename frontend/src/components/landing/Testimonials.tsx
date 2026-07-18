'use client';

const testimonials = [
  {
    name: 'Pak Budi',
    role: 'Guru SMAN 3 Jakarta',
    content: 'Quizzy bikin belajar jadi lebih menyenangkan. Siswa-siswa saya jadi lebih semangat karena bisa adu skor secara real-time. Highly recommended untuk guru!',
    avatar: 'B',
  },
  {
    name: 'Rina',
    role: 'Mahasiswa UI',
    content: 'Buat review materi kuliah pakai Quizzy. Formatnya mirip kuis tapi lebih seru karena ada timer dan leaderboard. Temen-temen juga pada suka.',
    avatar: 'R',
  },
  {
    name: 'Andi',
    role: 'HR Manager di TechCorp',
    content: 'Kami pakai Quizzy untuk training karyawan. Fitur creator-nya gampang banget dipake, dan hasilnya langsung keliatan. Efficiency banget!',
    avatar: 'A',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">Testimoni</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
            Dipercaya oleh ribuan pengguna
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Dari guru, mahasiswa, hingga profesional — semua suka pakai Quizzy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-indigo-100 transition-colors duration-300"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="mt-4 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
