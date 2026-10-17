# Connected prototype implementation plan

Spec: ../prd/prompt-brief-end-to-end-prototype.md

Goal: four connected demo perspectives using static HTML, shared ES modules, and localStorage.
All deliverables remain in this directory. Work in the supplied checkout to keep the requested artifacts reviewable here; no production or git configuration changes.

## Discovery and design

Reviewed product.md, technical.md, feature_list.md, campaign/discovery/application and Creator Suite feature documents; surveyed remaining feature goals. Checked campaign_service, campaign_application_service, campaign_eligibility_service, campaign_video_service, transitions, model statuses, frontend campaign creation/workspace/application pages and AppSidebar.

Reuse original assets and palette: paper #f6f5f9, white #ffffff, ink #252236, muted #6c687c, violet #7250ce, line #e5e2ed. Outfit with system fallback. Keep fixed sidebar, quiet tables, violet selection, rounded panels. A campaign journey strip is the central navigation device; dashboards prioritize each persona's work. Preserve the original marketing and admin demos at marketing.html and platform-snapshot.html.

## Tasks

- [x] Management-demo alignment (2026-10-15): Fit/GMV/safety/SKU discovery evidence;
  investment mix + GMV/ROI/CCE forecast estimates; Posted Videos hub; Forecast-vs-Actual
  monitoring with Combined/Organic/Paid tabs and per-channel shares; channel URL +
  rate-card/sample-only applications; Inter/arch tokens, flow strips, funnel tabs, ⓘ tips.
  State tests remain 17/17; new apply fields are optional and backward compatible.

- [x] Shared state and guard tests: launch readiness, approval separate from eligibility, failed/review-required outcomes, roster capacity, submission metadata, tracked-only totals, role guards, persistence/reset and quotas.
- [x] Entry/session flow and responsive shared shell; role-specific menus and dashboards.
- [x] Discovery search/filter/sort/profile/compare/shortlist and six-step campaign planning with frozen forecast.
- [x] Applications, eligibility, roster, code issuance, reservation, video verification, monitoring, commerce imports and activity.
- [x] Three Creator Suites with configuration, loading, results, error/retry, access limits, local export and code-gated demo sharing.
- [x] Admin directories, tool access, users and quota visibility; Brand read-only campaign reporting.
- [x] Browser validation, state tests, documentation and capability matrix.

## Review focus

Duplicate submissions, wrong-role mutations, stale forecasts after input changes, full/closed campaigns, and cross-role persistence. Mock figures must never be presented as fetched YouTube data. Brand permissions and simulated eligibility/AI remain explicit. Creator UI excludes private campaign budgets and other creators' records.

## Execution and validation record

All implementation stayed inside docs/prototype. Original entry pages were preserved byte-for-byte as marketing.html and platform-snapshot.html. Shared components use existing assets and Atlas tokens, with no new runtime dependencies.

State tests: 17/17 passed. Browser journey: Agency created/launched campaign → Creator applied → Agency approved → separate eligibility confirmed roster → code issued → Creator reserved/attached video → Agency resolved/verified → Brand saw 42K tracked fixture views. All three Creator Suites generation flows, error/retry and local code-gated sharing exercised. Super Admin organizations/tool controls exercised; suspended Creator sign-in rejection verified.

Final reviewer found reapplication CTA, suspension enforcement and campaign-scoped URL deduplication defects. Each reproduced in a failing test, fixed, and included in the passing 17-test suite.

Decisions: Use tab-local sessionStorage and shared localStorage business data to support concurrent perspectives. Brand scope is Lumina by name, explicitly proposed. Presenter-controlled generation and eligibility outcomes expose loading/error states deterministically. Export is actual local CSV; production PDF/XLSX/Sheets are documented rather than simulated as connected services. Preserve the original sourced demos as separate references. No commits, deployment, external messages or production mutations.

User steering: no mobile optimization needed; retained existing responsive fallback and stopped further mobile work.

Final backend suite: `.venv/bin/python -m pytest -q` → 257 passed, 76 failed, 23 warnings in 49.52s. Representative failures: campaign applications router not registered in app.routes; existing campaign fixtures rejected by `Creator rate card currency is unverified`. These failures are in unchanged backend code/tests and were not repaired as part of this prototype-only brief. Initial `.venv/bin/pytest -q` invocation could not import app; rerun through the venv Python resolved collection.

Additional final guard: campaign cancellation requires a reason and withdraws confirmed roster/code participation, matching backend lifecycle behavior. Covered by a regression test. Browser verified concurrent Admin/Creator tabs and live cross-tab tool disable/enable plus per-channel profiling refresh.
