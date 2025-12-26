import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

const SOCKET_URL = 'https://impostr-backend-production.up.railway.app';

let socket: Socket | null = null;

export const socketService = {
  connect: async () => {
    const token = await getToken();
    if (!token) return null;

    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  emit: (event: string, data: any, callback?: (response: any) => void) => {
    if (socket) {
      if (callback) {
        socket.emit(event, data, callback);
      } else {
        socket.emit(event, data);
      }
    } else {
      console.warn('Socket instance null, cannot emit:', event);
    }
  },

  on: (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event: string) => {
    if (socket) {
      socket.off(event);
    }
  },
};
