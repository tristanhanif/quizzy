'use client';

import { create } from 'zustand';
import type { Quiz, Question, LeaderboardEntry, Session, SessionStatus } from '@/types';

interface QuizState {
  activeQuiz: Quiz | null;
  activeSession: Session | null;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  totalQuestions: number;
  leaderboard: LeaderboardEntry[];
  scores: Record<string, number>;
  timer: number;
  isActive: boolean;

  setActiveQuiz: (quiz: Quiz) => void;
  setActiveSession: (session: Session) => void;
  setCurrentQuestion: (question: Question, index: number, total: number) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  updateScore: (userId: string, score: number) => void;
  setTimer: (time: number) => void;
  decrementTimer: () => void;
  setIsActive: (active: boolean) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  activeQuiz: null,
  activeSession: null,
  currentQuestionIndex: 0,
  currentQuestion: null,
  totalQuestions: 0,
  leaderboard: [],
  scores: {},
  timer: 0,
  isActive: false,

  setActiveQuiz: (quiz) => set({ activeQuiz: quiz }),
  setActiveSession: (session) => set({ activeSession: session }),

  setCurrentQuestion: (question, index, total) =>
    set({
      currentQuestion: question,
      currentQuestionIndex: index,
      totalQuestions: total,
      timer: question.timeLimit,
    }),

  setLeaderboard: (entries) => set({ leaderboard: entries }),

  updateScore: (userId, score) =>
    set((state) => ({
      scores: { ...state.scores, [userId]: score },
    })),

  setTimer: (time) => set({ timer: time }),

  decrementTimer: () =>
    set((state) => ({
      timer: state.timer > 0 ? state.timer - 1 : 0,
    })),

  setIsActive: (active) => set({ isActive: active }),

  resetQuiz: () =>
    set({
      activeQuiz: null,
      activeSession: null,
      currentQuestionIndex: 0,
      currentQuestion: null,
      totalQuestions: 0,
      leaderboard: [],
      scores: {},
      timer: 0,
      isActive: false,
    }),
}));
