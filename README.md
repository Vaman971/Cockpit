# 🐦 BluebirdCockpit

A full-stack business intelligence and project management platform built for tracking opportunities, projects, mission cards, purchase orders, revenue, and team performance.

---

## 📦 Project Structure

```
BluebirdCockpit/
├── api/              # Express.js REST API (Node.js backend)
│   ├── src/
│   │   ├── controllers/    # Route handlers with business logic
│   │   ├── models/         # Sequelize ORM models
│   │   ├── routes/         # Express routers
│   │   ├── middleware/      # Auth, validation, rate-limiting, error handling
│   │   ├── utils/          # Logger, JWT helpers
│   │   ├── db/             # Sequelize config, migrations, seeders
│   │   └── __tests__/      # Jest unit & integration tests
│   ├── .env                # Local environment variables (not committed)
│   ├── .env.example        # Template — copy this to .env
│   ├── jest.config.js
│   ├── eslint.config.js
│   └── package.json
├── client/           # React frontend
├── .husky/           # Git hooks (pre-commit linting)
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| MySQL | ≥ 8.0 | Local instance or Docker |
| npm | ≥ 9 | Comes with Node.js |
| Git | any | For Husky hooks to work |

---

### 1. Clone & Install

```bash
git clone <repo-url>
cd BluebirdCockpit

# Install root workspace dependencies
npm install

# Install API dependencies
cd api && npm install

# Install client dependencies
cd ../client && npm install
```

---

### 2. Configure Environment

```bash
cd api
cp .env.example .env
```

Edit `.env` with your local values:

```env
# ─── Server ────────────────────────────────────
NODE_ENV=development
PORT=8000

# ─── Database (MySQL) ─────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bluebird_cockpit
DB_USER=root
DB_PASSWORD=your_mysql_password

# ─── Auth ─────────────────────────────────────
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRES_IN=48h

# ─── CORS ─────────────────────────────────────
CORS_ORIGIN=http://localhost:3000

# ─── Logging ──────────────────────────────────
LOG_LEVEL=info
```

---

### 3. Set Up the Database

Make sure your MySQL server is running, then run migrations and seeders:

```bash
cd api

# Run all migrations (creates all tables)
npm run db:migrate

# Seed initial data
npm run db:seed

# To reset everything from scratch:
npm run db:reset
```

> **Migrations run in order** — all 20 migration files in `src/db/migrations/` are executed sequentially, creating tables for users, profiles, customers, opportunities, projects, mission cards, teams, purchase orders, invoices, revenue, extensions, expenses, forecasts, savings, currencies, and SharePoint entries.

---

### 4. Start the Development Server

```bash
# API (with hot-reload via nodemon)
cd api && npm run dev

# Frontend (in a separate terminal)
cd client && npm start
```

| Service | URL |
|---------|-----|
| API | http://localhost:8000 |
| Health Check | http://localhost:8000/health |
| Frontend | http://localhost:3000 |

---

## 🏗️ API Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| ORM | Sequelize 6 |
| Database | MySQL 8 |
| Auth | JWT (httpOnly cookie) |
| Validation | Zod 4 |
| Logging | Winston |
| Testing | Jest + Supertest |
| Linting | ESLint (Flat Config) + Prettier |
| Git Hooks | Husky + lint-staged |

---

### API Routes

| Prefix | Description |
|--------|-------------|
| `POST /auth/signIn` | Authenticate — returns JWT cookie |
| `POST /auth/signOut` | Clear JWT cookie |
| `/users` | User management (CRUD) |
| `/profile` | User profiles with image upload |
| `/oppurtunities` | Opportunity pipeline |
| `/project` | Project records |
| `/mission` | Mission cards |
| `/po` | Purchase Orders |
| `/invoice` | PO Invoices |
| `/revenue` | Revenue records |
| `/revenueInvoice` | Revenue invoices |
| `/extension` | Extensions (new canonical) |
| `/extensionInvoice` | Extension invoices (new canonical) |
| `/extention` | ⚠️ **Deprecated** — alias kept for frontend compat |
| `/extentionInvoice` | ⚠️ **Deprecated** — alias kept for frontend compat |
| `/saving` | Savings tracking |
| `/teams` | Team management |
| `/analytics` | Analytics & reporting |
| `/currency` | Currency conversion rates |
| `/finance` | Finance dashboard data |
| `/newFinance` | New finance endpoints |
| `/customer` | Customer records |
| `/forecast` | Delivery forecasts |
| `/expense` | Expense records |
| `/sharePoint` | SharePoint integration |
| `GET /health` | Health check — returns `{ status: "ok" }` |

---

### Middleware Stack (in order)

```
Request
  → Helmet (security headers)
  → CORS (whitelist-based)
  → requestLogger (Winston HTTP logs)
  → express.json (10 MB limit)
  → cookieParser
  → apiLimiter (200 req / 15 min)
  → Routes
      → [authLimiter — 10 req / 15 min on /auth]
      → [verifyToken — JWT cookie validation]
      → [verifyAuth — role check]
      → [validate(schema) — Zod body validation → 422]
      → Controller
  → 404 handler
  → errorHandler (global — returns { success: false, error: { message } })
```

---

### Response Format

All API responses follow a consistent shape:

**Success:**
```json
{ "success": true, "data": { ... } }
```

**Error (validation):**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed.",
    "details": [{ "field": "email", "message": "Invalid email address" }]
  }
}
```

**Error (not found / server):**
```json
{ "success": false, "error": { "message": "Resource not found." } }
```

---

### HTTP Status Codes

| Code | When |
|------|------|
| `200` | Successful read or update |
| `201` | Successful resource creation |
| `400` | Bad request (missing required field) |
| `401` | Unauthenticated |
| `403` | Forbidden (inactive account / wrong role) |
| `404` | Resource not found |
| `409` | Conflict (duplicate resource) |
| `422` | Validation failed (Zod schema error) |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

---

## 🧪 Testing

```bash
cd api

# Run all tests with coverage report
npm test

# Run in watch mode during development
npx jest --watch

# Run a single test file
npx jest src/__tests__/auth.test.js
```

**Current test suite:** 8 suites · 65 tests · ~3s

| Test File | What it covers |
|-----------|---------------|
| `health.test.js` | App boot, /health, 404 handler |
| `auth.test.js` | signIn (400/401/403/200/error), signOut |
| `project.test.js` | getProject, getProjectById, updateProject, deleteProject |
| `opportunity.test.js` | All 5 opportunity handlers |
| `profile.test.js` | getProfile, getAllProfile, getProfiles, updateProfile |
| `po.test.js` | createPo, getPo, getPoById, updatePo |
| `errorHandler.test.js` | Status codes, stack trace dev/prod |
| `validation.test.js` | validate middleware, Zod schemas |

> Tests use **mocked Sequelize models** — no real database connection needed.

---

## 🔍 Code Quality

```bash
cd api

# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix

# Format all source files
npm run format
```

**Husky pre-commit hook** automatically runs lint + format on every staged `src/**/*.js` file before each commit. If linting fails, the commit is blocked.

---

## 🗄️ Database

### Migrations (20 tables in order)

```
users → profiles → customers → opportunities → projects →
mission-cards → mission-card-customers → teams → user-teams →
purchase-orders → invoices → revenue → revenue-invoices →
extensions → extension-invoices → expenses → forecasts →
savings → currencies → sharepoints
```

### Key Commands

```bash
npm run db:migrate        # Apply all pending migrations
npm run db:migrate:undo   # Roll back all migrations
npm run db:seed           # Insert seed data
npm run db:seed:undo      # Remove seed data
npm run db:reset          # Full reset: undo + migrate + seed
```

> ⚠️ `db:reset` **drops all table data**. Never run in production.

### Environment Variable: `INIT_DB`

Setting `INIT_DB=true` in `.env` will run Sequelize `sync()` on startup (creates tables if missing). This is disabled by default — use migrations instead.

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| JWT Auth | httpOnly, Secure, SameSite=Strict cookie |
| Password hashing | bcryptjs (auto-salted) |
| Security headers | Helmet.js |
| Rate limiting | 200 req/15min (API), 10 req/15min (auth) |
| CORS | Whitelist-based via `CORS_ORIGIN` env var |
| Input validation | Zod schemas on all mutation endpoints |
| Error sanitisation | Stack traces hidden in production |

---

## 📝 Logging

Structured JSON logs via **Winston**:

```
[2026-05-01 12:00:00] info: Server running on port 8000 [development]
[2026-05-01 12:00:01] info: User signed in: alice@example.com
[2026-05-01 12:00:02] error: DB connection failed: ...
```

Log levels: `error` → `warn` → `info` → `http` → `debug`

Set `LOG_LEVEL=debug` in `.env` for verbose output during development.

---

## 🧩 Key Design Decisions

### Controller Pattern
Every controller follows:
- `async (req, res, next)` signature
- `try/catch` with `next(error)` — no swallowed errors
- No `console.log` — all output via `logger.info/error`
- `201` on creation, `200` on read/update, `404` on missing resources

### Model Hooks
All Sequelize `afterSave`/`afterUpdate`/`beforeDestroy` hooks:
- Use `logger.error()` for failures (never crash the process)
- Never reference `res` (HTTP context is unavailable in hooks)
- Use `Promise.all()` for concurrent DB operations

### `extention` → `extension` Migration
The codebase is mid-rename:
- New code uses `/extension` and `/extensionInvoice` routes
- Old `/extention` routes remain as **deprecated aliases** (frontend compatibility)
- DB table names (`extention`, `extentioninvoice`) are intentionally preserved
- Once the frontend is updated, remove `extentionRoute.js` and `extentionInvoiceRoute.js`

---

## 🛣️ Roadmap

- [ ] **Frontend route migration** — update client to use `/extension` endpoints
- [ ] **Docker Compose** — containerised local setup (MySQL + API + client)
- [ ] **Role-based access control** — granular permission system
- [ ] **API documentation** — Swagger/OpenAPI auto-generated spec
- [ ] **Expand test coverage** — `analyticsController`, `financeController`, `teamController`
- [ ] **CI/CD pipeline** — GitHub Actions (lint + test on PR)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Write/update tests for your changes
3. Ensure `npm test` and `npm run lint` both pass (Husky enforces this on commit)
4. Open a pull request with a clear description

---

## 📄 License

ISC
