# Checkout Demo (NestJS + Prisma + SQLite)

A small backend service demonstrating clean architecture, idempotent checkout creation, and asynchronous payment processing.

---

## Features

- **POST /checkouts** – Create a checkout (idempotent by `merchantId + idempotencyKey`).  
- **GET /checkouts/:id** – Get the current status of a checkout.  
- **POST /checkouts/:id/pay** – Simulate asynchronous payment processing (status updates to `COMPLETED` or `FAILED`).

---

## Tech Stack

- **NestJS** – Backend framework with module/controller/service separation  
- **Prisma ORM** – Database access layer  
- **SQLite** – In-memory or file-based database for simplicity  
- **TypeScript** – Type safety and maintainable code

---

## Setup

1. **Clone the repository**

```bash
git clone <repo-url>
cd checkout-demo
```

2. **Install dependencies**

```bash
npm install
```

3. **Create a `.env` file** in the project root:

```env
DATABASE_URL="file:./dev.db" # or in-memory: file:./dev.db?mode=memory&cache=shared
```

4. **Run Prisma migrations**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Start the server**

```bash
npm run start:dev
```

---

## API Examples

### 1. Create Checkout

```bash
curl -X POST http://localhost:3000/checkouts \
  -H "Content-Type: application/json" \
  -d '{
        "merchantId":"m123",
        "amount":1000,
        "currency":"USD",
        "idempotencyKey":"abc123"
      }'
```

### 2. Get Checkout Status

```bash
curl http://localhost:3000/checkouts/<checkout_id>
```

### 3. Process Payment

```bash
curl -X POST http://localhost:3000/checkouts/<checkout_id>/pay
```

> The checkout status will update asynchronously after ~1 second.

---

## Design Decisions

- **Idempotency** – Enforced using a **database unique constraint** (`merchantId + idempotencyKey`) with Prisma error handling.  
- **Async processing** – `setTimeout` simulates background payment processing; simple but demonstrates asynchronous logic.  
- **SQLite** – Lightweight and easy to set up; can be in-memory for tests or file-based for persistence.  
- **PrismaService** – Provides dependency injection for the Prisma client and clean separation from controllers.  
- **DTO validation** – Ensures incoming requests are validated using `class-validator`.

---

## Notes

- No real payment provider integration.  
- No authentication or frontend — backend logic only.  
- Code follows idiomatic NestJS structure for readability and maintainability.

---

## Testing Idempotency & Async

1. Send the **same POST /checkouts** request twice — it should return the **same checkout**.  
2. Send **POST /checkouts/:id/pay** to trigger async payment.  
3. Immediately GET `/checkouts/:id` — status will be `PENDING`.  
4. Wait ~1 second, GET again — status should update to `COMPLETED` or `FAILED`.

