'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '@/services/quiz.service';
import { sessionService } from '@/services/session.service';
import { resultService } from '@/services/result.service';
import type { CreateQuizPayload, CreateSessionPayload, SubmitResultPayload } from '@/types';

export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const res = await quizService.findAll();
      return res.data.data;
    },
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      const res = await quizService.findOne(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuizPayload) => quizService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateQuizPayload }) => quizService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quizService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => sessionService.create(payload),
  });
}

export function useJoinSession() {
  return useMutation({
    mutationFn: (roomCode: string) => sessionService.join(roomCode),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const res = await sessionService.findOne(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useSessionByRoomCode(roomCode: string) {
  return useQuery({
    queryKey: ['session', 'room', roomCode],
    queryFn: async () => {
      const res = await sessionService.findByRoomCode(roomCode);
      return res.data;
    },
    enabled: !!roomCode,
  });
}

export function useSubmitResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitResultPayload) => resultService.submit(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessionResults', variables.sessionId] });
    },
  });
}

export function useLeaderboard(sessionId: string, limit?: number) {
  return useQuery({
    queryKey: ['leaderboard', sessionId, limit],
    queryFn: async () => {
      const res = await resultService.getLeaderboard(sessionId, limit);
      return res.data.data;
    },
    enabled: !!sessionId,
  });
}
