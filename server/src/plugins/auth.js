import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import config from '../config/env.js';

/**
 * Authentication plugin.
 * Registers JWT support and adds authenticate / authorize decorators.
 */
async function authPlugin(fastify) {
  // Register JWT
  await fastify.register(fastifyJwt, {
    secret: config.jwtSecret,
    sign: { expiresIn: '7d' },
  });

  /**
   * Decorator: verifies a valid JWT token is present.
   * Attaches decoded user payload to request.user.
   */
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: true, message: 'Unauthorized: Invalid or missing token', statusCode: 401 });
    }
  });

  /**
   * Decorator: ensures the authenticated user has ADMIN role.
   */
  fastify.decorate('authorizeAdmin', async function (request, reply) {
    try {
      await request.jwtVerify();
      if (request.user.role !== 'ADMIN') {
        reply.status(403).send({ error: true, message: 'Forbidden: Admin access required', statusCode: 403 });
      }
    } catch (err) {
      reply.status(401).send({ error: true, message: 'Unauthorized: Invalid or missing token', statusCode: 401 });
    }
  });

  /**
   * Decorator: ensures the authenticated user has AUTHOR role.
   */
  fastify.decorate('authorizeAuthor', async function (request, reply) {
    try {
      await request.jwtVerify();
      if (request.user.role !== 'AUTHOR') {
        reply.status(403).send({ error: true, message: 'Forbidden: Author access required', statusCode: 403 });
      }
    } catch (err) {
      reply.status(401).send({ error: true, message: 'Unauthorized: Invalid or missing token', statusCode: 401 });
    }
  });
}

export default fp(authPlugin, { name: 'auth' });
