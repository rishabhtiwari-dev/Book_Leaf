import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

import config from './config/env.js';
import prisma from './lib/prisma.js';
import authPlugin from './plugins/auth.js';
import websocketPlugin from './plugins/websocket.js';
import authRoutes from './routes/auth.routes.js';
import booksRoutes from './routes/books.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import adminRoutes from './routes/admin.routes.js';

/**
 * Build and configure the Fastify application.
 */
async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: 'info'
    },
  });

  // --- Global error handler ---
  fastify.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;
    fastify.log.error(error);
    reply.status(statusCode).send({
      error: true,
      message: error.message || 'Internal Server Error',
      statusCode,
    });
  });

  // --- CORS ---
  await fastify.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // --- Swagger API Documentation ---
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'BookLeaf Support Portal API',
        description: 'API for the BookLeaf Author Support & Communication Portal',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      servers: [
        { url: `http://localhost:${config.port}`, description: 'Development server' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // --- Plugins ---
  await fastify.register(authPlugin);
  await fastify.register(websocketPlugin);

  // --- Routes ---
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(booksRoutes, { prefix: '/api/books' });
  await fastify.register(ticketsRoutes, { prefix: '/api/tickets' });
  await fastify.register(adminRoutes, { prefix: '/api/admin' });

  // --- Health check ---
  fastify.get('/api/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // --- Root ---
  fastify.get('/', async () => ({
    name: 'BookLeaf Support Portal API',
    version: '1.0.0',
    docs: '/api/docs',
  }));

  return fastify;
}

/**
 * Start the server.
 */
async function start() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected.');

    const app = await buildApp();

    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`\n🚀 BookLeaf Support Portal API running at http://localhost:${config.port}`);
    console.log(`📚 API Docs available at http://localhost:${config.port}/api/docs\n`);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        await app.close();
        await prisma.$disconnect();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

start();
