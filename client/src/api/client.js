import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookleaf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses – redirect to login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bookleaf_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((r) => r.data);

export const register = (data) =>
  client.post('/auth/register', data).then((r) => r.data);

export const getMe = () => client.get('/auth/me').then((r) => r.data);

// ── Books ──
export const getBooks = () => client.get('/books').then((r) => r.data);

export const getBook = (id) => client.get(`/books/${id}`).then((r) => r.data);

// ── Tickets (Author) ──
export const createTicket = (data) =>
  client.post('/tickets', data).then((r) => r.data);

export const getTickets = (filters = {}) =>
  client.get('/tickets', { params: filters }).then((r) => r.data);

export const getTicket = (id) =>
  client.get(`/tickets/${id}`).then((r) => r.data);

export const sendTicketResponse = (id, content) =>
  client.post(`/tickets/${id}/responses`, { content }).then((r) => r.data);

// ── Admin Tickets ──
export const getAdminTickets = (filters = {}) =>
  client.get('/admin/tickets', { params: filters }).then((r) => r.data);

export const getAdminTicket = (id) =>
  client.get(`/admin/tickets/${id}`).then((r) => r.data);

export const updateTicket = (id, data) =>
  client.patch(`/admin/tickets/${id}`, data).then((r) => r.data);

export const sendResponse = (id, content) =>
  client.post(`/admin/tickets/${id}/responses`, { content }).then((r) => r.data);

export const addNote = (id, content) =>
  client.post(`/admin/tickets/${id}/notes`, { content }).then((r) => r.data);

export const generateAiDraft = (id) =>
  client.post(`/admin/tickets/${id}/ai-draft`).then((r) => r.data);

export const getAdminStats = () =>
  client.get('/admin/stats').then((r) => r.data);

export default client;
