# Virgil

Virgil is a TypeScript monorepo for organization-centric domain verification workflows. The repository combines a backend API, a frontend shell, and a background worker so the app can manage users, organizations, domain ownership checks, and queued scan jobs in a single cohesive platform.

## Overview

At a high level, the platform is organized around these core capabilities:

- user registration and login with JWT-based authentication
- organization creation with role-aware membership management
- domain registration tied to an organization
- domain verification using DNS TXT records or a hosted verification file
- asynchronous worker processing for future scanning and reconnaissance tasks

The repo is intentionally split into focused apps so each part can evolve independently:

- `apps/api` handles the business logic, Prisma access, authentication, validation, and routes
- `apps/web` provides the user-facing Next.js interface
- `apps/worker` processes background jobs using BullMQ and Redis
- `packages/shared-types` is the shared contract area for cross-app types

## Repository structure

```text
virgil/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   ├── src/
│   │   └── package.json
│   ├── web/
│   └── worker/
├── docker-compose.yml
├── docs/
└── packages/
    └── shared-types/
```

## Architecture

```text
┌───────────────┐      HTTP/JSON      ┌───────────────┐
│ Next.js Web    │ ──────────────────► │ Express API    │
└───────────────┘                     └───────┬───────┘
                                               │
                                               │ Prisma
                                               ▼
                                       ┌───────────────┐
                                       │ PostgreSQL     │
                                       └───────────────┘

                                               │
                                               │ Redis / BullMQ
                                               ▼
                                       ┌───────────────┐
                                       │ Worker          │
                                       └───────────────┘
```

## Tech stack

### API

- Node.js
- TypeScript
- Express 5
- Prisma ORM
- PostgreSQL
- Redis
- JWT via `jsonwebtoken`
- password hashing via `bcryptjs`
- input validation via `zod`

### Web

- Next.js 16
- React 19
- Tailwind CSS
- TypeScript

### Worker

- BullMQ
- Redis
- TypeScript

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+ recommended
- npm
- Docker Desktop or Docker Engine
- Git

## Getting started

### 1. Start supporting services

From the repository root:

```bash
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5433`
- Redis on `localhost:6379`

### 2. Install dependencies

Run the following from the repo root:

```bash
cd apps/api && npm install
cd ../web && npm install
cd ../worker && npm install
```

### 3. Configure environment variables

The API expects environment variables such as:

```env
DATABASE_URL="postgresql://virgil:virgil_dev_password@localhost:5433/virgil_db"
REDIS_PORT=6379
PORT=4000
JWT_SECRET=ganti_dengan_random_string_panjang_nanti
```

The worker uses:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

> Do not commit real secrets. Use a secure secret value in production and keep local development credentials isolated from the repo.

### 4. Apply Prisma migrations and generate the client

From `apps/api`:

```bash
npx prisma migrate deploy
npx prisma generate
```

If you are working on schema changes during development, the usual flow is:

```bash
npx prisma migrate dev
npx prisma generate
```

## Running the apps

### API

Start the Express service:

```bash
cd apps/api
npm run dev
```

The API runs on:

- `http://localhost:4000`

A health check is exposed at:

```bash
curl http://localhost:4000/health
```

### Web frontend

Start the Next.js app:

```bash
cd apps/web
npm run dev
```

The frontend runs on:

- `http://localhost:3000`

### Worker

Start the background queue worker:

```bash
cd apps/worker
npm run dev
```

## Core domain model

The Prisma schema models the following entities:

- `User`
- `Organization`
- `OrganizationMember`
- `Domain`
- `ScanJob`

Core relationships:

- a user can belong to multiple organizations through membership records
- each organization can contain multiple domains
- each domain can have multiple scan jobs
- each domain holds a `verificationStatus` and `verificationToken`

## API surface

### Authentication endpoints

Base route: `/auth`

- `POST /auth/register`
  - body: `{ email, password }`
- `POST /auth/login`
  - body: `{ email, password }`

Authentication returns a JWT token, which should be placed in the `Authorization` header for protected routes.

### Organization endpoints

Base route: `/organizations`

- `POST /organizations` creates an organization for the authenticated user
- `GET /organizations` lists organizations for the current user

### Domain endpoints

Base route: `/organizations/:orgId/domains`

- `POST /organizations/:orgId/domains` registers a hostname for the organization
- `GET /organizations/:orgId/domains` lists all domains for the organization
- `POST /organizations/:orgId/domains/:domainId/verify` triggers the verification flow

## Domain verification flow

Virgil currently supports two verification approaches:

1. DNS TXT verification
   - checks `_virgil-challenge.<hostname>`
   - expects the verification token to appear in the TXT record value

2. File verification
   - checks `https://<hostname>/.well-known/virgil-verify.txt`
   - expects the response body to match the verification token exactly

This logic is implemented in:

- `apps/api/src/lib/domainVerification.ts`
- `apps/api/src/services/domainService.ts`

## Environment and security guidance

Use the following security practices while developing and deploying the app:

- keep `JWT_SECRET` strong and unique per environment
- never commit production credentials to the repository
- separate local, staging, and production configuration
- protect Redis and Postgres connection strings appropriately
- review RBAC rules before exposing new protected routes

## Development workflow

A typical local development loop is:

1. start Docker services with `docker compose up -d`
2. start the API with `npm run dev` inside `apps/api`
3. start the web app with `npm run dev` inside `apps/web`
4. start the worker when queue processing is needed
5. apply schema changes through Prisma migrations

## Scripts and common commands

From the API package:

```bash
npm run dev
npm run build
npm run start
```

From the web package:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

From the worker package:

```bash
npm run dev
```

## Current project status

This repository is in active early-stage development. The API and data layer are the most developed parts, while the frontend and worker still represent scaffolded and evolving components of the broader platform.

## Recommended next steps

- connect the web app to the auth and organization APIs
- wire the worker to real scan and domain validation tasks
- formalize shared request/response contracts in `packages/shared-types`
- add end-to-end tests for auth, organization, and domain flows
- move environment configuration to a production-safe secret strategy

## License

The current package metadata declares the project license as ISC.
