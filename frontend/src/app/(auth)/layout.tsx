import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quizzy - Masuk atau Daftar',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600">
        <div className="relative flex flex-col justify-between w-full p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Quizzy</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Belajar Jadi<br />
              Lebih Menyenangkan
            </h2>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-md">
              Buat quiz interaktif, adu pengetahuan secara real-time, dan kembangkan potensi diri bersama Quizzy.
            </p>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-indigo-200 text-sm font-medium">Gratis selamanya</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-indigo-200 text-sm font-medium">Real-time</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-indigo-500 border-2 border-indigo-600"
                />
              ))}
            </div>
            <p className="text-indigo-200 text-sm">
              <span className="font-semibold text-white">10,000+</span> pengguna aktif
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
