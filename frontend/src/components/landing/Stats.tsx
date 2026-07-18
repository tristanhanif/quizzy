'use client';

const stats = [
  { value: '10K+', label: 'Quiz Dibuat' },
  { value: '50K+', label: 'Peserta Aktif' },
  { value: '100K+', label: 'Pertanyaan Dijawab' },
  { value: '99.9%', label: 'Uptime' },
];

export default function Stats() {
  return (
    <section className="py-20 bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white">{stat.value}</p>
              <p className="mt-2 text-indigo-200 text-sm sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
