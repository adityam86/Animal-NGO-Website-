# AYUDAR — Critical Security & Reliability Fixes Report

**Repository:** `https://github.com/adityam86/Animal-NGO-Website-`  
**Target Branch:** `feature/ayudar-production-upgrade`  
**Base Branch:** `main` (`1ec0cc8`)  
**Scope Rule:** All changes implemented on `feature/ayudar-production-upgrade` only. `main` untouched, Git history preserved without rewrite, `prisma/dev.db` preserved read-only, no production deployment or remote push performed.

---

## 1. Files Changed on `feature/ayudar-production-upgrade`

### Modified Files
- `.env.example` — Added `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` template placeholders (no real secrets).
- `.env.production` — Added documentation entry for Upstash Redis REST environment variables (no real secrets).
- `package.json`, `package-lock.json` — Installed `@vercel/blob` SDK.
- `proxy.ts` — Enforced DB-backed active session validation (`verifyActiveSessionToken`), cookie clearance with `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=0`, and non-looping `/login` handling.
- `app/admin/layout.tsx` — Verified DB session via `getAdminSession()` and redirected invalid/revoked sessions to `/login?session=expired`.
- `app/login/page.tsx` & new `components/auth/LoginForm.tsx` — Split into Server Component + Client Form; redirects to `/admin` only for active DB sessions and displays `?session=expired` notice cleanly.
- `app/api/verify-payment/route.ts`, `app/api/webhooks/razorpay/route.ts`, `lib/payment.ts`, `lib/validation.ts` — Razorpay order-binding, cross-table payment replay protection, `donationId` XOR `sponsorshipId`, Razorpay API payment fetch verification, webhook `verifiedAt` timestamp.
- `app/api/create-order/route.ts`, `app/api/login/route.ts`, `app/api/upload/route.ts`, `app/api/rescue/upload/route.ts`, `app/api/reports/[type]/route.ts`, `app/api/donate/route.ts`, `app/api/sponsorship/route.ts`, `app/api/rescue/route.ts`, `app/api/rescue/[id]/route.ts`, `app/api/adoption/route.ts`, `app/api/volunteer/route.ts`, `app/api/contact/route.ts`, `app/api/ai/chat/route.ts` — Updated to `await checkDistributedRateLimit(...)`.
- `lib/auth-server.ts` — Added `verifyActiveSessionToken(token)` validating JWT + `prisma.adminSession` (`revokedAt === null`, `expiresAt > now`, `user.isActive === true`) and delegated `getAdminSession()`.
- `lib/rate-limit.ts` — Added `checkDistributedRateLimit(key, maxRequests, windowMs)` supporting Upstash Redis REST (`/pipeline`) with safe per-instance fallback.
- `lib/security.ts` & new `lib/image-url.ts` — Improved `getClientIp` header preference (`x-vercel-forwarded-for`, `cf-connecting-ip`, `x-real-ip`, `x-forwarded-for`) and isolated browser-safe `isSafeImageUrl` / `shouldBypassImageOptimization`.
- `lib/storage.ts` — Replaced custom REST fetch with `@vercel/blob` `put(...)` (`access: "public"`, `addRandomSuffix: true`, server-side `BLOB_READ_WRITE_TOKEN` only).
- `components/shared/ImageUploader.tsx`, `app/admin/adoption/page.tsx`, `components/shared/StoryCard.tsx`, `app/stories/[slug]/page.tsx`, `components/shared/BeforeAfterSlider.tsx` — Strict `isSafeImageUrl` checks and `unoptimized={shouldBypassImageOptimization(...)}` on `<Image>`.
- `app/volunteer/page.tsx`, `components/shared/InteractiveMap.tsx` — Replaced browser `alert()` calls with inline error state (`role="alert"` / `setErrorMsg`).
- `scripts/migrate-sqlite-to-postgres.ts` — Added `AuditLog` migration with orphan `userId` nulling, explicit `AdminSession` exclusion accounting, batched upserts (`MIGRATION_BATCH_SIZE = 50`), and extended transaction timeouts (`maxWait: 20_000`, `timeout: 120_000`).
- `tests/payment-security.test.ts`, `tests/security-auth.test.ts` — Expanded with regression tests for Fixes 1 and 2.

### New Files
- `lib/image-url.ts`
- `components/auth/LoginForm.tsx`
- `tests/migration-live.test.ts`
- `tests/storage-and-rate-limit.test.ts`
- `AYUDAR_CRITICAL_FIXES_REPORT.md`

---

## 2. Detailed Root Causes, Fixes & Regression Tests

### FIX 1 — Razorpay Order Replay & Payment Verification
- **Root Cause:** `app/api/verify-payment/route.ts` could accept order signatures without strictly requiring a matching non-null stored `razorpayOrderId`, did not enforce mutual exclusion between `donationId` and `sponsorshipId`, did not check `razorpayPaymentId` reuse across both `Donation` and `Sponsorship` tables, and lacked independent confirmation from Razorpay's server API (`payments.fetch`) before completing a record.
- **Fix Implemented:**
  - `verifyPaymentSchema` in `lib/validation.ts` enforces `donationId` XOR `sponsorshipId`.
  - `app/api/verify-payment/route.ts` verifies HMAC SHA-256 signature first, rejects null/mismatched `razorpayOrderId` with HTTP `400`, marks `Failed` only when `razorpayOrderId` matches `razorpay_order_id`, calls `verifyPaymentWithRazorpayApi` (`Razorpay.payments.fetch(paymentId)`) in non-mock mode to confirm `id`, `order_id === orderId`, `currency === "INR"`, integer paise match (`Math.round(expectedAmountInr * 100)`), and captured/authorized status (marking gateway `failed` accurately).
  - Inside `prisma.$transaction`, verifies `razorpayPaymentId` uniqueness across both `donation` and `sponsorship`, sets `verifiedAt: new Date()`, and handles repeated valid verifications idempotently (`200`, `alreadyCompleted: true`).
  - `app/api/webhooks/razorpay/route.ts` records `verifiedAt: new Date()` on idempotent `payment.captured` processing.
- **Regression Tests Added (`tests/payment-security.test.ts`, 7 tests passed — mocked Prisma & Razorpay):**
  - Mock payments blocked in `production`.
  - Rejection when DB `razorpayOrderId` is `null` (cheaper-order replay prevention).
  - Rejection for wrong HMAC signature or different order IDs without corrupting records.
  - Rejection when both `donationId` and `sponsorshipId` are supplied.
  - Rejection when Razorpay API reports wrong amount, mismatched `order_id`, or `failed` status.
  - Successful valid verification with `verifiedAt`, idempotent repeated verification (`200`), and cross-record `razorpayPaymentId` reuse rejection.
  - Webhook HMAC signature verification and idempotency.

### FIX 2 — Revoked/Suspended Admin Session & Redirect Loop
- **Root Cause:** `proxy.ts` previously redirected `/login` to `/admin` solely on stateless HMAC JWT validity, while `app/admin/layout.tsx` rejected revoked or inactive database sessions back to `/login`, creating an infinite `/admin` ↔ `/login` redirect loop when a revoked/suspended cookie remained in the browser. Cookie clearing via `delete()` also omitted `Max-Age=0` and explicit cookie flags.
- **Fix Implemented:**
  - `lib/auth-server.ts` exports `verifyActiveSessionToken(token)` checking both JWT validity and `prisma.adminSession` (`revokedAt === null`, `expiresAt > now`, `user.isActive === true`).
  - `proxy.ts` runs `verifyActiveSessionToken(token)` on `/admin/:path*`, `/login`, `/api/reports/:path*`, `/api/upload`, and `/api/admin/:path*`; invalid/revoked/suspended sessions on `/admin` redirect to `/login?session=expired` and clear the cookie via `Max-Age=0`, `HttpOnly`, `Path=/`, `SameSite=Lax` (and `Secure` in production).
  - On `/login`, `proxy.ts` redirects to `/admin` **only** if `session` is DB-active; otherwise stale cookies are cleared cleanly (`200`), preventing any redirect loop.
  - `app/login/page.tsx` checks `getAdminSession()` server-side and renders `components/auth/LoginForm.tsx` with expiry notice when `session=expired`.
- **Regression Tests Added (`tests/security-auth.test.ts`, 6 tests passed — mocked Prisma/Next cookies):**
  - `scrypt` hashing & verification, JWT tamper rejection, missing/weak `SESSION_SECRET` fail-closed in production.
  - Valid active DB session access; rejection of expired, revoked (`revokedAt`), and suspended (`isActive: false`) sessions on `/admin` and `/api/reports/*` alongside non-looping `200` access to `/login?session=expired` and cookie clearance (`Max-Age=0`).
  - DB authentication on `POST /api/login`, session revocation on logout, and Admin Server Action privilege enforcement.

### FIX 3 — SQLite-to-PostgreSQL Migration Completeness & Batching
- **Root Cause:** `scripts/migrate-sqlite-to-postgres.ts` used Prisma's default 5-second interactive transaction timeout (risking failure on large datasets), did not migrate `AuditLog`, and did not explicitly report intentional exclusion of `AdminSession`.
- **Fix Implemented:**
  - Added `AuditLog` migration (`tx.auditLog.upsert`) inside `scripts/migrate-sqlite-to-postgres.ts`, nulling dangling `userId` references missing from migrated `User` rows so FK constraints never fail.
  - Explicitly queries SQLite `AdminSession` count and reports `intentionallySkipped.adminSessions` so admins must re-authenticate cleanly in PostgreSQL without copying local sessions.
  - Batches model writes via `processInBatches` (`MIGRATION_BATCH_SIZE = 50`) and configures transaction options `{ maxWait: 20_000, timeout: 120_000 }`.
  - Preserves `prisma/dev.db` read-only.
- **Regression Tests Added (`tests/migration-live.test.ts`, 1 test passed — real `node:sqlite` DB, mocked `PrismaClient`):**
  - Verifies 17 migrated models (`ShelterLocation`, `Animal`, `RescueCase`, `RescueCaseStatus`, `Story`, `StoryPhase`, `Volunteer`, `VolunteerRole`, `VolunteerAvailability`, `Donation`, `AdoptionApplication`, `Sponsorship`, `MedicalRecord`, `Vaccination`, `User`, `ContactInquiry`, `AuditLog`), dangling `AuditLog.userId` nulling, skipping of `AdminSession`, extended transaction timeout config (`maxWait: 20000, timeout: 120000`), and idempotent re-execution.

### FIX 4 — Vercel Blob SDK & Image Handling
- **Root Cause:** `lib/storage.ts` used a custom REST `fetch` call instead of `@vercel/blob`, some `<Image>` callers lacked `unoptimized` for `data:` fallback URLs, and image URL validation needed clean browser-safe isolation away from Node-only `Buffer` code.
- **Fix Implemented:**
  - Installed `@vercel/blob` and updated `lib/storage.ts` to upload via `put(\`ayudar/\${uniqueName}\`, buffer, { access: "public", contentType, addRandomSuffix: true, token: blobToken })` using server-only `BLOB_READ_WRITE_TOKEN`, keeping `<= 2 MB` raster data-URL fallback and non-Vercel local FS writes.
  - Extracted browser-safe `isSafeImageUrl` and `shouldBypassImageOptimization` into `lib/image-url.ts` (re-exported by `lib/security.ts`) and updated `ImageUploader.tsx`, `app/admin/adoption/page.tsx`, `StoryCard.tsx`, `app/stories/[slug]/page.tsx`, and `BeforeAfterSlider.tsx`.
- **Regression Tests Added (`tests/storage-and-rate-limit.test.ts`, 4 tests passed — mocked `@vercel/blob` & `fetch`):**
  - Confirms `@vercel/blob` `put` receives server token and returns hosted URL.
  - Confirms missing-token fallback handles `<= 2 MB` images and rejects oversized payloads, and verifies `put` error propagation.
  - Verifies `isSafeImageUrl` rejects unsafe `https://` hosts and `data:image/svg+xml` while allowing `/images/...`, `/uploads/...`, `*.public.blob.vercel-storage.com`, and safe raster data URLs.

### FIX 5 — Distributed Rate Limiting Adapter
- **Root Cause:** `lib/rate-limit.ts` provided only an in-memory `Map` limiter, which does not synchronize quotas across Vercel serverless function instances.
- **Fix Implemented:**
  - Added `async checkDistributedRateLimit(key, maxRequests, windowMs)` in `lib/rate-limit.ts` using Upstash Redis REST (`/pipeline` `INCR` / `PTTL` / `PEXPIRE` with `2500ms` timeout) when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set.
  - Falls back cleanly to per-instance memory limiting (`mode: "memory-fallback"`) with a single production warning when Redis env vars are absent, without claiming distributed guarantees when unconfigured.
  - Updated all 14 API rate-limited route callers to `await checkDistributedRateLimit(...)` and improved `getClientIp` header resolution in `lib/security.ts`.
- **Regression Tests Added (`tests/storage-and-rate-limit.test.ts`):**
  - Tests Upstash REST `/pipeline` rate enforcement and per-instance fallback when Redis is unconfigured.

### FIX 6 — Credentials & Git History Audit
- **Findings:**
  - `.env.example`, `.env.production`, and working tree files on `feature/ayudar-production-upgrade` contain **zero** hardcoded production passwords, tokens, or secret keys.
  - `git show main:app/api/login/route.ts` (`1ec0cc8`) and earlier commits on `main` retain legacy hardcoded demo login credentials from the pre-upgrade MVP; `feature/ayudar-production-upgrade` replaced that mechanism with scrypt-hashed DB authentication.
- **Action / Recommendation:** Do not rewrite public Git history automatically. Any database seeded using the legacy MVP credential or email must immediately rotate credentials via `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` before production cutover.

---

## 3. Verification Results (Run After Final Edit)

All checks below ran cleanly after the final edit (`components/shared/InteractiveMap.tsx`, `proxy.ts`, `tests/migration-live.test.ts`, `tests/payment-security.test.ts`) with exit code `0`:

| Check | Command | Result | Scope / Conditions |
| :--- | :--- | :--- | :--- |
| Unit & Regression Suite | `npm test` (`vitest run`) | **PASSED (6 files, 25/25 tests)** | `tests/migration-live.test.ts` (1), `tests/payment-security.test.ts` (7), `tests/storage-and-rate-limit.test.ts` (4), `tests/security-auth.test.ts` (6), `tests/api-privacy-uploads.test.ts` (4), `tests/migration-and-utils.test.ts` (3). Prisma, Razorpay, Vercel Blob, Next cookies/headers, and Upstash `fetch` are mocked; SQLite source checks run against real `node:sqlite`. |
| TypeScript Check | `npx tsc --noEmit` | **PASSED (0 errors)** | Full workspace compilation. |
| ESLint Check | `npm run lint` | **PASSED (0 errors)** | Full workspace lint. |
| Production Build | `npm run build` (`prisma generate && next build`) | **PASSED** | Built all static & dynamic App Router routes + `ƒ Proxy (Middleware)` with `.env.production` / `.env`. |
| Migration Dry Run | `npx tsx scripts/migrate-sqlite-to-postgres.ts --dry-run` | **PASSED** | Read local `prisma/dev.db` read-only (`animals: 4`, `rescues: 1`, `rescueStatuses: 6`, `stories: 2`, `storyPhases: 10`, `adminSessions: 0` skipped). |
| UI `alert()` Check | PowerShell `Select-String -Pattern '\balert\('` on `app`, `components` | **PASSED (`NO_ALERTS_FOUND`)** | Zero `alert()` calls in UI source. |

---

## 4. Remaining External Configuration & Unverified Cloud Steps

The following external services are **NOT VERIFIED** locally (no PostgreSQL engine, Docker, live Razorpay merchant credentials, live Vercel Blob store, or live Upstash Redis database is connected in this environment):

1. **PostgreSQL (`DATABASE_URL`) & Migrations:** Configure production/staging PostgreSQL connection string and execute `npx prisma migrate deploy` and initial admin seed (`ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`) against a staging database before migrating production data with `scripts/migrate-sqlite-to-postgres.ts`.
2. **Session Secret (`SESSION_SECRET`):** Set a cryptographically random `>= 32` character secret in Vercel Environment Variables.
3. **Razorpay Live Keys & Webhook:** Configure `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`, and keep `ENABLE_DEMO_PAYMENTS="false"`; test an end-to-end payment capture + webhook event in Razorpay Test Mode against staging.
4. **Vercel Blob (`BLOB_READ_WRITE_TOKEN`):** Provision Vercel Blob store on the Vercel project and verify uploaded files resolve under `*.public.blob.vercel-storage.com`.
5. **Distributed Rate Limiting (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`):** Provision Upstash Redis REST credentials in Vercel to enable shared rate limiting across serverless instances. Without these variables, endpoints operate in per-instance `memory-fallback` mode.

---

## 5. Remaining Limitations & Merge Recommendation

- **Remaining Limitations:**
  - Live `prisma migrate deploy` and live PostgreSQL execution of `scripts/migrate-sqlite-to-postgres.ts` remain unverified until connected to a PostgreSQL instance.
  - Live network round-trips to Razorpay `payments.fetch`, `@vercel/blob` `put`, and Upstash Redis REST `/pipeline` are verified via unit mocks rather than external staging accounts.
  - When `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are unset, rate limiting remains per-serverless-instance only.
  - Historical `main` commits (`1ec0cc8` and prior) still contain legacy MVP hardcoded credentials in Git history; rotate credentials immediately on any seeded DB.
- **Merge Recommendation:** **Ready for staging deployment / PostgreSQL smoke verification and merge review** on `feature/ayudar-production-upgrade` once the target PostgreSQL database (`npx prisma migrate deploy`) and required Vercel environment variables (`DATABASE_URL`, `SESSION_SECRET`, Razorpay keys, `BLOB_READ_WRITE_TOKEN`, and Upstash Redis REST credentials) are provisioned and tested in staging. Do not merge directly into production without staging verification of live PostgreSQL migrations and Razorpay Test Mode payments.
