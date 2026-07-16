import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL } from './constants';

let hostSocket: Socket | null = null;
let participantSocket: Socket | null = null;

export function getHostSocket(): Socket {
  if (!hostSocket) {
    hostSocket = io(`${WS_BASE_URL}/host`, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return hostSocket;
}

export function getParticipantSocket(): Socket {
  if (!participantSocket) {
    participantSocket = io(`${WS_BASE_URL}/participant`, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return participantSocket;
}

export function disconnectAll(): void {
  if (hostSocket) {
    hostSocket.disconnect();
    hostSocket = null;
  }
  if (participantSocket) {
    participantSocket.disconnect();
    participantSocket = null;
  }
}
