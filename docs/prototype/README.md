# Atlas Nexus connected product prototype

A desktop-focused, static interactive prototype connecting Super Admin, Agency, Brand and Creator perspectives. It demonstrates one campaign process across role-specific workspaces, with shared fictional records. It requires no backend, account, API key, framework install or build step. Mobile optimization is outside the requested scope; the existing responsive fallback is retained.

## Run locally

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open **http://127.0.0.1:8765/docs/prototype/index.html**. Choose a demo perspective and enter its workspace. The displayed credentials are fictional, prefilled and read-only. Do not enter a real password. ES modules require a static server; `file://` is not supported. Google Fonts is optional; a system font fallback works offline. New workspaces use only local images and CSS, without a Tailwind CDN dependency.

Use the same browser profile, hostname and port when moving between roles. `localhost` and `127.0.0.1` have different browser storage. Open the sign-in page in another tab to keep two perspectives open together. **Switch perspective** changes the current tab; **Log out** ends that tab's simulated session. **Reset Demo Data** restores all shared fixtures after a confirmation.

## Entry points and navigation

| File | Perspective | Navigation and responsibilities |
| --- | --- | --- |
| `index.html` | Demo sign-in | Four accounts, role selection, simulated login, reset, original homepage link |
| `app.html` | Super Admin | Platform overview; organizations and partner networks; users/access; campaign oversight and applications; Discovery; Creator Suites; channels/contracts; tool management; YouTube quota snapshot; settings/account |
| `app-agency.html` | Agency / organization admin | Operational dashboard; Discovery/shortlist/comparison; campaigns; applications; Creator Suites; channels/contracts; account |
| `app-brand.html` | Proposed Brand stakeholder | Lumina portfolio; creator research/shortlist/comparison; read-only campaign Overview, Brief, Creators, Progress, Performance and Reports; account |
| `app-creator.html` | Creator / Maya Makes | Opportunities; own applications; confirmed campaigns; own code and submissions; enabled Creator Suites; own channel and read-only contract; account |
| `share.html?id=…` | Local report recipient | Code-gated, read-only report; no edit actions or saved setup tab |
| `marketing.html` | Marketing homepage | Solutions nav (For Brands / Agencies / Creators), Pricing, role tabs, login/register CTAs |
| `for-brands.html` | Brand POV page | Brand reporting story → `register.html?role=brand` / `login.html?role=brand` / `app-brand.html` preview |
| `for-agencies.html` | Agency POV page | Full campaign story → `register.html?role=agency` / `login.html?role=agency` / `app-agency.html` preview |
| `for-creators.html` | Creator POV page | Apply/submit story → `register.html?role=creator` / `login.html?role=creator` / `app-creator.html` preview |
| `pricing.html` | Pricing page | Creator Free / Brand & Agency / Network Custom → role-tagged register CTAs |
| `login.html` | Demo log in | Role tabs + prefilled demo credentials; `?role=` preselects; signs into `sessionStorage` then enters `app-*.html` |
| `register.html` | Demo registration | Simulated signup per role; `?role=` preselects; stores display profile locally then enters `app-*.html` |
| `platform-snapshot.html` | Preserved reference | Original admin demo, sourced dashboard, organization tabs, channel search/sort/drawers and account drawer |

Agency campaign tabs are Overview, Planning, Roster, Applications and Activity; Running appears after launch, Monitoring after the first tracked video. The six-step creation flow covers Information, Configuration, Creators, Investment, Readiness and Workspace. Draft edits reuse the same form. Campaign pause, resume, completion, cancellation and archive are guarded transitions; only drafts can be discarded.

Brand is **not an implemented production account role**. The proposed Brand view permits Lumina campaign briefs, current investment, launch baselines, creator packages, progress, tracked performance, manually imported commerce evidence and exports. It excludes application contact details, review decisions, verification, tool administration and platform administration. Its shared shortlist is a proposed collaboration assumption.

## Management demo alignment (atlas-nexus-demo, 2026-10-15)

The sibling `atlas-nexus-demo/` YouTube Brand Campaign story (dual Agency/Creator POV,
YA'Bar scenario, forecast → posted-video linking → forecast-vs-actual monitoring with
CCE/GMV funnels) now informs this prototype's presentation layer:

- Discovery shows demo Fit Scores, GMV/video models, brand-safety labels and SKU-match
  evidence (all fictional planning aids, never verified decisions).
- Campaign planning adds an investment mix (Hybrid / Creator only / Ads only), target ROI,
  and GMV/ROI/CCE forecast estimates alongside the locked views baseline.
- Running workspaces open with a Posted Videos hub (linked / tracking / pending) and a
  five-step flow strip; Monitoring opens with Forecast vs Actual, Combined/Organic/Paid
  funnel tabs (paid stays explicitly unconnected), CCE, and per-channel GMV/order shares
  apportioned from manual commerce evidence.
- Creator applications carry an optional channel URL plus rate-card / sample-only
  preference; validation and state transitions are unchanged.
- Visual tokens move toward the management demo: Inter, action `#652DFF`, ink `#0B0F2B`,
  canvas `#F3F4F8`, with ⓘ formula explainers for GMV/CCE/ROI/Fit.

Out of scope on purpose: real AI scoring, paid-ads attribution, merchant/order
integration, YA'Bar brand rename (Lumina fixtures retained), and mobile QA beyond the
existing responsive fallback.

## Primary demonstration: connected campaign journey

1. Reset if a clean starting point is wanted. Choose **Agency**.
2. In Discovery, search/filter/sort creators, inspect a profile, shortlist them, and compare two or three. Private audience demographics and discovery fit scoring remain unavailable.
3. Create a new campaign named, for example, **Lumina · October creator stories**, with Brand **Lumina**. Complete the brief and product. Set valid campaign/application dates, a positive budget and enough creator slots.
4. Select **Ruang Teknologi** as a planned creator. Leave **Maya Makes unselected**, so Maya can apply later. If Maya was shortlisted, deselect her in the creator-selection step. Set rates/quantities, review the estimated forecast, acknowledge an overrun if applicable, and save the draft.
5. In Planning, inspect readiness and launch. Launch locks the saved baseline and opens applications. Editing draft budget/packages requires a fresh forecast. All forecasts are estimates, never promises.
6. Switch to **Creator**. The new campaign appears in Opportunities. Open it, review requirements, enter a positive proposed rate and contact email, and submit. My applications shows **Submitted · under review** (`pending_brand`). Duplicate live applications are blocked.
7. Switch to **Agency**, open Applications and inspect the offer/profile. Approve it. The application is now **Approved**, with no automatic roster addition.
8. Run eligibility. Complete the presenter-controlled simulated outcome as **Eligible**. This atomically updates the application and confirmed roster. Alternatives demonstrate review-required, ineligible and failed/retry paths. No channel lookup or AI assessment runs.
9. Open Roster or Running and issue Maya's Atlas code. The identifier coordinates Atlas submissions; it is not YouTube Studio partnership consent.
10. Switch to **Creator**, open the accepted campaign, reserve a pre-upload intent, then attach `https://www.youtube.com/watch?v=abcdefghijk`. Direct URL submission is also supported. The posted URL enters **Pending verification** and contributes no monitoring metrics.
11. Switch to **Agency** → Running. Resolve the mock metadata, inspect the submission, then verify it. Metadata errors support retry; submissions can be rejected with a creator-visible reason. Only **tracked** videos enter Monitoring.
12. Monitoring now displays the fixed fictional video counters (42,000 views, 1,900 likes, 146 comments), separate from the launch forecast. Export a CSV or explicitly generate a simulated monitoring insight.
13. Switch to **Brand** and review the same Lumina campaign's progress, baseline and tracked performance. Read-only reporting reflects the shared changes.

The seeded **Lumina · Everyday essentials** campaign has Maya already on its confirmed roster to support a shorter delivery demo. Issue her code as Agency before submitting. It cannot be used for a fresh Maya application.

Withdrawn, rejected and ineligible applications can be submitted again while the campaign remains open. Full campaigns and closed/paused lifecycle states block inappropriate actions. Dates are real form values: fixtures use October–November 2026; set future dates in new campaigns when presenting later.

### Manual commerce evidence

After tracking a video, download the CSV template from Monitoring, edit it, and import it. Expected format:

```csv
video_id,orders,gmv
abcdefghijk,12,2400000
```

Every ID must belong to a tracked video in that campaign. Orders must be nonnegative whole numbers; GMV must be nonnegative. Currency is IDR. Revert removes that import's contribution. This is an intentionally small CSV parser: exact three-column header, no quoted commas or alternative schemas. Imports are evidence supplied by the presenter, with no automatic merchant/order attribution or deduplication between files.

### Creator Suites demonstrations

All three tools are explicitly enabled in demo seed data. Super Admin can disable a tool or change limits; non-admin catalog and command access follow those settings.

- **Brand Deal Reports:** name, brand, accessible channel, valid date period and YouTube URLs → simulated processing → completed overview/videos/channels/setup → optional explicit simulated executive insight → CSV export and local share. URLs are validated and deduplicated by video ID.
- **Channel Report:** accessible channel and Month/Year → simulated processing → lifetime counter fixtures, video/channel breakdowns and optional insight. Three fixture videos per channel count against the tool limit. The reporting month affects the demonstrated selection configuration; displayed counters are not period-only metrics.
- **Channel Profiling:** name, description and selected public channel fixtures → simulated import/processing → channel positioning descriptions and evidence table → per-channel refresh/remove, CSV and local share. At least one channel must remain. There is no invented audience or AI suitability analysis.

Choose **Simulate a generation failure** before generating to exercise the failed state. **Complete demo generation** advances the presenter-controlled loading state; **Retry generation** preserves inputs and completes the retry. Saved reports are searchable. Refresh usage is recorded per tool/report or profiling channel, with the configured daily limit and 30-second cooldown; platform admins are exempt from daily limits. Insights append to history rather than overwrite it.

A completed report can create an eight-character code and `share.html` link. Open it in the **same browser/origin**, enter the code, and inspect the read-only result. Disable sharing on the owner report to revoke it in the open recipient tab. This is a simulation, not a secure or externally distributable share service. CSV is the implemented local export; no PDF/XLSX/Google Sheets connection is implied.

### Administration demonstrations

Create a local organization record; inspect partner network hierarchy; create a local user invitation record; suspend/reactivate an existing demo identity. Suspension blocks that identity's sign-in and mutations. Invitations do not send email and do not provision additional demo login accounts. Adjust Creator Suite access and input/refresh limits, inspect the labeled static YouTube quota snapshot, or save the demo workspace display name.

## Shared data architecture

- `js/state.mjs`: versioned seed, workflow commands, launch validation, scoped duplicate video validation, monitoring aggregation and storage adapters. It imports no browser UI code and can run directly under Node.
- `js/session.mjs`: tab-local simulated session in `sessionStorage`, allowing simultaneous perspectives without one tab signing out another.
- `js/app.mjs`: session/route guards, role navigation, forms, accessible dialogs, toast feedback, downloads and state synchronization.
- `js/campaigns.mjs`: wizard, campaign tabs, applications, eligibility, roster, submissions, monitoring and imports.
- `js/discovery.mjs`: filters, sorting, profiles, comparison and shared shortlist.
- `js/suites.mjs`: three tool configurations, generation/results, errors/retry, refresh, insights, export and demo sharing.
- `js/overview.mjs`: distinct dashboards, platform administration, channels/contracts/account.
- `js/ui.mjs` and `css/workspace.css`: shared components, escaped text rendering and Atlas visual tokens.
- `tests/state.test.mjs`: executable workflow and regression checks.

Business data uses **`atlas-nexus-demo-v1`** in localStorage. A command reloads current saved data, applies a guarded transition to a copy and persists before rendering; validation errors do not write partial transitions. IDs use `crypto.randomUUID`. Storage events reload other open tabs. Reset affects shared business data, not another tab's sign-in. The selected perspective is remembered separately. Search/filter/compare state and unfinished wizard inputs are transient and reset on reload; saved drafts and reports persist.

This is a small single-browser demo, not a concurrent database: simultaneous writes are last-write-wins. Role guards explain intended access but are not security boundaries; all local fixtures remain readable through browser developer tools. Unsupported or unreadable saved state shows a recovery/reset screen. Clearing browser data removes the demo.

## Capability audit and production gaps

Implementation status below means checked-in code, **not confirmation of production deployment**. References reviewed: `docs/product.md`, `docs/technical.md`, `docs/features/feature_list.md`, campaign/discovery/applications, authentication/RBAC/hierarchy, channel/contracts/dashboard/user/tool/API monitoring and all three suite feature documents. Backend campaign/application/eligibility/video services, transition definitions and application model statuses were checked against frontend campaign creation/workspace/application pages and `components/layout/AppSidebar.vue` in the sibling frontend repository.

| Capability | Classification in checked-in platform | Prototype treatment / gap |
| --- | --- | --- |
| Platform / organization administration; hierarchical roles | Implemented | Simplified fictional directories, local invitations and account status; no real invitations or assignments |
| JWT login, creator registration and password recovery | Implemented | Only simulated demo sign-in; no password updates, registration or recovery service |
| Discovery search/filter/compare/YouTube packages | Implemented | Six creator fixtures, shared shortlist, comparison up to three; no live lookup/sync |
| Multi-platform rates, collaborative notes and currency support | Partially implemented / rollout caveats | YouTube long-form planning in IDR only; no FX, other-platform cost integration or notes editor |
| Discovery fit scoring, audience snapshots, Insight tab | Placeholder / not available | Explicitly unavailable; no fabricated fit score or demographics |
| Campaign planning, priced roster, forecasts, launch gates | Implemented, Beta | Interactive creator-led campaigns; ads-only and full investment mix are outside this demo |
| Applications, approval and separate eligibility | Implemented | Real status vocabulary; manual simulated eligibility outcomes. No actual Gemini/evidence checks |
| Codes, pre-upload intent, URL attachment, metadata and tracking | Implemented, Beta; polling rollout caveat | Manual presenter-driven resolution/verification. No native YouTube partnership consent |
| Monitoring, saved baseline, commerce imports and on-demand AI | Implemented, Beta | Tracked fixture totals, frozen estimates, simple reversible CSV imports and explicitly simulated AI |
| Three suites, access limits, exports, code-gated sharing | Implemented; Channel Report seeded inactive | Demo enables all tools; local CSV, plaintext local demo code, fixture generation. Production PDF/XLSX/Sheets and secure expiring share tokens are not reproduced |
| Channel Report video resolution | Implemented CMS → OAuth → upload fallback | Fixed video fixtures; public counters are lifetime totals, not period-scoped performance |
| Scoped channel/contract access and analytics snapshots | Implemented | Read-only fictional channel/contract context; original source snapshot preserved separately |
| Brand account and dedicated business workspace | Prototype only / proposed permissions | Lumina read-only stakeholder POV plus shared research shortlist; no production RBAC claim |
| Automatic merchant/order attribution, connected paid-ad results | Not established | Unavailable; no automatic attribution shown |
| Proactive recommendations, predictive intelligence, published revenue/invoicing | Planned / roadmap | Not represented as available features |

The original homepage and admin prototype are preserved byte-for-byte in `marketing.html` and `platform-snapshot.html`. Their dated source snapshots (`source-data.json`, `home-source-data.json`) and existing preview images remain intact. Those reference pages retain their original external links, Google Fonts/Tailwind CDN and avatar dependencies. Their previously documented production source provenance remains in those JSON files. New connected workspaces use fictional identities throughout and never combine their totals with those original sourced records.

## Validation

Run the standalone tests from the repository root:

```sh
node --test docs/prototype/tests/state.test.mjs
```

**17 tests passed**, covering launch readiness and stale forecasts, approval/eligibility separation, review/ineligible/failure outcomes, duplicate live applications, capacity/closed states, code-required reservation, YouTube URL validation, metadata-before-verification, tracked-only totals, role guards and suspension, storage/reset recovery, reversible manual commerce, report access/deduplication/refresh/share revocation, profiling channel refresh/removal, tab-local sessions, campaign-scoped video duplicates reapplication UI, and cancellation reason/roster withdrawal.

Chrome was used to exercise all four sign-ins, role switching, Discovery search/shortlist/comparison, every campaign creation step, launch, the complete cross-role scenario above, all three Suite configurations/loading/results, Channel Report failure/retry, explicit AI simulation, code-gated report access, organization creation and tool settings. Suspension/sign-in rejection was checked after the review fix. Desktop screenshots: `preview-connected-admin.jpg` and `preview-connected-brand.jpg`. A responsive fallback check and `preview-connected-mobile.jpg` were captured before the instruction to skip further mobile optimization; no complete mobile QA claim is made.

A separate static code review identified terminal reapplication, suspension access and global video deduplication issues. All three were corrected and pinned by regression tests. No production backend code was changed. The separate backend run (`.venv/bin/python -m pytest -q`) finished with **257 passed, 76 failed**, including missing router registration and unverified rate-card currency errors in unchanged backend code/tests. Details are recorded in `IMPLEMENTATION.md`.

## Limitations and next improvements

- One seeded identity per perspective; Creator always represents Maya Makes. Additional invitation records are directory examples.
- Demo scoping is simplified: Agency operates the demo organization; Brand is restricted by brand name `Lumina`, not an assignment table. There are no live services, payment/contract execution, private analytics or verified AI outcomes.
- Local share codes are stored in plaintext, never meant for sensitive information. Shares do not work on another browser/device. Production hashing, token expiration and rate limiting are documented capabilities, not implemented here.
- Reports and profiling use fixture selections and local CSV. Full production editing, archive administration, raw comments/Comments Insight, PDF/XLSX/Sheets exports, overlap detection and refresh resolution are not reproduced. Archive/restore is simplified for demo owners.
- YouTube quota and operational jobs are labeled static examples. Metric synchronization is not simulated as an actual refresh from YouTube.
- Global tool enablement is intentionally simpler than independent production role/organization assignments. Research comparison selection and unsaved wizard state do not persist across navigation reloads.
- Keyboard focus, Escape dismissal and native validation are implemented; no full accessibility audit or complete browser compatibility certification was performed. Desktop is the priority.

Recommended next work: validate Brand permission assumptions with stakeholders; expand agency planning to supported investment mixes; align detailed report editing/export/access settings with production components; add deterministic browser regression automation; replace fixture adapters only after product review and real API scope agreement.
