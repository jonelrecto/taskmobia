# ProjectFlow — Client Project Tracker

A full-stack REST API + React UI for a digital agency to track client projects by status, priority, and timeline — featuring Authentication (Login & Register), Pagination, Live Metrics, Zod Validation, and Vercel Serverless deployment.

👉 **Live Demo:** [https://taskmobia.vercel.app](https://taskmobia.vercel.app)  
📦 **GitHub Repository:** [https://github.com/jonelrecto/taskmobia](https://github.com/jonelrecto/taskmobia)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 (Vanilla CSS) |
| Backend | Node.js + Express 4 |
| Auth | JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`) |
| ORM | Prisma 5 |
| Database | SQLite (local & serverless `/tmp`) |
| Validation | Zod 3 |

---

## Demo Credentials

Test the application instantly with the pre-seeded demo user or register a new account:

- **Email:** `admin@projectflow.io`
- **Password:** `password123`  
*(Or click **"Continue with Demo Account"** on the sign-in screen)*

---

## Key Features Implemented

### 1. Full Project CRUD Operations
- **Create**: Add new client projects with validation.
- **Read**: List projects with search, filter, sort, and pagination support, or view single project details (`GET /projects/:id`).
- **Update**: Modify existing project details via `PUT /projects/:id`.
- **Delete**: Remove projects with modal confirmation dialog.

### 2. User Authentication & Authorization
- **JWT + bcryptjs Auth**: Token-based authentication protecting all project CRUD endpoints via `Authorization: Bearer <token>` header.
- **Sign In & Registration**: Dual-mode authentication UI with error handling.
- **Session Persistence**: Automatic session restoration from `localStorage` (`pf_token`).
- **Demo Login**: One-click demo login button for instant evaluator access.

### 3. Cross-Field & Schema Validation (Zod)
- **Required Fields**: `clientName` and `projectName` cannot be empty.
- **Enum Enforcement**: `status` ∈ `{Planning, In Progress, On Hold, Completed}` and `priority` ∈ `{Low, Medium, High}`.
- **Date Rule**: `dueDate >= startDate` (Due date cannot be earlier than start date).
- **Error Envelopes**: Meaningful JSON error envelopes returning field-specific messages (`{ error: { message, field } }`).

### 4. Custom Priority Ranking & Sorting
- **Business Priority Order**: Priority sorting ranks projects by domain weight (`High` > `Medium` > `Low`) so all **High priority** projects appear at the top of the list when sorting by priority.
- **Bi-directional Sort**: Supports `Priority: High → Low` and `Priority: Low → High`.

### 5. Server-Side Pagination & Search/Filters
- **Pagination**: Supports `page` and `limit` query parameters returning paginated datasets with envelope metadata (`total`, `totalPages`, `hasNextPage`, `hasPrevPage`).
- **Items Per Page**: UI toggle for 6, 12, or 24 items per page.
- **Multi-Field Search**: Instant search across project names, client names, and descriptions.
- **Filter Controls**: Dropdowns for filtering by Status and Priority.

### 6. Live Database Metrics
- **Real-Time Header Chips**: Header status counters (`Total`, `Active`, `On Hold`, `Done`) reflect real-time counts from the database via `GET /projects/stats`.

### 7. UI/UX Excellence
- **Design System**: Modern glassmorphic dark theme built with Vanilla CSS variables.
- **Status & Priority Badges**: Visual color-coded status badges with pulsing active indicators.
- **Feedback**: Toast notifications for CRUD actions and skeleton loading states.

---

## Assumptions Made

1. **ISO Date Format (`YYYY-MM-DD`)**:
   - Dates are stored and transmitted as `YYYY-MM-DD` strings to eliminate UTC-to-local timezone conversion displacement across client browsers and serverless functions.
   - String comparison (`dueDate >= startDate`) is mathematically valid for ISO `YYYY-MM-DD` formatted dates.

2. **Database String Columns for Enums**:
   - `status` and `priority` are stored as plain `String` columns in the database rather than PostgreSQL native enum types.
   - *Rationale:* PostgreSQL enum identifiers cannot contain spaces (e.g. `"In Progress"` or `"On Hold"`). Storing string columns validated by Zod at the API layer avoids translation layers between the stored value and API JSON wire format.

3. **SQLite for Zero-Config Local & Serverless Execution**:
   - SQLite (`dev.db`) was chosen for local development to ensure reviewer environment portability without requiring a local PostgreSQL process.
   - *Vercel Serverless Handling:* On Vercel serverless execution, the bundled `dev.db` is copied to `/tmp/dev.db` at runtime because AWS Lambda/Vercel functions feature a read-only root directory with `/tmp` being the only writable filesystem.

4. **Client State Management**:
   - Native React `useState`, `useCallback`, and custom hooks were used instead of Redux or Zustand to keep the application lightweight, fast-loading, and free of unnecessary state management boilerplate.

5. **Full Replace (`PUT`) Semantics**:
   - `PUT /projects/:id` replaces all editable project fields per standard REST specifications, validated against Zod schemas on every write.

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Install dependencies

```bash
# Root (backend)
npm install

# Frontend
cd client && npm install && cd ..
```

### 2. Configure environment

The `.env` file in the project root is pre-configured for local SQLite & JWT:

```env
DATABASE_URL="file:./dev.db"
PORT=5001
JWT_SECRET="projectflow-jwt-secret-dev-change-in-prod"
JWT_EXPIRES_IN="24h"
```

### 3. Initialise database & seed data

```bash
npm run db:push      # Syncs Prisma schema (User & Project models)
npm run db:seed      # Seeds demo user + 12 client projects
```

### 4. Run in development

```bash
npm run dev
```

- **API Server:** `http://localhost:5001`
- **React Client:** `http://localhost:5173`

The Vite dev server proxies `/projects`, `/auth`, and `/api` requests to the Express backend.

---

## API Reference

### Authentication Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/auth/register` | Public | Register new user & return JWT token |
| `GET` | `/auth/me` | Protected | Get authenticated user profile |

### Project Endpoints (Protected by JWT)

All project endpoints require `Authorization: Bearer <token>` header:

| Method | Path | Description |
|---|---|---|
| `GET` | `/projects` | List projects (supports `?page=`, `?limit=`, `?status=`, `?priority=`, `?search=`, `?sortBy=`, `?sortOrder=`) |
| `GET` | `/projects/stats` | Get database status summary counters |
| `GET` | `/projects/:id` | Get single project details |
| `POST` | `/projects` | Create a new project |
| `PUT` | `/projects/:id` | Full update (replace) of a project |
| `DELETE` | `/projects/:id` | Delete a project |

### Error Envelope

All errors return a consistent JSON response:

```json
{
  "error": {
    "message": "Due Date cannot be earlier than Start Date",
    "field": "dueDate"
  }
}
```

---

## Running Tests

```bash
# Start backend server
npm run dev:server

# Run API, Auth, and Pagination smoke tests
npm run test:api
```

Test suite verifies: login authentication, user registration, token protection (401), GET/POST/PUT/DELETE CRUD operations, Zod validation errors, priority custom ranking, database stats, and pagination metadata (**27/27 tests passing**).

---

## AI Tool Disclosure

This project was built with assistance from **Google Antigravity (Gemini)** as the AI coding agent.
