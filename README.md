# BookLeaf Publishing — Author Support & Communication Portal

An enterprise-grade, full-stack Author Support & Communication Portal built for **BookLeaf Publishing** to streamline author operations at scale (1,200+ monthly titles, 22,000+ catalog). Featuring dual interfaces (Author Portal & Operations Admin Portal) powered by contextual AI assistance, real-time WebSocket communication, and resilient offline degradation.

---

## 📌 Table of Contents

- [Live Demo & Quick Start](#-quick-start--test-credentials)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [System Features](#-system-features)
  - [Author Portal](#1-author-facing-portal)
  - [Admin Operations Portal](#2-admin-operations-portal)
- [AI Integration Details](#-ai-integration-details)
  - [Prompt Engineering Strategy](#prompt-engineering-strategy)
  - [API Key Security](#api-key-security)
  - [Resilience & Graceful Degradation](#resilience--graceful-degradation)
  - [Token & Cost Efficiency](#token--cost-efficiency)
  - [Model Selection Justification](#model-selection-justification)
- [REST API Specification](#-rest-api-specification)
- [Local Development Setup](#-local-development-setup)
- [Known Limitations & Future Roadmap](#-known-limitations--future-roadmap)

---

## 🔑 Quick Start & Test Credentials

The database is pre-seeded with the complete official `bookleaf_sample_data.json` dataset (10 authors, 18 books) plus active test tickets demonstrating all statuses and categories.

### Test Accounts

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@bookleaf.com` | `admin123` | Full access to queue, triage, metrics, AI responses |
| **Support Staff** | `support@bookleaf.com` | `support123` | Operations support agent account |
| **Author (Published)** | `priya.sharma@email.com` | `author123` | Published books (`BK001`, `BK002`), royalties & sales |
| **Author (High Vol)** | `rohit.kapoor@email.com` | `author123` | Bestsellers (`BK003`, `BK004`), multi-channel distribution |
| **Author (Production)** | `sneha.kulkarni@email.com` | `author123` | Includes published titles & title in cover design |
| **Any other author** | `<author_email>` | `author123` | Any author email from `bookleaf_sample_data.json` |

---

## 🏗 Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (React)                        │
│   Vite + React Router + Tailwind CSS + Socket.io Client     │
└──────────────┬───────────────────────────────▲──────────────┘
               │ HTTP REST                     │ WebSockets
               ▼                               │ (Socket.io)
┌──────────────────────────────────────────────┴──────────────┐
│                      Server (Fastify)                       │
│  Fastify 5 + JWT Auth + Zod Validation + Swagger/OpenAPI     │
├─────────────────────────────────────────────────────────────┤
│   AI Service            Prisma ORM            Knowledge Base│
│ (OpenAI + Fallback)    (SQLite/Postgres)    (BookLeaf Policy)│
└──────────────┬──────────────────┬───────────────────────────┘
               │                  │
               ▼                  ▼
      OpenAI gpt-4o-mini      SQLite (dev.db)
```

### Why Fastify?
- **Throughput & Speed**: Fastify is up to 2x faster than Express, with an asynchronous pipeline optimized for high-volume JSON payloads.
- **Built-in Schema Validation**: High-performance request parsing with Zod schemas prevents malformed payloads and injection attacks.
- **Native Plugin Architecture**: Encapsulation of authentication, WebSockets, and route decorators without global middleware bloat.

### Why React + Tailwind CSS?
- **Component Modularity**: Isolated views for ticket queues, live detail cards, royalty tables, and filter bars.
- **Productivity & Polish**: Custom Tailwind design system tailored to BookLeaf's branding (`#059669` emerald tones, slate typography, semantic status indicators).

### Why Prisma with SQLite?
- **Type-safe Query Engine**: Eliminates runtime schema mismatches.
- **Zero External Dependencies**: Works out-of-the-box locally with instant seeding, but can be switched to PostgreSQL/MySQL via a single line in `schema.prisma`.

---

## 🚀 System Features

### 1. Author-Facing Portal
- **Secure Authentication**: Email-based JWT login ensuring strict data isolation (authors can only inspect their own catalog and queries).
- **My Books Dashboard**: Comprehensive catalog breakdown featuring:
  - Book title, ISBN, genre, publication date, status.
  - MRP, copies sold, royalty earned, royalty paid, and pending balance.
  - Graceful edge-case handling for titles in production (cover design, typesetting) and zero-royalty books.
  - Multi-platform distribution badges (Amazon India, Flipkart, Amazon US, Amazon UK, BookLeaf Store).
- **Submit a Support Query**:
  - Contextual book selector linking queries directly to specific titles or general account inquiries.
  - Rich description editor with client-side validation.
  - File attachment UI support.
- **Real-Time Ticket Tracker**:
  - Live query timeline with immediate responses displayed via WebSocket events without page reloads.
  - Real-time toast notifications when an admin responds or changes ticket status.

### 2. Admin Operations Portal
- **Interactive Ticket Queue**:
  - Multi-parameter filtering by Status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), Category, Priority, and keyword search.
  - Smart sorting: **Critical priority and oldest unresolved tickets automatically surfaced first**.
- **AI-Powered Auto-Classification**:
  - Automatically tags tickets into 6 official BookLeaf categories:
    1. `ROYALTY_PAYMENTS` (Royalty & Payments)
    2. `ISBN_METADATA` (ISBN & Metadata Issues)
    3. `PRINTING_QUALITY` (Printing & Quality)
    4. `DISTRIBUTION_AVAILABILITY` (Distribution & Availability)
    5. `BOOK_STATUS_PRODUCTION` (Book Status & Production Updates)
    6. `GENERAL_INQUIRY` (General Inquiry)
  - Admin override capability with visual tags indicating AI suggestions.
- **AI-Generated Priority Score**:
  - Assesses ticket urgency (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) based on financial impact, publication blockers, or print defects.
  - Overrideable by admins.
- **AI-Drafted Response Generation**:
  - Generates context-aware, empathetic drafts synthesizing the author's query, associated book metadata (MRP, copies sold, royalties), and BookLeaf policies.
  - Admin can review, modify, or completely rewrite the draft before sending to the author.
- **Ticket Management Workflow**:
  - Self-assignment button (`Assign to Me`).
  - Private **Internal Notes** tab strictly concealed from the author view.
  - Real-time status transitions.
- **Operational Analytics Dashboard**:
  - Live counts of total, open, in-progress, and resolved queries.
  - Category distribution breakdowns and priority risk meters.

---

## 🧠 AI Integration Details

### Prompt Engineering Strategy
The AI integration is calibrated specifically against the **BookLeaf Knowledge Base & Communication Tone Guidelines**:
- **Empathetic & Professional**: Always acknowledges the author's frustration before presenting solutions.
- **Fact-Grounded**: Prompts dynamically inject the author's name, book title, ISBN, print partner, and financial figures directly into the context window.
- **Policy Enforcement**: Accurately articulates BookLeaf's 80/20 net profit calculation, quarterly payout timelines (within 45 days of quarter end, ₹1,000 threshold), free reprint policy for verified print defects, and 24–48 hour platform re-sync protocols.
- **Actionable Next Steps**: Never leaves open-ended promises; always states clear timeframes (e.g., 48-hour resolution, 5–7 business days reprint turnaround).

### API Key Security
- Keys are loaded via environment variables (`process.env.OPENAI_API_KEY`) on the server.
- No AI credentials or internal prompts are ever exposed over client networks or compiled bundles.

### Resilience & Graceful Degradation
What happens when OpenAI is rate-limited, offline, or an API key is omitted?
1. **Zero System Downtime**: Ticket creation and ticket replies never crash or block.
2. **Rule-Based Heuristic Fallback Classifier**: A domain-specific classifier analyzes query keywords (e.g., "royalty", "unpaid", "isbn error", "blurry", "typesetting delay") to reliably classify category and priority.
3. **Template Fallback Engine**: If the LLM is unreachable, the system generates targeted draft templates tailored to each of the 6 categories adhering strictly to BookLeaf's tone and policy guidelines.

### Token & Cost Efficiency
- **Category-Scoped Context**: Rather than injecting the entire knowledge base on every call, the system partitions the knowledge base into modular category excerpts (`getKBForCategory`). Only the relevant policy section is included in the prompt.
- **Minimal Classification Payload**: The classification prompt uses a concise 15-line classification guide with `max_tokens: 100` and low temperature (`0.1`), using less than 200 tokens per ticket.
- **On-Demand Generation**: AI drafts are generated only when the admin explicitly requests them, preventing wasted API calls on trivial or quick-reply tickets.

### Model Selection Justification
- **Model Used**: `gpt-4o-mini` (OpenAI).
- **Reasoning**: Support ticket classification and policy-grounded drafting are constrained, structured NLP tasks. `gpt-4o-mini` offers sub-second latency, near-zero cost ($0.15 per 1M input tokens vs $5.00 for GPT-4), and exceptional instruction-following capability, making it the optimal economic choice for a high-volume publishing business processing thousands of queries monthly.

---

## 📡 REST API Specification

Interactive Swagger / OpenAPI UI is accessible locally at:
👉 **`http://localhost:3001/api/docs`**

### Summary of Core Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate author or admin; returns JWT token and user profile.
- `POST /api/auth/register` — Register a new account.
- `GET /api/auth/me` — Retrieve the currently authenticated user session.

#### Books (`/api/books`)
- `GET /api/books` — Retrieve books for the authenticated author (admins view all catalog titles).
- `GET /api/books/:id` — Retrieve specific book details with ownership checks.

#### Author Tickets (`/api/tickets`)
- `POST /api/tickets` — Submit a ticket; runs AI classification and emits real-time WebSocket event.
- `GET /api/tickets` — List authenticated author's tickets with status/category filters.
- `GET /api/tickets/:id` — Retrieve full ticket thread and official responses.

#### Admin Operations (`/api/admin`)
- `GET /api/admin/tickets` — Multi-filter ticket queue with priority-first sorting.
- `GET /api/admin/tickets/:id` — Full ticket audit: author profile, book financial data, responses, internal notes.
- `PATCH /api/admin/tickets/:id` — Update status, override category/priority, or assign agent.
- `POST /api/admin/tickets/:id/responses` — Publish official response; emits instant notification to author.
- `POST /api/admin/tickets/:id/notes` — Create private internal note (hidden from author).
- `POST /api/admin/tickets/:id/ai-draft` — Generate an AI draft response based on query and book context.
- `GET /api/admin/stats` — Retrieve operational metrics, SLA queues, and category breakdowns.

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18 or higher (tested on Node v20/v24)
- **npm**: v9 or higher

### Step 1: Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables
Inside `server/.env` (an example `.env` is already configured for instant use):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="bookleaf-secret-key-production"
PORT=3001
NODE_ENV=development
OPENAI_API_KEY="your-openai-key-here" # Optional: app gracefully runs with smart fallbacks if omitted!
```

### Step 3: Initialize Database & Seed Sample Data
```bash
cd server
npx prisma generate
npx prisma db push
node src/seed/index.js
```

### Step 4: Run Automated Verification Tests
```bash
cd server
npm test
```
*Executes end-to-end integration tests verifying health checks, auth guards, AI classification, AI draft synthesis, and role permissions.*

### Step 5: Start Development Servers

**Option A — Run both concurrently from the root directory:**
```bash
# Terminal 1: Start Fastify API (port 3001)
npm run dev:server

# Terminal 2: Start Vite React Frontend (port 5173)
npm run dev:client
```

Open your browser at:
🌐 **`http://localhost:5173`**

---

## 🔮 Known Limitations & Future Roadmap

1. **File Attachments**: The current implementation provides UI file selection and validation. In a full production rollout, files would be streamed directly to an S3-compatible bucket (e.g. AWS S3 or Cloudflare R2) with signed URLs and photo verification models for print defect tickets.
2. **Automated Auto-Responder**: High-confidence queries (e.g., standard metadata update inquiries or stock sync notices) could be resolved instantly via an automated bot with author opt-in before escalating to human agents.
3. **Email Notification Pipeline**: Adding Nodemailer or SendGrid integration to notify authors via email whenever a ticket receives an admin reply.
4. **Vector Search (RAG)**: For complex custom agreements or distributor-specific edge cases, embedding the entire author contract catalog using vector similarity search (pgvector) would further personalize AI drafts.
