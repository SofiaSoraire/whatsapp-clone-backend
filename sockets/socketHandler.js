import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import { logger } from '../services/loggerService.js';

export const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Invalid token'));
      socket.userId = decoded.id;
      next();
    });
  });

  io.on('connection', (socket) => {
    logger.info(`Socket conectado: ${socket.userId}`);

    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      logger.info(`Usuario ${socket.userId} se unió a sala ${chatId}`);
    });

    socket.on('send-message', async (data) => {
      const { chatId, content } = data;
      try {
        const message = await Message.create({
          chatId,
          senderId: socket.userId,
          content
        });
        const populated = await message.populate('senderId', 'nickname');
        io.to(chatId).emit('new-message', populated);
        logger.info(`Mensaje enviado a sala ${chatId}`);
      } catch (error) {
        logger.error('Error al guardar mensaje:', error);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket desconectado: ${socket.userId}`);
    });
  });
};