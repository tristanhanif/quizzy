'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';
import { resultService } from '@/services/result.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { UserProfile, MutualStatus, Result } from '@/types';

export default function ProfilePage({ params }: { params: Promise<{ displayId: string }> }) {
  const { displayId } = use(params);
  const router = useRouter();
  const { user: currentUser, setUser } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mutualStatus, setMutualStatus] = useState<MutualStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutualLoading, setMutualLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPicture, setEditPicture] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [picturePreview, setPicturePreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [quizResults, setQuizResults] = useState<Result[]>([]);

  const isOwnProfile = currentUser?.displayId === displayId.toUpperCase();

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await userService.getUserProfile(displayId);
        setProfile(res.data);

        if (currentUser && res.data.id !== currentUser.id) {
          const statusRes = await userService.getMutualStatus(res.data.id);
          setMutualStatus(statusRes.data);
        }

        try {
          const resultsRes = await resultService.getUserResults(res.data.id);
          setQuizResults(resultsRes.data?.data || []);
        } catch {
          setQuizResults([]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'User tidak ditemukan');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [displayId, currentUser?.id]);

  const startEditing = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditPicture(profile.picture || '');
    setPicturePreview(profile.picture || '');
    setSaveError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError(null);
  };

  const handlePictureUrlChange = (url: string) => {
    setEditPicture(url);
    setPicturePreview(url);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      setSaveError('Nama minimal 2 karakter');
      return;
    }

    try {
      setSaveLoading(true);
      setSaveError(null);
      const res = await userService.updateProfile({
        fullName: editName.trim(),
        picture: editPicture.trim() || undefined,
      });

      setProfile(res.data);

      if (currentUser) {
        setUser({
          ...currentUser,
          name: res.data.name,
          picture: res.data.picture || undefined,
        });
      }

      setEditing(false);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSendMutual = async () => {
    if (!profile) return;
    try {
      setMutualLoading(true);
      await userService.sendMutualRequest(profile.id);
      setMutualStatus({ status: 'pending', mutualId: null, requestedBy: currentUser?.id });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim request');
    } finally {
      setMutualLoading(false);
    }
  };

  const handleAcceptMutual = async () => {
    if (!mutualStatus?.mutualId) return;
    try {
      setMutualLoading(true);
      await userService.acceptMutualRequest(mutualStatus.mutualId);
      setMutualStatus({ status: 'accepted', mutualId: mutualStatus.mutualId });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menerima request');
    } finally {
      setMutualLoading(false);
    }
  };

  const handleDeclineMutual = async () => {
    if (!mutualStatus?.mutualId) return;
    try {
      setMutualLoading(true);
      await userService.declineMutualRequest(mutualStatus.mutualId);
      setMutualStatus({ status: 'none', mutualId: null });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menolak request');
    } finally {
      setMutualLoading(false);
    }
  };

  const handleRemoveMutual = async () => {
    if (!mutualStatus?.mutualId) return;
    if (!confirm('Hapus mutual?')) return;
    try {
      setMutualLoading(true);
      await userService.removeMutual(mutualStatus.mutualId);
      setMutualStatus({ status: 'none', mutualId: null });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus mutual');
    } finally {
      setMutualLoading(false);
    }
  };

  const handleCopyDisplayId = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Memuat profil..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mx-auto mb-6 ring-4 ring-red-100">
          <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User tidak ditemukan</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">{error}</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const displayName = editing ? editName : profile.name;
  const displayPicture = editing ? picturePreview : profile.picture;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleLabel = profile.role === 'CREATOR' ? 'Creator' : profile.role === 'ADMIN' ? 'Admin' : 'Player';
  const isCreator = profile.role === 'CREATOR';

  const memberSince = new Date(profile.createdAt).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const memberSinceFull = new Date(profile.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const renderMutualButton = () => {
    if (isOwnProfile || !currentUser) return null;

    switch (mutualStatus?.status) {
      case 'accepted':
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold ring-1 ring-emerald-200/60">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Teman
            </span>
            <Button variant="ghost" size="sm" onClick={handleRemoveMutual} isLoading={mutualLoading}>
              Hapus
            </Button>
          </div>
        );
      case 'pending':
        if (mutualStatus.requestedBy === currentUser.id) {
          return (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Request Terkirim
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAcceptMutual} isLoading={mutualLoading}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Terima
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeclineMutual} isLoading={mutualLoading}>
              Tolak
            </Button>
          </div>
        );
      default:
        return (
          <Button size="sm" onClick={handleSendMutual} isLoading={mutualLoading}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Tambah Teman
          </Button>
        );
    }
  };

  const totalQuizzesPlayed = quizResults.length;
  const totalScore = quizResults.reduce((sum, r) => sum + (r.score || 0), 0);
  const avgScore = totalQuizzesPlayed > 0 ? Math.round(totalScore / totalQuizzesPlayed) : 0;
  const totalQuestions = quizResults.reduce((sum, r) => sum + (r.answers?.length || 0), 0);
  const correctAnswers = quizResults.reduce(
    (sum, r) => sum + (r.answers?.filter((a) => a.score > 0).length || 0),
    0
  );
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-all group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>

      {/* Profile Header Card */}
      <div className="rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-gray-100">
        {/* Hero Banner */}
        <div className="relative h-36 sm:h-44">
          <div
            className="absolute inset-0"
            style={{
              background: isCreator
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 70%, #c4b5fd 100%)'
                : profile.role === 'ADMIN'
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 40%, #b45309 70%, #92400e 100%)'
                : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #818cf8 70%, #a5b4fc 100%)',
            }}
          />
          {/* Decorative dots */}
          <div className="absolute inset-0 opacity-[0.07]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          {/* Soft light overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
        </div>

        {/* Profile Content */}
        <div className="relative px-5 sm:px-8 pb-7">
          {/* Avatar + Actions Row */}
          <div className="relative -mt-14 sm:-mt-16 mb-5 flex items-end justify-between">
            {/* Avatar */}
            <div className="relative group">
              <div className="rounded-2xl ring-[5px] ring-white shadow-xl overflow-hidden bg-white">
                {displayPicture ? (
                  <img
                    src={displayPicture}
                    alt={displayName}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover"
                  />
                ) : (
                  <div
                    className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold"
                    style={{
                      background: isCreator
                        ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                        : profile.role === 'ADMIN'
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              {editing && (
                <div className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ring-[5px] ring-white">
                  <svg className="w-7 h-7 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pb-1.5">
              {editing ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saveLoading}>
                    Batal
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} isLoading={saveLoading}>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan
                  </Button>
                </div>
              ) : (
                <>
                  {isOwnProfile ? (
                    <Button variant="secondary" size="sm" onClick={startEditing}>
                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      Edit Profil
                    </Button>
                  ) : (
                    renderMutualButton()
                  )}
                </>
              )}
            </div>
          </div>

          {/* Name & Meta */}
          <div>
            {editing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl sm:text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-indigo-400 focus:border-indigo-600 focus:outline-none w-full pb-1 transition-colors"
                placeholder="Nama lengkap"
                autoFocus
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{profile.name}</h1>
            )}

            {/* Badges Row */}
            <div className="flex items-center flex-wrap gap-2 mt-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                  isCreator
                    ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60'
                    : profile.role === 'ADMIN'
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60'
                    : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/60'
                }`}
              >
                {isCreator ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                ) : profile.role === 'ADMIN' ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
                {roleLabel}
              </span>

              <button
                onClick={handleCopyDisplayId}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 text-gray-500 text-xs font-mono hover:bg-gray-100 transition-colors ring-1 ring-gray-200/60 cursor-pointer"
                title="Salin Display ID"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-600">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    {profile.displayId}
                  </>
                )}
              </button>
            </div>

            {!editing && (
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Bergabung {memberSince}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Save Error */}
      {saveError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200/60 rounded-xl text-sm text-red-700">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {saveError}
        </div>
      )}

      {/* Edit Picture Section */}
      {editing && (
        <Card className="ring-1 ring-indigo-100/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Foto Profil</h3>
          </div>
          <Input
            label="URL Foto"
            placeholder="https://example.com/photo.jpg"
            value={editPicture}
            onChange={(e) => handlePictureUrlChange(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1.5">Masukkan URL gambar untuk foto profil kamu</p>
          {picturePreview && (
            <div className="mt-4 p-3 bg-gray-50/80 rounded-xl flex items-center gap-4 ring-1 ring-gray-100">
              <img
                src={picturePreview}
                alt="Preview"
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-sm"
                onError={() => setPicturePreview('')}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700">Preview</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{picturePreview}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Mutual Status Banner */}
      {!isOwnProfile && mutualStatus?.status === 'accepted' && (
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-emerald-400 to-teal-400">
          <div className="bg-white rounded-[15px] p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Kalian sudah saling kenal!</p>
                <p className="text-xs text-gray-500 mt-0.5">Hubungi via chat untuk bermain bersama</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Stats */}
      {totalQuizzesPlayed > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white p-4 ring-1 ring-gray-100 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 flex items-center justify-center mx-auto mb-2.5">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalQuizzesPlayed}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Quiz Diikuti</p>
          </div>

          <div className="rounded-xl bg-white p-4 ring-1 ring-gray-100 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 flex items-center justify-center mx-auto mb-2.5">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.178-1.792.93-1.792 1.904 0 .99.796 1.742 1.792 1.904M18.75 4.236c.996.178 1.792.93 1.792 1.904 0 .99-.796 1.742-1.792 1.904M12 2.25c-3.75 0-6.75 2.25-6.75 5.25 0 3 3 5.25 6.75 5.25s6.75-2.25 6.75-5.25c0-3-3-5.25-6.75-5.25Z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalScore.toLocaleString('id-ID')}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Total Skor</p>
          </div>

          <div className="rounded-xl bg-white p-4 ring-1 ring-gray-100 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 flex items-center justify-center mx-auto mb-2.5">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Rata-rata Skor</p>
          </div>

          <div className="rounded-xl bg-white p-4 ring-1 ring-gray-100 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/80 flex items-center justify-center mx-auto mb-2.5">
              <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{accuracy}%</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Akurasi</p>
          </div>
        </div>
      )}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* About Card */}
        <Card className="sm:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Tentang</h3>
          </div>

          <div className="space-y-0.5">
            {/* Name */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50/80 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Nama</p>
                <p className="text-sm text-gray-900 font-medium truncate">{profile.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50/80 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Email</p>
                <p className="text-sm text-gray-900 font-medium truncate">{profile.email || '-'}</p>
              </div>
            </div>

            {/* Display ID */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50/80 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Display ID</p>
                <p className="text-sm text-gray-900 font-medium font-mono">{profile.displayId}</p>
              </div>
            </div>

            {/* Joined Date */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50/80 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Bergabung</p>
                <p className="text-sm text-gray-900 font-medium">{memberSinceFull}</p>
              </div>
            </div>

            {/* Provider */}
            {profile.provider && (
              <div className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50/80 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.06a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Provider</p>
                  <p className="text-sm text-gray-900 font-medium capitalize">{profile.provider === 'google' ? 'Google' : 'Email'}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
