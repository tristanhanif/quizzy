export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'quizzy_access_token',
  USER: 'quizzy_user',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  QUIZZES: '/quizzes',
  QUIZ_CREATE: '/quizzes/create',
  QUIZ_DETAIL: (id: string) => `/quizzes/${id}`,
  SESSIONS: '/sessions',
  SESSION_DETAIL: (id: string) => `/sessions/${id}`,
  QUIZ_ARENA: (roomCode: string) => `/quiz/${roomCode}`,
  RESULTS: '/results',
  LEADERBOARD: (sessionId: string) => `/results?sessionId=${sessionId}`,
} as const;
