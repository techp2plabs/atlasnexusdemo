# Prototype architecture

## Runtime shape

Nuxt 3 serves the marketing pages, browser demo workspace and two Nitro AI routes. There is no connection to `atlas-platform-core` or production Atlas Nexus authentication. Pinia owns local state; campaign, report and hierarchy fixtures are versioned in `demo/seed.mjs` and persisted to browser local storage.

```text
Browser UI ── local selectors/commands ── localStorage fixtures
     │
     └── POST /api/ai/* ── validate IDs and limits ── server-owned fixture evidence ── Gemini
```

The server reconstructs creator/channel/video evidence from its seed using allowlisted IDs. The channel directory uses a dated, rounded public snapshot of P2P Labs; campaign briefs, fit metadata and per-video records are demonstration fixtures. It does not trust client-provided statistics. AI responses are constrained to JSON and validated before returning. Gemini credentials are server-only (`GEMINI_API_KEY`); local development without a key uses sample insight mode. A production build without a key returns an unavailable response for AI actions.

## Routes

- `/` — product homepage
- `/get-started`, `/register/creator`, `/register/agency`, `/login` — local demo entry
- `/app/home`, `/app/campaigns`, `/app/campaigns/:id`
- `/app/creator-suites` and report/profiling subroutes
- `/app/hierarchy`, `/app/analytics`, `/app/account`
- `POST /api/ai/creator-fit`, `POST /api/ai/report-insight`

## Scope and limits

The in-memory AI limiter allows eight calls per client address per minute and resets with the process. This is a small demo safeguard, not a shared production rate limiter. Browser role selection is UX simulation and does not provide server authentication or protect private records. Channel identity and rounded public counters are a snapshot and may be stale; per-video records and sample insights are synthetic. Gemini output is a recommendation, not a verified audience, brand safety, revenue or campaign outcome assessment.

## Local container

The Dockerfile builds Nuxt Nitro output on Node 22 Alpine and runs the generated Node server as the unprivileged `node` user on port 8080. The Docker context excludes local secrets, tests and build artifacts. Cloud deployment setup is intentionally outside this implementation.
