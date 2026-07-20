'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function LandingNavbar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/features', label: 'Fitur' },
    { href: '/about', label: 'Tentang'},
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <span className="text-indigo-600 font-bold text-sm">Q</span>
            </div>
            <span className="text-xl font-bold text-indigo-600 tracking-tight drop-shadow-sm">
              Quizzy
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full px-2 py-1 ring-1 ring-white/15">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-1.5 text-sm font-medium text-white hover:text-indigo-600 rounded-full hover:bg-white/10 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 px-5 py-2.5 text-sm bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-black/10 ring-1 ring-black/5 cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 px-4 py-2.5 text-sm text-white/90 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 px-5 py-2.5 text-sm bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-black/10 ring-1 ring-black/5 cursor-pointer"
                >
                  Daftar
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-white/10 px-4 py-4 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => { setMobileOpen(false); router.push('/dashboard'); }}
                className="w-full inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 px-5 py-3 text-sm bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setMobileOpen(false); router.push('/login'); }}
                  className="w-full inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 px-5 py-3 text-sm text-white/90 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  onClick={() => { setMobileOpen(false); router.push('/register'); }}
                  className="w-full inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 px-5 py-3 text-sm bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg cursor-pointer"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
