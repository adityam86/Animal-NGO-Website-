# AYUDAR — Staging Environment Checklist

**Purpose:** Step-by-step checklist for provisioning and validating a staging deployment of AYUDAR before merging `feature/ayudar-production-upgrade` into `main`.

---

## Phase 1 — External Service Provisioning

- [ ] **PostgreSQL Database** — Provision a staging PostgreSQL instance (Neon, Supabase, Railway, or AWS RDS).
  - Record the connection string as `DATABASE_URL` (runtime pooled connection for serverless queries).
  - Record `DIRECT_URL` (direct non-pooled session connection on port 5432 for `prisma migrate deploy`).
  - `prisma/schema.prisma` natively supports `directUrl = env("DIRECT_URL")` for migration execution.
- [ ] **Razorpay Test Mode** — Create or use an existing Razorpay Test Mode account. Record `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, and `RAZORPAY_WEBHOOK_SECRET`.
  - Ensure Razorpay dashboard has **Auto-Capture enabled** under `Settings` → `Payment Capture` (the Orders API `payment_capture: 1` parameter is deprecated in current Razorpay API guidelines).
  - Configure a webhook URL pointing to `https://<staging-domain>/api/webhooks/razorpay` with events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`, `refund.created`, `payment.dispute.created`, `payment.dispute.won`.
- [ ] **Vercel Blob Storage** — Provision a Vercel Blob store on the staging Vercel project. Record `BLOB_READ_WRITE_TOKEN`. Supports both public uploads (`access: "public"` for animal/story profiles) and private incident uploads (`access: "private"` streamed via authenticated admin route).
- [ ] **Private Object Storage (Optional S3 / Cloudflare R2)** — If not using private Vercel Blob, provision a private bucket for sensitive rescue incident photos. Record `PRIVATE_STORAGE_BUCKET`, `PRIVATE_STORAGE_ENDPOINT`, `PRIVATE_STORAGE_ACCESS_KEY`, and `PRIVATE_STORAGE_SECRET_KEY`. In production, private storage is mandatory (fails safe if missing).
- [ ] **Upstash Redis REST** — Provision an Upstash Redis database. Record `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- [ ] **Session Secret** — Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Record as `SESSION_SECRET` (≥ 32 chars).
- [ ] **Admin Seed Credentials** — Choose strong `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` (never reuse legacy MVP credentials `admin@ayudar.org` / `Ayudar@2026`).

---

## Phase 2 — Vercel Project Configuration

- [ ] Link the GitHub repository to a Vercel project (or create a new one for staging).
- [ ] Configure **Preview** environment variables in Vercel Project Settings → Environment Variables:
  - `DATABASE_URL` (staging PostgreSQL, **not** production)
  - `SESSION_SECRET`
  - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_WEBHOOK_SECRET`
  - `BLOB_READ_WRITE_TOKEN`
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - `NEXT_PUBLIC_SITE_URL` (staging URL)
  - `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `ADMIN_SEED_NAME`
  - `ENABLE_DEMO_PAYMENTS` = `"false"`
- [ ] Verify that **Production** environment variables are **not** set on Preview scope (and vice versa).
- [ ] Verify `.env.production` in the repository contains **only comments** (no real credentials).

---

## Phase 3 — Database Migration

**Order matters: Migrate SQLite FIRST, Seed SECOND.**

- [ ] Run `npx prisma migrate deploy` against staging `DATABASE_URL` → verify `0001_init` applied.
- [ ] Run `npx prisma migrate status` → confirm zero pending migrations.
- [ ] Run `npm run db:migrate:sqlite-to-pg -- --sqlite <path-to-sqlite>` against staging PostgreSQL.
  - Verify row counts for all 17 models match SQLite source.
  - Verify `AdminSession` count is `0` in PostgreSQL.
  - Verify `AuditLog` orphan `userId` values are `null` (not dangling).
  - Spot-check: `Donation`/`Sponsorship` amounts, `paymentStatus` distribution, `Boolean` flags, `DateTime` columns (no 1970-epoch fallbacks).
- [ ] Run `npx prisma db seed` → verify admin user created with `ADMIN_SEED_EMAIL`.
  - If `ADMIN_SEED_EMAIL` matches a migrated user, seed will reset their `passwordHash`, `role`, `isActive`.
- [ ] Verify FK integrity: `SELECT COUNT(*) FROM "Animal" WHERE "shelterLocationId" IS NOT NULL AND "shelterLocationId" NOT IN (SELECT id FROM "ShelterLocation")` → should return `0`.
- [ ] **Never re-run** `migrate-sqlite-to-postgres.ts` against a staging DB that received live PostgreSQL edits without understanding partial-update overwrite behavior.

---

## Phase 4 — Staging Functional Smoke Tests

- [ ] **Login/Logout:** POST `/api/login` with seeded admin credentials → verify `AdminSession` created, `AuditLog` `LOGIN_SUCCESS` recorded, authenticated `/admin` pages render.
- [ ] **Admin CRUD:** Create an animal, story, shelter via admin dashboard → verify DB records and image uploads to Vercel Blob.
- [ ] **Public Pages:** Visit `/animals`, `/stories`, `/rescue`, `/donate`, `/sponsor`, `/contact`, `/volunteer` → verify SSR and data display.
- [ ] **Rescue Submission:** Submit `/rescue` form with photo upload → verify `RescueCase` created and photo stored.
- [ ] **Donation Flow (Razorpay Test Mode):**
  1. POST `/api/donate` → create Pending donation.
  2. POST `/api/create-order` → create Razorpay test order.
  3. Complete Razorpay Checkout with test card (`4111 1111 1111 1111`).
  4. POST `/api/verify-payment` → verify `Completed`, `verifiedAt` set, `razorpayPaymentId` unique.
  5. Verify receipt page shows server-confirmed amount.
- [ ] **Webhook:** Trigger a test webhook from Razorpay Dashboard → verify `payment.captured` processed idempotently.
- [ ] **Rate Limiting:** Send > 15 requests to `/api/login` within 15 minutes → verify `429` response with `Retry-After` header.
- [ ] **Session Revocation:** Revoke admin session in DB → verify `/admin` redirects to `/login?session=expired` without loop.

---

## Phase 5 — Security Verification

- [ ] Verify no secrets in `git log --all` on `feature/ayudar-production-upgrade` (only legacy `main` history contains MVP demo credentials).
- [ ] Verify `ENABLE_DEMO_PAYMENTS` is `"false"` in staging.
- [ ] Verify Razorpay `"authorized"` (uncaptured) payments return `400` from `/api/verify-payment` and are NOT marked `Completed`.
- [ ] Verify cross-table `razorpayPaymentId` replay returns `409`.
- [ ] Verify webhook rejects non-INR currency.
- [ ] Verify `isSafeImageUrl` rejects `data:image/svg+xml` and `.svg?query=1`.
- [ ] Verify `getClientIp` uses `x-vercel-forwarded-for` on Vercel and ignores it elsewhere.

---

## Phase 6 — Preview Deployment

- [ ] Push `feature/ayudar-production-upgrade` to trigger Vercel Preview build.
- [ ] Verify Preview build succeeds (all routes, Prisma generate, Turbopack).
- [ ] Run Phase 4 smoke tests against the Preview URL.
- [ ] Verify Preview uses staging-only credentials (not production).
- [ ] Obtain team approval for merge to `main`.

---

## Do NOT

- Do not merge to `main` before completing Phases 1–5.
- Do not use production `DATABASE_URL` for staging.
- Do not reuse legacy MVP credentials (`admin@ayudar.org` / `Ayudar@2026`).
- Do not force-push or rewrite Git history.
- Do not deploy directly to production without staging validation.
