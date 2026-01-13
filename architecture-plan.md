Checkout Demom Architecture Overview
1. Overview
    Simple checkout service and payment flow in NestJS. Demonstrates clean architecture, idempotent operations, and simulates asynchronous payent processing.

2. Data Flow
    a. Create Checkout (POST /checkouts)
        - Controller validates request via DTO.
        - Service checks for existing checkout (idempotency).
        - If new, service creates record with PENDING status.
        - Controller returns checkout object.

    b. Process Payment (POST /checkouts/:id/pay)
        - Controller triggers async payment in service if status PENDING or FAILED
            - Bad request if COMPLETE or still PROCESSING
        - Checkout status to PROCESSING
            - blocking status to prevent multiple payments per checkout
        - Service immediately returns checkout status to client.
        - Background task updates status to COMPLETED or FAILED.

    c. Get Checkout Status (GET /checkouts/:id)
        - Controller calls service to fetch the latest status.
        - Returns structured response.

3. Components
    a. Controllers
        - POST /checkouts – create a new checkout
        - POST /checkouts/:id/pay – trigger async payment
        - GET /checkouts/:id – retrieve checkout status

    Responsibilities:
        - Validate request payloads (DTOs)
        - Forward requests to the service layer
        - Return consistent structured responses (see below)

    b. Services
        - Idempotency: ensures duplicate requests with the same merchantId and idempotencyKey return the same checkout with {retry: true} field and 200
        - Async Payment Simulation uses setTimeout() to update checkout status.
        - Data Access: interacts with Prisma to query the database. (sqlLite didnt support enum for this exercise in in-memory mode so enums enforced at DTO level)

    c. Database Layer
        - Prisma ORM abstracts database operations
        - SQLite (in-memory) for simplicity
        - Schema: single Checkout table with fields:
            id (UUID)
            merchantId (string)
            amount (int) // in cents 
            currency (enum)
            status (enum: PENDING, COMPLETED, FAILED)
            idempotencyKey (unique per merchant) (string)
            createdAt ()

    d. Interceptors & Validation
        - ValidationPipe ensures request data conforms to DTO rules.
        - ResponseInterceptor enforces a consistent response structure (see below)

4. Exception Handling
    - NotFoundException
    - BadRequestException – when attempting to process a checkout already completed or failed.
    - Validation Errors – return HTTP 422 with meaningful messages.
    - Idempotency Handling – returns existing checkout plus {retry: true} and 200 OK instead of 202 created

5. Endpoint details:
    a. POST /checkouts
        - BODY {
            {
                "merchantId": string, // required
                "amount": int, // required
                "currency": ["CAD", "USD"], // required
                "idempotencyKey": string // required
            }
        }
        - successful RESPONSE {
            "success": true,
            "data": {
                "id": "ba70daf8-e95f-4c18-9b2e-6a553dffb0a1",
                "merchantId": "m123",
                "amount": 3452346,
                "currency": "USD",
                "status": "PENDING",
                "idempotencyKey": "fffffhhhhff",
                "createdAt": "2026-01-13T18:53:34.071Z"
            }
        }
        - idempotetent retry RESPONSE {
            {
                "success": true,
                "data": {
                    .
                    .
                    "retry": true
                }
            }
        }
    b. GET /checkouts/:checkout_id
        - RESPONSE {
            "success": true,
            "data": {
                "id": "ba70daf8-e95f-4c18-9b2e-6a553dffb0a1",
                "status": "PENDING",
            }
        }
    c. POST /checkouts/:checkout_id/pay
        - RESPONSE {
            "success": true,
            "data": {
                "id": "ba70daf8-e95f-4c18-9b2e-6a553dffb0a1",
                "merchantId": "m123",
                "amount": 3452346,
                "currency": "USD",
                "status": "PENDING",
                "idempotencyKey": "fffffhhhhff",
                "createdAt": "2026-01-13T18:53:34.071Z"
            }
        }     
6. RESPONSE MODELS:
    STANDARD RESPONSE {
        "success": true,
        "data": {
            ...
        }
    }
    ERROR RESPONSE {
        "success": false,
        "data": {
            "error": "some error message"
        }
    }
7. ENUMS:
    i. checkout status ["COMPLETED", "PENDING", "FAILED", "PROCESSING"]
    ii. checkout currencies ["USD", "CAD"]
        1. arbitrarily assumes these are only currencies supported for now
