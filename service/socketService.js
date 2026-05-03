import { Server } from 'socket.io';

let io;

export const users = {};

export const initSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.id;

    if (userId) {
      users[userId] = socket.id;
      console.log(`User ${userId} connected with socket ID ${socket.id}`);
    }

    socket.on('newUser', (newUserId) => {
      for (const user in users) {
        if (user === newUserId) {
          delete users[user];
          break;
        }
      }
      users[newUserId] = socket.id;
      console.log('New user connected', newUserId);
    });

    socket.on('sendMessage', (message) => {
      if (users[message.sender._id]) {
        io.to(users[message.sender._id]).emit('receiveMessage', message);
      }
    });

    socket.on('sendNotification', (notification) => {
      if (users[notification.receiver]) {
        io.to(users[notification.receiver]).emit(
          'receiveNotification',
          notification,
        );
      }
    });

    socket.on('typing', (data) => {
      if (users[data.receiver]) {
        io.to(users[data.receiver]).emit('typingNow', data);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      for (const user in users) {
        if (users[user] === socket.id) {
          delete users[user];
          break;
        }
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default {
  initSocket,
  getIo,
  users,
};
