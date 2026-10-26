import prisma from '../lib/prisma.js';

/**
 * Books routes plugin.
 * Lists and retrieves book details for authors and admins.
 */
export default async function booksRoutes(fastify) {
  /**
   * GET /api/books
   * List books. Authors see only their own books; admins see all.
   */
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'List books for the authenticated user',
      tags: ['Books'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          genre: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { status, genre } = request.query;
      const where = {};

      // Authors can only see their own books
      if (request.user.role !== 'ADMIN') {
        where.userId = request.user.id;
      }

      if (status) where.status = status;
      if (genre) where.genre = { contains: genre };

      const books = await prisma.book.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, authorId: true },
          },
        },
        orderBy: { publicationDate: 'desc' },
      });

      // Parse availableOn JSON string into array
      const parsed = books.map((book) => ({
        ...book,
        availableOn: JSON.parse(book.availableOn || '[]'),
      }));

      return reply.send({ books: parsed });
    },
  });

  /**
   * GET /api/books/:id
   * Get a single book's details. Authors can only see their own.
   */
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get book details by ID',
      tags: ['Books'],
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
      const book = await prisma.book.findUnique({
        where: { id: request.params.id },
        include: {
          author: {
            select: { id: true, name: true, email: true, authorId: true, phone: true, city: true },
          },
        },
      });

      if (!book) {
        return reply.status(404).send({
          error: true,
          message: 'Book not found',
          statusCode: 404,
        });
      }

      // Authors can only view their own books
      if (request.user.role !== 'ADMIN' && book.userId !== request.user.id) {
        return reply.status(403).send({
          error: true,
          message: 'Forbidden: You can only view your own books',
          statusCode: 403,
        });
      }

      return reply.send({
        book: {
          ...book,
          availableOn: JSON.parse(book.availableOn || '[]'),
        },
      });
    },
  });
}
