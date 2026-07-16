export enum UserRole {
  ADMIN = 'ADMIN',
  CREATOR = 'CREATOR',
  PARTICIPANT = 'PARTICIPANT',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  fullName?: string;
  email?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
}

export interface Question {
  questionId: string;
  text: string;
  type: QuestionType;
  points: number;
  choices: string[];
  correctAnswer: string;
  timeLimit: number;
}

export interface Quiz {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export enum SessionStatus {
  WAITING = 'WAITING',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
}

export interface Session {
  id: string;
  quizId: string;
  creatorId: string;
  roomCode: string;
  status: SessionStatus;
  currentQuestionIndex: number;
  maxParticipants: number;
  questionTimeLimit: number;
  participants: string[];
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  joinedAt: string;
  score: number;
  answers: Answer[];
}

export interface Answer {
  questionId: string;
  answer: string;
  score: number;
}

export interface LeaderboardEntry {
  participantId: string;
  participantName: string;
  score: number;
  rank: number;
}

export interface Result {
  id: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  score: number;
  answers: Answer[];
  submittedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export interface CreateQuizPayload {
  title: string;
  description: string;
  questions: Omit<Question, 'questionId'>[];
}

export interface CreateSessionPayload {
  quizId: string;
  maxParticipants?: number;
  questionTimeLimit?: number;
  endTime?: string;
}

export interface SubmitResultPayload {
  sessionId: string;
  totalScore: number;
  answers: Answer[];
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email?: string;
  fullName?: string;
  password: string;
}
