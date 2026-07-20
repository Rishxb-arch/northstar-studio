# Northstar Studio MVP

A Vite + React local MVP for Northstar Studio, an AI management product for short-form creators. Creator onboarding generates a mock Creator Brain, trend and competitor signals, ten production-ready video briefs, performance predictions, audience insights, brand-deal suggestions, and a Monday–Friday sprint. The generation is deterministic mock logic—there is no AI API or backend.

## Data behavior

The app intentionally stores data in the current browser's `localStorage`:

- `agentic.creator.workspace.v1` contains the latest generated Creator Brain and dashboard output.
- `agentic.creator.betaLeads.v1` keeps a local confirmation copy of submitted beta/waitlist leads and powers the local saved-lead count.
- **Load sample** replaces the current workspace with sample creator data.
- **Reset** clears the generated workspace and onboarding fields, but leaves saved beta leads intact.

Creator workspaces are device- and browser-profile-specific. Public beta applications are submitted to `/api/waitlist`, which writes to Supabase when the required Vercel environment variables are configured.

## Waitlist tracking with Supabase

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/waitlist.sql`.
3. In Vercel, add these environment variables for Production/Preview/Development:

```txt
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[REDACTED]
```

Use the **service role** key only as a Vercel server-side environment variable. Do not expose it in frontend code or commit it to git.

4. Redeploy the Vercel project.
5. New waitlist submissions will appear in Supabase → Table Editor → `waitlist`.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Quality checks

```bash
npm run lint
npm run build
npm run preview
```
