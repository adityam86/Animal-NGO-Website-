# AYUDAR Animal Welfare — Final Implementation Report

**Project:** AYUDAR Animal Welfare NGO Web Platform  
**Repository:** `https://github.com/adityam86/Animal-NGO-Website-`  
**Working Branch:** `feature/ayudar-production-upgrade`  
**Base Commit:** `00665378bc803a5bfd24e0469254a90e33178007`  
**Latest Feature Commit:** `d470066`  
**Target Deployment Platform:** Vercel (Next.js 16 App Router)  
**Database:** PostgreSQL (with SQLite source data migration)  
**Date of Audit:** November 27, 2026  

---

## Executive Summary

This report documents the completion of all repository-level engineering, security hardening, database migration scripting, regression testing, and build validation tasks for the AYUDAR production upgrade. All code modifications reside strictly on `feature/ayudar-production-upgrade`. Production and `main` remain completely untouched.

Per project guidelines, this report clearly distinguishes between repository code achievements, mock-tested boundaries, external staging requirements, and operational account ownership.

---

## Section A — Implemented and Tested in Code

The following capabilities and security hardening controls have been fully implemented in source code and validated through our automated build, lint, typecheck, and Vitest test suites:

### 1. Image Processing & Privacy Architecture
- **Sharp Server-Side Re-encoding (`lib/image-processing.ts`):** Decodes uploaded images with `failOn: "error"`, auto-rotates via `.rotate()`, and re-encodes as clean WebP/JPEG raster data, permanently stripping all EXIF, GPS coordinates, camera model, author, and auxiliary metadata tags.
- **Content & Polyglot Rejection:** Enforces maximum image dimensions ($\le 4096\text{px}$) and maximum file size boundaries. Pre-scans raw buffers to strictly reject `<svg`, `<html`, `<?xml`, `<script`, and binary executable (`MZ`, `ELF`) headers.
- **Private vs Public Storage Policy Separation (`lib/storage.ts`):** 
  - Public animal and story images are routed to public CDN paths.
  - Sensitive rescue incident photos are stored in private storage (`storage/private/rescues/` or private S3/R2) and are never exposed via public static web directories.
- **Authenticated Photo Endpoint (`app/api/admin/rescues/photo/[filename]/route.ts`):** Serves private incident photos exclusively to verified admin and coordinator sessions (`requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"])`), enforcing strict filename regex sanitization (`SAFE_FILENAME_RE`) and directory traversal prevention.
- **Public Rescue Tracking Privacy (`app/api/rescue/[id]/route.ts`):** Redacts exact GPS coordinates (e.g. `(GPS: lat, lng)`) and precise street/flat addresses from public tracking responses, returning only generalized landmark status information.

### 2. Rescue Upload Abuse Defense
- **Short-Lived Signed Upload Tokens (`lib/upload-token.ts`):** HMAC-SHA256 signed tokens encoding `rescue-upload` purpose, client IP binding, unique `tokenId`, and a strict 15-minute expiration timestamp.
- **Anti-Replay Protection:** Enforces atomic token consumption (`consumeUploadToken`) to prevent replaying used upload tokens.
- **Rate-Limited Token Issuance (`app/api/rescue/upload-token/route.ts`):** Rate limits token generation to 12 requests per 15 minutes per IP.
- **Frontend Integration (`components/shared/ImageUploader.tsx`):** Automatically requests and attaches signed tokens when submitting citizen rescue photos.

### 3. Authentication & Lockout Protection
- **Composite IP+Email Rate Limiting (`app/api/login/route.ts`):** Throttles failed attempts per `login-composite:${ip}:${email}` (5 attempts / 15 min), preventing an attacker from locking out an administrator using only their email.
- **Global IP & Broad Account Safeguards:** Preserves global IP rate limiting (20 attempts / 15 min) and broad account threshold (30 attempts / 15 min across all IPs).
- **Constant-Time Timing Parity (`lib/password.ts`):** Executes `verifyDummyPassword(password)` using a static precomputed `scrypt` hash for nonexistent or inactive accounts, eliminating side-channel timing enumeration.
- **Generic Responses:** Returns generic HTTP 401 error messages ("Invalid email or password") to prevent account existence discovery.

### 4. Payment Security & Razorpay Integration
- **Strict Capture Enforcement:** Requires `payment.status === "captured"` for success; rejects `authorized`, `created`, and `failed` statuses. Authorized payments remain in `Pending` state and are never marked as collected.
- **Auto-Capture Configuration (`app/api/create-order/route.ts`):** Configures explicit `payment_capture: 1` in `razorpay.orders.create` to ensure authorized funds are automatically captured upon authorization.
- **Webhook Hardening (`app/api/webhooks/razorpay/route.ts`):** Validates HMAC-SHA256 signatures in constant time, enforces `currency === "INR"`, validates amount against stored server database records, and implements cross-table replay guards preventing duplicate payment IDs across donations and sponsorships.
- **Refund & Dispute Webhooks:** Implemented idempotent handlers for `payment.refunded`, `refund.processed`, and dispute events, marking status as `Refunded` without incorrectly creating or treating refunds as donations.
- **Server-Sourced Receipt Amounts (`app/donate/page.tsx`):** Displays donation receipt amounts strictly from the server verification response (`serverReceiptAmount`), preventing client-side DOM tampering.

### 5. PostgreSQL Migration & Configuration
- **Dual-URL Configuration:** Added `directUrl = env("DIRECT_URL")` to `prisma/schema.prisma` for unpooled migration execution, alongside runtime pooled `DATABASE_URL`.
- **Safe Date Parsing (`scripts/migrate-sqlite-to-postgres.ts`):** `toDate` and `toNullableDate` throw explicit errors and abort the migration transaction upon encountering invalid dates, preventing silent replacement with the current date.
- **AdminSession Exclusion:** Explicitly excludes active SQLite session records during migration, requiring all staff to authenticate afresh in production.

### 6. Deployment Tracing & Git Hygiene
- **Tracing Isolation (`next.config.ts`):** Restricts Prisma outputFileTracing to `["./prisma/schema.prisma", "./prisma/migrations/**/*"]`, ensuring `prisma/dev.db` is strictly excluded from Vercel serverless deployment bundles.
- **Gitignore Protection (`.gitignore`):** Explicitly ignores `/public/uploads` and `/storage`.

---

## Section B — Tested Using Mocks Only

The following behaviors were validated using isolated Vitest unit and regression mocks:

1. **Razorpay API Interaction:** `verifyPaymentWithRazorpayApi` calls were tested using mock payment entities (simulating `captured`, `authorized`, `failed`, amount mismatch, currency mismatch, and network timeout). Real Razorpay servers were not contacted during local tests.
2. **Razorpay Webhooks:** Webhook payloads (`payment.captured`, `order.paid`, `payment.failed`, `payment.refunded`, `payment.dispute.created`) were signed and verified using local HMAC fixtures against mock database transactions.
3. **Upstash Redis REST API:** Distributed rate limiter fail-closed and fail-open behaviors during Redis network outages were tested using simulated `fetch` failure mocks.
4. **Prisma PostgreSQL Live Transaction:** Database upserts and foreign key cascading were tested using an in-memory transactional mock client. Real PostgreSQL TCP connections were not initiated during unit testing.
5. **Vercel Blob Storage Client:** Put requests to `@vercel/blob` were verified using mock token and URL responses.

---

## Section C — Verified Against Real External Services

- **Local Node.js Runtime & Native Sharp Engine:** Tested real raster decoding, EXIF metadata stripping, dimension checks, and WebP re-encoding using real binary image buffers via native libvips on Windows x64.
- **Local SQLite Database (`prisma/dev.db`):** Successfully executed `npx tsx scripts/migrate-sqlite-to-postgres.ts --dry-run` directly against the local SQLite database file, validating all 18 models and 17 content/audit tables.
- **Next.js Production Build Engine:** Successfully compiled the complete application with Turbopack (`npm run build`), generating and optimizing all 41 routes.

---

## Section D — Still Requiring Account-Owner Setup

The following external services require real user credentials and account ownership before staging validation can take place. These credentials cannot and must not be fabricated:

1. **PostgreSQL Database:**
   - Create a staging database on a managed provider (Neon, Supabase, Railway, or AWS RDS).
   - Obtain `DATABASE_URL` (pooled connection for serverless queries).
   - Obtain `DIRECT_URL` (direct connection on port 5432 for `prisma migrate deploy`).
2. **Razorpay Test Mode:**
   - Activate Test Mode in the Razorpay Dashboard.
   - Obtain `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
   - Configure a webhook URL (`https://<staging-url>/api/webhooks/razorpay`) with `RAZORPAY_WEBHOOK_SECRET` for events `payment.captured`, `payment.failed`, `order.paid`, and `payment.refunded`.
3. **Private Object Storage (S3 / Cloudflare R2):**
   - Provision a private bucket for sensitive rescue incident photos.
   - Configure `PRIVATE_STORAGE_BUCKET`, `PRIVATE_STORAGE_ENDPOINT`, `PRIVATE_STORAGE_ACCESS_KEY`, and `PRIVATE_STORAGE_SECRET_KEY`.
4. **Public Object Storage (Vercel Blob):**
   - Provision a Vercel Blob store on the staging project to receive `BLOB_READ_WRITE_TOKEN` for public animal and story images.
5. **Upstash Redis:**
   - Provision an Upstash Redis database and record `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
6. **Administrator Credentials & Session Secret:**
   - Generate a cryptographically secure `SESSION_SECRET` ($\ge 32$ random characters).
   - Define a strong, unique `ADMIN_SEED_PASSWORD`. Never reuse the legacy MVP password.
7. **Vercel Preview Environment:**
   - Add all above credentials to Vercel Project Settings under **Preview** scope.

---

## Section E — Remaining Risks or Limitations

1. **Pre-Staging Status:** While the application compiles cleanly and all 45 automated tests pass, the platform has not yet been subjected to live end-to-end HTTP traffic against real PostgreSQL or Razorpay servers. Live staging validation is mandatory before merging into `main`.
2. **Historical Git Commits:** Historical commits on legacy branches contain early MVP SQLite files and demo placeholders. As instructed, Git history was not rewritten. All real production credentials must be newly generated and distinct from any historical values.
3. **Third-Party Script Dependency:** Client-side Razorpay Checkout relies on `https://checkout.razorpay.com/v1/checkout.js`. If an end user has an aggressive content blocker or network restriction, the modal fallback triggers and informs the user to check their connection.
4. **Serverless Cold Starts:** First-time requests to cold serverless lambdas may incur a slight delay while initializing Prisma connections. Connection pooling via `DATABASE_URL` mitigates this for runtime traffic.

---

## Section F — Verification Command Results

| Verification Step | Command | Status | Details |
|---|---|---|---|
| **Prisma Generation** | `npx prisma generate` | **Passed** | Generated Prisma Client v5.22.0 in 377ms |
| **Static Typecheck** | `npx tsc --noEmit` | **Passed** | 0 TypeScript errors |
| **Code Quality Lint** | `npm run lint` | **Passed** | 0 ESLint errors, 0 warnings |
| **Unit & Regression Suite** | `npm test` | **Passed** | **45/45 tests passed** across 7 test files in 9.11s |
| **Production Build** | `npm run build` | **Passed** | Turbopack compiled successfully in 26.8s; 41 routes generated |
| **SQLite Migration Dry-Run** | `npx tsx scripts/migrate-sqlite-to-postgres.ts --dry-run` | **Passed** | 18 models parsed; `AdminSession` intentionally excluded |
