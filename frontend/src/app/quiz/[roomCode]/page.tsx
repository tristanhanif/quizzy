'use client';

import { use, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionByRoomCode, useSubmitResult } from '@/hooks/useQuiz';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { useQuizStore } from '@/store/quizStore';
import { sessionService } from '@/services/session.service';
import { quizService } from '@/services/quiz.service';
import QuestionCard from '@/components/quiz/QuestionCard';
import Timer from '@/components/ui/Timer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Leaderboard from '@/components/quiz/Leaderboard';
import { SessionStatus, UserRole } from '@/types';
import type { Question, LeaderboardEntry } from '@/types';

export default function QuizArenaPage({ params }: { params: Promise<{ roomCode: string }> }) {
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

  const isCreator = user?.role === UserRole.CREATOR;
  const isOwner = sessionData?.creatorId === user?.id;

  const { namespace } = isCreator && isOwner
    ? { namespace: 'host' as const }
    : { namespace: 'participant' as const };

  const { isConnected, emit, on, off } = useSocket({ namespace });

  useEffect(() => {
    if (!sessionData) return;

    if (sessionData.status === SessionStatus.LIVE && sessionData.currentQuestionIndex > 0) {
      loadCurrentQuestion(sessionData);
    }
  }, [sessionData]);

  const loadCurrentQuestion = async (sess: any) => {
    try {
      const quizRes = await quizService.findOne(sess.quizId);
      const quiz = quizRes.data;
      const idx = sess.currentQuestionIndex;
      if (quiz.questions[idx]) {
        setCurrentQuestion(quiz.questions[idx]);
        setQuestionIndex(idx);
        setTotalQuestions(quiz.questions.length);
        setQuizStarted(true);
        setShowResult(false);
        setLastAnswerCorrect(null);
      }
    } catch (err) {
      console.error('Failed to load question:', err);
    }
  };

  useEffect(() => {
    if (!isConnected) return;

    const handleQuizStarted = async (data: any) => {
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setQuizStarted(true);
      setQuizFinished(false);
      setShowResult(false);
      setLastAnswerCorrect(null);
    };

    const handleNewQuestion = async (data: any) => {
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setShowResult(false);
      setLastAnswerCorrect(null);
    };

    const handleQuizFinished = (data: any) => {
      setLeaderboard(data.leaderboard);
      setQuizFinished(true);
      setQuizStarted(false);
    };

    const handleParticipantJoined = (data: any) => {
      setParticipantCount(data.participantCount);
    };

    const handleAnswerSubmitted = (data: any) => {
      if (data.userId !== user?.id) {
        setParticipantCount((prev) => prev);
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

  const handleJoinRoom = () => {
    if (!user || !sessionData) return;

    if (isCreator && isOwner) {
      emit('start_quiz', { roomCode }, (response: any) => {
        if (response?.error) console.error(response.error);
      });
    } else {
      emit('join_room', { roomCode, userId: user.id }, (response: any) => {
        if (response?.error) console.error(response.error);
      });
    }
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

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion || !user) return;

      const isCorrect = answer === currentQuestion.correctAnswer;
      const score = isCorrect ? currentQuestion.points : 0;

      setLastAnswerCorrect(isCorrect);
      setShowResult(true);
      setAnswers((prev) => [
        ...prev,
        { questionId: currentQuestion.questionId, answer, score },
      ]);

      emit('submit_answer', {
        roomCode,
        userId: user.id,
        questionId: currentQuestion.questionId,
        answer,
      });
    },
    [currentQuestion, user, roomCode, emit]
  );

  const handleTimeUp = useCallback(() => {
    if (!showResult && currentQuestion) {
      setLastAnswerCorrect(false);
      setShowResult(true);
      setAnswers((prev) => [
        ...prev,
        { questionId: currentQuestion.questionId, answer: '', score: 0 },
      ]);
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

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading quiz arena...</p>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-lg font-semibold mb-2">Session Not Found</p>
          <p className="text-gray-500 mb-4">This room code is invalid or the session has ended.</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz Finished!</h1>
            <p className="text-gray-500">Here are the final results</p>
          </div>
          <Leaderboard entries={leaderboard} currentUserId={user?.id} />
          {answers.length > 0 && (
            <Card>
              <p className="text-sm text-gray-500 mb-2">Your Score</p>
              <p className="text-3xl font-bold text-indigo-600">
                {answers.reduce((sum, a) => sum + a.score, 0)}
              </p>
              <Button className="mt-4 w-full" onClick={handleSubmitQuiz} isLoading={submitResult.isPending}>
                Submit Results
              </Button>
            </Card>
          )}
          <Button className="w-full" variant="secondary" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz Arena</h1>
            <p className="text-gray-500">Status: {sessionData.status}</p>
          </div>

          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-2">Room Code</p>
            <p
              className="text-4xl font-mono font-bold text-indigo-600 cursor-pointer hover:text-indigo-700"
              onClick={copyRoomCode}
            >
              {roomCode}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {copied ? 'Copied!' : 'Click to copy'}
            </p>
          </Card>

          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-1">Connection</p>
            <p className={`font-medium ${isConnected ? 'text-indigo-600' : 'text-gray-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500 mb-1">Session Info</p>
            <div className="space-y-1 mt-2 text-sm">
              <p>Total Questions: {sessionData.maxParticipants ? 'N/A' : 'Loading...'}</p>
              <p>Time per Question: {sessionData.questionTimeLimit}s</p>
            </div>
          </Card>

          {isCreator && isOwner ? (
            <Button className="w-full" onClick={handleJoinRoom} disabled={!isConnected}>
              Start Quiz
            </Button>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Waiting for host to start the quiz...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Q{questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-sm font-medium text-gray-500">{roomCode}</span>
        </div>

        {currentQuestion && (
          <div className="flex justify-center">
            <Timer
              duration={currentQuestion.timeLimit}
              onTimeUp={handleTimeUp}
              isActive={!showResult}
            />
          </div>
        )}

        {currentQuestion && (
          <Card>
            <QuestionCard
              question={currentQuestion}
              questionNumber={questionIndex + 1}
              totalQuestions={totalQuestions}
              onAnswer={handleAnswer}
              showResult={showResult}
              isCorrect={lastAnswerCorrect ?? undefined}
            />
          </Card>
        )}

        {isCreator && isOwner && showResult && (
          <div className="flex gap-4">
            {questionIndex < totalQuestions - 1 ? (
              <Button className="w-full" onClick={handleNextQuestion}>
                Next Question
              </Button>
            ) : (
              <Button className="w-full" variant="secondary" onClick={handleEndQuiz}>
                End Quiz
              </Button>
            )}
          </div>
        )}

        {!isCreator && (
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Score: {answers.reduce((sum, a) => sum + a.score, 0)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
