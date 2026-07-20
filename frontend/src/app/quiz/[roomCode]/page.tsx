'use client';

import { use, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionByRoomCode, useSubmitResult } from '@/hooks/useQuiz';
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
    onTickRef.current?.(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - 1;
        onTickRef.current?.(nextTime);
        if (nextTime <= 0) {
          clearInterval(interval);
          onTimeUpRef.current?.();
          return 0;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  return (
    <span
      className={`text-lg font-bold ${
        timeLeft <= 5 ? 'text-red-400 animate-pulse' : timeLeft <= 10 ? 'text-yellow-400' : 'text-white'
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

  const isCreator = user?.role === UserRole.CREATOR;
  const isOwner = sessionData?.creatorId === user?.id;

  const { namespace } = isCreator && isOwner
    ? { namespace: 'host' as const }
    : { namespace: 'participant' as const };

  const { isConnected, emit, on, off } = useSocket({ namespace });

  // 1. Join Room via WebSocket
  useEffect(() => {
    if (!isConnected || !user || !sessionData) return;

    if (!isCreator || !isOwner) {
      emit('join_room', { roomCode, userId: user.id }, (response: any) => {
        if (response?.error) console.error('Error joining room:', response.error);
      });
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
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex ?? 0);
      setTotalQuestions(data.totalQuestions ?? 0);
      setQuizStarted(true);
      setQuizFinished(false);
      setShowResult(false);
      setLastAnswerCorrect(null);
      setSelectedAnswer(null);
      setRemainingTime(data.question?.timeLimit || 30);
    };

    const handleNewQuestion = (data: any) => {
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setShowResult(false);
      setLastAnswerCorrect(null);
      setSelectedAnswer(null);
      setRemainingTime(data.question?.timeLimit || 30);
    };

    const handleQuizFinished = (data: any) => {
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
  }, [isConnected, on, off, user?.id]);

  // Host Action Handlers
  const handleStartQuiz = () => {
    if (!user || !sessionData) return;
    emit('start_quiz', { roomCode }, (response: any) => {
      if (response?.error) console.error(response.error);
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
  const handleAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion || !user || showResult) return;

      const isCorrect = answer === currentQuestion.correctAnswer;
      const score = isCorrect ? currentQuestion.points : 0;

      setSelectedAnswer(answer);
      setLastAnswerCorrect(isCorrect);
      setShowResult(true);

      setAnswers((prev) => {
        const filtered = prev.filter((a) => a.questionId !== currentQuestion.questionId);
        return [...filtered, { questionId: currentQuestion.questionId, answer, score }];
      });

      emit('submit_answer', {
        roomCode,
        userId: user.id,
        questionId: currentQuestion.questionId,
        answer,
      });
    },
    [currentQuestion, user, roomCode, emit, showResult]
  );

  const handleTimeUp = useCallback(() => {
    if (!showResult && currentQuestion) {
      setLastAnswerCorrect(false);
      setShowResult(true);
      setAnswers((prev) => {
        if (prev.some((a) => a.questionId === currentQuestion.questionId)) return prev;
        return [...prev, { questionId: currentQuestion.questionId, answer: '', score: 0 }];
      });
    }
  }, [showResult, currentQuestion]);

  const handleSubmitQuiz = async () => {
    if (!sessionData || !user) return;
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
    try {
      await submitResult.mutateAsync({
        sessionId: sessionData.id,
        totalScore,
        answers,
      });
    } catch (err) {
      console.error('Failed to submit result:', err);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getChoiceColor = (index: number) => {
    const colors = [
      'bg-rose-500 hover:bg-rose-600',
      'bg-blue-500 hover:bg-blue-600',
      'bg-yellow-500 hover:bg-yellow-600',
      'bg-green-500 hover:bg-green-600',
    ];
    return colors[index % colors.length];
  };

  const getChoiceLetter = (index: number) => ['A', 'B', 'C', 'D'][index];

  // ------------------------------------------
  // RENDER: Loading State
  // ------------------------------------------
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading quiz arena...</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER: Session Not Found State
  // ------------------------------------------
  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-white text-lg font-semibold mb-2">Session Not Found</p>
          <p className="text-gray-400 mb-4">Kode ruangan ini tidak valid atau sesi telah berakhir.</p>
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
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Selesai!</h1>
            <p className="text-gray-400">Papan Peringkat Akhir</p>
          </div>

          <div className="rounded-2xl bg-gray-800 border border-gray-700 p-6">
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.participantId}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    entry.participantId === user?.id
                      ? 'bg-indigo-600/20 border border-indigo-500/50'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <span className="text-2xl font-bold text-white w-8">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{entry.participantName}</p>
                    <p className="text-sm text-gray-400">{entry.score} poin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {answers.length > 0 && (
            <div className="rounded-2xl bg-gray-800 border border-gray-700 p-6 text-center">
              <p className="text-sm text-gray-400 mb-2">Skor Total Anda</p>
              <p className="text-4xl font-bold text-indigo-400">
                {answers.reduce((sum, a) => sum + a.score, 0)}
              </p>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitResult.isPending}
                className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitResult.isPending ? 'Mengirim...' : 'Kirim Hasil Akhir'}
              </button>
            </div>
          )}

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
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
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Arena</h1>
            <p className="text-gray-400">Status: {sessionData.status}</p>
          </div>

          <div className="rounded-2xl bg-gray-800 border border-gray-700 p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Kode Ruangan</p>
            <p
              className="text-5xl font-mono font-bold text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors tracking-wider"
              onClick={copyRoomCode}
            >
              {roomCode}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {copied ? 'Tersalin ke clipboard!' : 'Klik untuk menyalin kode'}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-800 border border-gray-700 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Status Koneksi Socket</p>
            <p className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? '● Terhubung' : '○ Terputus'}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-800 border border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white">Peserta Bergabung</h3>
              <span className="ml-auto inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-medium text-white">
                {participantCount}
              </span>
            </div>
            {participants.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada peserta yang bergabung</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl bg-gray-700/50 px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                      {p.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-sm font-medium text-gray-200">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isCreator && isOwner ? (
            <button
              className="w-full py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/30"
              onClick={handleStartQuiz}
              disabled={!isConnected}
            >
              Mulai Quiz
            </button>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm animate-pulse">Menunggu host memulai quiz...</p>
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-400 font-mono">{roomCode}</span>
          <span className="text-base md:text-lg font-bold text-white bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
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
                  className="text-gray-700"
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
                  className="text-indigo-500 transition-all duration-1000 ease-linear"
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
          <div className="rounded-2xl bg-gray-800 border border-gray-700 p-6 mb-4 shadow-xl">
            <h2 className="text-xl md:text-2xl font-bold text-white text-center leading-relaxed">
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
                    relative flex items-center justify-center gap-3 p-4 md:p-6 rounded-2xl font-bold text-white text-lg md:text-xl
                    transition-all duration-200 min-h-[80px] md:min-h-[100px]
                    ${
                      showCorrectHighlight
                        ? 'bg-green-500 scale-[1.02] shadow-lg shadow-green-500/30'
                        : showWrongHighlight
                          ? 'bg-gray-600 opacity-60'
                          : isSelected
                            ? `${getChoiceColor(index)} scale-[1.02] shadow-lg`
                            : `${getChoiceColor(index)} active:scale-[0.98]`
                    }
                    disabled:cursor-default
                  `}
                >
                  <span className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg md:text-xl font-black flex-shrink-0">
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
            <p className="text-xs text-gray-500">Skor Anda</p>
            <p className="text-xl font-bold text-white">
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
                      ? 'bg-indigo-500 scale-125 ring-2 ring-indigo-400/50'
                      : i < questionIndex
                        ? answerForStep && answerForStep.score > 0
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        : 'bg-gray-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="text-right">
            {isCreator && isOwner && showResult && (
              questionIndex < totalQuestions - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30"
                >
                  Lanjut →
                </button>
              ) : (
                <button
                  onClick={handleEndQuiz}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
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