# Northstar Studio Backend API Contract

This is the product backend contract for the app we are actually building now — not a list of fake future endpoints.

The public landing page remains pre-login. The creator workspace is post-login/beta-access. During beta, the browser stores a generated access key and sends it as `x-northstar-user`. Later, real auth can replace that header without changing the product flow.

## Current functional API flow

### 1. Session

`GET /api/session`

Returns the beta session envelope and the implemented API catalog.

### 2. Create/read/update/delete workspace

`POST /api/workspaces`

Input:

```json
{
  "inputs": {
    "handle": "@creator",
    "niche": "Beauty & skincare",
    "platform": "Both",
    "competitors": "@one, @two",
    "monetizationGoal": "$10k/month through brand deals",
    "brandCategories": "SPF, skincare, wellness",
    "contentStyle": "Warm authority, quick demos"
  }
}
```

Behavior:

- validates onboarding inputs
- generates creator profile, trends, competitor gaps, ideas, audience needs, brand ideas, and sprint plan
- persists to Supabase `creator_workspaces` when env vars/table exist
- returns the generated workspace even in local fallback mode

`GET /api/workspaces`

Returns the saved workspace for the access key when Supabase is configured.

`PATCH /api/workspaces`

Updates active idea and sprint task status. Can work from a saved workspace or an explicit `workspace` payload, so the frontend remains functional during local/dev fallback.

`DELETE /api/workspaces`

Deletes the saved workspace when Supabase is configured.

### 3. Product resources derived from workspace

These are functional derived resources, not placeholders. Each accepts either a saved workspace context or explicit `workspace` payload.

- `GET/POST /api/ideas` — scored idea bank
- `GET/POST/PATCH /api/briefs` — active brief and markdown export
- `GET/PATCH /api/sprints` — sprint board and task progress
- `GET/POST /api/calendar` — publishing calendar from sprint/tasks
- `GET/PATCH /api/brands` — brand pipeline and outreach angles
- `GET/POST /api/analytics` — imported performance snapshot and recommendation loop

### 4. Supporting resources

- `GET/POST/PATCH /api/creators` — creator profile derived from the workspace
- `GET /api/integrations` — Instagram/TikTok/Supabase readiness state
- `POST /api/waitlist` — public beta/waitlist capture

## Supabase persistence

The current working persistence path is `creator_workspaces`, because the app needs one reliable document-style workspace first. The schema also includes normalized tables for the next phase, but the frontend does not depend on them yet.

Primary working table:

- `creator_workspaces`

Supporting/future normalization tables:

- `creator_profiles`
- `creator_integrations`
- `content_ideas`
- `content_briefs`
- `sprint_tasks`
- `calendar_items`
- `brand_opportunities`
- `performance_snapshots`

All tables have RLS enabled. The frontend must call Vercel APIs only; the Supabase service role key stays server-side.
