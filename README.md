# 📋 Job Tracker API

A production-grade REST API for tracking job applications through the entire hiring pipeline — from initial application to offer or rejection.

Built with TypeScript, Node.js, Express.js, MongoDB, and Redis over 30 days as a structured backend development challenge.

[![CI](https://github.com/MastaR-svg/job-tracker-api/actions/workflows/ci.yml/badge.svg)](https://github.com/MastaR-svg/job-tracker-api/actions/workflows/ci.yml)
[![Docker](https://github.com/MastaR-svg/job-tracker-api/actions/workflows/docker.yml/badge.svg)](https://github.com/MastaR-svg/job-tracker-api/actions/workflows/docker.yml)

**Live API:** https://job-tracker-api-production-5674.up.railway.app  
**Interactive Docs:** https://job-tracker-api-production-5674.up.railway.app/api/docs  
**GitHub:** https://github.com/MastaR-svg/job-tracker-api

---

## ✨ Features

| Feature | Details |
|---------|---------|
| **Authentication** | JWT access tokens (15min) + refresh tokens (7 days) with Redis blacklist |
| **Job Management** | Full CRUD with status tracking through 5 pipeline stages |
| **Search & Filter** | Full-text search across fields, sort by 4 criteria, date range filtering |
| **Pagination** | Page/limit with total count and metadata |
| **File Uploads** | Resume/CV attachment per job (PDF, DOC, DOCX — 5MB max) |
| **Email Notifications** | Welcome email on registration, status change notifications |
| **Dashboard Analytics** | Status breakdown, success rate, recent applications |
| **Security** | helmet, CORS, rate limiting, input validation, XSS sanitization |
| **Testing** | 35 unit + integration tests with Jest and Supertest |
| **Containerization** | Multi-stage Docker build, docker-compose for full local stack |
| **CI/CD** | GitHub Actions — test + type-check on every push, Docker build on merge |
| **Deployment** | Railway with automatic deploys from main branch |

---

## 🛠️ Tech Stack

### Core
- **Runtime:** Node.js 20
- **Language:** TypeScript (strict mode)
- **Framework:** Express.js 5
- **Database:** MongoDB with Mongoose ODM
- **Cache / Blacklist:** Redis

### Auth & Security
- **Authentication:** JWT (access + refresh token pattern)
- **Password Hashing:** bcrypt (10 rounds)
- **Token Storage:** httpOnly cookies for refresh tokens
- **Security Headers:** helmet
- **Rate Limiting:** express-rate-limit (100/15min API, 10/15min auth)
- **Validation:** express-validator with sanitization

### Infrastructure
- **Containerization:** Docker (multi-stage builds)
- **Orchestration:** Docker Compose
- **CI/CD:** GitHub Actions
- **Deployment:** Railway
- **Database Hosting:** MongoDB Atlas
- **Email:** Nodemailer with Ethereal (dev) / SMTP (prod)

### Developer Experience
- **Testing:** Jest + Supertest (35 tests)
- **Documentation:** Swagger UI / OpenAPI 3.0
- **Logging:** Winston (structured JSON in prod, colorized in dev)
- **Hot Reload:** nodemon + ts-node in development

---

## 🏗️ Architecture

```
src/
├── config/          # Database, Redis, logger, env validation, Swagger
├── controllers/     # HTTP layer — extract request data, send responses
├── middleware/       # Auth, error handling, validation, rate limiting, logging
├── models/          # Mongoose schemas (User, JobApplication)
├── repositories/    # Data access layer — IJobRepository, IUserRepository
├── routes/          # Express routers with JSDoc OpenAPI annotations
├── services/        # Business logic — AuthService, JobService, EmailService
├── types/           # TypeScript interfaces, DTOs, enums
└── utils/           # Errors, async handler, response helpers, email queue
```

### Key Design Decisions

**Repository Pattern** — Services depend on `IJobRepository` (interface), not `MongoJobRepository` (concrete class). This makes services unit-testable with mock repositories and makes the storage layer swappable.

**Layered Architecture** — Strict separation: Routes → Controllers → Services → Repositories. Controllers handle HTTP concerns only; business logic lives exclusively in services.

**Discriminated Union Errors** — Custom error classes (`NotFoundError`, `ValidationError`, `UnauthorizedError`) extend `AppError` with status codes, enabling a single centralized error handler.

**Short-Lived Access Tokens + Refresh Rotation** — Access tokens expire in 15 minutes (low theft risk). Refresh tokens are rotated on every use and immediately blacklisted on logout via Redis, enabling true server-side session invalidation.

**Fail-Secure Redis** — If Redis is unavailable, the blacklist check returns `true` (token treated as revoked) rather than `false`. Security degrades gracefully rather than silently permitting revoked tokens.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or cloud)

### Local Development

```bash
# Clone the repository
git clone https://github.com/MastaR-svg/job-tracker-api.git
cd job-tracker-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, Redis URL, and JWT secret

# Start development server (hot reload)
npm run dev
```

Server runs at `http://localhost:5000`  
API docs at `http://localhost:5000/api/docs`

### Docker (Full Stack)

```bash
# Start API + MongoDB + Redis together
docker-compose up

# Run in background
docker-compose up -d

# Stop
docker-compose down
```

---

## 🔑 Environment Variables

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (min 16 chars) |
| `ACCESS_TOKEN_EXPIRES_IN` | No | Access token TTL (default: 15m) |
| `REFRESH_TOKEN_EXPIRES_IN` | No | Refresh token TTL (default: 7d) |
| `BCRYPT_SALT_ROUNDS` | No | bcrypt cost factor (default: 10) |
| `EMAIL_HOST` | No | SMTP host (default: Ethereal for dev) |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password |

---

## 📡 API Reference

Interactive documentation: **https://job-tracker-api-production-5674.up.railway.app/api/docs**

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, receive access token + refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token, get new access token |
| POST | `/api/auth/logout` | Bearer | Blacklist refresh token, clear cookie |
| GET | `/api/auth/me` | Bearer | Get current user profile |

### Job Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List jobs with search, filter, sort, pagination |
| POST | `/api/jobs` | Create new application |
| GET | `/api/jobs/dashboard` | Analytics dashboard |
| GET | `/api/jobs/stats` | Status counts |
| GET | `/api/jobs/:id` | Get single application |
| PATCH | `/api/jobs/:id` | Update application |
| DELETE | `/api/jobs/:id` | Delete application |
| POST | `/api/jobs/:id/resume` | Upload resume (PDF/DOC/DOCX, max 5MB) |
| DELETE | `/api/jobs/:id/resume` | Remove resume |

### Query Parameters (`GET /api/jobs`)

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Full-text search across company, position, location, notes |
| `status` | enum | Filter: `applied`, `interview`, `assessment`, `offer`, `rejected` |
| `sortBy` | enum | Sort field: `createdAt`, `appliedDate`, `company`, `salary` |
| `sortOrder` | enum | `asc` or `desc` |
| `dateFrom` | date | Applied date range start (YYYY-MM-DD) |
| `dateTo` | date | Applied date range end (YYYY-MM-DD) |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Per page, max 50 (default: 10) |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

**35 tests** across 3 test suites:
- `job.service.test.ts` — 16 unit tests (business logic, pagination, dashboard)
- `auth.service.test.ts` — 10 unit tests (register, login, error cases)
- `auth.routes.test.ts` — 9 integration tests (HTTP layer, validation)

---

## 🐳 Docker

```bash
# Build image
docker build -t jat-api .

# Full stack with docker-compose
docker-compose up --build

# Check container health
docker-compose ps

# View API logs
docker-compose logs -f api

# Shell into container
docker exec -it jat-api sh
```

Image details:
- **Base:** `node:20-alpine`
- **Size:** ~253MB (multi-stage build)
- **User:** Non-root (`appuser`) for security
- **Health check:** Polls `/health` every 30s

---

## 📦 Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled production build
npm run type-check   # TypeScript type checking without emit
npm test             # Run test suite
npm run test:coverage # Tests with coverage report
```

---

## 🔒 Security

- Passwords hashed with bcrypt (10 rounds, ~100ms per hash)
- JWTs signed with HS256, access tokens expire in 15 minutes
- Refresh tokens stored in httpOnly cookies (inaccessible to JavaScript)
- Refresh token rotation — each token single-use, blacklisted after use
- Redis blacklist enables immediate logout (token revocation)
- Rate limiting: 100 req/15min (API), 10 req/15min (auth endpoints)
- Input validation and XSS sanitization on all user inputs
- HTTP security headers via helmet
- CORS restricted to known frontend origins
- Non-root Docker user in production

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
