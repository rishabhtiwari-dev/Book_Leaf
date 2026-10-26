import { z } from 'zod';
import prisma from '../lib/prisma.js';
import aiService from '../services/ai.service.js';
import { emitTicketEvent } from '../plugins/websocket.js';

/** Zod schema for updating a ticket */
const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  category: z.enum([
    'ROYALTY_PAYMENTS', 'ISBN_METADATA', 'PRINTING_QUALITY',
    'DISTRIBUTION_AVAILABILITY', 'BOOK_STATUS_PRODUCTION', 'GENERAL_INQUIRY',
  ]).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  assignedToId: z.string().optional().nullable(),
});

/** Zod schema for response content */
const responseSchema = z.object({
  content: z.string().min(1, 'Response content is required'),
});

/** Zod schema for internal note */
const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

/**
 * Admin routes plugin.
 * All routes require admin authentication.
 */
export default async function adminRoutes(fastify) {
  /**
   * GET /api/admin/tickets
   * List ALL tickets with advanced filtering.
   */
  fastify.get('/tickets', {
    onRequest: [fastify.authorizeAdmin],
    schema: {
      description: 'List all tickets with filters (admin only)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          category: { type: 'string' },
          priority: { type: 'string' },
          search: { type: 'string' },
          dateFrom: { type: 'string' },
          dateTo: { type: 'string' },
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
        },
      },
    },
    handler: async (request, reply) => {
      const {
        status, category, priority, search,
        dateFrom, dateTo, page = 1, limit = 20,
      } = request.query;

      const where = {};

      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;

      if (search) {
        where.OR = [
          { subject: { contains: search } },
          { description: { contains: search } },
          { ticketNumber: { contains: search } },
        ];
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          include: {
            author: { select: { id: true, name: true, email: true, authorId: true } },
            book: { select: { id: true, bookId: true, title: true } },
            assignedTo: { select: { id: true, name: true } },
            _count: { select: { responses: true, internalNotes: true } },
          },
          orderBy: [{ createdAt: 'desc' }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.ticket.count({ where }),
      ]);

      // Sort by priority then date (in-memory since Prisma doesn't support custom sort)
      tickets.sort((a, b) => {
        const pDiff = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        if (pDiff !== 0) return pDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

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
   * GET /api/admin/tickets/:id
   * Get full ticket details with responses, notes, author info, book details.
   */
  fastify.get('/tickets/:id', {
    onRequest: [fastify.authorizeAdmin],
    schema: {
      description: 'Get full ticket details (admin only)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
    handler: async (request, reply) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: request.params.id },
        include: {
          author: {
            select: {
              id: true, name: true, email: true, authorId: true,
              phone: true, city: true, joinedDate: true,
            },
          },
          book: true,
          responses: {
            include: {
              user: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          internalNotes: {
            include: {
              user: { select: { id: true, name: true } },
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

      // Parse book availableOn if present
      if (ticket.book) {
        ticket.book.availableOn = JSON.parse(ticket.book.availableOn || '[]');
      }

      return reply.send({ ticket });
    },
  });

  /**
   * PATCH /api/admin/tickets/:id
   * Update ticket status, category, priority, or assignment.
   */
  fastify.patch('/tickets/:id', {
    onRequest: [fastify.authorizeAdmin],
    schema: {
      description: 'Update ticket fields (admin only)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
          category: { type: 'string' },
          priority: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
          assignedToId: { type: 'string', nullable: true },
        },
      },
    },
    handler: async (request, reply) => {
      const validation = updateTicketSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({
          error: true,
          message: validation.error.errors[0].message,
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

      const updateData = {};
      const { status, category, priority, assignedToId } = validation.data;

      if (status !== undefined) updateData.status = status;
      if (category !== undefined) updateData.category = category;
      if (priority !== undefined) updateData.priority = priority;
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

      const updatedTicket = await prisma.ticket.update({
        where: { id: request.params.id },
        data: updateData,
        include: {
          author: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, bookId: true, title: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      });

      // Emit update event to both admins and the ticket author
      emitTicketEvent('ticket:updated', updatedTicket, {
        toAdmins: true,
        toUserId: updatedTicket.userId,
      });

      return reply.send({ ticket: updatedTicket });
    },
  });

  /**
   * POST /api/admin/tickets/:id/responses
   * Send a response to the author.
   */
  fastify.post('/tickets/:id/responses', {
    onRequest: [fastify.authorizeAdmin],
    schema: {
      description: 'Send a response to the ticket author (admin only)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
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
      const validation = responseSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({
          error: true,
          message: validation.error.errors[0].message,
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
          content: validation.data.content,
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

  /**
   * POST /api/admin/tickets/:id/notes
   * Add an internal note to a ticket (not visible to authors).
   */
  fastify.post('/tickets/:id/notes', {
    onRequest: [fastify.authorizeAdmin],
    schema: {
      description: 'Add an internal note to a ticket (admin only)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
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
      const validation = noteSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({
          error: true,
          message: validation.error.errors[0].message,
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

      const note = await prisma.internalNote.create({
        data: {
          content: validation.data.content,
          ticketId: ticket.id,
          userId: request.user.id,
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      return reply.status(201).send({ note });
    },
  });

  /**
   * POST /api/admin/tickets/:id/ai-draft
   * Generate an AI draft response for a ticket.
   * Returns the draft text without saving it.
   */
  fastify.post('/tickets/:id/ai-draft', {
    onRequest: [fastify.authorizeAdmin],
    schema: {
      description: 'Generate an AI draft response (admin only)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
    handler: async (request, reply) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: request.params.id },
        include: {
          author: {
            select: { id: true, name: true, email: true, city: true, authorId: true },
          },
          book: true,
        },
      });

      if (!ticket) {
        return reply.status(404).send({
          error: true,
          message: 'Ticket not found',
          statusCode: 404,
        });
      }

      // Parse book data if present
      let bookDetails = null;
      if (ticket.book) {
        bookDetails = {
          ...ticket.book,
          availableOn: JSON.parse(ticket.book.availableOn || '[]'),
        };
      }

      const draft = await aiService.generateDraftResponse(
        ticket,
        bookDetails,
        ticket.author,
      );

      return reply.send({ draft });
    },
  });

  /**
   * GET /api/admin/stats
   * Dashboard statistics.
   */
  fastify.get('/stats', {
    onRequest: [fastify.authorizeAdmin],
    schema: {
      description: 'Get dashboard statistics (admin only)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        criticalTickets,
        highTickets,
        totalAuthors,
        totalBooks,
        categoryStats,
      ] = await Promise.all([
        prisma.ticket.count(),
        prisma.ticket.count({ where: { status: 'OPEN' } }),
        prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.ticket.count({ where: { status: 'RESOLVED' } }),
        prisma.ticket.count({ where: { status: 'CLOSED' } }),
        prisma.ticket.count({ where: { priority: 'CRITICAL' } }),
        prisma.ticket.count({ where: { priority: 'HIGH' } }),
        prisma.user.count({ where: { role: 'AUTHOR' } }),
        prisma.book.count(),
        prisma.ticket.groupBy({
          by: ['category'],
          _count: { id: true },
        }),
      ]);

      const byCategory = {};
      for (const stat of categoryStats) {
        byCategory[stat.category] = stat._count.id;
      }

      const [mediumTickets, lowTickets] = await Promise.all([
        prisma.ticket.count({ where: { priority: 'MEDIUM' } }),
        prisma.ticket.count({ where: { priority: 'LOW' } }),
      ]);

      const categoryDisplayNames = {
        ROYALTY_PAYMENTS: 'Royalty & Payments',
        ISBN_METADATA: 'ISBN & Metadata Issues',
        PRINTING_QUALITY: 'Printing & Quality',
        DISTRIBUTION_AVAILABILITY: 'Distribution & Availability',
        BOOK_STATUS_PRODUCTION: 'Book Status & Production Updates',
        GENERAL_INQUIRY: 'General Inquiry',
      };

      const byCategoryList = Object.keys(categoryDisplayNames).map((key) => ({
        category: key,
        name: categoryDisplayNames[key],
        count: byCategory[key] || 0,
      }));

      return reply.send({
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        criticalTickets,
        highTickets,
        totalAuthors,
        totalBooks,
        byCategory: byCategoryList,
        byPriority: [
          { priority: 'CRITICAL', count: criticalTickets },
          { priority: 'HIGH', count: highTickets },
          { priority: 'MEDIUM', count: mediumTickets },
          { priority: 'LOW', count: lowTickets },
        ],
        stats: {
          tickets: {
            total: totalTickets,
            open: openTickets,
            inProgress: inProgressTickets,
            resolved: resolvedTickets,
            closed: closedTickets,
          },
          priority: {
            critical: criticalTickets,
            high: highTickets,
            medium: mediumTickets,
            low: lowTickets,
          },
          byCategory,
          totalAuthors,
          totalBooks,
        },
      });
    },
  });
}
