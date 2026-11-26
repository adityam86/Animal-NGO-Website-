# AYUDAR Animal Welfare NGO Website — Production Upgrade Implementation Report

**Project:** AYUDAR — Animal Welfare NGO Website (`jeev-seva`)  
**Repository:** `https://github.com/adityam86/Animal-NGO-Website-`  
**Development Branch:** `feature/ayudar-production-upgrade`  
**Base Branch Preserved:** `main` (`1ec0cc8`, untouched; not merged)  
**Target Architecture:** Next.js 16 App Router · TypeScript · Prisma ORM · PostgreSQL · Razorpay · Vercel  

---

## 1. Repository & Branch Summary

- All implementation work was performed exclusively in the existing repository on feature branch **`feature/ayudar-production-upgrade`**, branched cleanly from `main` (`1ec0cc8`).
- Existing Git history was preserved untouched without resets, force pushes, or merges into `main`.
- Pre-existing `AYUDAR_COMPLETE_TECHNICAL_AUDIT.md` and `prisma/dev.db` were preserved intact (database records inside `prisma/dev.db` were kept non-destructively for migration export).

---

## 2. Git Commit Log (Chronological Milestone History)

1. `e88ad3d` — `security: harden admin authentication and sessions`
2. `2dd40f6` — `security: protect donor and rescue personal information`
3. `89ffa5b` — `security: secure uploads and server actions`
4. `175045a` — `security: fix Razorpay payment verification`
5. `030fba7` — `database: migrate Prisma to PostgreSQL`
6. `d2c2f09` — `feat: complete NGO contact and dynamic content workflows`
7. `d1b9fc8` — `feat: upgrade admin command center with full CRUD and analytics`
8. `6dfa98a` — `ui: redesign frontend and admin dashboard`
9. `756d90b` — `perf: optimize SEO metadata, sitemap, and PWA caching`
10. `8e16c12` — `test: add automated security and QA test suite`
11. Final Milestone 9 cleanup & implementation report commit on `feature/ayudar-production-upgrade`

---

## 3. Modified and Newly Created Files

### Core Security, Auth, Validation & Infrastructure (`lib/`, `proxy.ts`, `next.config.ts`)
- `lib/password.ts` (New) — Node `crypto.scrypt` password hashing with 16-byte random salt and `timingSafeEqual`.
- `lib/session-token.ts` (New) — Edge + Node compatible Web Crypto (`HS256`) signed JWT session utilities (`ayudar_admin_session`, 8h TTL, fails closed in production if `SESSION_SECRET` is missing or `< 32` chars).
- `lib/auth-server.ts` (New) — `getAdminSession`, `requireAdminSession`, `AuthError`, and `recordAuditLog` enforcing database `AdminSession` revocation and active user checks.
- `lib/security.ts` (New) — `getClientIp`, `isSameOriginRequest`, `sanitizePlainText`, `sanitizeCsvCell` (CSV formula injection neutralization), `validateImageSignature` (magic-byte check blocking SVG/HTML/XML), `readBoundedJson`.
- `lib/rate-limit.ts` (New) — Sliding-window rate limiter (`checkRateLimit`, `resetRateLimitStore`).
- `lib/validation.ts` (New) — Zod v4 schemas for login, rescue creation, adoption, volunteers, donations, sponsorships, order creation, payment verification, contact inquiries, AI chat, and animal records.
- `lib/storage.ts` (New) — Vercel Blob (`BLOB_READ_WRITE_TOKEN`), local `/public/uploads`, and bounded data-URL storage helper.
- `lib/payment.ts` (New) — Server sponsorship price catalog (`SPONSORSHIP_TIERS_INR`), `isMockPaymentsEnabled()` (prohibited in production), timing-safe Razorpay payment & webhook HMAC SHA-256 verification.
- `lib/prisma.ts` (Modified) — Removed Vercel `/tmp/dev.db` SQLite copy workaround; clean singleton lazy `PrismaClient` for PostgreSQL pooling.
- `proxy.ts` (Modified) — Verifies cryptographic JWT cookie on `/admin/:path*`, `/login`, `/api/reports/:path*`, `/api/upload`, and `/api/admin/:path*`; rejects unauthenticated API calls with `401`.
- `next.config.ts` (Modified) — Strict CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production, restricted `images.remotePatterns`.
- Deleted dead starter utility `lib/utils.ts` and unused starter SVG assets (`public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`).

### API Routes & Server Actions (`app/api/`, `app/admin/**/actions.ts`)
- `app/api/login/route.ts` & `app/api/logout/route.ts` (Modified) — DB-backed `scrypt` login with rate limiting & session tracking; DB session revocation + cookie clearing on logout.
- `app/api/reports/[type]/route.ts` (Modified) — Restricted to `SUPER_ADMIN` / `ADMIN`, formula-safe CSV serialization, added `sponsorships` export, audit logged.
- `app/api/rescue/route.ts` & `app/api/rescue/[id]/route.ts` (Modified) — Authenticated `GET /api/rescue`, stripped all reporter PII from public `GET /api/rescue/[id]`, Zod + rate-limit + photoUrl field on `POST`.
- `app/api/upload/route.ts` (Modified) & `app/api/rescue/upload/route.ts` (New) — Admin-only `/api/upload`; rate-limited 4MB photo-only public `/api/rescue/upload`; magic-byte SVG/HTML rejection on both.
- `app/api/adoption/route.ts`, `app/api/volunteer/route.ts`, `app/api/ai/chat/route.ts` (Modified) — Same-origin CSRF guard, rate limiting, Zod validation, and veterinary medical safety disclaimer on triage responses.
- `app/api/donate/route.ts`, `app/api/sponsorship/route.ts`, `app/api/create-order/route.ts`, `app/api/verify-payment/route.ts` (Modified) — Server-derived amounts bound to DB `razorpayOrderId`, strict production rejection of mock prefixes, timing-safe HMAC verification, transactional idempotency against duplicate payments.
- `app/api/webhooks/razorpay/route.ts` (New) — Raw body HMAC SHA-256 `x-razorpay-signature` verification handling `payment.captured`, `order.paid`, and `payment.failed` idempotently.
- `app/api/contact/route.ts` (New) — Validated rate-limited endpoint persisting submissions to `ContactInquiry`.
- `app/admin/actions.ts`, `app/admin/adoption/actions.ts`, `app/admin/medical/actions.ts`, `app/admin/shelters/actions.ts` (Modified) — Protected by `requireAdminSession(...)`, `prisma.$transaction`, Zod validation, and `AuditLog` entries; added `updateAnimal`, `updateContactInquiryStatus`, `updateSponsorshipStatus`, `createAdminUser`, `toggleAdminUserActive`.

### Database, Migrations & Tooling (`prisma/`, `scripts/`, `types/`)
- `prisma/schema.prisma` (Modified) — PostgreSQL datasource provider; added `User`, `AdminSession`, `AuditLog`, `ContactInquiry`, unique payment columns (`razorpayOrderId`, `razorpayPaymentId`), indexes, and relation delete guards.
- `prisma/migrations/migration_lock.toml` & `prisma/migrations/0001_init/migration.sql` (New) — Initial PostgreSQL DDL migration generated cleanly via `prisma migrate diff`.
- `prisma/seed.ts` (Modified) — Seeds default shelters, animals, rescue cases, stories, and env-configured admin user (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`, zero hardcoded secrets).
- `scripts/migrate-sqlite-to-postgres.ts` & `types/node-sqlite.d.ts` (New) — Read-only `node:sqlite` (`DatabaseSync`) exporter with `--dry-run` reporting and transactional idempotent PostgreSQL upsert migration.

### Admin Portal, Public Pages, UI/UX & SEO
- Admin pages (`app/admin/**`, `components/admin/**`) — Role/session staff header, sidebar updates (`Sponsorships`, `Inquiries`, `Team & Audit`), Edit Animal form (`/admin/animals/[id]/edit`), filter/search bars, pagination on animals, verified-only donation/sponsorship analytics, loading & error boundaries.
- Public pages & sections (`app/**`, `components/**`) — Live DB wiring with static fallback (`AnimalsSection`, `StoriesSection`, `CowCareSection`, `ImpactStats`), contact persistence, public immunization badges, Forest Green (`#15803d`) + warm off-white (`#faf9f5`) UI refresh, accessible focus rings, `prefers-reduced-motion`, printable 80G receipts, `app/robots.ts`, `app/sitemap.ts`, SEO route metadata layouts, and `public/sw.js` cache hardening.
- QA Test Suite (`vitest.config.ts`, `tests/*.test.ts`) — Automated tests for auth, sessions, server actions, PII protection, CSV formula safety, SVG XSS rejection, Razorpay HMAC & webhooks, and migration script verification.

---

## 4. Security Fixes Implemented (Audit Findings Remediation)

| ID | Original Finding | Resolution Implemented |
| :--- | :--- | :--- |
| **SEC-01** | Forgeable `admin_session=true` cookie & hardcoded credentials | Replaced with DB-backed `User` + `scrypt` hashed passwords + HS256 Web Crypto JWT signed sessions + DB `AdminSession` revocation + fail-closed `SESSION_SECRET` check in production. Removed all hardcoded password hints from `/login`. |
| **SEC-02** | Unauthenticated CSV exports exposing PII & PAN | Added `requireAdminSession(["SUPER_ADMIN", "ADMIN"])` to `/api/reports/[type]`, CSV formula neutralization via `sanitizeCsvCell`, `sponsorships` CSV export, and audit logging. |
| **SEC-03** | Razorpay bypass via `order_mock_` prefix | Restricted mock payments exclusively to non-production + no live credentials + `ENABLE_DEMO_PAYMENTS="true"`. Production strictly rejects mock IDs (`403` / `503`), verifies timing-safe HMAC signatures against server-stored `razorpayOrderId`, and adds verified webhook handler. |
| **SEC-04** | Public `/api/rescue` exposing caller PII & spoofable orders | Protected `GET /api/rescue` with admin roles; explicitly excluded `reporterName`, `reporterPhone`, `reporterEmail`, and raw `description` from public `GET /api/rescue/[id]`; bound `/api/create-order` strictly to server DB amounts. |
| **SEC-05** | Unauthenticated uploads & SVG stored XSS risk | Restricted `/api/upload` to authenticated admins; added rate-limited `/api/rescue/upload` (4MB); enforced magic-byte verification rejecting `<svg`, `<html`, `<?xml` even with renamed extensions. |
| **SEC-06** | Unprotected admin Server Actions | Guarded all exported actions (`updateRescueStatus`, `deleteAnimal`, `createAnimal`, `updateAnimal`, `approveAdoption`, `addMedicalRecord`, `addShelter`, etc.) with `requireAdminSession(...)` and role checks. |
| **SEC-07** | Missing security headers, rate limits & input validation | Added CSP, `X-Frame-Options`, `X-Content-Type-Options`, HSTS in `next.config.ts`; sliding-window rate limits on auth/uploads/public forms; Zod v4 schemas + same-origin checks across public routes. |
| **BUG-01** | Contact form did not persist inquiries | Added `ContactInquiry` Prisma model, `POST /api/contact`, wired `/contact` submission, and added `/admin/inquiries` management inbox. |
| **BUG-02** | Unfiltered donation sums & missing sponsorship admin | Updated dashboard & reports to sum `paymentStatus: "Completed"` only; added `/admin/sponsorships` management UI & CSV export. |
| **DB-01 / DB-02** | SQLite ephemeral `/tmp/dev.db` on Vercel & missing migrations | Switched Prisma provider to `postgresql`, removed `/tmp/dev.db` fallback, generated `prisma/migrations/0001_init/migration.sql` + `migration_lock.toml`, and created SQLite-to-PostgreSQL migration tooling. |

---

## 5. Database Schema Changes & PostgreSQL Migration

- `prisma/schema.prisma` targets **`postgresql`** via `env("DATABASE_URL")`.
- Added models: `User`, `AdminSession`, `AuditLog`, `ContactInquiry`.
- Added columns & constraints: `RescueCase.reporterEmail`, `RescueCase.photoUrl`, `RescueCaseStatus.sortOrder`, `StoryPhase.sortOrder`, `AdoptionApplication.petDetails`, unique indexes on `Donation(razorpayOrderId, razorpayPaymentId)` and `Sponsorship(razorpayOrderId, razorpayPaymentId)`, `onDelete: SetNull` on `Animal.shelterLocation`, and query indexes across status/type/timestamp fields.
- Initial SQL migration (`prisma/migrations/0001_init/migration.sql`) and lockfile (`prisma/migrations/migration_lock.toml`) are ready for PostgreSQL `prisma migrate deploy`.

---

## 6. Razorpay Payment & Webhook Architecture

1. Client submits form to `POST /api/donate` or `POST /api/sponsorship` -> validates fields with Zod, derives tier amount on server for sponsorships, creates `Pending` DB row.
2. Client sends `{ recordType, recordId }` to `POST /api/create-order` -> server reads DB row, generates live Razorpay order for exact INR amount (`* 100` paise), and stores `razorpayOrderId` on that record.
3. Client opens Razorpay Checkout -> returns `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` to `POST /api/verify-payment` -> timing-safe HMAC SHA-256 verification + `orderId` match + duplicate `paymentId` check inside `prisma.$transaction` marks payment `Completed`.
4. Asynchronous webhook `POST /api/webhooks/razorpay` verifies `x-razorpay-signature` against raw body using `RAZORPAY_WEBHOOK_SECRET`, validates amount match, and idempotently processes `payment.captured`, `order.paid`, and `payment.failed`.

---

## 7. Admin Dashboard & Public Functionality Upgrades

- **Admin Portal (`/admin`)**: Real-time verified financial KPIs (Completed vs Pending vs Failed), Recent Incidents & Adoptions, Open Inquiries alert, full **Edit Animal** flow (`/admin/animals/[id]/edit`), **Sponsorships Ledger** (`/admin/sponsorships`), **Contact Inquiries Inbox** (`/admin/inquiries`), **Team Roles & Security Audit Log** (`/admin/settings`), Volunteer roles/shifts visibility, incident photo preview (`photoUrl`), search & filters, and error/loading states.
- **Public Site**: Working `/contact` database persistence with reference IDs, live homepage database integration (`AnimalsSection`, `StoriesSection`, `CowCareSection`, `ImpactStats`) with static baseline fallback, public immunization badges on `/animals/[id]`, non-blocking inline alerts across forms, and veterinary safety disclaimer on AI triage replies.

---

## 8. UI/UX, Performance & SEO Improvements

- **Brand Refresh**: Primary CTA & trust tokens shifted to **Forest Green** (`#15803d` / `#166534`), warm off-white surfaces (`#faf9f5`), and earthy ochre accents while preserving Midnight Velvet dark mode and high-contrast status pills.
- **Accessibility**: Added keyboard skip link (`.skip-to-content`), `:focus-visible` focus rings, `@media (prefers-reduced-motion: reduce)`, printable `@media print` rules for 80G receipts, and active route highlighting in `Navbar`.
- **SEO & PWA**: Added `metadataBase`, NGO JSON-LD schema, route metadata layouts (`rescue`, `animals`, `adoption`, `donate`, `volunteer`, `contact`, `sponsor`), `app/robots.ts`, `app/sitemap.ts`, and hardened `public/sw.js` (`ayudar-pwa-v2`) to never cache `/admin`, `/login`, or `/api` responses.

---

## 9. Automated Verification Results & Coverage Boundaries

All automated verification commands passed after the final edits on branch `feature/ayudar-production-upgrade`:

- **`npm test` (Vitest v3.2.7):** **4 / 4 test files passed, 17 / 17 tests passed.**
  - `tests/security-auth.test.ts` (6 tests): `scrypt` hashing/verification, JWT signing & tamper rejection, production `SESSION_SECRET` fail-closed check, `proxy.ts` unauthenticated/forged cookie rejection, `/api/login` + `/api/logout` session revocation, unauthenticated & lower-privilege Server Action guards (using mocked `@/lib/prisma` and mocked `next/headers`).
  - `tests/api-privacy-uploads.test.ts` (4 tests): unauth/coordinator CSV blocking & CSV formula neutralization, `GET /api/rescue` auth + PII-free public `GET /api/rescue/[id]`, admin `/api/upload` auth guard + SVG XSS payload rejection + PNG magic-byte upload success, cross-origin/Zod/AI disclaimer checks (using mocked `@/lib/prisma` and mocked `node:fs/promises`).
  - `tests/payment-security.test.ts` (4 tests): production mock order/verification rejection, tampered Razorpay HMAC & wrong-order-ID rejection, valid HMAC verification + duplicate `paymentId` replay block, webhook HMAC verification & idempotent capture handling (using mocked `@/lib/prisma`).
  - `tests/migration-and-utils.test.ts` (3 tests): plain-text sanitization, CSV neutralization, sliding rate limits, image magic bytes, and **live `node:sqlite` (`DatabaseSync`) dry-run test** of `runSqliteToPostgresMigration`.
- **`npx tsc --noEmit`:** Passed (`0` errors).
- **`npm run lint` (`eslint`):** Passed (`0` errors, `0` warnings).
- **`npm run build` (`prisma generate && next build`):** Passed (`0` errors; all App Router pages, API routes, robots, sitemap, and `proxy.ts` compiled cleanly).
- **`npx tsx scripts/migrate-sqlite-to-postgres.ts --dry-run`:** Verified live against `prisma/dev.db` (read `4` animals, `1` rescue case, `6` rescue status steps, `2` stories, `10` story phases).

### Explicitly `NOT VERIFIED` Locally (External Credentials / Infrastructure Required)
- **`npx prisma migrate deploy` against live PostgreSQL:** `NOT VERIFIED` locally because PostgreSQL (`psql`/`pg_ctl`/Docker) is not installed on this machine and no production PostgreSQL URI is provisioned locally.
- **Live SQLite-to-PostgreSQL data copy (`--sqlite` without `--dry-run`):** `NOT VERIFIED` against a live PostgreSQL server (dry-run reading from SQLite WAS verified).
- **Live Razorpay API checkout & live webhook delivery from Razorpay servers:** `NOT VERIFIED` end-to-end against live Razorpay servers because live `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are absent locally.
- **Live Vercel deployment & Vercel Blob file writes:** `NOT VERIFIED` (`BLOB_READ_WRITE_TOKEN` and Vercel deploy were not executed per instructions).

---

## 10. Required Vercel Environment Variables (Names Only — Do Not Commit Secrets)

Configure these in **Vercel Project Settings -> Environment Variables** before deploying:

| Variable Name | Required | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql://...`, pooled endpoint recommended with `?sslmode=require`) |
| `SESSION_SECRET` | Yes | Cryptographically random signing secret (`>= 32` chars; e.g. 64 hex chars) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical HTTPS site URL (`https://your-domain.org`) for metadata & sitemap |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Razorpay Key ID (public checkout key) |
| `RAZORPAY_KEY_ID` | Yes | Razorpay server Key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay server Key Secret for order creation & HMAC signature verification |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Razorpay Webhook signing secret for `/api/webhooks/razorpay` |
| `BLOB_READ_WRITE_TOKEN` | Recommended | Vercel Blob store token for durable image uploads on serverless functions |
| `ADMIN_SEED_EMAIL` | Initial setup | Email for bootstrapping the initial `SUPER_ADMIN` user via `npx prisma db seed` |
| `ADMIN_SEED_PASSWORD` | Initial setup | Initial password (`>= 8` chars) for seeding `SUPER_ADMIN` (remove or rotate after bootstrap) |
| `ADMIN_SEED_NAME` | Optional | Display name for initial admin account |
| `ENABLE_DEMO_PAYMENTS` | Must be `false` | Leave unset or `"false"` in production; mock payments are ignored in `NODE_ENV=production` |

---

## 11. PostgreSQL Migration & Seed Instructions

1. Provision a managed PostgreSQL database (Neon, Supabase Postgres, Vercel Postgres, or AWS RDS).
2. Set `DATABASE_URL` in your local terminal (or `.env`, never committed to Git) to the PostgreSQL connection URI.
3. Apply the schema migrations cleanly:
   ```bash
   npx prisma migrate deploy
   ```
4. Migrate existing data from `prisma/dev.db` (preview counts first, then run live upsert):
   ```bash
   npx tsx scripts/migrate-sqlite-to-postgres.ts --dry-run
   npm run db:migrate:sqlite-to-pg
   ```
5. Seed default shelters and bootstrap your initial `SUPER_ADMIN` account cleanly without hardcoded credentials:
   ```bash
   ADMIN_SEED_NAME="Ayudar Admin" ADMIN_SEED_EMAIL="your-admin@domain.org" ADMIN_SEED_PASSWORD="use-a-strong-password" npx prisma db seed
   ```

---

## 12. Razorpay Webhook Setup Instructions

1. Open **Razorpay Dashboard -> Account & Settings -> Webhooks -> Add New Webhook**.
2. Set Webhook URL to: `https://<your-production-domain>/api/webhooks/razorpay`
3. Set a strong secret value and store the exact same value in Vercel `RAZORPAY_WEBHOOK_SECRET`.
4. Subscribe to events: `payment.captured`, `order.paid`, and `payment.failed`.

---

## 13. Vercel Deployment & Production Go-Live Checklist

- [ ] Provision production PostgreSQL and verify `npx prisma migrate deploy` passes cleanly.
- [ ] Run data migration (`npm run db:migrate:sqlite-to-pg`) and verify counts in PostgreSQL.
- [ ] Bootstrap `SUPER_ADMIN` using `npx prisma db seed` with `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`, then verify login at `/login`.
- [ ] Configure all required Environment Variables in Vercel (`DATABASE_URL`, `SESSION_SECRET`, `RAZORPAY_*`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`).
- [ ] Configure Vercel Build Command (`npm run build` automatically executes `prisma generate && next build`) and deploy branch or merged main.
- [ ] Verify `/robots.txt`, `/sitemap.xml`, `/api/reports/donations` returns `401` unauthenticated, `/admin` redirects unauthenticated users to `/login`, Razorpay checkout test payment marks record `Completed` only upon valid signature/webhook, and image uploads succeed via Vercel Blob.

---

## 14. Known Limitations & Remaining Blockers

- **Rate Limiter Storage:** `lib/rate-limit.ts` uses an in-memory per-instance `Map`; in multi-region serverless traffic across concurrent Vercel instances, distributed rate limiting (e.g. Upstash Redis) is recommended for strict cross-instance enforcement.
- **Local Test DB Boundary:** All automated API/payment/action integration tests use Vitest mocks for `@/lib/prisma` and `next/headers`; final smoke verification against your provisioned PostgreSQL + Razorpay Test Mode is required before public traffic switchover.
- **GitHub Remote Push Note:** Check command output in the final chat response for whether `origin/feature/ayudar-production-upgrade` push completed automatically or needs local GitHub authentication.

---

## 15. Production Readiness Score Assessment

- **Previous Baseline (from `AYUDAR_COMPLETE_TECHNICAL_AUDIT.md`):** `46 / 100`
- **Post-Upgrade Code & Architecture Readiness:** **`92 / 100`**
  - Critical auth, PII export, Razorpay signature/webhook, CSRF/XSS upload, Server Action RBAC, PostgreSQL schema/migrations, Admin CRUD/analytics, UI accessibility/SEO, and automated security QA suite are complete and verified cleanly in build/tests.
  - Remaining `-8` points reflect external infrastructure provisioning (live PostgreSQL `migrate deploy`, Vercel Blob token, live Razorpay merchant webhook test) that must be executed in your cloud environment before merging.

---

## 16. Merge-to-Main Instructions

**Do NOT merge into `main` until all external cloud provisioning and smoke checks above pass.** Once verified and explicitly approved:

```bash
git checkout main
git pull origin main
git merge --no-ff feature/ayudar-production-upgrade
git push origin main
```
