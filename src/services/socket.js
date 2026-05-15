import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

let socket = null;

export const connectSocket = (token) => {
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
  socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
  socket.on('connect_error', (err) => console.log('Socket error:', err.message));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (roomId, userId, userName) => {
  if (socket) socket.emit('join_room', { roomId, userId, userName });
};

export const leaveRoom = (roomId, userId, userName) => {
  if (socket) socket.emit('leave_room', { roomId, userId, userName });
};

export const sendChatMessage = (roomId, userId, userName, avatar, message) => {
  if (socket) socket.emit('send_message', { roomId, userId, userName, avatar, message });
};

export const raiseHand = (roomId, userId, userName) => {
  if (socket) socket.emit('raise_hand', { roomId, userId, userName });
};
