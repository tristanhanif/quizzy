'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function CTA() {
  const router = useRouter();

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-gray-100 shadow-xl">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">Q</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Siap bikin quiz pertama kamu?
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Daftar sekarang dan mulai buat quiz interaktif dalam hitungan menit. Gratis, tanpa kartu kredit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.push('/register')} className="w-full sm:w-auto text-base px-8 py-3">
              Daftar Sekarang
            </Button>
            <Button size="lg" variant="secondary" onClick={() => router.push('/login')} className="w-full sm:w-auto text-base px-8 py-3">
              Sudah punya akun? Masuk
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
