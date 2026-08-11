# ProjectFlow — Client Project Tracker

A full-stack REST API + React UI for a digital agency to track client projects by status, priority, and timeline — now with full Authentication (Login & Register).

👉 **Live Demo:** [https://taskmobia.vercel.app](https://taskmobia.vercel.app)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 (Vanilla CSS) |
| Backend | Node.js + Express 4 |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| ORM | Prisma 5 |
| Database | SQLite (local) |
| Validation | Zod 3 |

---

## Demo Credentials

You can test the application instantly with the pre-seeded demo user or register a new account:

- **Email:** `admin@projectflow.io`
- **Password:** `password123`

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

### 3. Initialise the database & seed demo user

```bash
npm run db:push      # Syncs Prisma schema (User & Project models)
npm run db:seed      # Seeds demo user + 12 client projects
```

### 4. Run in development

```bash
npm run dev
```

- **API:** `http://localhost:5001`
- **UI:**  `http://localhost:5173`

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
| `GET` | `/projects/:id` | Get single project |
| `POST` | `/projects` | Create a project |
| `PUT` | `/projects/:id` | Full update (replace) of a project |
| `DELETE` | `/projects/:id` | Delete a project |

### Error Envelope

All errors return:

```json
{
  "error": {
    "message": "Invalid email or password",
    "field": "email"
  }
}
```

---

## Running Tests

```bash
# Start backend server
npm run dev:server

# Run API and Auth smoke tests
npm run test:api
```

Tests cover: login (success & 401), registration, `/auth/me`, unauthenticated access rejection (401), protected CRUD project operations.

---

## AI Tool Disclosure

This project was built with assistance from **Google Antigravity (Gemini)** as the AI coding agent.
