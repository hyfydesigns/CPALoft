# CPA Loft

> Your accounting, elevated.

An AI-powered SaaS platform built for Certified Public Accountants. Combines Claude AI with document management, client tracking, and a secure client upload portal — all in one professional workspace.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Auth:** NextAuth v4 (JWT, credentials)
- **Database:** Prisma ORM + SQLite
- **AI:** Anthropic Claude (`claude-sonnet-4-5`)
- **UI:** Tailwind CSS + shadcn/ui (Radix)
- **File Uploads:** react-dropzone

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/hyfydesigns/CPALoft.git
cd CPALoft
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env.local`

Create a file named `.env.local` in the project root with the following contents:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-at-least-32-characters-long"

# Anthropic AI — get your key at https://console.anthropic.com
ANTHROPIC_API_KEY="sk-ant-api03-..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="CPA Loft"

# SMTP — Email verification
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="CPA Loft <noreply@cpaloft.com>"
```

> **Never commit `.env.local`** — it is already in `.gitignore`.

#### Where to get the keys

| Variable | Where to get it |
|---|---|
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in your terminal |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `SMTP_HOST` | Your SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_USER` | Your SMTP username / email address |
| `SMTP_PASS` | Your SMTP password or App Password |

> **Gmail tip:** Enable 2FA on your Google account, then go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) and create an App Password. Use that as `SMTP_PASS`.

> **No SMTP?** If SMTP is not configured, the app still works — verification links are printed to the server console so you can test locally without sending real emails.

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Seed demo data (optional)

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

This creates a demo CPA account:
- **Email:** `demo@cpaloft.com`
- **Password:** `demo1234`

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

- **AI Tax Assistant** — Streaming Claude AI with deep CPA knowledge (tax law, GAAP, IFRS, audit standards)
- **Document Management** — Upload, preview, and organise client documents with drag-and-drop
- **Client Management** — Full CRM for tracking clients, status, and notes
- **Client Upload Portal** — Generate secure invite links so clients can upload files directly to you
- **Billing & Plans** — Free / Pro ($49/mo) / Premium ($149/mo) tier system
- **Help Centre** — Searchable FAQ across 6 categories

---

## Project Structure

```
app/
  (auth)/           # Login & signup pages
  (dashboard)/      # Protected CPA dashboard
    dashboard/
      ai-assistant/ # Claude AI chat
      billing/      # Plan management
      clients/      # Client CRM
      documents/    # File management
      settings/     # Account settings
  api/              # Route handlers
    chat/           # AI streaming endpoint
    clients/        # Client CRUD
    documents/      # Document CRUD
    portal/         # Client portal invite & upload
  help/             # Public help/FAQ page
  page.tsx          # Public landing page
  portal/           # Client-facing upload portal

components/
  dashboard/        # Sidebar, header
  ui/               # shadcn/ui + Logo system

lib/
  anthropic.ts      # Anthropic client + system prompt
  auth.ts           # NextAuth config
  db.ts             # Prisma client
  utils.ts          # Helpers + PLANS config

prisma/
  schema.prisma     # DB schema
  seed.ts           # Demo data seeder
```

---

## Demo Credentials

| Field | Value |
|---|---|
| Email | `demo@cpaloft.com` |
| Password | `demo1234` |

---

## License

MIT
