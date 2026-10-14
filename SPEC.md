# Paystack Webhook Tester & Event Simulator

## Overview

Paystack Webhook Tester is a lightweight developer tool, local server, and browser dashboard for testing, simulating, and debugging Paystack webhook integrations locally.

When integrating Paystack, developers need to verify that their application correctly handles asynchronous webhooks (e.g. `charge.success`, `transfer.success`, `invoice.payment_failed`) and securely validates the `x-paystack-signature` HMAC-SHA512 header. Generating real test payments in the sandbox is slow, cannot easily test edge cases (like network retries or payment failures), and requires public tunneling setup.

Paystack Webhook Tester solves this by providing:
- Pre-built realistic event templates for all major Paystack events.
- Automatic HMAC-SHA512 header calculation (`x-paystack-signature`) using the developer's test secret key.
- One-click webhook dispatch to any target URL (e.g. `http://localhost:3000/api/webhook`) with full response inspection (HTTP status, response time, response body).
- Built-in webhook receiver (`/api/ingest`) to inspect incoming payloads and verify signatures.
- Dual interface: an interactive web dashboard and a zero-dependency CLI.

## Audience

- **Nigerian Software Developers & Fintech Engineers**: Building e-commerce, SaaS, or payment integrations using Paystack in Nigeria, Ghana, Kenya, South Africa, and across Africa.
- **Backend Teams**: Writing and testing webhook handler logic, signature verification middleware, and database update workflows.
- **QA Engineers**: Testing idempotency, retry mechanisms, and edge cases for payment failures and charge reversals.

## Acceptance Tests

The tool must satisfy the following acceptance criteria:

1. **HMAC-SHA512 Signature Generation**
   - Given a JSON payload string and a secret key, the tool computes the HMAC-SHA512 hex digest.
   - The generated signature must match Paystack's official signature verification specification.

2. **Signature Verification**
   - Given a payload string, secret key, and `x-paystack-signature` header, the tool returns `true` for a valid signature and `false` for invalid or tampered payloads.
   - Comparison uses timing-safe equality to prevent timing attacks.

3. **Event Template Catalog**
   - The tool provides realistic, schema-accurate templates for common Paystack webhook events:
     - `charge.success`: Successful card or bank payment.
     - `transfer.success`: Successful transfer payout.
     - `transfer.failed`: Failed transfer payout with error reason.
     - `transfer.reversed`: Reversed transfer payout.
     - `invoice.create`: New invoice created.
     - `invoice.payment_failed`: Customer invoice payment attempt failed.
     - `subscription.create`: Recurring subscription created.
   - Each template includes realistic IDs, Nigerian currency (`NGN`), customer metadata, and transaction channels.

4. **Webhook Dispatcher**
   - Given a target URL, payload, and secret key, the dispatcher delivers an HTTP POST request with `Content-Type: application/json` and `x-paystack-signature`.
   - The dispatcher records execution metadata: HTTP status code, round-trip latency in milliseconds, headers sent, and response body.

5. **Webhook Ingest Endpoint**
   - Exposes `/api/ingest` to accept incoming POST webhook payloads.
   - Stores ingested events in memory (up to a configurable limit) with timestamp, headers, payload, and signature verification result.

6. **Web Dashboard & REST API**
   - Exposes an HTTP server serving a single-page dashboard.
   - Exposes REST endpoints:
     - `GET /api/templates`: list available event templates.
     - `GET /api/templates/:event`: get a specific template payload.
     - `POST /api/sign`: compute signature for given payload and secret.
     - `POST /api/verify`: verify signature for given payload and secret.
     - `POST /api/dispatch`: send webhook to target and return execution record.
     - `GET /api/history`: retrieve list of dispatched and ingested events.
     - `GET /api/health`: return server health status.

7. **Command Line Interface (CLI)**
   - `paystack-webhook-tester sign --payload '<json>' --secret '<key>'`: print HMAC-SHA512 signature.
   - `paystack-webhook-tester verify --payload '<json>' --signature '<sig>' --secret '<key>'`: verify signature and exit with code 0 or 1.
   - `paystack-webhook-tester dispatch --event <name> --target <url> --secret '<key>'`: send event to target.
   - `paystack-webhook-tester serve --port <port>`: start the web dashboard and API server.
