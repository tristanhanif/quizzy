'use client';

import { use, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionByRoomCode, useSubmitResult } from '@/hooks/useQuiz';
import { sessionService } from '@/services/session.service';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { quizService } from '@/services/quiz.service';
import { SessionStatus, UserRole } from '@/types';
import type { Question, LeaderboardEntry } from '@/types';

// ==========================================
// SUB-KOMPONEN: CountdownTimer
// ==========================================
function CountdownTimer({
  duration,
  onTimeUp,
  onTick,
  isActive = true,
}: {
  duration: number;
  onTimeUp?: () => void;
  onTick?: (time: number) => void;
  isActive?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onTimeUpRef = useRef(onTimeUp);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onTickRef.current = onTick;
  }, [onTimeUp, onTick]);

  useEffect(() => {
    setTimeLeft(duration);
    Promise.resolve().then(() => {
      onTickRef.current?.(duration);
    });
  }, [duration]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    Promise.resolve().then(() => {
      onTickRef.current?.(timeLeft);
      if (timeLeft <= 0) {
        onTimeUpRef.current?.();
      }
    });
  }, [timeLeft]);

  return (
    <span
      className={`text-lg font-bold ${
        timeLeft <= 5 ? 'text-slate-900 animate-pulse' : timeLeft <= 10 ? 'text-indigo-600' : 'text-slate-900'
      }`}
    >
      {timeLeft}
    </span>
  );
}

// ==========================================
// KOMPONEN UTAMA: QuizArenaPage
// ==========================================
export default function QuizArenaPage({ params }: { params: Promise<{ roomCode: string }> }) {
  // Unwarp params dengan React `use` untuk Next.js 15+
  const { roomCode } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: sessionData, isLoading: sessionLoading } = useSessionByRoomCode(roomCode);
  const submitResult = useSubmitResult();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; score: number }[]>([]);
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const quizQuestionsRef = useRef<Question[]>([]);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [answeredParticipants, setAnsweredParticipants] = useState<{ id: string; name: string; answer?: string }[]>([]);

  const isCreator = user?.role === UserRole.CREATOR;
  const isOwner = sessionData?.creatorId === user?.id;

  const { namespace } = isCreator && isOwner
    ? { namespace: 'host' as const }
    : { namespace: 'participant' as const };

  const { isConnected, emit, on, off } = useSocket({ namespace });

  // 1. Join Room via REST + WebSocket
  useEffect(() => {
    if (!isConnected || !user || !sessionData) return;

    if (isCreator && isOwner) {
      emit('join_room', { roomCode, userId: user.id }, (response: any) => {
        if (response?.error) {
          console.error('Error joining room as host:', response.error);
          return;
        }
        if (response?.participants) {
          setParticipants(response.participants);
          setParticipantCount(response.participantCount || 0);
        }
      });
    } else {
      (async () => {
        try {
          await sessionService.join(roomCode);
        } catch (err: any) {
          const errMsg = err?.response?.data?.message;
          const isAlreadyInSession = Array.isArray(errMsg)
            ? errMsg.includes('You are already in this session')
            : errMsg === 'You are already in this session';

          if (!isAlreadyInSession) {
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

  // 2. Load Soal jika Sesi Sudah Live
  useEffect(() => {
    if (!sessionData) return;

    if (sessionData.status === SessionStatus.LIVE && sessionData.currentQuestionIndex >= 0) {
      loadCurrentQuestion(sessionData);
    }
  }, [sessionData]);

  const loadCurrentQuestion = async (sess: any) => {
    try {
      const quizRes = await quizService.findOne(sess.quizId);
      const quiz = quizRes.data;
      quizQuestionsRef.current = quiz.questions || [];
      const idx = sess.currentQuestionIndex;
      if (quiz?.questions?.[idx]) {
        setCurrentQuestion(quiz.questions[idx]);
        setQuestionIndex(idx);
        setTotalQuestions(quiz.questions.length);
        setQuizStarted(true);
        setShowResult(false);
        setLastAnswerCorrect(null);
        setSelectedAnswer(null);
        setRemainingTime(quiz.questions[idx].timeLimit || 30);
      }
    } catch (err) {
      console.error('Failed to load question:', err);
    }
  };

  // 3. Socket Event Listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleQuizStarted = (data: any) => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex ?? 0);
      setTotalQuestions(data.totalQuestions ?? 0);
      setQuizStarted(true);
      setQuizFinished(false);
      setShowResult(false);
      setLastAnswerCorrect(null);
      setSelectedAnswer(null);
      setRemainingTime(data.question?.timeLimit || 30);
      setAnsweredParticipants([]);
    };

    const handleNewQuestion = (data: any) => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setShowResult(false);
      setLastAnswerCorrect(null);
      setSelectedAnswer(null);
      setRemainingTime(data.question?.timeLimit || 30);
      setAnsweredParticipants([]);
    };

    const handleQuizFinished = (data: any) => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
      setLeaderboard(data.leaderboard || []);
      setQuizFinished(true);
      setQuizStarted(false);
    };

    const handleParticipantJoined = (data: { participantId: string; participantName?: string; participantCount: number }) => {
      setParticipantCount(data.participantCount);
      if (data.participantId) {
        setParticipants((prev) => {
          if (prev.some((p) => p.id === data.participantId)) return prev;
          return [...prev, { id: data.participantId, name: data.participantName || `Peserta ${data.participantCount}` }];
        });
      }
    };

    const handleAnswerSubmitted = (data: any) => {
      if (data.userId !== user?.id && data.participantCount) {
        setParticipantCount(data.participantCount);
      }
      if (data.userId && data.userId !== user?.id) {
        setAnsweredParticipants((prev) => {
          if (prev.some((p) => p.id === data.userId)) return prev;
          const newList = [
            ...prev,
            {
              id: data.userId,
              name: data.participantName || `Peserta`,
              answer: data.answer,
            },
          ];

          // Jika semua peserta sudah menjawab, hentikan countdown timer dan tampilkan hasil langsung di sisi host
          if (participants.length > 0 && newList.length === participants.length) {
            setShowResult(true);
          }

          return newList;
        });
      }
    };

    on('quiz_started', handleQuizStarted);
    on('new_question', handleNewQuestion);
    on('quiz_finished', handleQuizFinished);
    on('participant_joined', handleParticipantJoined);
    on('answer_submitted', handleAnswerSubmitted);

    return () => {
      off('quiz_started', handleQuizStarted);
      off('new_question', handleNewQuestion);
      off('quiz_finished', handleQuizFinished);
      off('participant_joined', handleParticipantJoined);
      off('answer_submitted', handleAnswerSubmitted);
    };
  }, [isConnected, on, off, user?.id, participants]);

  // Cleanup advance timeout on unmount
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  // Host Action Handlers
  const handleStartQuiz = () => {
    if (!user || !sessionData) return;
    emit('start_quiz', { roomCode }, (response: any) => {
      if (response?.error) {
        console.error(response.error);
      } else {
        loadCurrentQuestion({
          ...sessionData,
          currentQuestionIndex: 0,
          status: SessionStatus.LIVE,
        });
      }
    });
  };

  const handleNextQuestion = () => {
    emit('next_question', { roomCode }, (response: any) => {
      if (response?.error) console.error(response.error);
    });
  };

  const handleEndQuiz = () => {
    emit('end_quiz', { roomCode }, (response: any) => {
      if (response?.error) console.error(response.error);
    });
  };

  // Participant Action Handlers
  const advanceToNextQuestion = useCallback(() => {
    const nextIndex = questionIndex + 1;
    const questions = quizQuestionsRef.current;
    if (nextIndex < totalQuestions && questions[nextIndex]) {
      setCurrentQuestion(questions[nextIndex]);
      setQuestionIndex(nextIndex);
      setShowResult(false);
      setLastAnswerCorrect(null);
      setSelectedAnswer(null);
      setRemainingTime(questions[nextIndex].timeLimit || 30);
    }
  }, [questionIndex, totalQuestions]);

  const submitParticipantResult = useCallback(
    async (currentAnswers: typeof answers) => {
      if (!sessionData || !user) return;
      const totalScore = currentAnswers.reduce((sum, a) => sum + a.score, 0);
      try {
        await submitResult.mutateAsync({
          sessionId: sessionData.id,
          totalScore,
          answers: currentAnswers,
        });
        console.log('Final results submitted successfully');
      } catch (err) {
        console.error('Failed to submit final result:', err);
      }
    },
    [sessionData, user, submitResult]
  );

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion || !user || showResult) return;

      const isCorrect = answer === currentQuestion.correctAnswer;
      const score = isCorrect ? currentQuestion.points : 0;

      setSelectedAnswer(answer);
      setLastAnswerCorrect(isCorrect);
      setShowResult(true);

      const newAnswers = [
        ...answers.filter((a) => a.questionId !== currentQuestion.questionId),
        { questionId: currentQuestion.questionId, answer, score }
      ];
      setAnswers(newAnswers);

      emit('submit_answer', {
        roomCode,
        userId: user.id,
        questionId: currentQuestion.questionId,
        answer,
      });

      if (questionIndex === totalQuestions - 1) {
        submitParticipantResult(newAnswers);
      }

      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = setTimeout(() => {
        advanceToNextQuestion();
      }, 1200);
    },
    [currentQuestion, user, roomCode, emit, showResult, advanceToNextQuestion, answers, questionIndex, totalQuestions, submitParticipantResult]
  );

  const handleTimeUp = useCallback(() => {
    if (!showResult && currentQuestion) {
      setLastAnswerCorrect(false);
      setShowResult(true);

      const newAnswers = [
        ...answers.filter((a) => a.questionId !== currentQuestion.questionId),
        { questionId: currentQuestion.questionId, answer: '', score: 0 }
      ];
      setAnswers(newAnswers);

      if (questionIndex === totalQuestions - 1) {
        submitParticipantResult(newAnswers);
      }

      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = setTimeout(() => {
        advanceToNextQuestion();
      }, 1200);
    }
  }, [showResult, currentQuestion, advanceToNextQuestion, answers, questionIndex, totalQuestions, submitParticipantResult]);

  const handleSubmitQuiz = async () => {
    if (!sessionData || !user) return;
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
    try {
      await submitResult.mutateAsync({
        sessionId: sessionData.id,
        totalScore,
        answers,
      });
      router.push(`/sessions/${sessionData.id}/report`);
    } catch (err) {
      console.error('Failed to submit result:', err);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getChoiceColor = () => {
    return 'bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-900';
  };

  const getChoiceLetter = (index: number) => ['A', 'B', 'C', 'D'][index];

  // ------------------------------------------
  // RENDER: Loading State
  // ------------------------------------------
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading quiz arena...</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER: Session Not Found State
  // ------------------------------------------
  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-slate-900 text-lg font-semibold mb-2">Session Not Found</p>
          <p className="text-slate-500 mb-4">Kode ruangan ini tidak valid atau sesi telah berakhir.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER: Tampilan Hasil Akhir
  // ------------------------------------------
  if (quizFinished) {
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
    const myScore = answers.reduce((sum, a) => sum + a.score, 0);
    const myRank = sortedLeaderboard.findIndex((e) => e.participantId === user?.id) + 1;

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏆</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Selesai!</h1>
            <p className="text-slate-500">Papan Peringkat Akhir</p>
          </div>

          {answers.length > 0 && (
            <div className="rounded-2xl bg-indigo-600 p-6 text-center text-white">
              <p className="text-sm text-indigo-200 mb-1">Skor Total Anda</p>
              <p className="text-5xl font-bold">{myScore}</p>
              {myRank > 0 && (
                <p className="text-sm text-indigo-200 mt-2">
                  Peringkat #{myRank} dari {sortedLeaderboard.length} peserta
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Leaderboard</h2>
            {sortedLeaderboard.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada data</p>
            ) : (
              <div className="space-y-3">
                {sortedLeaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = entry.participantId === user?.id;
                  return (
                    <div
                      key={entry.participantId}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isCurrentUser
                          ? 'bg-indigo-50 border border-indigo-200 ring-1 ring-indigo-100'
                          : rank <= 3
                            ? 'bg-slate-50 border border-slate-100'
                            : 'bg-white border border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        rank === 1
                          ? 'bg-amber-400 text-white shadow-sm'
                          : rank === 2
                            ? 'bg-gray-300 text-white'
                            : rank === 3
                              ? 'bg-orange-400 text-white'
                              : 'bg-slate-100 text-slate-500'
                      }`}>
                        {rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold truncate ${isCurrentUser ? 'text-indigo-700' : 'text-slate-900'}`}>
                            {entry.participantName}
                          </p>
                          {isCurrentUser && (
                            <span className="shrink-0 text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Kamu</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-slate-900">{entry.score}</p>
                        <p className="text-xs text-slate-400">poin</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER: Tampilan Ruang Tunggu (Lobby)
  // ------------------------------------------
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Arena</h1>
            <p className="text-slate-500">Status: {sessionData.status}</p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-500 mb-2">Kode Ruangan</p>
            <p
              className="text-5xl font-mono font-bold text-indigo-600 cursor-pointer hover:text-indigo-700 transition-colors tracking-wider"
              onClick={copyRoomCode}
            >
              {roomCode}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {copied ? 'Tersalin ke clipboard!' : 'Klik untuk menyalin kode'}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Status Koneksi Socket</p>
            <p className={`text-sm font-medium ${isConnected ? 'text-indigo-600' : 'text-slate-400'}`}>
              {isConnected ? '● Terhubung' : '○ Terputus'}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Peserta Bergabung</h3>
              <span className="ml-auto inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                {participantCount}
              </span>
            </div>
            {participants.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada peserta yang bergabung</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                      {p.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isCreator && isOwner ? (
            <button
              className="w-full py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50"
              onClick={handleStartQuiz}
              disabled={!isConnected}
            >
              Mulai Quiz
            </button>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm animate-pulse">Menunggu host memulai quiz...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER: Tampilan Pertanyaan (Live Arena)
  // ------------------------------------------
  const totalCircleLength = 2 * Math.PI * 24;
  const timeProgress = currentQuestion?.timeLimit
    ? (remainingTime / currentQuestion.timeLimit)
    : 1;

  // ==========================================
  // HOST/MONITORING VIEW (Creator)
  // ==========================================
  if (isCreator && isOwner) {
    const answeredCount = answeredParticipants.length;
    const totalParticipants = participants.length;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400 font-mono">{roomCode}</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                {answeredCount}/{totalParticipants} jawab
              </span>
              <span className="text-base md:text-lg font-bold text-slate-900 bg-white px-4 py-2 rounded-full border border-slate-200">
                Soal {questionIndex + 1} / {totalQuestions}
              </span>
            </div>
            {currentQuestion && (
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-200" />
                  <circle
                    cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" fill="none"
                    strokeDasharray={`${totalCircleLength}`}
                    strokeDashoffset={`${totalCircleLength * (1 - timeProgress)}`}
                    className="text-indigo-600 transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CountdownTimer
                    duration={currentQuestion.timeLimit || 30}
                    onTimeUp={() => setShowResult(true)}
                    isActive={!showResult}
                    onTick={(time) => setRemainingTime(time)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Teks Pertanyaan */}
          {currentQuestion && (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 mb-4 shadow-sm">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center leading-relaxed">
                {currentQuestion.text}
              </h2>
            </div>
          )}

          {/* Jawaban Benar (ditampilkan untuk host setelah reveal) */}
          {showResult && currentQuestion && (
            <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-indigo-800">Jawaban Benar</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.choices.map((choice, index) => (
                  <div
                    key={choice}
                    className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                      choice === currentQuestion.correctAnswer
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    <span className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      choice === currentQuestion.correctAnswer
                        ? 'bg-white text-indigo-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {getChoiceLetter(index)}
                    </span>
                    <span className="truncate">{choice}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pilihan Jawaban (read-only preview untuk host) */}
          {!showResult && currentQuestion && (
            <div className="grid grid-cols-2 gap-3 flex-1 opacity-60">
              {currentQuestion.choices.map((choice, index) => (
                <div
                  key={choice}
                  className="flex items-center justify-center gap-3 p-4 md:p-6 rounded-2xl font-bold text-lg md:text-xl bg-white border-2 border-slate-200 text-slate-400 min-h-[80px] md:min-h-[100px] cursor-not-allowed"
                >
                  <span className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg md:text-xl font-black flex-shrink-0">
                    {getChoiceLetter(index)}
                  </span>
                  <span className="text-left flex-1 text-base md:text-lg">{choice}</span>
                </div>
              ))}
            </div>
          )}

          {/* Status Peserta */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Status Peserta</h3>
            </div>
            {participants.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada peserta</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {participants.map((p) => {
                  const answeredInfo = answeredParticipants.find((a) => a.id === p.id);
                  const hasAnswered = !!answeredInfo;
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        hasAnswered
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {hasAnswered ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          p.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-700 flex-1">{p.name}</span>
                      <span className={`text-xs font-medium ${hasAnswered ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {hasAnswered
                          ? `Selesai ${answeredInfo.answer ? `(Jawaban: ${answeredInfo.answer})` : ''}`
                          : 'Menjawab...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer: Host Controls */}
          <div className="flex items-center justify-between mt-4 pb-4">
            <div className="text-left">
              <p className="text-xs text-slate-400">Jawaban masuk</p>
              <p className="text-xl font-bold text-slate-900">
                {answeredCount} / {totalParticipants}
              </p>
            </div>

            <div className="flex gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === questionIndex
                      ? 'bg-indigo-600 scale-125 ring-2 ring-indigo-200'
                      : i < questionIndex
                        ? 'bg-indigo-600'
                        : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="text-right">
              {showResult && (
                questionIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Lanjut →
                  </button>
                ) : (
                  <button
                    onClick={handleEndQuiz}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                  >
                    Selesai
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PARTICIPANT VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-400 font-mono">{roomCode}</span>
          <span className="text-base md:text-lg font-bold text-slate-900 bg-white px-4 py-2 rounded-full border border-slate-200">
            Soal {questionIndex + 1} / {totalQuestions}
          </span>
          {currentQuestion && (
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-slate-200"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${totalCircleLength}`}
                  strokeDashoffset={`${totalCircleLength * (1 - timeProgress)}`}
                  className="text-indigo-600 transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CountdownTimer
                  duration={currentQuestion.timeLimit || 30}
                  onTimeUp={handleTimeUp}
                  isActive={!showResult}
                  onTick={(time) => setRemainingTime(time)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Teks Pertanyaan */}
        {currentQuestion && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 mb-4 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>
        )}

        {/* Pilihan Jawaban (2x2 Grid) */}
        {currentQuestion && (
            <div className="grid grid-cols-2 gap-3 flex-1">
              {currentQuestion.choices.map((choice, index) => {
              const isSelected = selectedAnswer === choice;
              const isCorrectAnswer = choice === currentQuestion.correctAnswer;
              const showCorrectHighlight = showResult && isCorrectAnswer;
              const showWrongHighlight = showResult && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={choice}
                  onClick={() => handleAnswer(choice)}
                  disabled={showResult}
                  className={`
                    relative flex items-center justify-center gap-3 p-4 md:p-6 rounded-2xl font-bold text-lg md:text-xl
                    transition-all duration-200 min-h-[80px] md:min-h-[100px]
                    ${
                      showCorrectHighlight
                        ? 'bg-emerald-500 text-white scale-[1.02] shadow-lg shadow-emerald-500/20'
                        : showWrongHighlight
                          ? 'bg-red-500 text-white scale-[1.02] shadow-lg shadow-red-500/20'
                          : isSelected
                            ? `${getChoiceColor()} scale-[1.02] shadow-lg border-indigo-400`
                            : `${getChoiceColor()} active:scale-[0.98]`
                    }
                    disabled:cursor-default
                  `}
                >
                  <span className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg md:text-xl font-black flex-shrink-0">
                    {getChoiceLetter(index)}
                  </span>
                  <span className="text-left flex-1 text-base md:text-lg">{choice}</span>
                  {showCorrectHighlight && (
                    <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {showWrongHighlight && (
                    <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              );
              })}
            </div>
        )}

        {/* Footer Bar */}
        <div className="flex items-center justify-between mt-4 pb-4">
          <div className="text-left">
            <p className="text-xs text-slate-400">Skor Anda</p>
            <p className="text-xl font-bold text-slate-900">
              {answers.reduce((sum, a) => sum + a.score, 0)}
            </p>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const answerForStep = answers[i];
              return (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === questionIndex
                      ? 'bg-indigo-600 scale-125 ring-2 ring-indigo-200'
                      : i < questionIndex
                        ? answerForStep && answerForStep.score > 0
                          ? 'bg-emerald-500'
                          : 'bg-red-400'
                        : 'bg-slate-200'
                  }`}
                />
              );
            })}
          </div>

          <div className="text-right" />
        </div>
      </div>
    </div>
  );
}