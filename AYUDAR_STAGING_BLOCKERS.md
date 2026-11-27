# AYUDAR — Staging Blockers

**Purpose:** Prioritized list of items that must be resolved before the `feature/ayudar-production-upgrade` branch can be merged to `main` and deployed to production.

---

## Priority 1 — BLOCKED (Requires External Credentials)

These items cannot be validated without provisioning external staging services.

| # | Blocker | Required Action | Risk if Skipped |
|:--|:--------|:----------------|:----------------|
| 1 | **Staging PostgreSQL not provisioned** | Provision a PostgreSQL instance and run `npx prisma migrate deploy` + `scripts/migrate-sqlite-to-postgres.ts` | Schema/FK/data issues discovered only in production |
| 2 | **Razorpay Test Mode not configured** | Set up Test Mode keys + webhook endpoint | Payment capture, webhook handling, and `"authorized"` rejection untested against live API |
| 3 | **Vercel Blob store not provisioned** | Create Blob store and set `BLOB_READ_WRITE_TOKEN` | Image uploads will fall back to inline data URLs or local FS (broken on Vercel's read-only FS for files > 2 MB) |
| 4 | **Upstash Redis not provisioned** | Create Redis database and set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting operates per-instance only (fail-open across serverless instances) |
| 5 | **`SESSION_SECRET` not generated** | Generate cryptographically random ≥ 32 char secret | Sessions will fail to sign/verify in production |

---

## Priority 2 — Code-Level Security Risks (Documented, Not Yet Fixed)

These are known risks identified during the five-track audit. They do not block staging deployment but should be addressed before production launch.

| # | Severity | Issue | File(s) | Recommended Fix |
|:--|:---------|:------|:--------|:----------------|
| 1 | **HIGH** | Rescue photos stored with `access: "public"` (EXIF GPS, bystander images on public CDN) | `lib/storage.ts:27` | Use `access: "private"` for `"rescue"` prefix + authenticated admin proxy route |
| 2 | **HIGH** | No EXIF/GPS metadata stripping on any uploaded image | `lib/storage.ts`, `app/api/upload/route.ts`, `app/api/rescue/upload/route.ts` | Install `sharp` and re-encode uploads server-side |
| 3 | **HIGH** | `/api/login` rate limit fail-open allows distributed brute-force when Redis unavailable | `lib/rate-limit.ts`, `app/api/login/route.ts` | DB-backed failed-attempt counter or fail-closed for login |
| 4 | **HIGH** | Targeted admin lockout DoS via `login-acct:${email}` (8/15min, email-only key) | `app/api/login/route.ts:48` | Composite `ip+email` key with higher global email threshold + alerting |
| 5 | **MEDIUM** | Unauthenticated `POST /api/rescue/upload` can orphan files in Blob storage | `app/api/rescue/upload/route.ts` | Require CAPTCHA or link upload to pending rescue case token |
| 6 | **MEDIUM** | No refund/dispute/chargeback webhook handling | `app/api/webhooks/razorpay/route.ts` | Handle `refund.created`, `payment.refunded`, dispute events |
| 7 | **MEDIUM** | `create-order` does not pass `payment_capture: 1` (relies on dashboard setting) | `app/api/create-order/route.ts:84` | Add `payment: { capture: "automatic" }` to `orders.create` |
| 8 | **MEDIUM** | Donation receipt UI reads client React state instead of server-confirmed amount | `app/donate/page.tsx:236-240` | Display `result.donation.amount` from server response |
| 9 | **MEDIUM** | `GET /api/rescue/[id]` exposes exact GPS coordinates publicly via `location` field | `app/api/rescue/[id]/route.ts:36` | Redact or coarsen GPS coordinates in public tracking response |
| 10 | **MEDIUM** | Magic-byte-only validation (12 bytes) accepts polyglot/truncated files | `lib/security.ts:76-133` | Re-encode uploads with `sharp` to strip payloads beyond image data |
| 11 | **LOW** | `outputFileTracingIncludes: ["./prisma/**/*"]` could ship `prisma/dev.db` to Vercel | `next.config.ts:42` | Add `prisma/dev.db` to `.vercelignore` or refine glob |
| 12 | **LOW** | `public/uploads` not in `.gitignore` | `.gitignore` | Add `public/uploads/` to `.gitignore` |
| 13 | **LOW** | Login timing side-channel (missing user skips `scrypt` verification) | `app/api/login/route.ts:60-61` | Execute dummy `scrypt` when user is null/inactive |

---

## Priority 3 — Operational Prerequisites

| # | Item | Status |
|:--|:-----|:-------|
| 1 | Vercel project linked and Preview environment configured | NOT DONE |
| 2 | Vercel CLI installed locally | NOT INSTALLED |
| 3 | `gh` CLI for PR creation | NOT INSTALLED |
| 4 | Legacy MVP credentials rotated on any seeded database | PENDING |
| 5 | Razorpay auto-capture verified in dashboard settings | PENDING |
| 6 | Webhook URL registered in Razorpay dashboard | PENDING |

---

## Merge Recommendation

**Do not merge to `main`** until:
1. All Priority 1 blockers are resolved (staging credentials provisioned and smoke-tested).
2. Priority 2 items #1–4 (HIGH severity) are addressed or explicitly accepted by the project owner.
3. The staging environment checklist (Phases 1–5) is completed with passing results.

Once staging validates cleanly, the branch is ready for merge review.
