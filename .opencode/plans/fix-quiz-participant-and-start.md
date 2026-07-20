# Fix: Host Tidak Lihat Peserta & Quiz Tidak Bisa Dimulai

## Root Cause Analysis

### Masalah 1: Host tidak lihat peserta bergabung
Host socket ada di namespace `/host`, participant socket di namespace `/participant`.
- Participant gateway emit `participant_joined` ke room `roomCode` di namespace `/participant`
- Host NEVER join room `roomCode` di namespace `/host` (tidak ada handler `join_room` di host gateway)
- Jadinya host tidak pernah terima event participant

### Masalah 2: Quiz tidak bisa dimulai
Host click "Mulai Quiz" → emit `start_quiz` → backend:
1. Return `{ success: true }` — frontend tidak process callback
2. Broadcast `quiz_started` ke room `roomCode` — host tidak join room itu
3. Host tetap di waiting page, tidak pindah ke tampilan soal

---

## Changes Required

### Backend Changes

#### 1. `host.gateway.ts` — Tambah handler join_room + return question di start_quiz

**a) Tambah handler `join_room`:**
```ts
@SubscribeMessage('join_room')
async handleJoinRoom(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { roomCode: string },
) {
  const { roomCode } = data;
  client.join(roomCode);
  return { success: true, message: 'Joined room' };
}
```

**b) Modifikasi `handleStartQuiz` return tambahan soal:**
```ts
return { 
  success: true, 
  message: 'Quiz started',
  question: firstQuestion,
  questionIndex: 0,
  totalQuestions: quiz.questions.length,
};
```

#### 2. `participant.gateway.ts` — Cross-namespace emit

**Di `handleJoinRoom`, ganti emit jadi:**
```ts
const participantEvent = {
  participantId: userId,
  participantCount: session.participants.length,
};
// Emit ke participant namespace
this.server.of('/participant').to(roomCode).emit('participant_joined', participantEvent);
// Emit ke host namespace
this.server.of('/host').to(roomCode).emit('participant_joined', participantEvent);
```

> **Catatan**: Jika `this.server` di NestJS adalah namespace-scoped, perlu akses parent server via `(this.server as any).server.of('/host')...` — perlu dicek saat implementasi.

### Frontend Changes

#### 3. `page.tsx` — Host join room + process start_quiz callback + fetch participants

**a) Modifikasi useEffect auto-join (baris ~108):**
Tambahkan host juga emit `join_room`:
```tsx
useEffect(() => {
  if (!isConnected || !user || !sessionData) return;

  if (isCreator && isOwner) {
    // Host join the room
    emit('join_room', { roomCode }, (response: any) => {
      if (response?.error) console.error('Host join room error:', response.error);
    });
  } else {
    (async () => {
      try {
        await sessionService.join(roomCode);
      } catch (err: any) {
        if (err?.response?.data?.message !== 'You are already in this session') {
          console.error('Failed to join session:', err);
          return;
        }
      }
      emit('join_room', { roomCode, userId: user.id }, (response: any) => {
        if (response?.error) console.error('Error joining room:', response.error);
      });
    })();
  }
}, [isConnected, user, sessionData, isCreator, isOwner, roomCode, emit]);
```

**b) Modifikasi `handleStartQuiz` process callback:**
```tsx
const handleStartQuiz = () => {
  if (!user || !sessionData) return;
  emit('start_quiz', { roomCode }, (response: any) => {
    if (response?.error) {
      console.error(response.error);
    } else if (response?.question) {
      setCurrentQuestion(response.question);
      setQuestionIndex(response.questionIndex ?? 0);
      setTotalQuestions(response.totalQuestions ?? 0);
      setQuizStarted(true);
      setQuizFinished(false);
      setShowResult(false);
      setLastAnswerCorrect(null);
      setSelectedAnswer(null);
      setRemainingTime(response.question?.timeLimit || 30);
    }
  });
};
```

**c) Tambah fetch participants awal:**
```tsx
useEffect(() => {
  if (!sessionData || !isCreator || !isOwner) return;
  // Set initial participant count
  setParticipantCount(sessionData.participants?.length || 0);
  // Fetch participant details
  if (sessionData.id) {
    sessionService.getParticipants(sessionData.id)
      .then((res: any) => {
        if (res?.data) {
          const list = (Array.isArray(res.data) ? res.data : []).map((p: any) => ({
            id: p.userId || p.id,
            name: p.fullName || p.name || p.userId?.substring(0, 8) || 'Peserta',
          }));
          setParticipants(list);
        }
      })
      .catch(console.error);
  }
}, [sessionData, isCreator, isOwner]);
```

---

## Testing Steps
1. Login sebagai CREATOR, buat quiz, start session
2. Buka halaman `/quiz/{roomCode}` — host lihat peserta bergabung
3. Login sebagai PARTICIPANT di browser lain, join session
4. Host lihat participant muncul real-time
5. Host klik "Mulai Quiz" → host pindah ke tampilan soal
6. Participant juga lihat soal yang sama

