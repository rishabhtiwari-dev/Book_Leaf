# BookLeaf Publishing — Author Support & Communication Portal

A full-stack support and communication portal built for **BookLeaf Publishing** to help manage author communication at scale. The system includes two role-based interfaces — an **Author Portal** for authors to view their book catalog, royalties, and support queries, and an **Admin Operations Portal** for the BookLeaf team to triage incoming tickets with AI-assisted classification, priority scoring, and draft response generation.

**Repository:** [https://github.com/rishabhtiwari-dev/Book_Leaf.git](https://github.com/rishabhtiwari-dev/Book_Leaf.git)

---

## Table of Contents

- [Quick Start & Credentials](#quick-start--credentials)
- [How to Run Locally](#how-to-run-locally)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Feature Walkthrough](#feature-walkthrough)
  - [Author Portal](#author-portal)
  - [Admin Operations Portal](#admin-operations-portal)
- [AI Implementation & Production Thinking](#ai-implementation--production-thinking)
- [API Reference](#api-reference)
- [Assumptions & Trade-Offs](#assumptions--trade-offs)

---

## Quick Start & Credentials

The SQLite database comes pre-seeded with the official `bookleaf_sample_data.json` dataset (10 authors, 18 books) plus active test tickets.

### Demo Logins

| Role | Email | Password | What to test |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@bookleaf.com` | `admin123` | Ticket queue, AI classification, AI drafting, triage, internal notes |
| **Operations Staff** | `support@bookleaf.com` | `support123` | Secondary admin account for ticket assignment |
| **Author (Published)** | `priya.sharma@email.com` | `author123` | 2 published books, sales & royalty breakdown, ticket history |
| **Author (Bestseller)** | `rohit.kapoor@email.com` | `author123` | High sales volume, multiple distribution platforms |
| **Author (In Production)** | `sneha.kulkarni@email.com` | `author123` | Books currently in Cover Design / Typesetting stages |
| **Any other author** | `<email-from-sample-data>` | `author123` | All 10 authors from `bookleaf_sample_data.json` are seeded |

---

## How to Run Locally

### Prerequisites
- **Node.js**: v18.x or later (developed & tested on Node v20/v24)
- **npm**: v9.x or later

### 1. Clone the repository
```bash
git clone https://github.com/rishabhtiwari-dev/Book_Leaf.git
cd Book_Leaf
```

### 2. Install dependencies
```bash
# Install root, server, and client dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Setup the database
The SQLite database file is initialized and pre-seeded out of the box. If you ever want to re-seed from scratch:
```bash
cd server
npx prisma db push
node src/seed/index.js
cd ..
```

### 4. Configure environment variables (Optional)
The server works out-of-the-box with default values. Check `server/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="bookleaf-secret-key-production"
# Optional: Add your OpenAI API key for live GPT-4o-mini responses
# If omitted or offline, the app automatically falls back to smart local heuristics
OPENAI_API_KEY=""
```

### 5. Run automated tests
```bash
cd server
npm test
cd ..
```
*Runs 9 end-to-end integration tests covering authentication, book ownership, ticket creation, real-time events, and AI fallback behavior.*

### 6. Start the app
You can start both frontend and backend concurrently from the root directory:
```bash
# Terminal 1 — Start Fastify server (runs on port 3001)
npm run dev:server

# Terminal 2 — Start Vite frontend (runs on port 5173)
npm run dev:client
```

Open your browser at: **`http://localhost:5173`**  
Interactive API Swagger Docs: **`http://localhost:3001/api/docs`**

---

## Architecture & Design Decisions

### Tech Stack
- **Backend:** Node.js + Fastify 5 + Prisma ORM + SQLite + Socket.io
- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide Icons + Socket.io Client
- **Validation:** Zod schemas for strict request/response validation
- **API Documentation:** Swagger / OpenAPI UI at `/api/docs`

### Code Architecture: Strict Separation of Function & Design
To keep the codebase maintainable, readable, and easy to test, every major screen is cleanly split:
- **`[feature].function.js`**: Contains pure business logic, custom hooks, state management, API requests, WebSocket subscriptions, pre-computed variables, and event handlers.
- **`[feature].design.jsx`**: Pure presentational JSX. Zero business logic, zero inline calculations, zero `.trim()` / `.replace()` operations, and no inline arrow functions.
- **`[feature].design.css`**: Layout stylesheets and custom UI theme classes.
- **`[Feature].jsx`**: Lightweight container that binds the functional hook to the design view.

```
client/src/pages/admin/
├── ticketDetail.function.js    # State, API mutations, handlers, button readiness flags
├── ticketDetail.design.jsx     # Pure presentational markup
├── ticketDetail.design.css     # Scoped layout CSS
└── TicketDetail.jsx            # Router entry point
```

### Why these technical choices?
1. **Fastify instead of Express**: Fastify provides significantly higher throughput and lower overhead, which matters when handling hundreds of authors submitting queries simultaneously. Its built-in schema compilation with Zod handles validation cleanly without boilerplate.
2. **SQLite with Prisma**: For an evaluation project, requiring a reviewer to install PostgreSQL or spin up Docker containers is unnecessary friction. SQLite runs with zero setup, while Prisma ensures the entire schema is type-safe and can point to PostgreSQL in production with a single config line.
3. **WebSockets for Live Updates**: When an admin responds or updates a ticket, the author's screen updates in real time without polling or manual refreshes.

---

## Feature Walkthrough

### Author Portal
1. **Authentication**: Simple email/password login. Authors can only see their own books and support tickets.
2. **My Books**:
   - Complete table and mobile card view of published and in-production titles.
   - Shows Title, ISBN, Genre, Status, MRP, Total Copies Sold, Royalty Earned, Royalty Paid, and Royalty Pending.
   - Handles edge cases cleanly: titles in Cover Design or Typesetting show clear production badges instead of misleading zero sales.
   - Displays distribution platform badges (Amazon India, Flipkart, Amazon US, Amazon UK, BookLeaf Store).
3. **Submit a Support Query**:
   - Ticket submission form with a dropdown to select a specific book or choose "General / Account Level".
   - Subject line and detailed description field with validation.
   - Optional file attachment UI with file picker display.
4. **My Tickets & Real-Time Thread**:
   - List of all tickets submitted by the author with real-time status badges (`Open`, `In Progress`, `Resolved`, `Closed`).
   - Clicking a ticket opens the full conversation thread showing the original query and official staff responses.
   - When an admin sends a response, it appears immediately on the author's screen via WebSockets with a toast notification.

### Admin Operations Portal
1. **Ticket Queue**:
   - Central triage view of all author tickets across the company.
   - Filterable by Status, Category, Priority, and search term.
   - **Smart Sorting**: Critical priority tickets and oldest unresolved tickets are automatically surfaced at the top.
2. **AI Auto-Classification & Override**:
   - New tickets are automatically categorized into one of 6 official BookLeaf categories:
     - `Royalty & Payments`
     - `ISBN & Metadata Issues`
     - `Printing & Quality`
     - `Distribution & Availability`
     - `Book Status & Production Updates`
     - `General Inquiry`
   - Admins can override the classification at any time from a dropdown.
3. **AI Priority Scoring & Override**:
   - Automatically assesses urgency (`Critical`, `High`, `Medium`, `Low`) based on financial risk or publication blockers (e.g., missing royalties for 6 months flags as Critical/High, while bio updates flag as Low).
   - Admins can override the priority score with one click.
4. **AI-Drafted Responses**:
   - When opening a ticket, admins can click **"Generate AI Draft"** to get a context-aware response based on the author's specific question, book financial details, and BookLeaf's knowledge base.
   - The admin can edit, add to, or rewrite the draft before sending.
5. **Internal Notes**:
   - Private team notes visible only to operations staff, strictly hidden from the author view.
6. **Ticket Management**:
   - One-click "Assign to Me" button, status transitions, and audit timestamps.
7. **Operations Dashboard**:
   - High-level metrics showing total tickets, open queue, in-progress items, category distributions, and priority breakdown.

---

## AI Implementation & Production Thinking

### 1. Prompt Engineering & Grounding
The AI prompts are grounded directly in BookLeaf's real operational policies:
- **80/20 Royalty Split**: 80% net profit to the author, 20% to BookLeaf. Net profit = MRP minus print cost, platform commission, and shipping.
- **Quarterly Payout Schedule**: Paid within 45 days of quarter end, minimum payout threshold of ₹1,000 (amounts below roll over).
- **Printing Turnaround & Free Reprints**: In-house printing in Delhi with print partners Repro India and Epitome Books. Turnaround is 5–7 business days; defective copies receive free reprints upon photo verification.
- **Platform Sync**: Distribution across Amazon, Flipkart, etc. Stock sync issues resolved within 24–48 hours.
- **Tone Guidelines**: The AI prompts enforce BookLeaf's communication style — empathetic, professional, transparent about timelines, and partner-oriented rather than bureaucratic.

### 2. Token & Cost Efficiency
- **Category-Scoped Context**: Instead of stuffing the entire knowledge base into every single prompt, the prompt builder selects only the relevant policy section based on the ticket's category.
- **Compact Classification Prompt**: Classification runs on a small, focused prompt using `max_tokens: 80` and `temperature: 0.1`, using less than 150 tokens per ticket.
- **On-Demand Drafting**: Draft responses are generated only when the admin clicks "Generate AI Draft", avoiding unnecessary API calls on tickets that admins prefer to answer directly.

### 3. Graceful Degradation & Resilience
If the OpenAI API is unreachable, rate-limited, or if the API key is not configured:
- The system **never crashes or blocks ticket creation**.
- A built-in **keyword heuristic classifier** automatically categorizes the ticket and assigns an appropriate priority score based on domain rules.
- A **template-based draft engine** generates a structured, policy-accurate draft based on the identified category so the admin still gets a helpful starting point.

### 4. Model Selection Justification
- **Model Choice:** `gpt-4o-mini`
- **Why:** Ticket classification and policy-grounded drafting are structured tasks with clear context boundaries. `gpt-4o-mini` provides sub-second latency, near-zero cost ($0.15 per million input tokens), and strong instruction following, making it the most practical choice for a business processing thousands of queries every month.

### 5. API Key Security
- API keys are read strictly from backend environment variables (`server/.env`).
- Never bundled into client builds or sent across the network.

---

## API Reference

The interactive Swagger documentation is available at `http://localhost:3001/api/docs`.

### Authentication
- `POST /api/auth/login` — Login with email and password, returns JWT token.
- `GET /api/auth/me` — Get current user profile.

### Books
- `GET /api/books` — Get author's books (or all books for admin).
- `GET /api/books/:id` — Get specific book details.

### Author Tickets
- `GET /api/tickets` — List author's tickets with status filtering.
- `POST /api/tickets` — Submit a new ticket (triggers AI classification & WebSocket event).
- `GET /api/tickets/:id` — Get ticket details and conversation thread.

### Admin Operations
- `GET /api/admin/tickets` — Filterable ticket queue with search and sorting.
- `GET /api/admin/tickets/:id` — Full ticket detail with author info, book data, responses, and internal notes.
- `PATCH /api/admin/tickets/:id` — Update status, category, priority, or assigned agent.
- `POST /api/admin/tickets/:id/responses` — Send official response to author (emits WebSocket update).
- `POST /api/admin/tickets/:id/notes` — Add private internal note.
- `POST /api/admin/tickets/:id/ai-draft` — Generate an AI draft response for a ticket.
- `GET /api/admin/stats` — Queue counts, SLA metrics, and category/priority breakdowns.

---

## Assumptions & Trade-Offs

1. **File Attachments (UI Only)**: Per the assignment brief ("actual upload is bonus, not required"), file selection and validation are implemented in the UI. In a production cloud deployment, this would stream files to an S3/Cloudflare R2 bucket with pre-signed URLs.
2. **In-Process WebSockets**: Socket.io runs directly on the Fastify instance. For a horizontally-scaled multi-server deployment, a Redis adapter would be added for pub/sub across server instances.
3. **SQLite for Evaluation**: Used SQLite for zero-setup evaluation. Prisma makes it trivial to swap to PostgreSQL with one configuration line in production.
4. **Author Self-Registration**: In BookLeaf's real flow, authors are provisioned during publishing onboarding. For convenience, the sample dataset authors are pre-seeded with password `author123`.
