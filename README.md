# Northstar Studio MVP

A Vite + React local MVP for Northstar Studio, an AI management product for short-form creators. Creator onboarding generates a mock Creator Brain, trend and competitor signals, ten production-ready video briefs, performance predictions, audience insights, brand-deal suggestions, and a Monday–Friday sprint. The generation is deterministic mock logic—there is no AI API or backend.

## Local data behavior

The app intentionally stores data in the current browser's `localStorage`:

- `agentic.creator.workspace.v1` contains the latest generated Creator Brain and dashboard output.
- `agentic.creator.betaLeads.v1` contains locally submitted beta/waitlist leads and powers the saved-lead count.
- **Load sample** replaces the current workspace with sample creator data.
- **Reset** clears the generated workspace and onboarding fields, but leaves saved beta leads intact.

Data is device- and browser-profile-specific. Clearing site data or using a private browsing session removes it. Nothing is sent to a server.

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
