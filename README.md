# 🇺🇸 1776 CrossFit Surmount Challenge Tracker

A mobile-first **Progressive Web App** for tracking the 1776 CrossFit Surmount
Challenge: accumulate **1,776 reps** across push-ups, sit-ups, and air squats
between **June 1 – July 4, 2026**.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, NextAuth.js v5
(Google sign-in), and Supabase (PostgreSQL). Deploys to Vercel.

Features: Google login, a circular progress ring, pace tracking, logging
streaks, badges, an editable log history, and a leaderboard. Installable to the
iPhone Home Screen — no App Store required.

---

## 📋 What you'll set up

You don't need to be a developer to follow this. You'll create three free
accounts and copy a handful of values between them:

1. **Google Cloud** – so people can "Sign in with Google".
2. **Supabase** – the database that stores users and reps.
3. **Vercel** – hosts the website and gives you a public link.

Set aside ~30–45 minutes the first time. ☕

---

## 🧰 Prerequisites

- A **GitHub account** (free) — Vercel deploys from here.
- [Node.js 18.18+](https://nodejs.org) installed **only if** you want to run the
  app on your own computer first. You can skip this and deploy straight to
  Vercel if you prefer.

---

## 1. Get the code onto GitHub

1. Create a new **empty** repository on [GitHub](https://github.com/new) (e.g.
   `crossfit-surmount-challenge`). Don't add a README — this project has one.
2. Upload this project's files to that repository. If you have the project on
   your computer and have `git` installed:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

   (Or use GitHub Desktop / drag-and-drop upload if you're not comfortable with
   the command line.)

---

## 2. Create the Supabase project & database

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in.
2. Click **New project**. Pick a name, set a strong **database password**
   (save it somewhere), choose the region closest to your gym, and create it.
3. Wait ~2 minutes for it to provision.
4. In the left sidebar, open **SQL Editor** → **New query**.
5. Open the file `supabase/migrations/001_initial.sql` from this project, copy
   **all** of its contents, paste it into the query box, and click **Run**.
   You should see "Success. No rows returned." This creates the `users` and
   `rep_entries` tables.
6. Now grab your API keys. Go to **Project Settings** (gear icon) → **API**:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → `anon` `public`** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys → `service_role` `secret`** → this is
     `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep this private — never share it)

> **Why a service role key?** This app reads and writes the database only from
> the server, using the service role key. Row Level Security is enabled on both
> tables and no public policies are added, so the browser-exposed `anon` key
> can't touch your data directly.

---

## 3. Create the Google OAuth app (for "Sign in with Google")

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. At the top, click the project dropdown → **New Project**, name it (e.g.
   "Surmount Challenge"), and create it. Make sure it's selected.
3. In the search bar, go to **APIs & Services → OAuth consent screen**:
   - Choose **External**, click **Create**.
   - App name: `1776 Surmount Challenge`. Add your email for the support and
     developer contact fields. Save and continue through the steps.
   - On **Test users**, you can add your gym members' Google emails so they can
     log in while the app is in "Testing" mode — or click **Publish app** to
     allow anyone. (Publishing a simple sign-in app needs no Google review.)
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Name: `Surmount Web`.
   - **Authorized JavaScript origins**, add:
     - `http://localhost:3000` (for local testing)
     - `https://YOUR-APP.vercel.app` (your live URL — you can add this after
       Step 4 once you know it)
   - **Authorized redirect URIs**, add:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://YOUR-APP.vercel.app/api/auth/callback/google`
   - Click **Create**. Copy the **Client ID** (→ `GOOGLE_CLIENT_ID`) and
     **Client secret** (→ `GOOGLE_CLIENT_SECRET`).

> You can come back and add the real Vercel URLs after Step 4. Just remember:
> **Google sign-in won't work until the live redirect URI is added here.**

---

## 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub.
2. **Add New… → Project** → **Import** your GitHub repository.
3. Vercel auto-detects Next.js. Before clicking Deploy, expand
   **Environment Variables** and add all of the following (see the table below).
4. Click **Deploy**. After ~1 minute you'll get a URL like
   `https://your-app.vercel.app`.
5. Go back to **Step 3** and add that URL (origin + `/api/auth/callback/google`
   redirect) to your Google OAuth credentials. Also update `NEXTAUTH_URL` in
   Vercel to your live URL and **redeploy** (Deployments → ⋯ → Redeploy).

### Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (and in a
local `.env.local` file if running on your machine — copy `.env.example`):

| Variable | Where it comes from |
|---|---|
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in a terminal, or use any 32+ char random string. |
| `NEXTAUTH_URL` | Your app's URL. Local: `http://localhost:3000`. Production: `https://your-app.vercel.app`. |
| `GOOGLE_CLIENT_ID` | Google Cloud → Credentials (Step 3). |
| `GOOGLE_CLIENT_SECRET` | Google Cloud → Credentials (Step 3). |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role secret. |

---

## 5. (Optional) Connect a custom domain

1. In Vercel: **Project → Settings → Domains → Add**, type your domain (e.g.
   `challenge.yourgym.com`), and follow the DNS instructions (add the CNAME or
   A record Vercel shows you at your domain registrar).
2. Once the domain is verified, update:
   - `NEXTAUTH_URL` in Vercel → your custom domain, then **redeploy**.
   - Google OAuth credentials (Step 3) → add the custom domain origin and the
     `/api/auth/callback/google` redirect URI.

---

## 💻 Running locally (optional)

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open <http://localhost:3000>. The PWA service worker only runs in a production
build (`npm run build && npm start`), which is expected.

---

## 📱 Installing on an iPhone

Open the live URL in **Safari**, tap the **Share** button, then **Add to Home
Screen**. The app gets an icon and launches full-screen like a native app. A
gentle reminder banner also appears in-app the first time.

---

## 🏅 How things are calculated

- **Pace:** the challenge runs 34 days. Your "on-pace" target on a given day is
  `1,776 × (days elapsed ÷ 34)`, rounded. The dashboard shows how many reps
  you're ahead or behind that target.
- **Streak:** consecutive calendar days with at least one logged entry, counting
  back from today. If you haven't logged *today* yet, the streak still counts
  from yesterday so you don't lose it prematurely.
- **Badges:** 🛋️ Off the Couch (444), 🌶️ Getting Spicy (888), 🚀 Send It
  (1,332), 🦅 Freedom Fighter (1,776), 💪 No Excuses (all three movements),
  🔥 Beast Mode (7-day streak).

---

## 🛠️ Tech & architecture notes

- **Database access** is server-only via the Supabase service-role client
  (`src/lib/db.ts`). Mutations are Next.js **server actions** (`src/app/actions.ts`)
  that re-authenticate, validate, write, and revalidate the affected pages.
- **Auth** uses NextAuth v5 with a split config: `auth.config.ts` is the
  edge-safe base used by `middleware.ts` for route protection, while `auth.ts`
  adds the database upsert on first login.
- **Icons** are generated from scratch by `scripts/generate-icons.mjs` (run
  `npm run generate-icons`) — no binary assets are checked in beyond the output.

## 📂 Project structure

```
src/
  app/
    layout.tsx            Root layout, PWA metadata, toast provider
    page.tsx              Redirects to /dashboard or /login
    login/page.tsx        Login screen
    dashboard/page.tsx    Main screen: ring, pace, streak, badges, quick-add
    history/page.tsx      Log history (edit / delete)
    leaderboard/page.tsx  Ranked leaderboard with tabs
    actions.ts            Server actions (add / update / delete reps)
    api/auth/[...nextauth]/route.ts
  components/             ProgressRing, BadgeGrid, QuickAddForm, Leaderboard, …
  lib/                    challenge constants, stats, badges, db, supabase
  auth.ts / auth.config.ts / middleware.ts
supabase/migrations/001_initial.sql
public/                  manifest.json, sw.js, icons/
```
