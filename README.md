# Masarra

Masarra is an Arabic-first, multilingual game platform built with AdonisJS, React, Inertia, and PostgreSQL.

## Requirements

- Node.js 24+
- npm 11+
- PostgreSQL 17+ or Docker

## Local setup

```bash
cp .env.example .env
node ace generate:key
docker compose up -d postgres
npm install
node ace migration:run
npm run dev
```

The application runs at `http://localhost:3333`.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run check
```

Install the repository hooks after Git is initialized:

```bash
npm run hooks:install
```

## Structure

```text
app/
├── controllers/   HTTP and Inertia adapters
├── exceptions/    Global exception handling
├── http/          Shared API contracts and response helpers
├── middleware/    Request security and context
├── models/        Lucid models
├── services/      Application services
└── validators/    VineJS request validators

database/
└── migrations/

inertia/
├── components/
├── layouts/
└── pages/

tests/
├── functional/
└── unit/
```

Development progress is tracked in [`docs/IMPLEMENTATION_PROGRESS.md`](docs/IMPLEMENTATION_PROGRESS.md). Project rules are in [`docs/DEVELOPMENT_RULES.md`](docs/DEVELOPMENT_RULES.md).

## Auth APIs

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
POST /api/v1/auth/otp/phone/send
POST /api/v1/auth/otp/phone/verify
GET  /api/v1/account/me
PATCH /api/v1/account/profile
PATCH /api/v1/account/password
GET  /api/v1/account/game-history
GET  /api/v1/account/game-history/:id
GET  /api/v1/account/purchased-history
GET  /api/v1/account/credit-transactions
GET  /api/v1/pages/:slug
POST /api/v1/contact
GET  /api/v1/master/games
GET  /api/v1/master/games/:slug
POST /api/v1/game-sessions
GET  /api/v1/game-sessions/:id/setup
PATCH /api/v1/game-sessions/:id/teams
PATCH /api/v1/game-sessions/:id/settings
POST /api/v1/game-sessions/:id/optional-category
POST /api/v1/game-sessions/:id/lock
GET  /api/v1/wallet
POST /api/v1/game-sessions/:id/reserve-credits
POST /api/v1/game-sessions/:id/category-payment-intent
POST /api/v1/payments/:id/confirm
POST /api/v1/game-sessions/:id/start
POST /api/v1/game-sessions/:id/rounds/next
POST /api/v1/game-sessions/:id/rounds/:roundId/complete
POST /api/v1/game-sessions/:id/rounds/:roundId/abandon
POST /api/v1/game-sessions/:id/rounds/:roundId/question
POST /api/v1/game-sessions/:id/rounds/:roundId/score
GET  /api/v1/game-sessions/:id/scoreboard
POST /api/v1/game-sessions/:id/stop
GET  /api/v1/admin/games
POST /api/v1/admin/games
GET  /api/v1/admin/games/:id
PUT  /api/v1/admin/games/:id
GET  /api/v1/admin/games/:gameId/categories
POST /api/v1/admin/games/:gameId/categories
GET  /api/v1/admin/categories/:id
PUT  /api/v1/admin/categories/:id
GET  /api/v1/admin/questions
POST /api/v1/admin/questions
GET  /api/v1/admin/questions/:id
PUT  /api/v1/admin/questions/:id
GET  /api/v1/admin/content-pages
POST /api/v1/admin/content-pages
GET  /api/v1/admin/content-pages/:id
PUT  /api/v1/admin/content-pages/:id
GET  /api/v1/admin/contact-messages
GET  /api/v1/admin/contact-messages/:id
PATCH /api/v1/admin/contact-messages/:id/status
GET  /api/v1/admin/dashboard/summary
GET  /api/v1/admin/reports/payments
GET  /api/v1/admin/reports/game-sessions
GET  /api/v1/admin/reports/users
GET  /api/v1/admin/reports/contact-messages
```

## Admin web routes

```text
GET /admin
GET /admin/games
GET /admin/games/create
GET /admin/games/:id/edit
GET /admin/categories
GET /admin/categories/create
GET /admin/categories/:id/edit
GET /admin/questions
GET /admin/questions/create
GET /admin/questions/:id/edit
GET /admin/content-pages
GET /admin/content-pages/create
GET /admin/content-pages/:id/edit
GET /admin/contact-messages
GET /admin/contact-messages/:id
```
