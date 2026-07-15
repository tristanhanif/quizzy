# FILE: database.prd
# TITLE: Firestore Database Schema & Indexing Strategy
# VERSION: 1.0.0
# STORAGE_ENGINE: Firebase Cloud Firestore

---

## 1. COLLECTIONS_OVERVIEW
- **users**: Data profil pengguna.
- **quizzes**: Data bank soal (skala dokumen: < 1MB).
- **quiz_sessions**: Ruangan aktif.
- **quiz_sessions/{sessionId}/participants**: Sub-koleksi untuk memisahkan write load tiap peserta.
- **quiz_results**: Riwayat kuis yang sudah selesai (immutable).
- **categories**: Master data untuk filter kuis.

---

## 2. SCHEMA_SPECIFICATIONS

### Collection: `quizzes`
- `id`: String (Firestore ID)
- `creatorId`: String (Ref to users)
- `questions`: Array<Object> 
  - `questionId`, `text`, `type`, `points`, `choices`, `correctAnswer`, `timeLimit`

### Collection: `quiz_sessions`
- `roomCode`: String (Indexed, Unique)
- `status`: Enum (WAITING, LIVE, FINISHED)
- `currentQuestionIndex`: Number
- `endTime`: Timestamp (Untuk sinkronisasi timer klien)

### Collection: `quiz_results`
- `sessionId`: String (Indexed)
- `participantId`: String (Indexed)
- `score`: Number
- `submittedAt`: Timestamp

---

## 3. INDEXING_STRATEGY (Composite Indexes)
Agar query tidak gagal saat dijalankan dari NestJS:
1. `quiz_results`: Composite index pada `{sessionId: ASC, score: DESC}`.
   - *Tujuan: Untuk generate Leaderboard secara instan.*
2. `quiz_sessions`: Index pada `roomCode`.
   - *Tujuan: Agar proses join room instant.*

---

## 4. SECURITY_RULES_LOGIC
- `allow read, write: if request.auth != null;` (Dasar)
- Tambahan:
  - Sesi kuis hanya bisa dibaca jika user terdaftar sebagai peserta di sesi tersebut.
  - Skor hanya bisa diupdate oleh backend (bukan client).
  - Soal kuis hanya bisa dibaca oleh pemilik kuis atau peserta di sesi aktif.

---

## 5. OPTIMIZATION_GUIDELINES
- Gunakan `transaction` pada NestJS saat memperbarui skor peserta untuk menghindari race condition.
- Hindari membaca seluruh koleksi `quiz_results` jika hanya butuh 10 besar; gunakan `limit(10)` dan `orderBy('score', 'desc')`.