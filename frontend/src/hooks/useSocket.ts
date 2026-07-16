'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL } from '@/utils/constants';
import { useAuthStore } from '@/store/authStore';

interface UseSocketOptions {
  namespace: 'host' | 'participant';
}

export function useSocket({ namespace }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const socket = io(`${WS_BASE_URL}/${namespace}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace, token]);

  const emit = useCallback(
    (event: string, data: any, callback?: (response: any) => void) => {
      if (socketRef.current?.connected) {
        if (callback) {
          socketRef.current.emit(event, data, callback);
        } else {
          socketRef.current.emit(event, data);
        }
      }
    },
    []
  );

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    socketRef.current?.off(event, handler);
  }, []);

  return { isConnected, emit, on, off, socket: socketRef };
}
