# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CPA Loft** is a SaaS platform for Certified Public Accountants. It provides AI-assisted tax/accounting chat, client management, document storage, tax deadline tracking, and a branded client portal for document upload.

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server (localhost:3000)

# Build (Vercel production — runs prisma generate + db push + next build)
npm run build

# Database
npm run db:push          # Push Prisma schema changes to the DB (no migration file)
npm run db:studio        # Open Prisma Studio GUI

# Lint
npm run lint
```

> **Local dev database:** SQLite (`file:./dev.db`). `.env` is read by Prisma CLI; `.env.local` is read by Next.js at runtime. Both point to `dev.db` locally. In production, both point to Supabase PostgreSQL (pooler URL for runtime, direct URL for migrations).

## Architecture

### Route Groups & Pages

| Path | Description |
|---|---|
| `app/(auth)/` | CPA sign-in, sign-up, verify email, forgot password |
| `app/(dashboard)/dashboard/` | All CPA-facing pages (AI chat, clients, documents, deadlines, billing, settings) |
| `app/portal/` | Client portal — login, register, main page (file upload + document requests) |
| `app/help/` | Public help/FAQ page (auth-aware nav) |
| `app/resources/` | Printable onboarding guides (CPA guide, team guide) |

The dashboard uses a shared layout (`app/(dashboard)/layout.tsx`) that enforces `role === "cpa"` — clients are redirected to `/portal`.

### Auth & Role System

NextAuth v4 with JWT strategy (`lib/auth.ts`). The JWT carries `id`, `role`, and `plan`. Two roles:

- **`cpa`** — main dashboard users. Must verify email before login.
- **`client`** — portal-only users created via invite token. `emailVerified` is not required.

Middleware (`middleware.ts`) enforces routing:
- Unauthenticated → `/portal/login` (with `?cpa=userId` preserved for branding)
- CPA hitting `/portal` → `/portal/login?notice=cpa` (allows client to sign in without CPA losing their session)
- Client hitting `/dashboard` → `/portal`

### Plans & Gating

Three tiers defined in `lib/utils.ts` (`PLANS` constant): `free`, `pro`, `premium`.

- `lib/plan-gate.ts` exports `requirePro(plan)` and `requirePremium(plan)` — call at the top of API route handlers, return early if they return a response.
- `checkPlanLimit("clients" | "documents", plan, count)` — use before creating resources.
- Limits: Free (3 clients, 5 docs), Pro (50 clients, 100 docs), Premium (unlimited).
- **Premium-only features:** portal branding (firm logo + display name in portal login/emails), custom branding in client-facing emails.

### File Storage (`lib/blob.ts`)

- **Production:** Vercel Blob with `access: "private"` (the store is private — public access will error).
- **Local dev:** written to `public/uploads/`.
- All blobs are served through `GET /api/documents/[id]/download` (authenticates, then proxies with Bearer token). Never expose raw blob URLs to the browser.
- `uploadFile(folder, filename, buffer, contentType)` — unified upload helper.
- `fetchBlobContent(blobUrl)` — server-side fetch with auth token, used to proxy blobs and to convert logos to base64 data URLs for `<img>` tags.

### Email (`lib/email.ts`, `lib/email-branding.ts`)

- Nodemailer over SMTP (`SMTP_HOST/USER/PASS/PORT/FROM`).
- `getEmailBranding(userId, plan)` — returns `{ logoUrl, displayName }` for premium users. `logoUrl` points to `GET /api/logo/[userId]` (public, no auth, for email clients).
- All 5 client-facing email functions accept an optional `branding?: EmailBranding` last argument. Pass the result of `getEmailBranding` from the calling API route.
- Client-facing emails: `sendClientInviteEmail`, `sendClientWelcomeEmail`, `sendDocumentTaggedEmail`, `sendClientWelcomeBackEmail`, `sendDocumentRequestEmail`.
- CPA-facing emails (no branding): `sendVerificationEmail`, `sendPasswordResetEmail`, `sendDeadlineReminderEmail`, `sendPracticeDigestEmail`.

### AI Assistant (`lib/anthropic.ts`)

Anthropic SDK, streaming via `streamChatResponse()`. System prompt is `CPA_SYSTEM_PROMPT` (CPA-domain expert). Model: `claude-sonnet-4-5`. AI usage is tracked per user in the `AiUsage` table. The `AiUsage` count gates free/pro limits.

### Stripe Billing (`lib/stripe.ts`)

Lazy singleton — `stripe` is a Proxy that only instantiates `new Stripe()` at runtime, not at build time. Use `stripe.xxx` as normal. Webhooks are at `POST /api/webhooks` and update `User.plan` and subscription fields.

### Client Portal Flow

1. CPA adds a client → optionally sends invite email with a token URL (`/portal/register?token=xxx`).
2. Client registers at `/portal/register` — creates a `User` with `role: "client"`, links to `Client.portalUserId`.
3. Client logs in at `/portal/login` — if `?cpa=userId` is in the URL, the page fetches `/api/portal/public-branding?cpa=userId` and shows the CPA's logo/name.
4. Client uploads documents via `POST /api/portal/upload` — stored as blobs owned by the CPA user.
5. CPA sees uploaded docs in their dashboard; documents link to client records.

Portal links in all client notification emails include `?cpa={cpaUserId}` so the login page can show the CPA's branding.

### PDF / Document Analysis

`pdfjs-dist`, `canvas`, and `tesseract.js` are declared as `serverExternalPackages` in `next.config.ts` so webpack does not bundle them. PDF extraction happens server-side in `lib/pdf-extract.ts`. The AI analyze route (`POST /api/documents/[id]/analyze`) fetches the blob server-side via `fetchBlobContent`, extracts text, and creates a new Chat with the content pre-loaded.

### Key API Route Patterns

- All routes call `getServerSession(authOptions)` and check `session?.user?.id` first.
- Plan gates go immediately after the auth check, before any DB work.
- Upload routes log detailed errors with `[route/name]` prefix and return `{ error, detail }` on 500.
- `getAppUrl()` from `lib/utils.ts` must be used anywhere a full URL is constructed — it strips trailing slashes from env vars.
- Activity logging via `logActivity()` (`lib/activity.ts`) is fire-and-forget (wrapped in try/catch).

## Required Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase pooler URL (port 6543, `?pgbouncer=true`) for runtime |
| `DIRECT_URL` | Supabase direct URL (port 5432) for Prisma CLI migrations |
| `NEXTAUTH_URL` | Full app URL (no trailing slash) |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `NEXT_PUBLIC_APP_URL` | Public app URL — used by `getAppUrl()` |
| `SMTP_HOST/PORT/USER/PASS/FROM` | SMTP credentials for transactional email |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRO_PRICE_ID` / `STRIPE_PREMIUM_PRICE_ID` | Stripe price IDs |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (auto-added by Vercel when blob store is connected) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) |

## Onboarding Components

- `components/onboarding/WelcomeModal.tsx` — first-login modal, shown once per browser (sessionStorage flag `cpaloft_welcome_seen`).
- `components/onboarding/OnboardingChecklist.tsx` — dashboard widget with step completion tracked in localStorage (`cpaloft_onboarding_steps`). Dismiss calls `PATCH /api/onboarding`.
