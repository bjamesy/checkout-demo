Checkout Demo (NestJS + Prisma + SQLite)

A small backend service demonstrating clean architecture, idempotent checkout creation, and asynchronous payment processing.

Features

POST /checkouts – Create a checkout (idempotent by merchantId + idempotencyKey).

GET /checkouts/:id – Get the current status of a checkout.

POST /checkouts/:id/pay – Simulate asynchronous payment processing (status updates to COMPLETED or FAILED).

Tech Stack

NestJS – Backend framework with module/controller/service separation

Prisma ORM – Database access layer

SQLite – In-memory or file-based database for simplicity

TypeScript – Type safety and clean code

Setup

Clone repository:

git clone <repo-url>
cd checkout-demo


Install dependencies:

npm install


Create .env in project root:

DATABASE_URL="file:./dev.db"  # or use in-memory: file:./dev.db?mode=memory&cache=shared


Run Prisma migrations:

npx prisma migrate dev --name init
npx prisma generate


Start the server:

npm run start:dev

API Example

Create Checkout

curl -X POST http://localhost:3000/checkouts \
  -H "Content-Type: application/json" \
  -d '{"merchantId":"m123","amount":1000,"currency":"USD","idempotencyKey":"abc123"}'


Get Checkout Status

curl http://localhost:3000/checkouts/<checkout_id>


Process Payment

curl -X POST http://localhost:3000/checkouts/<checkout_id>/pay


Status will update asynchronously after ~1 second.

Design Decisions

Idempotency – enforced with a database unique constraint (merchantId + idempotencyKey) and catch on P2002 errors.

Async processing – setTimeout simulates background payment processing; simple but effective for take-home.

SQLite – lightweight, easy to set up, can be in-memory or file-based.

PrismaService – wraps Prisma client for dependency injection and clean separation.

DTO validation – ensures incoming requests are correct using class-validator.

Notes

No real payment provider integration.

No authentication or frontend — backend logic only.

Clean, maintainable code with NestJS idiomatic structure.