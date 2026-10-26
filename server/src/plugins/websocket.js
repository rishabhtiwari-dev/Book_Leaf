import fp from 'fastify-plugin';
import { Server } from 'socket.io';
import config from '../config/env.js';

/** @type {Server|null} */
let io = null;

/**
 * WebSocket plugin using Socket.io.
 * Sets up JWT-authenticated Socket.io server attached to Fastify.
 */
async function websocketPlugin(fastify) {
  io = new Server(fastify.server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
      credentials: true,
    },
  });

  // JWT authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = fastify.jwt.verify(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    if (userId) {
      // Join a personal room so we can target messages to specific users
      socket.join(`user:${userId}`);

      // Admins also join the admin room
      if (socket.user.role === 'ADMIN') {
        socket.join('admins');
      }
    }

    socket.on('disconnect', () => {
      // Cleanup handled automatically by Socket.io
    });
  });

  // Attach io instance to fastify for access in routes
  fastify.decorate('io', io);

  fastify.addHook('onClose', () => {
    io.close();
  });
}

/**
 * Emit a ticket event to relevant users.
 * @param {string} event - Event name (e.g. 'ticket:created', 'ticket:updated', 'ticket:response')
 * @param {object} data - Event payload
 * @param {object} [options] - Options for targeting
 * @param {string} [options.toUserId] - Emit to a specific user
 * @param {boolean} [options.toAdmins] - Emit to all admins
 */
export function emitTicketEvent(event, data, options = {}) {
  if (!io) return;

  if (options.toUserId) {
    io.to(`user:${options.toUserId}`).emit(event, data);
  }
  if (options.toAdmins) {
    io.to('admins').emit(event, data);
  }
}

export default fp(websocketPlugin, { name: 'websocket' });
