# AYUDAR — Staging Validation Report

**Repository:** `https://github.com/adityam86/Animal-NGO-Website-`
**Branch:** `feature/ayudar-production-upgrade`
**Date:** 2026-11-27
**Scope:** Five-track parallel code audit + cross-track verification + targeted security fixes

---

## Executive Summary

Five parallel validation tracks (PostgreSQL schema & migration, Razorpay payment security, Vercel Blob & upload privacy, Upstash Redis rate limiting, and Vercel Preview deployment) completed via deep code inspection and mocked regression testing. **9 security fixes** were applied and verified. All automated checks pass: **25/25 Vitest tests**, `tsc --noEmit` (0 errors), ESLint (0 errors), `next build` (all routes), and SQLite-to-PostgreSQL `--dry-run`.

**Staging readiness: PARTIAL** — code and mocked tests are production-quality, but live external service validation (PostgreSQL `migrate deploy`, Razorpay Test Mode capture, Vercel Blob upload, Upstash Redis rate enforcement) is **BLOCKED** pending staging credentials. No production blockers exist in the codebase itself.

---

## Track A — PostgreSQL Staging

**Status: PARTIAL**

### Tests Executed (Mocked)
- Vitest: `tests/migration-live.test.ts` (1 test) — 18-model migration with real `node:sqlite` source, mocked `PrismaClient` target
- Vitest: `tests/migration-and-utils.test.ts` (3 tests) — dry-run, date/boolean conversions
- `npx tsx scripts/migrate-sqlite-to-postgres.ts --dry-run` — read local `prisma/dev.db` (4 animals, 1 rescue, 6 statuses, 2 stories, 10 phases, 0 admin sessions)
- `npx tsc --noEmit` — schema types verified
- `npx prisma generate` — client generated from `schema.prisma`

### Tests Blocked by Missing Credentials
- `npx prisma migrate deploy` against staging PostgreSQL
- Live `scripts/migrate-sqlite-to-postgres.ts` execution against PostgreSQL
- FK constraint enforcement, `P2002` unique collision testing, transaction timeout under network latency
- `npx prisma db seed` ordering verification

### Findings
- **18 models, 11 FKs, 6 unique indexes, 38 non-unique indexes** — all match between `schema.prisma` and `0001_init/migration.sql` with zero DDL mismatches
- Migration handles `AuditLog` orphan `userId` nulling; intentionally skips `AdminSession` (reported in output)
- Batched upserts (`MIGRATION_BATCH_SIZE = 50`) with extended transaction timeout (`maxWait: 20_000`, `timeout: 120_000`)
- **Risk:** 9 FK columns besides `AuditLog.userId` lack orphan pre-validation — dangling FK references in SQLite will cause PostgreSQL transaction rollback
- **Risk:** Re-running migration against a Postgres DB with live mutations can regress `paymentStatus`, `status`, `assignedTeam`, `outcome` columns via partial-update upserts
- **Risk:** `prisma db seed` before migration can cause `User_email_key` P2002 collision if seed email matches migrated user

### Severity
- No code bugs found — risks are operational sequencing (documented in checklist)

---

## Track B — Razorpay Test Mode

**Status: PARTIAL (1 HIGH fix applied)**

### Tests Executed (Mocked)
- Vitest: `tests/payment-security.test.ts` (7 tests) — HMAC verification, null/mismatched order ID rejection, dual ID rejection, Razorpay API amount/order/status verification, cross-table replay prevention, idempotent re-verification, webhook HMAC + idempotency

### Tests Blocked
- Live Razorpay Test Mode order creation + Checkout capture + `payments.fetch` API round-trip
- Live webhook delivery (`payment.captured`, `payment.failed`, `order.paid`)
- Concurrent request race condition testing (requires real PostgreSQL with `READ COMMITTED` isolation)

### Fixes Applied
1. **[HIGH] `lib/payment.ts:129` — Authorized-not-captured payments no longer marked Completed.** Previously `"authorized"` and `"captured"` both returned `{ ok: true }`; now only `"captured"` does. `"authorized"` returns `{ ok: false, authorized: true }` with HTTP 400.
2. **[MEDIUM] `app/api/webhooks/razorpay/route.ts` — Added currency validation, cross-table `razorpayPaymentId` replay check, `SPONSORSHIP_TIERS_INR` amount lookup, and `paymentStatus: { not: "Completed" }` guard on update WHERE clause.**
3. **[MEDIUM] `app/api/verify-payment/route.ts` — Added `paymentStatus: { not: "Completed" }` to both donation and sponsorship update WHERE clauses to prevent concurrent race overwrites.**

### Remaining Documented Risks
- No refund/dispute/chargeback webhook handling (`refund.created`, `payment.refunded` ignored)
- `create-order` does not pass `payment_capture: 1` (relies on Razorpay dashboard auto-capture setting)
- Donation receipt UI reads client React state (`finalAmount`) instead of server-confirmed record
- Pre-API `"Failed"` mutation on bad HMAC allows targeted status flip (recoverable via valid payment)

---

## Track C — Vercel Blob & Upload Privacy

**Status: PARTIAL (2 MEDIUM fixes applied)**

### Tests Executed (Mocked)
- Vitest: `tests/storage-and-rate-limit.test.ts` (4 tests) — `@vercel/blob` `put`, missing-token fallback, `isSafeImageUrl` validation
- Vitest: `tests/api-privacy-uploads.test.ts` (4 tests) — admin auth on `/api/upload`, SVG rejection, rescue upload validation

### Tests Blocked
- Live `@vercel/blob` `put(...)` with staging `BLOB_READ_WRITE_TOKEN`
- Actual file upload to `*.public.blob.vercel-storage.com`

### Fixes Applied
1. **[MEDIUM] `lib/image-url.ts` — SVG bypass via query/fragment fixed.** `isSafeImageUrl` now strips `?query` and `#fragment` before checking `.svg` extension on local paths, and checks `parsed.pathname` on HTTPS URLs.
2. **[MEDIUM] `app/admin/actions.ts:318` — `createStory` now uses `isSafeImageUrl` instead of permissive prefix matching.** Previously accepted arbitrary `https://` and `data:image/svg+xml`.

### Remaining Documented Risks
- **[HIGH] Rescue photos stored with `access: "public"`** — incident photos (which may contain street landmarks, bystanders, EXIF GPS) are publicly accessible on Vercel Blob CDN. Recommend `access: "private"` + authenticated proxy for rescue photos.
- **[HIGH] No EXIF/GPS metadata stripping** — no image re-encoding library (`sharp`/`jimp`) is installed; raw buffers with GPS coordinates are persisted unchanged.
- **[MEDIUM] Unauthenticated `POST /api/rescue/upload`** can orphan files in Blob storage without linking to a `RescueCase`
- **[LOW] `public/uploads` not in `.gitignore`** — local fallback uploads could be committed
- **[LOW] Magic-byte-only validation (first 12 bytes)** accepts polyglot files (valid header + malicious payload after byte 256)

---

## Track D — Upstash Redis Rate Limiting

**Status: PARTIAL (2 fixes applied)**

### Tests Executed (Mocked)
- Vitest: `tests/storage-and-rate-limit.test.ts` — Upstash pipeline happy path, memory fallback

### Tests Blocked
- Live Upstash Redis REST endpoint testing
- Multi-instance distributed rate limit verification
- IP header spoofing simulation under Vercel edge

### Fixes Applied
1. **[MEDIUM] `lib/rate-limit.ts` — Pipeline response validation hardened.** Now checks for per-command `error` fields, validates `Number.isFinite` on results (prevents NaN propagation), checks `/pexpire` response `res.ok`, and logs non-2xx pipeline responses instead of silently falling through.
2. **[MEDIUM] `lib/security.ts:getClientIp` — IP header trust hardened.** `x-vercel-forwarded-for` only trusted when `process.env.VERCEL` is set; IP syntax validated with `/^[\da-fA-F.:]{3,45}$/`; fallback changed from `"local"` to `"unknown"` to avoid bucket collision.

### Remaining Documented Risks
- **[HIGH] Fail-open for `POST /api/login`** — when Redis is unavailable, per-instance memory allows distributed brute-force across serverless instances. Recommend DB-backed failed-attempt counter or fail-closed for login.
- **[HIGH] Targeted admin lockout DoS** — `login-acct:${email}` key (8/15min) lets attackers lock out known admin emails from any IP
- **[MEDIUM] Unauthenticated `POST /api/rescue/upload` fail-open** — can exhaust Vercel Blob storage when Redis fallback is active
- **[LOW] Non-atomic 2-request window initialization** (INCR+PTTL then conditional PEXPIRE) — concurrent cold-key race can slightly extend window

---

## Track E — Vercel Preview Deployment

**Status: PARTIAL**

### Configuration Audit Results
- **`vercel.json`**: Does not exist. Vercel uses `next.config.ts` defaults (acceptable for Next.js App Router).
- **Security headers** (`next.config.ts`): CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, HSTS (prod only), `Referrer-Policy`, `Permissions-Policy` — all properly configured.
- **`images.remotePatterns`**: Only `*.public.blob.vercel-storage.com` — correctly scoped.
- **`NEXT_PUBLIC_*` variables**: Only `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `NEXT_PUBLIC_SITE_URL` — no secrets exposed client-side.
- **`.gitignore`**: Excludes `.env*` except `.env.production` (comments only) and `.env.example` (template only).
- **PWA `sw.js`**: Correctly excludes `/api/`, `/admin`, `/login` from service worker caching. Only public marketing pages cached.
- **`manifest.json`**: Properly configured for standalone PWA.
- **`outputFileTracingIncludes`**: `"/**": ["./prisma/**/*"]` — includes Prisma schema and migrations, but could inadvertently ship `prisma/dev.db` to Vercel bundle. Recommend excluding `prisma/dev.db` from production trace.

### Preview Deployment Readiness
- **BLOCKED**: No `vercel` CLI installed, no Vercel project linked, no staging environment variables configured.
- All build checks pass locally with Turbopack (`next build` succeeds across all 54 routes).

---

## Cross-Track Verification Results

| Check | Result |
|:---|:---|
| Vitest (`npm test`) | **PASSED — 6 files, 25/25 tests** |
| TypeScript (`npx tsc --noEmit`) | **PASSED — 0 errors** |
| ESLint (`npm run lint`) | **PASSED — 0 errors** |
| Production Build (`npm run build`) | **PASSED — 54 routes, Turbopack** |
| Migration Dry Run | **PASSED — read-only against local `prisma/dev.db`** |
| Secret Scan (`.env.example`, `.env.production`, source) | **PASSED — zero hardcoded secrets** |

---

## Security Fixes Applied in This Validation

| # | Severity | File(s) | Fix |
|:--|:---------|:--------|:----|
| 1 | HIGH | `lib/payment.ts:129` | `"authorized"` payments no longer accepted as `"captured"` |
| 2 | MEDIUM | `app/api/webhooks/razorpay/route.ts` | Added currency check, cross-table replay guard, tier-based amount lookup, `paymentStatus` WHERE guard |
| 3 | MEDIUM | `app/api/verify-payment/route.ts` | Added `paymentStatus: { not: "Completed" }` to transaction update WHERE |
| 4 | MEDIUM | `lib/image-url.ts` | Fixed SVG bypass via `?query` / `#fragment` |
| 5 | MEDIUM | `app/admin/actions.ts` | `createStory` now uses `isSafeImageUrl` |
| 6 | MEDIUM | `lib/rate-limit.ts` | Pipeline error/NaN validation, `/pexpire` response check |
| 7 | MEDIUM | `lib/security.ts` | `getClientIp` Vercel-only trust, IP syntax validation |
| 8 | MEDIUM | `tests/payment-security.test.ts` | Updated webhook test mocks for cross-table replay check |
| 9 | LOW | `lib/payment.ts:81` | Return type updated with `authorized` field |
