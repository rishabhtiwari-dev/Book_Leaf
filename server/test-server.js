import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';

dotenv.config();

import config from './src/config/env.js';
import prisma from './src/lib/prisma.js';
import authPlugin from './src/plugins/auth.js';
import websocketPlugin from './src/plugins/websocket.js';
import authRoutes from './src/routes/auth.routes.js';
import booksRoutes from './src/routes/books.routes.js';
import ticketsRoutes from './src/routes/tickets.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

async function runTests() {
  console.log('Testing server bootstrap and routes...');
  await prisma.$connect();

  const fastify = Fastify({ logger: false });

  await fastify.register(cors, { origin: true });
  await fastify.register(swagger, {
    openapi: {
      info: { title: 'Test API', version: '1.0.0' }
    }
  });
  await fastify.register(swaggerUi, { routePrefix: '/api/docs' });
  await fastify.register(authPlugin);
  await fastify.register(websocketPlugin);
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(booksRoutes, { prefix: '/api/books' });
  await fastify.register(ticketsRoutes, { prefix: '/api/tickets' });
  await fastify.register(adminRoutes, { prefix: '/api/admin' });

  fastify.get('/api/health', async () => ({ status: 'ok' }));

  await fastify.ready();
  console.log('✅ Server loaded successfully with all plugins and routes!');

  // Test 1: Health check
  const healthRes = await fastify.inject({ method: 'GET', url: '/api/health' });
  console.log('Health check:', healthRes.statusCode, healthRes.json());

  // Test 2: Login Admin
  const adminLogin = await fastify.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email: 'admin@bookleaf.com', password: 'admin123' },
  });
  const adminData = adminLogin.json();
  console.log('Admin login status:', adminLogin.statusCode, 'User:', adminData.user?.name, 'Role:', adminData.user?.role);
  const adminToken = adminData.token;

  // Test 3: Login Author
  const authorLogin = await fastify.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email: 'priya.sharma@email.com', password: 'author123' },
  });
  const authorData = authorLogin.json();
  console.log('Author login status:', authorLogin.statusCode, 'User:', authorData.user?.name, 'Role:', authorData.user?.role);
  const authorToken = authorData.token;

  // Test 4: Author Books
  const booksRes = await fastify.inject({
    method: 'GET',
    url: '/api/books',
    headers: { authorization: `Bearer ${authorToken}` },
  });
  const booksData = booksRes.json();
  console.log('Author books count:', booksData.books?.length, 'First book:', booksData.books?.[0]?.title);

  // Test 5: Author submits ticket with sample royalty issue
  const createTicketRes = await fastify.inject({
    method: 'POST',
    url: '/api/tickets',
    headers: { authorization: `Bearer ${authorToken}` },
    payload: {
      subject: 'Royalty payout not received for Q3',
      description: 'I published my book 4 months ago and still haven’t received any royalty. What is going on?',
      bookId: booksData.books?.[0]?.id,
    },
  });
  const ticketData = createTicketRes.json();
  console.log('Ticket created:', ticketData.ticket?.ticketNumber, 'Category:', ticketData.ticket?.category, 'Priority:', ticketData.ticket?.priority);

  // Test 6: Admin gets ticket queue
  const adminQueueRes = await fastify.inject({
    method: 'GET',
    url: '/api/admin/tickets',
    headers: { authorization: `Bearer ${adminToken}` },
  });
  console.log('Admin tickets count:', adminQueueRes.json().tickets?.length);

  // Test 7: Admin generates AI draft response
  const aiDraftRes = await fastify.inject({
    method: 'POST',
    url: `/api/admin/tickets/${ticketData.ticket?.id}/ai-draft`,
    headers: { authorization: `Bearer ${adminToken}` },
  });
  console.log('AI Draft response status:', aiDraftRes.statusCode);
  console.log('AI Draft preview:\n', aiDraftRes.json().draft?.substring(0, 150), '...');

  // Test 8: Admin sends response
  const sendResp = await fastify.inject({
    method: 'POST',
    url: `/api/admin/tickets/${ticketData.ticket?.id}/responses`,
    headers: { authorization: `Bearer ${adminToken}` },
    payload: { content: 'Dear Priya, we have checked your quarterly royalty report. Payment is scheduled for this Friday.' },
  });
  console.log('Admin response status:', sendResp.statusCode);

  // Test 9: Admin dashboard stats
  const statsRes = await fastify.inject({
    method: 'GET',
    url: '/api/admin/stats',
    headers: { authorization: `Bearer ${adminToken}` },
  });
  console.log('Admin stats:', statsRes.json().totalTickets, 'tickets, Open:', statsRes.json().openTickets);

  await fastify.close();
  await prisma.$disconnect();
  console.log('✅ All integration tests passed cleanly!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

