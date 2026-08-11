# Architectural Decisions Record (ADR) — Client Project Tracker

## 1. Database — SQLite (local) / PostgreSQL (production)

**Decision:** SQLite via Prisma for local development; the Prisma schema is written against
`provider = "sqlite"` with `DATABASE_URL` injected via `.env`. Switching to PostgreSQL or
Neon for production requires only changing the provider string and the env var — zero
application code changes.

**Why not Postgres locally?**
Running a Postgres daemon (native install or Docker) adds a hard dependency that not every
reviewer's machine will satisfy. SQLite is zero-config, file-based, and instantly portable —
a reviewer can clone and `npm run db:push && npm run db:seed` without installing anything extra.

---

## 2. Authentication & Authorization — JWT + bcryptjs

**Decision:** Token-based authentication using JSON Web Tokens (`jsonwebtoken`) and password hashing via `bcryptjs`.
- `User` model stored in Prisma with hashed passwords (`password123` hashed for seed user).
- Public endpoints: `POST /auth/login`, `POST /auth/register`.
- Protected endpoints: `GET /auth/me` and all `/projects/*` CRUD routes protected by `authenticate` Express middleware checking `Authorization: Bearer <token>`.
- Client stores JWT token in `localStorage` (`pf_token`) with automatic session restoration on app load.

---

## 3. Status/Priority — String columns, not database enums

**Decision:** `status` and `priority` are plain `String` columns in the Prisma schema.
Allowed values are enforced at the API layer by Zod.

**Why not Postgres native enums?**
PostgreSQL enum identifiers cannot contain spaces. The spec's required values (`"In Progress"`,
`"On Hold"`) would force a translation layer between the stored identifier and the wire value
at every boundary (write, read, seed, API response). A string column keeps the stored value
identical to the JSON value everywhere; the application layer (Zod) is the single enforcement
point.

---

## 4. Layered Server Architecture

**Decision:** Strict `routes → controllers → services → db` layering with:
- `server/routes/projects.js` & `server/routes/auth.js` — route wiring only
- `server/controllers/projects.js` & `server/controllers/auth.js` — HTTP request/response
- `server/services/projects.js` & `server/services/auth.js` — business logic, validation, Prisma queries
- `server/validation/project.js` & `server/validation/auth.js` — Zod schemas
- `server/middleware/authenticate.js` — JWT verification middleware
- `server/middleware/errorHandler.js` — single error handler, consistent JSON envelope

---

## 5. Validation — Dual-layer (Zod backend + client-side mirrors)

**Decision:** Zod is the source-of-truth validator for both project fields and login/registration fields. The React UI also validates client-side for immediate user feedback.

---

## 6. Frontend State — Local React state, no state library

**Decision:** `useState` + `useCallback` in `App.jsx`; `useToast` custom hook for notifications. Token state persisted to `localStorage`.

---

## What would be added with more time

- **Project Ownership** — Filter projects per logged in user account
- **Refresh Tokens & Cookies** — HttpOnly cookies for enhanced security against XSS
- **Pagination** — cursor or offset pagination for large datasets
- **Unit tests** — Jest + Supertest for service & controller layers
