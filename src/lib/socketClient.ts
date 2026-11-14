import { io, Socket } from 'socket.io-client';
import { isDemoModeActive } from './apiClient';
import { STORAGE_KEYS } from '@/constants/site';

let socket: Socket | null = null;
let lastToken: string | null = null;

function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
}

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.accessToken || null;
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

export function getSupportSocket(token?: string | null): Socket | null {
  if (typeof window === 'undefined') return null;
  if (isDemoModeActive()) return null;

  const resolvedToken = (token !== undefined ? token : readStoredToken()) || null;

  if (socket) {
    if (resolvedToken !== lastToken) {
      lastToken = resolvedToken;
      socket.auth = {
        token: resolvedToken || undefined,
      };
      if (socket.connected) {
        socket.disconnect().connect();
      } else if (resolvedToken) {
        socket.connect();
      }
    } else if (!socket.connected && !socket.active && resolvedToken) {
      socket.connect();
    }
    return socket;
  }

  lastToken = resolvedToken;
  const socketUrl = getSocketUrl();

  socket = io(socketUrl, {
    auth: {
      token: resolvedToken || undefined,
    },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.io.on('reconnect_attempt', () => {
    if (!socket) return;
    const latestToken = readStoredToken();
    lastToken = latestToken;
    socket.auth = {
      token: latestToken || undefined,
    };
  });

  return socket;
}

export function disconnectSupportSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    lastToken = null;
  }
}
