# Implementation Plan — Client Project Tracker

**Assessment:** Full Stack Developer Technical Assessment
**Estimated time budget:** 2–4 hours
**Stack:** React (Vite) + Node.js/Express + PostgreSQL (Prisma ORM) + Vercel

---

## 1. Scope Summary

Build a REST API + React UI for a digital agency to track client projects — create,
view, update, delete, with validation on required fields, status/priority enums, and
date ordering (`dueDate >= startDate`).

Evaluation is weighted (per SUBMISSION.md):

| Category | Weight |
|---|---|
| Functionality | 30% |
| Code Quality | 25% |
| Architecture | 20% |
| Documentation | 10% |
| Error Handling & Validation | 10% |
| Communication | 5% |

**Implication for time allocation:** Backend correctness (Functionality) and clean
layering (Code Quality + Architecture) together are 75% of the score. Deployment is
an optional bonus per REQUIREMENTS.md — it should never come at the cost of the core
CRUD + validation being solid.

---

## 2. Data Model

```
Project {
  id: integer (autoincrement, matches provided test_data.json ids 1-12)
  clientName: string      // required
  projectName: string     // required
  description: string     // optional
  status: enum             // Planning | In Progress | On Hold | Completed
  priority: enum           // Low | Medium | High
  startDate: date
  dueDate: date            // must be >= startDate
  createdAt: datetime
  updatedAt: datetime
}
```

**Decision:** `status`/`priority` are stored as plain `String` columns validated by
Zod at the API layer, not as native Postgres enum types. Postgres enum identifiers
can't contain spaces, but the spec's values do (`"In Progress"`, `"On Hold"`), which
would force a translation layer between the stored enum identifier and the wire
value at every boundary. A plain string column keeps the stored value identical to
the API/JSON value everywhere, at the cost of relying on the application layer
(rather than the database) to reject invalid values.

## 3. API Contract

| Method | Path | Purpose |
|---|---|---|
| GET | `/projects` | List all projects |
| GET | `/projects/:id` | Get one project |
| POST | `/projects` | Create a project |
| PUT | `/projects/:id` | Update a project (full replace, per spec) |
| DELETE | `/projects/:id` | Delete a project |

Error responses use a consistent envelope:
```json
{ "error": { "message": "Due date cannot be earlier than start date", "field": "dueDate" } }
```

---

## Phase 0 — Planning & Contract (15 min)

- Lock the data model and API contract above before writing code.
- Start `DECISIONS.md` immediately and log choices as they're made (not retroactively
  at the end) — this becomes the basis for the "technical reflection" answers the
  submission form asks for.

## Phase 1 — Scaffolding (15–20 min)

```
/server            → Express application (app.js, routes, controllers, services)
/api               → Vercel serverless entry point, wraps /server/app.js
/prisma            → schema.prisma, migrations
/seed              → seed script consuming test_data.json
/client            → React app (Vite)
DECISIONS.md
README.md
vercel.json
```

- `/server` holds the actual Express app; `/api` is a thin Vercel-specific wrapper.
  Keeping them separate avoids confusion between "our routes folder" and Vercel's
  `/api` filesystem convention, and keeps the Express app portable to any host.
- `npm create vite@latest client -- --template react`
- Minimal ESLint/Prettier config for both — low scoring weight on its own, but
  inconsistent formatting drags down the Code Quality read.

## Phase 2 — Database & Seed (20–25 min)

- `prisma/schema.prisma` targeting `postgresql`, matching the data model above.
- Local dev database: Docker Postgres (`docker run -e POSTGRES_PASSWORD=devpassword
  -p 5432:5432 postgres:16`) or a free Neon instance — either is fine, document the
  choice.
- `npx prisma migrate dev --name init` to create the table and migration history.
- Seed script (`seed/seed.js`) reads `test_data.json` directly, inserts via Prisma
  with explicit `id` values to match the provided dataset, then resets the Postgres
  auto-increment sequence so subsequent inserts continue correctly.

## Phase 3 — Backend API (45–60 min) — highest scoring weight

- Layered structure, no logic in route handlers:
  ```
  server/routes/projects.js       → route wiring only
  server/controllers/projects.js  → request/response, calls services
  server/services/projects.js     → business logic (validation orchestration, date rule)
  server/db/client.js             → Prisma client singleton
  server/validation/project.js    → Zod schemas
  server/middleware/errorHandler.js
  ```
- Zod schema enforcing every rule from REQUIREMENTS.md:
  - `clientName`, `projectName` required and non-empty
  - `status` ∈ `{Planning, In Progress, On Hold, Completed}`
  - `priority` ∈ `{Low, Medium, High}`
  - `dueDate >= startDate` (cross-field refinement)
- Centralized error-handling middleware: 400 on validation failure, 404 on unknown
  `:id`, 500 fallback with no leaked stack trace, consistent JSON envelope throughout.
- Manual curl/Postman pass against all 5 endpoints before starting the frontend —
  cheaper to catch a bug now than after the UI depends on it.

## Phase 4 — Frontend (60–75 min) — second-highest weight

- `src/api/projects.js` — one function per endpoint, no fetch logic inside components.
- `src/components/ProjectList.jsx` — all fields visible; explicit loading, empty, and
  error states (cheap to build, very visible signal of care to a reviewer).
- `src/components/ProjectForm.jsx` — shared between create and edit; client-side
  validation mirrors the backend rules for immediate feedback, but the backend
  remains the source of truth (never trust client-only validation).
- `src/components/ProjectItem.jsx` — row/card with edit and delete (with confirm)
  actions.
- Status/priority rendered as `<select>` dropdowns bound to the exact enum values —
  prevents invalid states from ever being constructible in the UI.
- State: local `useState`/`useReducer` only. No state library at this scale —
  documented in `DECISIONS.md` as a deliberate simplicity choice, not an oversight.

## Phase 5 — Error Handling & Validation Pass (15–20 min, cross-cutting)

- Re-verify every rule from REQUIREMENTS.md against both layers (client and server).
- Confirm the server rejects invalid `status`/`priority` even though the UI only
  offers valid options — the API must never trust the client.
- Walk each failure path through the actual UI once (not just via curl) — "meaningful
  errors" means the user sees *why* it failed, not a generic message.

## Phase 6 — Documentation & Reflection (20–30 min)

- `README.md`: what it is, stack, setup (`npm install`, env vars, migrate, seed, run),
  test instructions if applicable, live URL if deployed.
- `DECISIONS.md`: the status/priority string-vs-enum tradeoff, why Prisma, why plain
  React state, what would be added with more time (auth, pagination, search/filter,
  optimistic UI). Written so it can be pasted directly into the submission form's
  reflection questions.
- Disclose AI tool usage explicitly, per README.md's stated instruction.

## Phase 7 — Deployment (remaining time — optional bonus)

- Vercel Postgres (built on Neon) is the lowest-friction option since it's already
  Vercel-native and auto-populates `DATABASE_URL`.
- `vercel.json` routes `/api/*` to the Express handler and serves the built
  `/client` as static output.
- Smoke-test all 5 endpoints against the live URL after deploy.
- If time runs out: skip this phase and say so plainly in `DECISIONS.md`
  ("deployment omitted due to time budget; verified locally") — an honest note
  scores better than a broken deploy.

---

## 4. Time-Pressure Fallback Order

If the 2–4 hour budget gets tight, cut in this order:

1. **Cut first:** Phase 7 (deployment) — explicitly optional per REQUIREMENTS.md.
2. **Cut second:** Reduce Phase 5 to spot-checks instead of exhaustive re-verification.
3. **Never cut:** Phases 0–4 and 6 — Functionality, Code Quality, Architecture, and
   Documentation together are 85% of the rubric, and are the phases that build them.

## 5. Known Environment Note

Prisma's native query/schema-engine binaries are fetched from `binaries.prisma.sh`
at `generate`/`migrate` time. In network-restricted environments (e.g. this sandbox,
CI runners with a strict egress allowlist) that host may be blocked. Workarounds, in
order of preference:
- Prisma's **driver adapters** (`@prisma/adapter-pg` + `pg`, `previewFeatures =
  ["driverAdapters"]`) use a WASM query engine bundled in the npm package — no
  runtime binary download needed, and it's also the recommended approach for
  serverless/Vercel deployments.
- `prisma generate` itself still needs the schema-engine binary in some CLI
  versions; if that's also blocked, author `migration.sql` by hand from the schema
  and apply it directly via `psql`, then run `prisma generate`/`migrate` normally
  once on a machine with full internet access (e.g. local dev machine or Vercel's
  build environment, which is not restricted this way).