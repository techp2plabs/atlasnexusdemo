# Atlas Nexus — Creator Partnership Demo

A Nuxt 3 prototype for creator campaign matching, Creator Suites, network hierarchy, and public YouTube statistics. Business data is sample data stored in the current browser; this app does not connect to the existing Atlas Nexus backend.

## Live demo

The app is deployed on Google Cloud Run in the **Atlas Technology** GCP project (`atlas-technology`), in region `asia-southeast2`. Service: `atlasnexusdemo` — <https://atlasnexusdemo-gz23wnibqa-et.a.run.app/>.

## Run locally

Requirements: Node.js 22 or 23 and npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

Open <http://localhost:3000>. The demo can run without a Gemini key. AI actions then show a clearly labeled sample preview. To use Gemini locally, set `GEMINI_API_KEY` in your shell before starting Nuxt. The key is read only by the Nitro server and must never use a `NUXT_PUBLIC_` prefix.

## Demo roles

- **Super Admin** — inspect and edit the sample network hierarchy.
- **Agency** — create a campaign, analyze creator fit and manage a shortlist; create Brand Deal Reports.
- **Creator** — review the sample channel report and public channel statistics.

Choose a role at `/login`. Data changes are saved to this browser's local storage; the demo profile is kept in session storage. Use **Demo settings → Reset sample data** to restore the fixture.

## Product scope

- Campaign matching scores creator fit from public channel and video evidence and returns reasons, evidence IDs and a recommendation.
- Creator Suites includes YouTube Brand Deal Reports, YouTube Channel Reports and Channel Profiling. Gemini Executive Insight is available for the two report tools when configured.
- Analytics displays simple public channel and video counters. Date filters refer to video publication dates; counters remain cumulative.
- Organization/channel names and rounded subscriber/view counters use the P2P Labs Atlas Nexus snapshot dated October 17, 2026. Campaign briefs, per-video rows and per-video counters are clearly labeled demo fixtures. No private YouTube Analytics, demographic, revenue or campaign performance data is represented.

The retired legacy HTML prototype has been removed; the Nuxt app and its current demo notes live in this repository.

## Build and checks

```sh
npm run test:unit
npm run build
npm run preview
```

Local container preview:

```sh
docker build -t atlas-nexus-demo .
docker run --rm -p 8080:8080 -e GEMINI_API_KEY="$GEMINI_API_KEY" atlas-nexus-demo
```

A Gemini key is optional for local container preview; without it, production mode returns a clear configuration error for AI actions instead of presenting sample output as a live result.
