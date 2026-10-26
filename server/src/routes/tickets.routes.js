import { z } from 'zod';
import prisma from '../lib/prisma.js';
import aiService from '../services/ai.service.js';
import { emitTicketEvent } from '../plugins/websocket.js';

/** Zod schema for creating a ticket */
const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  bookId: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
});

/**
 * Tickets routes plugin.
 * Author-facing ticket operations: create, list, view.
 */
export default async function ticketsRoutes(fastify) {
  /**
   * POST /api/tickets
   * Create a new support ticket. Automatically classifies via AI.
   */
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Create a new support ticket',
      tags: ['Tickets'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['subject', 'description'],
        properties: {
          subject: { type: 'string' },
          description: { type: 'string' },
          bookId: { type: 'string' },
          category: { type: 'string' },
          priority: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const validation = createTicketSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({
          error: true,
          message: validation.error.errors[0].message,
          statusCode: 400,
        });
      }

      const { subject, description, bookId, category: userCategory, priority: userPriority } = validation.data;

      // If bookId is a bookId code (e.g. "BK001"), look up the actual UUID
      let resolvedBookId = bookId;
      if (bookId) {
        const book = await prisma.book.findFirst({
          where: {
            OR: [
              { id: bookId },
              { bookId: bookId },
            ],
          },
        });
        if (book) {
          // Verify the book belongs to the author (unless admin)
          if (request.user.role !== 'ADMIN' && book.userId !== request.user.id) {
            return reply.status(403).send({
              error: true,
              message: 'Forbidden: This book does not belong to you',
              statusCode: 403,
            });
          }
          resolvedBookId = book.id;
        } else {
          return reply.status(404).send({
            error: true,
            message: 'Book not found',
            statusCode: 404,
          });
        }
      }

      // AI classification
      const aiResult = await aiService.classifyTicket(subject, description);

      // Generate ticket number
      const counter = await prisma.ticketCounter.upsert({
        where: { id: 'singleton' },
        update: { count: { increment: 1 } },
        create: { id: 'singleton', count: 1 },
      });
      const ticketNumber = `TKT-${String(counter.count).padStart(4, '0')}`;

      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          subject,
          description,
          category: userCategory || aiResult.category,
          priority: userPriority || aiResult.priority,
          aiCategory: aiResult.category,
          aiPriority: aiResult.priority,
          userId: request.user.id,
          bookId: resolvedBookId || null,
        },
        include: {
          author: { select: { id: true, name: true, email: true, authorId: true } },
          book: { select: { id: true, bookId: true, title: true } },
        },
      });

      // Emit socket event to admins
      emitTicketEvent('ticket:created', ticket, { toAdmins: true });

      return reply.status(201).send({ ticket });
    },
  });

  /**
   * GET /api/tickets
   * List tickets. Authors see only their own. Supports filtering.
   */
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'List tickets (authors see only their own)',
      tags: ['Tickets'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          category: { type: 'string' },
          priority: { type: 'string' },
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
        },
      },
    },
    handler: async (request, reply) => {
      const { status, category, priority, page = 1, limit = 20 } = request.query;
      const where = {};

      // Authors can only see their own tickets
      if (request.user.role !== 'ADMIN') {
        where.userId = request.user.id;
      }

      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          include: {
            author: { select: { id: true, name: true, email: true, authorId: true } },
            book: { select: { id: true, bookId: true, title: true } },
            _count: { select: { responses: true } },
          },
          orderBy: [{ createdAt: 'desc' }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.ticket.count({ where }),
      ]);

      return reply.send({
        tickets,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    },
  });

  /**
   * GET /api/tickets/:id
   * Get ticket details with responses. Authors can only see their own.
   */
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get ticket details with responses',
      tags: ['Tickets'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: request.params.id },
        include: {
          author: { select: { id: true, name: true, email: true, authorId: true, phone: true, city: true } },
          book: true,
          responses: {
            include: {
              user: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      });

      if (!ticket) {
        return reply.status(404).send({
          error: true,
          message: 'Ticket not found',
          statusCode: 404,
        });
      }

      // Authors can only view their own tickets
      if (request.user.role !== 'ADMIN' && ticket.userId !== request.user.id) {
        return reply.status(403).send({
          error: true,
          message: 'Forbidden: You can only view your own tickets',
          statusCode: 403,
        });
      }

      // Parse book availableOn if present
      if (ticket.book) {
        ticket.book.availableOn = JSON.parse(ticket.book.availableOn || '[]');
      }

      return reply.send({ ticket });
    },
  });

  /**
   * POST /api/tickets/:id/responses
   * Add a response to a ticket (admin only).
   */
  fastify.post('/:id/responses', {
    onRequest: [fastify.authorizeAdmin],
    schema: {
      description: 'Add a response to a ticket (admin only)',
      tags: ['Tickets'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { content } = request.body;

      if (!content || !content.trim()) {
        return reply.status(400).send({
          error: true,
          message: 'Response content is required',
          statusCode: 400,
        });
      }

      const ticket = await prisma.ticket.findUnique({
        where: { id: request.params.id },
      });

      if (!ticket) {
        return reply.status(404).send({
          error: true,
          message: 'Ticket not found',
          statusCode: 404,
        });
      }

      const response = await prisma.ticketResponse.create({
        data: {
          content: content.trim(),
          ticketId: ticket.id,
          userId: request.user.id,
          sentBy: 'ADMIN',
        },
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
      });

      // Update ticket status to IN_PROGRESS if it was OPEN
      if (ticket.status === 'OPEN') {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: 'IN_PROGRESS' },
        });
      }

      // Emit event to the ticket author
      emitTicketEvent('ticket:response', {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        response,
      }, { toUserId: ticket.userId });

      return reply.status(201).send({ response });
    },
  });
}
