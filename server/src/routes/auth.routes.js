import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

/** Zod schema for registration */
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['AUTHOR', 'ADMIN']).optional().default('AUTHOR'),
});

/** Zod schema for login */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Auth routes plugin.
 * Handles user registration, login, and profile retrieval.
 */
export default async function authRoutes(fastify) {
  /**
   * POST /api/auth/register
   * Register a new user.
   */
  fastify.post('/register', {
    schema: {
      description: 'Register a new user',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' },
          role: { type: 'string', enum: ['AUTHOR', 'ADMIN'] },
        },
      },
    },
    handler: async (request, reply) => {
      const validation = registerSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({
          error: true,
          message: validation.error.errors[0].message,
          statusCode: 400,
        });
      }

      const { email, password, name, role } = validation.data;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.status(409).send({
          error: true,
          message: 'An account with this email already exists',
          statusCode: 409,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name, role },
      });

      const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name });

      return reply.status(201).send({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    },
  });

  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token.
   */
  fastify.post('/login', {
    schema: {
      description: 'Login with email and password',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const validation = loginSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({
          error: true,
          message: validation.error.errors[0].message,
          statusCode: 400,
        });
      }

      const { email, password } = validation.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.status(401).send({
          error: true,
          message: 'Invalid email or password',
          statusCode: 401,
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return reply.status(401).send({
          error: true,
          message: 'Invalid email or password',
          statusCode: 401,
        });
      }

      const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name });

      return reply.send({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          city: user.city,
          authorId: user.authorId,
        },
      });
    },
  });

  /**
   * GET /api/auth/me
   * Get the current authenticated user's profile.
   */
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get current user profile',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          city: true,
          authorId: true,
          joinedDate: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          error: true,
          message: 'User not found',
          statusCode: 404,
        });
      }

      return reply.send({ user });
    },
  });
}
