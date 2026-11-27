# AYUDAR — Final Security Hardening Review

**Repository:** `https://github.com/adityam86/Animal-NGO-Website-`  
**Working Branch:** `feature/ayudar-production-upgrade`  
**Base Commit:** `00665378bc803a5bfd24e0469254a90e33178007`  
**Date:** November 27, 2026  
**Status:** All 10 Pre-Staging Security Hardening Fixes Implemented & Verified  

---

## Executive Summary

Before initiating live staging deployment and external integration verification, a comprehensive security hardening audit was performed across all critical application boundaries. All identified vulnerabilities and pre-staging risks—including citizen image privacy, EXIF/GPS data leakage, upload abuse, admin lockout denial-of-service, login timing side-channels, webhook dispute handling, and deployment bundle tracing—have been resolved with regression tests.

---

## Detailed Audit & Resolution Breakdown

### Fix 1 — Rescue Image Privacy & Access Separation
- **Vulnerability Addressed:** Sensitive rescue incident photos submitted by citizens could previously be stored in publicly accessible static web directories (`/public/uploads` or public CDN roots), risking unauthorized exposure of citizen property, surroundings, and incident details.
- **Architectural Solution:**
  - Implemented a clear separation between **public storage** (`ayudar/public/` and `/public/uploads/` for intentionally public story and animal profiles) and **private storage** (`storage/private/rescues/` and `ayudar/private/rescues/` for rescue incident photos).
  - Developed an authenticated access endpoint: `GET /api/admin/rescues/photo/[filename]`.
  - Access requires verified administrator or coordinator sessions via `requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"])`.
  - Enforced strict directory traversal and filename sanitization (`SAFE_FILENAME_RE = /^[a-zA-Z0-9_-]+\.(webp|jpg|jpeg|png)$/i`).
  - Private incident photos are served with `Cache-Control: private, no-cache, no-store, must-revalidate` and `X-Content-Type-Options: nosniff`.
  - Public citizen tracking endpoint (`GET /api/rescue/[id]`) explicitly excludes `photoUrl`.

### Fix 2 — Sharp Image Processing, Metadata Stripping & Polyglot Rejection
- **Vulnerability Addressed:** Untrusted image uploads relying only on magic-byte prefixes could allow malicious polyglots (e.g. valid JPEG/GIF headers prepended to SVG/HTML scripts), corrupted image streams causing server panics, and leakage of user geolocation through EXIF/GPS metadata.
- **Architectural Solution:**
  - Integrated `sharp` for server-side raster re-encoding (`lib/image-processing.ts`).
  - Decodes images with `failOn: "error"` to strictly reject truncated, malformed, or corrupt image streams.
  - Automatically auto-rotates pixels according to EXIF orientation via `.rotate()`, and re-encodes as clean WebP/JPEG, permanently stripping all EXIF, GPS, camera model, author, and IPTC/XMP metadata tags.
  - Enforces maximum dimension boundary (width and height $\le 4096\text{px}$) and maximum file size boundaries.
  - Implemented pre-decode scanning that strictly rejects `<svg`, `<html`, `<?xml`, `<script`, and binary executable (`MZ`, `ELF`) polyglot signatures.

### Fix 3 & 10 — Admin Login Lockout Protection & Timing Parity
- **Vulnerability Addressed:** Single email-based rate limiting allowed an unauthenticated attacker to flood login attempts for an administrator's email from any IP, locking out the legitimate administrator (targeted Denial of Service). Furthermore, varying response times between existing and nonexistent accounts created an enumeration timing side-channel.
- **Architectural Solution:**
  - Replaced the single account rate limiter with **composite IP+email throttling** (`login-composite:${ip}:${email}`, limited to 5 attempts per 15 minutes). An attacker targeting an administrator's email is blocked without locking out the administrator logging in from their legitimate connection.
  - Preserved global IP throttling (`login-ip:${ip}`, 20 attempts per 15 minutes) to protect against credential stuffing across multiple accounts.
  - Added a broad account-level safety threshold (`login-acct-broad:${email}`, 30 attempts per 15 minutes across all IPs) as a defense against large-scale distributed botnets.
  - Implemented constant-time execution parity for nonexistent or inactive accounts via `verifyDummyPassword(password)` using a static precomputed `scrypt` hash, eliminating timing side-channel account enumeration.

### Fix 4 — Rescue Upload Abuse Prevention (Signed HMAC Tokens)
- **Vulnerability Addressed:** Unauthenticated upload endpoints could be abused to flood the server or cloud storage with orphaned files.
- **Architectural Solution:**
  - Implemented cryptographic upload tokens (`lib/upload-token.ts`) signed with HMAC-SHA256 using the server session secret.
  - Tokens encode purpose (`rescue-upload`), client IP binding, unique `tokenId`, and a strict 15-minute expiration timestamp (`expiresAt`).
  - Implemented atomic token consumption via `consumeUploadToken(tokenId)` to prevent token replay attacks.
  - Created rate-limited token issuance endpoint (`POST /api/rescue/upload-token`, 12 tokens per 15 min per IP).
  - Both `app/api/rescue/upload/route.ts` and `ImageUploader` enforce and exchange signed upload tokens.

### Additional Fix 5 — GPS Coordinate Redaction in Public Tracking
- In `app/api/rescue/[id]/route.ts`, public tracking responses sanitize free-text locations by stripping exact GPS coordinates (e.g. `(GPS: 28.57021, 77.32189)`) and replacing them with `(Location coordinates logged)`, protecting citizen privacy while preserving live GPS map access for authenticated dispatchers in the admin portal.

### Additional Fix 6 — Server-Sourced Donation Receipt Amounts
- Updated `POST /api/verify-payment` to return the verified server database record amount (`amount`).
- In `app/donate/page.tsx`, the verified 80G tax receipt UI sources its amount strictly from the server verification response (`serverReceiptAmount`), preventing client-side DOM manipulation of receipt amounts.

### Additional Fix 7 — Razorpay Auto-Capture Configuration
- In `app/api/create-order/route.ts`, removed deprecated `payment_capture: 1` in `razorpay.orders.create()` following modern Razorpay API guidelines. Documented the required dashboard setting (`Settings` → `Payment Capture`) in deployment guides and staging checklists.

### Additional Fix 8 — Refund & Dispute Webhook Handling
- In `app/api/webhooks/razorpay/route.ts`, implemented safe idempotent handling for documented refund events (`refund.processed`, `refund.created`, `refund.failed`, `refund.speed_changed`).
- Distinguishes partial refunds from full refunds using cumulative `amount_refunded`: partial refunds mark status as `Partially Refunded` and never fully `Refunded`. Full refunds mark `Refunded`. Failed refunds log `RAZORPAY_REFUND_FAILED` without marking as refunded.
- Handled dispute events (`payment.dispute.created`, `payment.dispute.won`, `payment.dispute.lost`) independently. Dispute events update dispute status or log audits and never automatically change a donation to `Refunded`.

### Additional Fix 9 — Private Vercel Blob & Fail-Safe Storage Policies
- In `lib/storage.ts` and `app/api/admin/rescues/photo/[filename]/route.ts`, integrated `@vercel/blob` private access model (`put(..., { access: "private" })` and `get(..., { access: "private" })`).
- In production runtime, fails safe if persistent private storage is unavailable, strictly preventing fallback to public storage, inline data URLs, or ephemeral local files.

### Additional Fix 9 — Tracing & Gitignore Hygiene
- Updated `next.config.ts`: Changed `outputFileTracingIncludes` from `["./prisma/**/*"]` to `["./prisma/schema.prisma", "./prisma/migrations/**/*"]`, ensuring `prisma/dev.db` is strictly excluded from Vercel serverless deployment bundles.
- Updated `.gitignore` to explicitly ignore `/public/uploads` and `/storage`.

---

## Verification Test Results

### 1. Vitest Test Suite (52/52 Passed)
```
✓ tests/migration-live.test.ts (1 test)
✓ tests/payment-security.test.ts (7 tests)
✓ tests/security-auth.test.ts (6 tests)
✓ tests/migration-and-utils.test.ts (4 tests)
✓ tests/final-security-hardening.test.ts (22 tests)
✓ tests/storage-and-rate-limit.test.ts (8 tests)
✓ tests/api-privacy-uploads.test.ts (4 tests)

Test Files  7 passed (7)
Tests       52 passed (52)
Duration    17.90s
```

### 2. TypeScript Static Typecheck (`npx tsc --noEmit`)
- **Result:** Clean exit with 0 type errors.

### 3. ESLint Static Analysis (`npm run lint`)
- **Result:** Clean exit with 0 errors and 0 warnings.

### 4. Next.js Production Turbopack Build (`npm run build`)
- **Result:** Clean compilation in 26.8s, all 41 routes statically optimized and dynamically rendered with zero errors.

### 5. SQLite Migration Dry Run (`npx tsx scripts/migrate-sqlite-to-postgres.ts --dry-run`)
- **Result:** All 18 models parsed and validated with zero data corruption. `AdminSession` records intentionally skipped.

---

## Preserved Files Confirmation
The following files remain untouched and untracked:
- `prisma/dev.db` (Local SQLite database preserved)
- `AYUDAR_COMPLETE_TECHNICAL_AUDIT.md` (Original audit report preserved)
- `FINAL_CODE_REVIEW.md` (Original code review preserved)
