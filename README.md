# Northstar Studio

A premium creator-ops product for Instagram/TikTok short-form creators. The public landing page drives beta demand; the post-login workspace turns creator inputs into a practical operating system: positioning, video ideas, production briefs, weekly sprint, calendar, brand pipeline, and performance loops.

## Product architecture

### Pre-login

- Public landing page
- Beta/waitlist capture through `/api/waitlist`
- Product positioning and sample output

### Post-login / beta workspace

The current beta uses a local `x-northstar-user` access key stored in the browser. Real auth can replace this later without changing the domain APIs.

Functional APIs are documented in `docs/backend-api-contract.md`:

- `/api/session`
- `/api/workspaces`
- `/api/ideas`
- `/api/briefs`
- `/api/sprints`
- `/api/calendar`
- `/api/brands`
- `/api/analytics`
- `/api/creators`
- `/api/integrations`

These endpoints are not placeholders: tests call the route handlers and verify workspace generation, sprint updates, idea/brand/analytics resources, and server-side brief export.

## Data behavior

Frontend local fallback:

- `northstar.workspace.access.v1` stores the beta access key.
- `agentic.creator.workspace.v1` mirrors the latest generated workspace for smooth local/dev behavior.
- `agentic.creator.betaLeads.v1` keeps a local confirmation copy of submitted beta/waitlist leads.

Server persistence:

- `/api/waitlist` writes waitlist leads to Supabase.
- Product APIs write/read `creator_workspaces` when Supabase env vars and tables are configured.
- The frontend still works in local fallback mode when Supabase is not configured.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/waitlist.sql`.
3. In Vercel, add these environment variables for Production/Preview/Development:

```txt
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[REDACTED]
```

Use the **service role** key only as a Vercel server-side environment variable. Do not expose it in frontend code or commit it to git.

4. Redeploy the Vercel project.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Quality checks

```bash
npm test
npm run lint
npm run build
npm run preview
```
