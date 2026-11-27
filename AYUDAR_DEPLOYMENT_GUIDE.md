# AYUDAR — Deployment Guide (Staging & Production)

This guide documents the operational procedures for provisioning, deploying, and maintaining the AYUDAR Animal Welfare web platform on Vercel with PostgreSQL, Razorpay, and Upstash Redis.

---

## 1. Architecture & Services Overview

| Service | Staging Environment | Production Environment | Role |
|---|---|---|---|
| **Web Hosting** | Vercel (Preview Branch) | Vercel (Production Domain) | Next.js 16 (Turbopack, SSR, API routes) |
| **Relational Database** | Managed PostgreSQL (Neon / Supabase / RDS) | Managed PostgreSQL with automated backups | Application state, transactions, audit logs |
| **Payment Gateway** | Razorpay Test Mode | Razorpay Live Mode | INR donations, 80G tax receipts, sponsorships |
| **Public Storage** | Vercel Blob (Staging Store) | Vercel Blob (Production Store) | Public animal gallery, adoption profiles, blog images |
| **Private Storage** | Private S3 / Cloudflare R2 | Private S3 / Cloudflare R2 | Citizen rescue incident photos (authenticated access) |
| **Rate Limiter / Cache** | Upstash Redis REST | Upstash Redis REST | Distributed IP & account rate limiting |

---

## 2. Environment Variables Specification

All sensitive credentials must be set in the Vercel Project Dashboard (`Settings` → `Environment Variables`). **Never commit production credentials to Git.**

| Variable Name | Required Scope | Purpose | Example / Notes |
|---|---|---|---|
| `DATABASE_URL` | Preview & Production | Pooled PostgreSQL connection string for runtime queries | `postgresql://user:pass@ep-pooler.region.neon.tech/ayudar_db?sslmode=require` |
| `DIRECT_URL` | Preview & Production | Direct session PostgreSQL connection for migrations | `postgresql://user:pass@ep-direct.region.neon.tech/ayudar_db?sslmode=require` |
| `SESSION_SECRET` | Preview & Production | HMAC signing key for JWT admin session tokens (min 32 chars) | Generated via `crypto.randomBytes(48).toString('hex')` |
| `NEXT_PUBLIC_SITE_URL` | Preview & Production | Canonical site URL for SEO sitemaps, OpenGraph, and CORS | Staging: `https://staging.ayudar.org`, Prod: `https://ayudar.org` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Preview & Production | Razorpay public key for client-side checkout modal | Staging: `rzp_test_...`, Prod: `rzp_live_...` |
| `RAZORPAY_KEY_ID` | Preview & Production | Razorpay secret API key ID | Staging: `rzp_test_...`, Prod: `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Preview & Production | Razorpay secret API key secret for verification | Staging: test secret, Prod: live secret |
| `RAZORPAY_WEBHOOK_SECRET` | Preview & Production | Webhook signing secret configured in Razorpay dashboard | Staging: `whsec_test_...`, Prod: `whsec_live_...` |
| `BLOB_READ_WRITE_TOKEN` | Preview & Production | Vercel Blob token for public animal and story images | Provided automatically when linking Vercel Blob store |
| `PRIVATE_STORAGE_BUCKET` | Preview & Production | Private S3 / Cloudflare R2 bucket for rescue photos | `ayudar-rescue-private-staging` |
| `PRIVATE_STORAGE_ENDPOINT` | Preview & Production | S3 API endpoint URL (for R2 / MinIO) | `https://<account-id>.r2.cloudflarestorage.com` |
| `PRIVATE_STORAGE_ACCESS_KEY`| Preview & Production | S3 access key ID for private bucket | Secret key ID |
| `PRIVATE_STORAGE_SECRET_KEY`| Preview & Production | S3 secret access key for private bucket | Secret key |
| `UPSTASH_REDIS_REST_URL` | Preview & Production | Upstash Redis REST URL for distributed rate limiting | `https://<db>.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Preview & Production | Upstash Redis REST bearer token | Secret token |
| `ENABLE_DEMO_PAYMENTS` | Preview & Production | Opt-in flag for simulated payment IDs | **MUST BE `"false"` IN STAGING AND PRODUCTION** |
| `ADMIN_SEED_EMAIL` | Staging Seed Only | Bootstrap admin email address | `admin@ayudar.org` |
| `ADMIN_SEED_PASSWORD` | Staging Seed Only | Bootstrap admin password (hashed with scrypt) | Unique, high-entropy password |

---

## 3. Staging Deployment Procedure

### Step 1: External Account Provisioning
1. **PostgreSQL:** Create a disposable staging database on Neon, Supabase, or AWS RDS. Record `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).
2. **Upstash Redis:** Create an Upstash Redis database. Record REST URL and Token.
3. **Razorpay Test Mode:** In Razorpay Dashboard, activate Test Mode. Obtain API Keys and set a Webhook Secret.
4. **Private S3 / R2 Bucket:** Create a private bucket (no public read policy). Obtain access keys.

### Step 2: Configure Vercel Preview Environment
1. In Vercel Project Settings, add all staging environment variables scoped to **Preview**.
2. Verify that `ENABLE_DEMO_PAYMENTS` is set to `"false"`.

### Step 3: Run Database Migrations on Staging
1. Apply the Prisma schema migration to staging PostgreSQL:
   ```bash
   npx prisma migrate deploy
   ```
2. Run the SQLite data migration against staging PostgreSQL:
   ```bash
   npx tsx scripts/migrate-sqlite-to-postgres.ts --sqlite prisma/dev.db
   ```
3. Run the admin user seed script to bootstrap the initial admin account:
   ```bash
   npx prisma db seed
   ```

### Step 4: Validate Staging Endpoints
1. Log in to `/admin` with the seeded admin account.
2. Verify session creation, session cookie properties (`HttpOnly`, `SameSite=Lax`, `Secure`), and audit logs.
3. Submit a test rescue case with an incident photo at `/rescue`.
4. Verify that the incident photo is accessible only in the admin portal (`/api/admin/rescues/photo/[filename]`) and returns HTTP 401 when unauthenticated.
5. Initiate a donation with Razorpay Test Mode card (`4111 1111 1111 1111`) and verify server-side verification and receipt display.

---

## 4. Production Promotion Procedure

**Rules for Merging into `main`:**
1. Staging smoke tests must pass 100%.
2. Real PostgreSQL database migration must complete with zero errors.
3. Real Razorpay Test Mode transactions must verify and trigger webhooks.
4. Production secrets must be configured in Vercel scoped to **Production**.

**Promotion Steps:**
1. Open a Pull Request from `feature/ayudar-production-upgrade` to `main`.
2. Ensure Vercel Preview deployment passes all automated checks.
3. Execute standard fast-forward or squash merge into `main`.
4. Monitor Vercel Production deployment logs.
5. Run health checks:
   - Check `/robots.txt` and `/sitemap.xml`.
   - Verify `/donate`, `/rescue`, `/animals`, and `/login`.

---

## 5. Rollback & Emergency Plan

- **Vercel Rollback:** If a deployment fails in production, use the Vercel Dashboard → `Deployments` → Select previous stable deployment → Click `Instant Rollback`.
- **Database Backup:** Ensure point-in-time recovery (PITR) is enabled on the managed PostgreSQL database before applying production migrations.
- **Fail-Closed Security:** Sensitive routes (`/api/login`, `/api/rescue/upload`) fail closed with HTTP 503 if Redis experiences an outage in production, protecting the application from brute-force during infrastructure degradation.
