import {
  esc,
  money,
  count,
  b,
  link,
  badge,
  heading,
  notice,
  empty,
  panel,
  stats,
  table,
  field,
  area,
  select,
  submit,
  identity,
  infoTip,
  flowStrip,
  funnelTabs,
} from "./ui.mjs";
import { investment, readiness, monitoring, forecastEstimate, commerceTotals } from "./state.mjs";
let wizard = null,
  step = 0,
  appFilter = "all",
  funnelTab = "combined";
const manage = (c) => ["agency", "admin"].includes(c.role);
const creator = (s, id) => s.creators.find((x) => x.id === id);
const apps = (c, id) =>
  c.s.applications.filter(
    (a) =>
      (!id || a.campaignId === id) &&
      (c.role !== "creator" || a.creatorId === "c1")
  );
const nextLabel = (a) =>
  ({
    pending_brand: "Await agency decision",
    approved: "Run eligibility assessment",
    under_analysis: "Complete simulated assessment",
    needs_review: "Retry eligibility assessment",
    eligible: "Open campaign requirements",
    not_eligible: "Browse other opportunities",
    rejected: "Browse other opportunities",
    withdrawn: "Application withdrawn",
  }[a.status]);
export function page(c, path) {
  let [route, id, tab] = path.split("/");
  if (route === "new") return wizardPage(c, id);
  if (route === "applications") return applicationPage(c);
  if (route === "campaign") return workspace(c, id, tab || "overview");
  return listing(c, route);
}
function listing(c, route) {
  let creatorPOV = c.role === "creator",
    accepted = route === "accepted";
  let list = c.s.campaigns.filter(
    (x) =>
      !creatorPOV ||
      (accepted
        ? x.roster.some((r) => r.creatorId === "c1" && r.confirmed)
        : x.status === "open")
  );
  return (
    heading(
      creatorPOV
        ? accepted
          ? "My campaigns"
          : "Campaign opportunities"
        : c.role === "brand"
        ? "Your campaign portfolio"
        : "Campaigns",
      creatorPOV
        ? "Find your next collaboration and follow your deliverables."
        : c.role === "brand"
        ? "Understand investment, creator suitability and campaign outcomes."
        : "Plan investment, coordinate creators, and track verified delivery.",
      manage(c) ? link("Create campaign", "new", "primary") : ""
    ) +
    (c.role === "brand"
      ? notice(
          "Proposed Brand experience: read-only access to Lumina campaign briefs, planned investment, creator selection and verified results. No production Brand RBAC is implied."
        )
      : "") +
    (manage(c)
      ? flowStrip(
          [
            ["Discovery", "Rank & shortlist"],
            ["Create", "Brief + forecast"],
            ["Launch", "Open applications"],
            ["Link videos", "Paste posted URLs"],
            ["Monitor", "Forecast vs actual"],
          ],
          -1
        )
      : "") +
    `<div class="grid">${
      list
        .map((x) => {
          let m = monitoring(c.s, x.id),
            mine = x.roster.find((r) => r.creatorId === "c1");
          return `<article class="card"><div class="actions">${badge(
            x.status
          )}${
            creatorPOV && mine ? badge("Confirmed creator") : ""
          }</div><h3>${esc(x.name)}</h3><p>${esc(
            x.description
          )}</p><div class="list-row"><small class="muted">Campaign period</small><small>${esc(
            x.start
          )} — ${esc(
            x.end
          )}</small></div><div class="list-row"><small class="muted">${
            creatorPOV ? "Application deadline" : "Investment baseline"
          }</small><small>${
            creatorPOV
              ? esc(x.close)
              : money(x.baseline?.investment || investment(x))
          }</small></div><div class="list-row"><small class="muted">${
            creatorPOV ? "Deliverable" : "Verified videos"
          }</small><small>${
            creatorPOV ? "YouTube long-form" : m.videos.length
          }</small></div><div class="actions">${link(
            creatorPOV && mine ? "Manage deliverables" : "Open campaign",
            "campaign/" + x.id,
            "primary"
          )}</div></article>`;
        })
        .join("") ||
      empty(
        accepted ? "No confirmed campaigns yet" : "No campaigns available",
        accepted
          ? "Approval is followed by eligibility before roster confirmation."
          : "Agency drafts appear here after launch.",
        link("View applications", "applications")
      )
    }</div>`
  );
}
function wizardPage(c, id) {
  if (!manage(c))
    return empty(
      "Planning is restricted",
      "Switch to Agency or Super Admin to create campaigns."
    );
  if (!wizard || wizard.editId !== (id || null)) {
    let existing = c.s.campaigns.find((x) => x.id === id);
    wizard = existing
      ? { ...structuredClone(existing), editId: id }
      : {
          editId: null,
          name: "",
          brand: "Lumina",
          objective: "Product awareness",
          description: "",
          product: "",
          requirements:
            "One dedicated YouTube video with clear sponsorship disclosure.",
          start: "2026-10-15",
          end: "2026-11-30",
          close: "2026-11-15",
          budget: 25000000,
          slots: 4,
          minSubscribers: 10000,
          mix: "hybrid",
          targetROI: 2.0,
          skus: ["Chocolate", "Matcha", "Original"],
          roster: c.s.shortlist.length
            ? c.s.creators
                .filter((x) => c.s.shortlist.includes(x.id))
                .map((x) => ({ creatorId: x.id, rate: x.rate, quantity: 1 }))
            : [{ creatorId: "c2", rate: 6000000, quantity: 1 }],
          overrun: false,
        };
    step = 0;
  }
  let titles = [
    "Information",
    "Configuration",
    "Creators",
    "Investment",
    "Readiness",
    "Workspace",
  ];
  let w = wizard;
  let body = "";
  if (step === 0)
    body = `<div class="form-grid">${field(
      "Campaign name",
      "name",
      w.name,
      "text",
      'required maxlength="120"'
    )}${field("Brand", "brand", w.brand, "text", "required")}${field(
      "Campaign objective",
      "objective",
      w.objective,
      "text",
      "required"
    )}${area(
      "Campaign description",
      "description",
      w.description,
      "required"
    )}</div>`;
  if (step === 1)
    body = `<div class="form-grid">${field(
      "Start date",
      "start",
      w.start,
      "date",
      "required"
    )}${field("End date", "end", w.end, "date", "required")}${field(
      "Total budget · IDR",
      "budget",
      w.budget,
      "number",
      'required min="1" step="1"'
    )}${field(
      "Creator slots (includes planned roster)",
      "slots",
      w.slots,
      "number",
      'required min="1" max="100"'
    )}${field(
      "Application close date",
      "close",
      w.close,
      "date",
      "required"
    )}${field(
      "Minimum subscribers · demo threshold",
      "minSubscribers",
      w.minSubscribers,
      "number",
      'min="0"'
    )}${field("Product", "product", w.product, "text", "required")}${area(
      "Creator requirements",
      "requirements",
      w.requirements,
      "required"
    )}</div>`;
  if (step === 2)
    body =
      notice(
        "Select creator-provided rates and deliverable quantities. YouTube packages alone enter campaign costs."
      ) +
      table(
        ["Select", "Creator · fit & commerce model", "Rate per video · IDR", "Long-form videos"],
        c.s.creators.map((x) => {
          let r = w.roster.find((r) => r.creatorId === x.id);
          return [
            `<input aria-label="Select ${esc(
              x.name
            )}" type="checkbox" name="creator_${x.id}" ${r ? "checked" : ""}>`,
            `${identity(x)}<small class="muted" style="display:block;margin-top:4px">Fit ${
              x.fit ?? "—"
            } · ${x.gmvVideo ? money(x.gmvVideo) + "/video" : "GMV —"} · ${esc(
              x.safety || "Review"
            )}</small>`,
            `<input aria-label="Rate for ${esc(x.name)}" name="rate_${
              x.id
            }" type="number" min="1" step="1" value="${r?.rate || x.rate}">`,
            `<input aria-label="Video quantity for ${esc(x.name)}" name="qty_${
              x.id
            }" type="number" min="1" max="20" value="${r?.quantity || 1}">`,
          ];
        })
      );
  if (step === 3) {
    let views = w.roster.reduce(
      (n, r) => n + creator(c.s, r.creatorId).avgViews * r.quantity,
      0
    );
    let est = forecastEstimate(w, c.s.creators);
    let mix = w.mix || "hybrid";
    body =
      `<div class="mix-tabs" role="tablist" aria-label="Investment mix">${[
        ["hybrid", "Hybrid"],
        ["creator", "Creator only"],
        ["ads", "Ads only"],
      ]
        .map(
          ([id, label]) =>
            `<label class="mix-tab ${mix === id ? "is-on" : ""}"><input type="radio" name="mix" value="${id}" ${
              mix === id ? "checked" : ""
            }>${label}</label>`
        )
        .join("")}</div><p class="muted small">Hybrid: organic commerce from creators + paid amplification in Monitoring “Combined”. Creator-only and Ads-only adjust the planning narrative; paid spend is not modelled as a separate ledger here.</p><div class="form-grid">${field(
        "Target ROI · ×",
        "targetROI",
        w.targetROI ?? 2.0,
        "number",
        'min="0.1" step="0.1"'
      )}</div>` +
      stats([
        ["Creator investment", money(investment(w)), "Rate × quantity"],
        [
          "Budget remaining",
          money(w.budget - investment(w)),
          "Unallocated investment",
        ],
        ["Estimated views", count(views), "Historical average × quantity"],
        [
          "Planned videos",
          w.roster.reduce((n, r) => n + r.quantity, 0),
          "Long-form only",
        ],
      ]) +
      stats([
        [
          "Est. GMV",
          money(est.gmv),
          "GMV/video model × quantities" + infoTip("gmv"),
        ],
        [
          "Est. ROI",
          est.roi ? est.roi + "×" : "—",
          "Est. GMV ÷ investment" + infoTip("roi"),
        ],
        [
          "Est. CCE",
          est.cce ? est.cce + "×" : "—",
          "GMV ÷ creator investment" + infoTip("cce"),
        ],
        [
          "Target ROI",
          (w.targetROI ?? 2.0) + "×",
          est.roi >= (w.targetROI ?? 2.0) ? "Forecast meets target" : "Below target — adjust mix",
        ],
      ]) +
      notice(
        "Forecast figures are calculated estimates based on fictional GMV/video models and historical averages. They are not guaranteed campaign outcomes. Paid ads, merchant attribution and order causality are unavailable."
      ) +
      `<label class="check"><input name="overrun" type="checkbox" ${
        w.overrun ? "checked" : ""
      }>Acknowledge any investment above the campaign budget</label>`;
  }
  if (step === 4) {
    let errors = readiness({
      ...w,
      forecast: {
        signature: JSON.stringify([
          w.budget,
          w.roster.map((r) => [r.creatorId, r.rate, r.quantity]),
        ]),
      },
    });
    body = `<h3>${esc(w.name)}</h3><p>${esc(w.brand)} · ${esc(
      w.objective
    )}</p>${table(
      ["Readiness requirement", "Status"],
      [
        [
          "Identity, dates and application configuration",
          errors.length ? badge("Review inputs") : badge("Ready"),
        ],
        [
          "Priced creator packages",
          `${w.roster.length} creators · ${money(investment(w))}`,
        ],
        [
          "Forecast",
          "Saved automatically when creating the draft; locked on launch",
        ],
      ]
    )}${
      errors.length
        ? notice(errors.map(esc).join("<br>"), true)
        : notice(
            "Ready to save. Creating a draft does not open applications; review and launch from Planning."
          )
    }`;
  }
  if (step === 5)
    body = `<h3>Your connected campaign workspace</h3><p>Save this campaign and its estimated forecast, then launch from Planning. Creators can apply once the campaign is open.</p><div class="journey">${[
      "Plan investment",
      "Review applications",
      "Confirm eligibility",
      "Verify videos",
      "Monitor results",
    ]
      .map((t) => `<div><b>${t}</b></div>`)
      .join("")}</div>${notice(
      "Planned creators are directly rostered. New applicants require separate approval and eligibility. Atlas campaign codes coordinate submissions internally."
    )}`;
  return (
    heading(
      w.editId ? "Edit campaign planning" : "Create a campaign",
      "Build a campaign brief, select creators and review investment.",
      link("Back to campaigns", "campaigns")
    ) +
    `<div class="wizard"><div class="stepper">${titles
      .map(
        (t, i) =>
          `<span class="step ${i === step ? "current" : ""}">${
            i + 1
          }. ${t}</span>`
      )
      .join("")}</div><section class="panel pad"><h2>${
      titles[step]
    }</h2><form id="campaign-wizard">${body}<div class="wizard-footer">${
      step ? b("Back", "wizardBack") : link("Cancel", "campaigns")
    }${submit(
      step === 5 ? "Save draft & open workspace" : "Continue"
    )}</div></form></section></div>`
  );
}
function journey(c, x) {
  let a = apps(c, x.id),
    m = monitoring(c.s, x.id);
  return `<div class="journey">${[
    [
      "Planning",
      x.status !== "draft",
      "Baseline " + (x.baseline ? "locked" : "not locked"),
    ],
    ["Applications", a.length > 0, a.length + " offers"],
    ["Confirmed roster", x.roster.length > 0, x.roster.length + " creators"],
    ["Video verification", m.videos.length > 0, m.videos.length + " tracked"],
    [
      "Monitoring",
      m.videos.length > 0,
      m.videos.length
        ? "Verified video evidence"
        : "Waiting for tracked videos",
    ],
  ]
    .map(
      ([t, done, sub]) =>
        `<div class="${
          done ? "done" : ""
        }"><b>${t}</b><small>${sub}</small></div>`
    )
    .join("")}</div>`;
}
function workspace(c, id, tab) {
  let x = c.s.campaigns.find((x) => x.id === id);
  if (!x)
    return empty(
      "Campaign not found",
      "Return to your campaign list.",
      link("Campaigns", "campaigns")
    );
  if (c.role === "creator") return creatorWorkspace(c, x);
  let brand = c.role === "brand",
    m = monitoring(c.s, x.id);
  let tabs = brand
    ? ["overview", "brief", "creators", "progress", "performance", "reports"]
    : [
        "overview",
        "planning",
        "roster",
        "applications",
        ...(x.status !== "draft" ? ["running"] : []),
        ...(m.videos.length ? ["monitoring"] : []),
        "activity",
      ];
  if (!tabs.includes(tab)) tab = "overview";
  let actions = link("All campaigns", "campaigns");
  if (manage(c) && x.status === "draft")
    actions += b("Discard draft", "discard", { id: x.id }, "danger");
  let body = "";
  if (["overview", "brief"].includes(tab))
    body = `<div class="two-col">${panel(
      "Campaign brief",
      `<div class="pad"><h3>${esc(x.objective)}</h3><p>${esc(
        x.description
      )}</p><div class="list-row"><span>Product</span><strong>${esc(
        x.product
      )}</strong></div><div class="list-row"><span>Campaign period</span><span>${esc(
        x.start
      )} — ${esc(
        x.end
      )}</span></div><div class="list-row"><span>Application deadline</span><span>${esc(
        x.close
      )}</span></div><h3 style="margin-top:23px">Deliverable requirements</h3><p>${esc(
        x.requirements
      )}</p></div>`
    )}${panel(
      brand ? "Investment visibility" : "Campaign readiness",
      `<div class="pad">${badge(
        x.status
      )}<div class="list-row"><span>Total budget</span><strong>${money(
        x.budget
      )}</strong></div><div class="list-row"><span>Current creator investment</span><strong>${money(
        investment(x)
      )}</strong></div><div class="list-row"><span>Locked baseline</span><strong>${
        x.baseline ? money(x.baseline.investment) : "Not launched"
      }</strong></div><p class="muted small" style="margin-top:18px">${
        x.baseline
          ? "Baseline is frozen at launch. Subsequent applicant additions may change current roster investment."
          : "Save forecast and launch from Planning to open creator applications."
      }</p>${
        manage(c)
          ? link(
              x.status === "draft" ? "Review planning" : "Manage roster",
              "campaign/" +
                x.id +
                "/" +
                (x.status === "draft" ? "planning" : "roster"),
              "primary"
            )
          : link(
              "Review performance",
              "campaign/" + x.id + "/performance",
              "primary"
            )
      }</div>`
    )}</div>`;
  if (tab === "planning") body = planning(c, x);
  if (["roster", "creators"].includes(tab)) body = rosterPanel(c, x);
  if (tab === "applications") body = applicationTable(c, x.id);
  if (["running", "progress"].includes(tab)) body = running(c, x);
  if (["monitoring", "performance", "reports"].includes(tab))
    body = monitor(c, x, tab);
  if (tab === "activity")
    body = panel(
      "Campaign activity",
      `<div class="pad timeline">${c.s.activity
        .filter((e) => e.campaignId === x.id)
        .map(
          (e) =>
            `<div>${esc(e.text)}<small>${new Date(
              e.at
            ).toLocaleString()}</small></div>`
        )
        .join("")}</div>`
    );
  return (
    heading(x.name, x.brand + " · " + x.objective, actions) +
    (brand
      ? notice(
          "Proposed Brand workspace · read-only campaign evidence. All metrics are fictional demo fixtures."
        )
      : "") +
    journey(c, x) +
    `<div class="tabs" role="tablist" aria-label="Campaign workspace">${tabs
      .map(
        (t) =>
          `<a role="tab" aria-selected="${
            t === tab
          }" class="tab" href="#campaign/${x.id}/${t}">${
            t[0].toUpperCase() + t.slice(1)
          }</a>`
      )
      .join("")}</div>` +
    body
  );
}
function planning(c, x) {
  let errors = readiness(x);
  let total = investment(x);
  let est = forecastEstimate(x, c.s.creators);
  let next =
    {
      open: ["active", "paused", "completed", "cancelled"],
      active: ["paused", "completed", "cancelled"],
      paused: ["active", "cancelled"],
      completed: ["archived"],
      cancelled: ["archived"],
    }[x.status] || [];
  return (
    stats([
      ["Total budget", money(x.budget)],
      ["Creator investment", money(total)],
      [
        "Estimated views",
        count(x.baseline?.views || x.forecast?.views),
        "Calculated forecast, not actual",
      ],
      ["Budget balance", money(x.budget - total)],
    ]) +
    panel(
      "Investment & forecast",
      `<div class="pad">${notice(
        "Forecast estimates use fictional GMV/video models × planned quantities plus recent average views. No guaranteed results, paid ad data or automatic commerce attribution."
      )}<div class="list-row"><span>Investment mix</span><strong>${esc(
        x.mix || "hybrid"
      )}</strong></div><div class="list-row"><span>Target ROI</span><strong>${
        x.targetROI ?? 2.0
      }×</strong></div><div class="list-row"><span>Estimated GMV · model</span><strong>${money(
        est.gmv
      )}${infoTip("gmv")}</strong></div><div class="list-row"><span>Estimated ROI / CCE</span><strong>${
        est.roi
      }× / ${est.cce}×${infoTip("roi")}</strong></div><div class="actions" style="margin-top:16px">${
        x.status === "draft"
          ? link("Edit planning", "new/" + x.id) +
            b("Save forecast", "saveForecast", { id: x.id }) +
            b("Launch campaign", "launchDialog", { id: x.id }, "primary")
          : badge("Launch baseline locked")
      }</div></div>`
    ) +
    panel(
      x.status === "draft" ? "Launch readiness" : "Campaign lifecycle",
      `<div class="pad">${
        x.status === "draft"
          ? errors.length
            ? `<ul>${errors.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>`
            : notice(
                "All launch requirements are met. Launch opens applications and locks the saved forecast."
              )
          : `<p>Current state: ${badge(x.status)}</p><div class="actions">${next
              .map((status) =>
                b(
                  status[0].toUpperCase() + status.slice(1),
                  "lifecycleDialog",
                  { id: x.id, status }
                )
              )
              .join("")}</div>`
      }</div>`
    )
  );
}
function rosterPanel(c, x) {
  return panel(
    "Confirmed creator roster",
    x.roster.length
      ? table(
          [
            "Creator",
            "YouTube package",
            "Agreed investment",
            "Participation",
            ...(manage(c) ? ["Atlas code"] : []),
          ],
          x.roster.map((r) => [
            identity(creator(c.s, r.creatorId)),
            `${r.quantity} long-form video${r.quantity > 1 ? "s" : ""}`,
            money(r.rate * r.quantity),
            badge(r.confirmed ? "Confirmed" : "Withdrawn"),
            ...(manage(c)
              ? [
                  r.code
                    ? `<code>${esc(r.code)}</code>`
                    : x.status !== "draft"
                    ? b("Issue code", "issueCode", {
                        id: x.id,
                        creatorId: r.creatorId,
                      })
                    : "Available after launch",
                ]
              : []),
          ])
        )
      : empty(
          "Roster is empty",
          "Select planned creators or complete applicant eligibility."
        ),
    "Approval alone does not create a roster entry. Eligible assessment confirms membership."
  );
}
function applicationPage(c) {
  return (
    heading(
      c.role === "creator" ? "My applications" : "Campaign applications",
      c.role === "creator"
        ? "Follow agency decisions, eligibility and roster confirmation."
        : "Review creator offers before a separate eligibility assessment.",
      link("Browse campaigns", "campaigns")
    ) + applicationTable(c)
  );
}
function applicationTable(c, id) {
  let all = apps(c, id),
    filtered = all.filter((a) => appFilter === "all" || a.status === appFilter);
  return (
    `<div class="filters"><label for="app-status">Application status</label><select id="app-status" data-change="appFilter">${[
      "all",
      "pending_brand",
      "approved",
      "under_analysis",
      "eligible",
      "needs_review",
      "not_eligible",
      "rejected",
      "withdrawn",
    ]
      .map(
        (x) =>
          `<option value="${x}" ${x === appFilter ? "selected" : ""}>${
            x === "all" ? "All states" : x.replaceAll("_", " ")
          }</option>`
      )
      .join("")}</select></div>` +
    panel(
      "Applications",
      filtered.length
        ? table(
            [
              "Creator / campaign",
              "Proposed rate",
              "Decision / eligibility",
              "Next step",
              "Review",
            ],
            filtered.map((a) => {
              let cp = c.s.campaigns.find((x) => x.id === a.campaignId);
              return [
                `<strong>${esc(
                  creator(c.s, a.creatorId).name
                )}</strong><small>${esc(cp.name)}</small>`,
                money(a.rate),
                badge(a.status),
                esc(nextLabel(a)),
                b("View application", "applicationDetail", { id: a.id }),
              ];
            })
          )
        : empty(
            "No applications in this view",
            c.role === "creator"
              ? "Apply to a different open campaign to start the shared journey."
              : "Creator applications appear here as soon as they are submitted.",
            link("Browse campaigns", "campaigns")
          )
    )
  );
}
function running(c, x) {
  let videos = c.s.videos.filter((v) => v.campaignId === x.id),
    brand = c.role === "brand";
  let linked = videos.filter((v) => v.videoId).length,
    tracked = videos.filter((v) => v.status === "tracked").length,
    pending = videos.filter((v) => v.status === "pending_verification").length;
  return (
    flowStrip(
      [
        ["Discovery", "Select creators"],
        ["Create", "Brief + forecast"],
        ["Launch", "Campaign go-live"],
        ["Link videos", "Paste URLs after posting"],
        ["Monitor", "KPIs by channel & video"],
      ],
      3
    ) +
    `<section class="panel"><div class="panel-head"><div><h2>Posted videos</h2><p>Paste YouTube URLs after creators post → mock metadata resolves → agency verifies → feeds Monitoring.</p></div><div class="actions"><span class="badge">${linked} linked</span><span class="badge green">${tracked} tracking</span><span class="badge amber">${pending} pending</span></div></div></section>` +
    (!brand
      ? notice(
          `Atlas campaign identifier: <code>${esc(
            x.code || "Not issued"
          )}</code>. Internal coordination only; it does not establish YouTube Studio partnership consent.`
        )
      : "") +
    rosterPanel(c, x) +
    panel(
      "Deliverable tracking",
      videos.length
        ? table(
            ["Creator / video", "Submission state", "Metadata", "Actions"],
            videos.map((v) => [
              `${esc(creator(c.s, v.creatorId).name)}<small>${esc(
                v.title || v.videoId || "Pre-upload reservation"
              )}</small>`,
              badge(v.status),
              badge(v.metadata),
              brand
                ? '<span class="muted">Read-only</span>'
                : `<div class="actions">${b("Inspect", "videoDetail", {
                    id: v.id,
                  })}${
                    v.status === "pending_verification"
                      ? v.metadata !== "resolved"
                        ? b("Resolve metadata", "resolveVideo", { id: v.id })
                        : b(
                            "Verify video",
                            "verifyDialog",
                            { id: v.id },
                            "primary"
                          )
                      : ""
                  }</div>`,
            ])
          )
        : empty(
            "Waiting for creator submissions",
            "Issue a code, then switch to Creator to reserve an upload or submit a posted-video URL."
          )
    ) +
    panel(
      "Package progress",
      `<div class="pad">${x.roster
        .map((r) => {
          let tracked = videos.filter(
            (v) => v.creatorId === r.creatorId && v.status === "tracked"
          ).length;
          return `<div class="bar-row"><span>${esc(
            creator(c.s, r.creatorId).name
          )}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(
            100,
            (tracked / r.quantity) * 100
          )}%"></div></div><span>${tracked} / ${
            r.quantity
          } verified</span></div>`;
        })
        .join("")}</div>`
    )
  );
}
function monitor(c, x, tab) {
  let m = monitoring(c.s, x.id);
  if (!m.videos.length)
    return panel(
      "Campaign performance",
      empty(
        "No tracked videos yet",
        "Forecasts remain estimates. Only agency-verified, tracked videos enter monitoring.",
        manage(c) && x.status !== "draft"
          ? link("Review Running", "campaign/" + x.id + "/running")
          : ""
      )
    );
  let totals = commerceTotals(c.s, x.id);
  let orders = totals.orders,
    gmv = totals.gmv;
  let est = forecastEstimate(x, c.s.creators);
  let inv = x.baseline?.investment || investment(x);
  let actualROI = inv ? +(gmv / inv).toFixed(2) : 0;
  let actualCCE = inv ? +(gmv / inv).toFixed(2) : 0;
  let funnelNote =
    funnelTab === "paid"
      ? "Paid ads attribution is not connected in this prototype — showing no paid GMV by design."
      : funnelTab === "organic"
      ? "Organic funnel: tracked fixtures plus manually imported commerce evidence."
      : "Combined funnel: organic evidence plus paid (none connected).";
  // Per-channel aggregation from tracked fixtures + commerce evidence share.
  let byChannel = x.roster.map((r) => {
    let vids = m.videos.filter((v) => v.creatorId === r.creatorId);
    let views = vids.reduce((n, v) => n + (v.metrics?.views || 0), 0);
    return { roster: r, cr: creator(c.s, r.creatorId), vids, views };
  });
  let totalViews = byChannel.reduce((n, b) => n + b.views, 0);
  let withGmv = byChannel.map((ch) => ({
    ...ch,
    gmv: totalViews ? Math.round((gmv * ch.views) / totalViews) : 0,
    orders: totalViews
      ? Math.round((orders * ch.views) / totalViews)
      : 0,
  }));
  return (
    `<section class="panel"><div class="panel-head"><div><h2>Forecast vs actual</h2><p>Launch baseline estimate against tracked evidence for this campaign.</p></div><div class="actions"><span class="badge">Plan: ${
      x.mix || "hybrid"
    }</span></div></div><div class="pad"><div class="fva-grid">${[
      ["Forecast views", count(x.baseline?.views), "Locked estimate"],
      ["Tracked views", count(m.views), "Lifetime fixtures"],
      ["Est. GMV", money(est.gmv), "Demo model"],
      ["Actual GMV", money(gmv), "Manual evidence" + infoTip("gmv")],
      ["Est. ROI", (est.roi || "—") + "×", "Planning model" + infoTip("roi")],
      ["Actual ROI", actualROI + "×", "GMV ÷ baseline"],
    ]
      .map(
        ([l, v, h]) =>
          `<div class="fva-cell"><span>${esc(l)}</span><strong>${v}</strong><small>${h}</small></div>`
      )
      .join("")}</div><p class="small muted">Different metric coverage may limit comparison: lifetime counters can include views outside the campaign period.</p></div></section>` +
    funnelTabs(funnelTab) +
    notice(esc(funnelNote)) +
    notice(
      "Mock actual performance · lifetime video counters from tracked fixtures. Forecasts are a locked estimate. Commerce evidence is manually imported; no causal order attribution or connected ads data."
    ) +
    stats([
      ["Tracked views", count(m.views), "Lifetime counter fixtures"],
      ["Net GMV · evidence", money(gmv), "Manual CSV imports" + infoTip("gmv")],
      ["CCE", actualCCE + "×", "GMV ÷ baseline" + infoTip("cce")],
      [
        "Locked forecast views",
        count(x.baseline?.views),
        "Estimated at launch",
      ],
    ]) +
    panel(
      "Actual performance against the estimate",
      `<div class="pad"><div class="bar-row"><span>Forecast · estimate</span><div class="bar-track"><div class="bar-fill" style="width:100%"></div></div><span>${count(
        x.baseline?.views
      )}</span></div><div class="bar-row"><span>Tracked views</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(
        100,
        (m.views / (x.baseline?.views || 1)) * 100
      )}%;background:#519176"></div></div><span>${count(
        m.views
      )}</span></div><p class="small muted">Different metric coverage may limit comparison: lifetime counters can include views outside the campaign period.</p></div>`
    ) +
    panel(
      "Tracked creator & video performance",
      table(
        ["Creator", "Video", "Views", "Likes", "Comments"],
        m.videos.map((v) => [
          esc(creator(c.s, v.creatorId).name),
          esc(v.videoId),
          count(v.metrics.views),
          count(v.metrics.likes),
          count(v.metrics.comments),
        ])
      ),
      "Fictional YouTube source metric fixtures",
      b("Export campaign CSV", "exportCampaign", { id: x.id })
    ) +
    panel(
      "Creator performance · by channel",
      table(
        ["Channel", "Fit", "Videos", "Views", "Orders · share", "Net GMV · share"],
        withGmv.map((ch) => [
          esc(ch.cr?.name || ch.roster.creatorId),
          ch.cr?.fit ?? "—",
          ch.vids.length,
          count(ch.views),
          ch.orders,
          money(ch.gmv),
        ])
      ),
      "GMV/orders are apportioned from manual evidence by tracked views; paid split unavailable"
    ) +
    panel(
      "Imported commerce evidence",
      `<div class="pad">${
        totals.imports.length
          ? `<p>${orders} orders · ${money(
              gmv
            )} GMV · manually uploaded evidence</p>${totals.imports
              .map(
                (i) =>
                  `<div class="list-row"><span>${
                    i.rows.length
                  } rows · ${new Date(i.at).toLocaleString()}</span>${
                    manage(c)
                      ? b("Revert import", "revertCommerce", { id: i.id })
                      : badge("Manual import")
                  }</div>`
              )
              .join("")}`
          : '<p class="muted">Unavailable until evidence is manually imported. No automatic merchant or order integration.</p>'
      }${
        manage(c)
          ? `<div class="actions">${b(
              "Download CSV template",
              "commerceTemplate",
              { id: x.id }
            )}${b("Import commerce CSV", "commerceDialog", { id: x.id })}</div>`
          : ""
      }</div>`
    ) +
    panel(
      "Monitoring analysis",
      `<div class="pad">${
        (x.insights || [])
          .map(
            (i) =>
              `<div class="list-row"><div><strong>Simulated AI insight</strong><p>${esc(
                i.text
              )}</p><small class="muted">${new Date(
                i.at
              ).toLocaleString()}</small></div></div>`
          )
          .join("") ||
        '<p class="muted">Generate an on-demand demo analysis of tracked campaign evidence.</p>'
      }${
        manage(c)
          ? b("Generate demo analysis", "monitorInsight", { id: x.id })
          : ""
      }</div>`
    )
  );
}
function creatorWorkspace(c, x) {
  let r = x.roster.find((r) => r.creatorId === "c1" && r.confirmed),
    a = apps(c, x.id).at(-1),
    videos = c.s.videos.filter(
      (v) => v.campaignId === x.id && v.creatorId === "c1"
    );
  if (!r && x.status !== "open" && !a)
    return empty(
      "Campaign unavailable",
      "Browse open opportunities.",
      link("Campaigns", "campaigns")
    );
  return (
    heading(
      x.name,
      x.brand + " · " + x.objective,
      link("Back to campaigns", "campaigns")
    ) +
    panel(
      "Campaign requirements",
      `<div class="pad"><p>${esc(x.description)}</p><h3>${esc(
        x.product
      )}</h3><p>${esc(
        x.requirements
      )}</p><div class="list-row"><span>Campaign period</span><span>${esc(
        x.start
      )} — ${esc(
        x.end
      )}</span></div><div class="list-row"><span>Application deadline</span><span>${esc(
        x.close
      )}</span></div><div class="list-row"><span>Subscriber threshold</span><span>${count(
        x.minSubscribers
      )} · assessed after approval</span></div>${
        r
          ? badge("Confirmed creator")
          : a
          ? `<p>${badge(a.status)}</p>${b(
              "View application & next step",
              "applicationDetail",
              { id: a.id },
              "primary"
            )}${
              x.status === "open" &&
              ["withdrawn", "rejected", "not_eligible"].includes(a.status)
                ? b("Apply again", "applyDialog", { id: x.id }, "primary")
                : ""
            }`
          : x.status === "open"
          ? b("Apply to campaign", "applyDialog", { id: x.id }, "primary")
          : ""
      }</div>`
    ) +
    (r
      ? panel(
          "Your delivery workspace",
          `<div class="pad">${
            r.code
              ? notice(`Your Atlas code: <code>${esc(r.code)}</code>`)
              : notice(
                  "Your roster is confirmed. Ask the agency to issue your campaign code.",
                  true
                )
          }<p class="small muted">Atlas codes coordinate internal submissions. They are not native YouTube Studio partnership authorization.</p><div class="list-row"><span>Your package</span><strong>${
            r.quantity
          } long-form video · ${money(
            r.rate * r.quantity
          )}</strong></div><div class="actions" style="margin-top:20px">${b(
            "Reserve pre-upload intent",
            "reserve",
            { id: x.id }
          )}${b("Submit posted-video URL", "submitDialog", {
            id: x.id,
          })}</div></div>`
        ) +
        panel(
          "Your submissions",
          videos.length
            ? table(
                ["Submission", "Status", "Performance", "Action"],
                videos.map((v) => [
                  esc(v.videoId || "Reserved upload"),
                  badge(v.status),
                  v.status === "tracked"
                    ? `${count(
                        v.metrics.views
                      )} views · fictional lifetime fixture`
                    : v.reason
                    ? esc(v.reason)
                    : "Not tracked",
                  v.status === "pending_upload"
                    ? b("Attach posted URL", "attachDialog", { id: v.id })
                    : b("View verification", "videoDetail", { id: v.id }),
                ])
              )
            : empty(
                "No submissions yet",
                "Reserve your next upload or submit a posted-video link."
              )
        )
      : "")
  );
}
export function action(c, a, p) {
  let x = c.s.campaigns.find((x) => x.id === p.id);
  if (a === "funnelTab") {
    funnelTab = ["combined", "organic", "paid"].includes(p.tab) ? p.tab : "combined";
    c.render();
    return true;
  }
  if (a === "wizardBack") {
    step = Math.max(0, step - 1);
    c.render();
    return true;
  }
  if (a === "applicationDetail") {
    let app = c.s.applications.find((x) => x.id === p.id),
      cp = c.s.campaigns.find((x) => x.id === app.campaignId),
      cr = creator(c.s, app.creatorId);
    let buttons = "";
    if (manage(c) && app.status === "pending_brand")
      buttons =
        b(
          "Approve application",
          "reviewDialog",
          { id: app.id, decision: "approved" },
          "primary"
        ) +
        b(
          "Reject application",
          "reviewDialog",
          { id: app.id, decision: "rejected" },
          "danger"
        );
    if (["approved", "needs_review"].includes(app.status))
      buttons += b(
        "Run eligibility assessment",
        "startEligibility",
        { id: app.id },
        "primary"
      );
    if (app.status === "under_analysis")
      buttons += b(
        "Choose simulated outcome",
        "assessmentDialog",
        { id: app.id },
        "primary"
      );
    if (c.role === "creator" && app.status === "pending_brand")
      buttons += b(
        "Withdraw application",
        "withdrawDialog",
        { id: app.id },
        "danger"
      );
    buttons += link("Open campaign", "campaign/" + cp.id);
    c.modal(
      "Application review",
      `${identity(cr)}<p style="margin-top:20px">${esc(cp.name)}</p>${badge(
        app.status
      )}${table(
        ["Application detail", "Submitted value"],
        [
          ["Proposed rate", money(app.rate) + (app.compensation === "sample_only" ? " · sample only" : "")],
          ["Contact", esc(app.contact)],
          ["Channel URL", esc(app.channelUrl || "—")],
          ["Creator message", esc(app.message || "No message")],
          [
            "Eligibility",
            app.eligibility
              ? esc(app.eligibility.outcome || app.eligibility.status)
              : "Not assessed",
          ],
          ["Next step", esc(nextLabel(app))],
        ]
      )}${notice(
        "Approval and eligibility are separate. Only an eligible assessment creates confirmed roster membership. Demo eligibility outcomes are selected manually; no AI or external checks run."
      )}<div class="actions">${buttons}${b(
        "View creator profile",
        "creatorProfile",
        { id: app.creatorId }
      )}</div>`
    );
    return true;
  }
  if (a === "applyDialog") {
    c.modal(
      "Apply to " + x.name,
      `<form id="application-form" data-id="${x.id}">${notice(
        "Applying as Maya Makes. Channel URL and compensation preference travel with the application for agency review; eligibility still runs separately after approval."
      )}<div class="form-grid">${field(
        "Channel",
        "channel",
        "Maya Makes",
        "text",
        "readonly"
      )}${field(
        "Contact email",
        "contact",
        "maya@example.test",
        "email",
        "required"
      )}${field(
        "YouTube channel URL",
        "channelUrl",
        "https://youtube.com/@mayamakes",
        "url",
        "required placeholder=\"https://youtube.com/@mayamakes\""
      )}${field(
        "Proposed long-form rate · IDR",
        "rate",
        4000000,
        "number",
        'required min="1" step="1"'
      )}</div><div class="field">Compensation preference<label class="check"><input type="radio" name="compensation" value="rate_card" checked>Rate card — paid deliverables</label><label class="check"><input type="radio" name="compensation" value="sample_only">Sample only — product sample, no paid rate yet</label></div>${area(
        "Why are you suitable?",
        "message",
        "",
        "required"
      )}${submit("Submit application")}</form>`
    );
    return true;
  }
  if (a === "reviewDialog") {
    c.confirm(
      p.decision === "approved"
        ? "Approve this application?"
        : "Reject this application?",
      p.decision === "approved"
        ? "The creator must complete eligibility before joining the roster."
        : "The creator will see the rejection decision.",
      "review",
      p
    );
    return true;
  }
  if (a === "withdrawDialog") {
    c.confirm(
      "Withdraw your application?",
      "You may apply again while the campaign remains open.",
      "withdraw",
      p
    );
    return true;
  }
  if (a === "startEligibility") {
    c.execute(a, p, "Eligibility processing started");
    c.modal(
      "Eligibility assessment",
      notice(
        "Simulated processing. Production uses channel evidence, campaign thresholds and AI-assisted analysis. This demo does not call those services."
      ) +
        `<div class="empty"><span class="spinner" aria-label="Processing"></span><h3>Eligibility assessment in progress</h3><p>Choose a demo outcome to explore success, review-required, ineligible or failed states.</p>${b(
          "Choose simulated outcome",
          "assessmentDialog",
          p,
          "primary"
        )}</div>`
    );
    return true;
  }
  if (a === "assessmentDialog") {
    c.modal(
      "Simulate eligibility result",
      `<form id="assessment-form" data-id="${p.id}">${notice(
        "Presenter control · outcome is simulated, not an actual score or verified decision.",
        true
      )}${select("Assessment outcome", "outcome", [
        ["eligible", "Eligible — confirm roster atomically"],
        ["needs_review", "Review required — do not roster"],
        ["not_eligible", "Ineligible — do not roster"],
        ["failed", "Generation failed — return to approved for retry"],
      ])}${submit("Complete simulated assessment")}</form>`
    );
    return true;
  }
  if (a === "launchDialog") {
    let errors = readiness(x);
    c.modal(
      "Launch campaign",
      errors.length
        ? notice(errors.map(esc).join("<br>"), true)
        : `<p>Open creator applications and freeze the current forecast as the campaign baseline.</p>${b(
            "Confirm launch",
            "launch",
            p,
            "primary"
          )}`
    );
    return true;
  }
  if (a === "lifecycleDialog") {
    if (p.status === "cancelled") {
      c.modal(
        "Cancel campaign",
        `<form id="cancel-campaign" data-id="${p.id}">${area(
          "Cancellation reason",
          "reason",
          "",
          "required"
        )}${notice(
          "Cancellation withdraws roster participation and makes Atlas codes unusable.",
          true
        )}${submit("Cancel campaign")}</form>`
      );
      return true;
    }
    c.confirm(
      "Set campaign to " + p.status + "?",
      "Campaign availability and submission access will follow this state.",
      "lifecycle",
      p
    );
    return true;
  }
  if (a === "discard") {
    c.confirm(
      "Discard draft?",
      "This removes the local draft. Launched campaigns use lifecycle actions.",
      "deleteDraft",
      p,
      "campaigns"
    );
    return true;
  }
  if (["submitDialog", "attachDialog"].includes(a)) {
    c.modal(
      a === "attachDialog" ? "Attach a posted video" : "Submit a posted video",
      `<form id="video-form" data-id="${p.id}" data-mode="${
        a === "attachDialog" ? "attachVideo" : "submitVideo"
      }">${field(
        "YouTube video URL",
        "url",
        "",
        "url",
        'required placeholder="https://www.youtube.com/watch?v=abcdefghijk"'
      )}${notice(
        "Demo example: https://www.youtube.com/watch?v=abcdefghijk. No YouTube request is made. Metadata must be resolved and verified by the agency."
      )}${submit("Submit for verification")}</form>`
    );
    return true;
  }
  if (a === "videoDetail") {
    let v = c.s.videos.find((v) => v.id === p.id);
    c.modal(
      "Submission verification",
      `${badge(v.status)}${table(
        ["Evidence", "Value"],
        [
          ["Video URL", esc(v.url || "Awaiting upload")],
          ["Metadata", esc(v.metadata)],
          ["Reason", esc(v.reason || "—")],
          [
            "Metrics",
            v.status === "tracked"
              ? `${count(v.metrics.views)} lifetime views · fictional fixture`
              : "Excluded from monitoring",
          ],
        ]
      )}${
        manage(c) && v.status === "pending_verification"
          ? `<div class="actions" style="margin-top:20px">${
              v.metadata !== "resolved"
                ? b("Resolve demo metadata", "resolveVideo", p)
                : b("Verify & track", "verifyDialog", p, "primary")
            }${b("Simulate metadata error", "resolveFail", p)}${b(
              "Reject submission",
              "rejectDialog",
              p,
              "danger"
            )}</div>`
          : ""
      }`
    );
    return true;
  }
  if (a === "verifyDialog") {
    c.confirm(
      "Verify and track this video?",
      "The demo metadata is resolved. Tracking adds its fictional source counters to monitoring.",
      "verifyVideo",
      p
    );
    return true;
  }
  if (a === "rejectDialog") {
    c.modal(
      "Reject submission",
      `<form id="reject-form" data-id="${p.id}">${area(
        "Reason for creator",
        "reason",
        "",
        "required"
      )}${submit("Reject submission")}</form>`
    );
    return true;
  }
  if (a === "resolveFail") {
    c.execute(
      "resolveVideo",
      { ...p, fail: true },
      "Metadata resolution failed; retry Resolve metadata"
    );
    return true;
  }
  if (a === "commerceTemplate") {
    let m = monitoring(c.s, p.id);
    c.download(
      "commerce-template.csv",
      `video_id,orders,gmv\n${
        m.videos[0]?.videoId || "abcdefghijk"
      },12,2400000\n`,
      "text/csv"
    );
    return true;
  }
  if (a === "commerceDialog") {
    c.modal(
      "Import commerce evidence",
      `<form id="commerce-form" data-id="${p.id}">${notice(
        "Manual CSV evidence only. Use video_id,orders,gmv; all video IDs must already be tracked. Currency: IDR. Avoid importing the same evidence twice."
      )}<label class="field">CSV file<input type="file" name="csv" accept=".csv,text/csv" required></label>${submit(
        "Import CSV evidence"
      )}</form>`
    );
    return true;
  }
  if (a === "exportCampaign") {
    let cp = c.s.campaigns.find((x) => x.id === p.id),
      m = monitoring(c.s, p.id);
    c.download(
      "campaign-performance.csv",
      "campaign,video_id,creator,views,likes,comments,metric_coverage\n" +
        m.videos
          .map((v) =>
            [
              cp.name,
              v.videoId,
              creator(c.s, v.creatorId).name,
              v.metrics.views,
              v.metrics.likes,
              v.metrics.comments,
              "Fictional lifetime fixture",
            ]
              .map((z) => '"' + String(z).replaceAll('"', '""') + '"')
              .join(",")
          )
          .join("\n"),
      "text/csv"
    );
    return true;
  }
  if (
    [
      "saveForecast",
      "launch",
      "issueCode",
      "reserve",
      "monitorInsight",
      "revertCommerce",
    ].includes(a)
  ) {
    c.execute(
      a,
      p,
      {
        launch: "Campaign opened; baseline locked",
        issueCode: "Atlas code issued",
        reserve: "Pre-upload intent reserved",
        saveForecast: "Estimated forecast saved",
        monitorInsight: "Simulated analysis added to history",
        revertCommerce: "Commerce import reverted",
      }[a]
    );
    return true;
  }
  return false;
}
export async function form(c, name, v, form) {
  if (name === "cancel-campaign") {
    c.execute(
      "lifecycle",
      { id: form.dataset.id, status: "cancelled", reason: v.reason },
      "Campaign cancelled; roster withdrawn"
    );
    return true;
  }
  if (name === "campaign-wizard") {
    if (step === 0) Object.assign(wizard, v);
    if (step === 1) {
      Object.assign(wizard, v, {
        budget: +v.budget,
        slots: +v.slots,
        minSubscribers: +v.minSubscribers,
      });
      if (v.end < v.start || v.close < v.start || v.close > v.end)
        throw Error(
          "Dates must be ordered; application close must be within the campaign period"
        );
    }
    if (step === 2) {
      wizard.roster = c.s.creators
        .filter((x) => v["creator_" + x.id])
        .map((x) => ({
          creatorId: x.id,
          rate: +v["rate_" + x.id],
          quantity: +v["qty_" + x.id],
        }));
      if (!wizard.roster.length)
        throw Error("Select at least one planned creator");
      if (
        wizard.roster.some(
          (r) => r.rate <= 0 || !Number.isInteger(r.quantity) || r.quantity < 1
        )
      )
        throw Error("Enter positive rates and whole video quantities");
      if (wizard.slots < wizard.roster.length)
        throw Error("Increase creator slots to fit the planned roster");
    }
    if (step === 3) {
      wizard.overrun = !!v.overrun;
      if (["hybrid", "creator", "ads"].includes(v.mix)) wizard.mix = v.mix;
      if (v.targetROI !== undefined && v.targetROI !== "") {
        let t = +v.targetROI;
        if (!(t > 0)) throw Error("Enter a positive target ROI");
        wizard.targetROI = t;
      }
      if (investment(wizard) > wizard.budget && !wizard.overrun)
        throw Error(
          "Acknowledge the budget overrun or return to creator packages"
        );
    }
    if (step === 5) {
      let cp = structuredClone(wizard);
      delete cp.editId;
      c.execute(
        wizard.editId ? "updateCampaign" : "createCampaign",
        wizard.editId ? { ...cp, id: wizard.editId } : cp,
        "Draft saved",
        false
      );
      let campaignId = wizard.editId || c.s.campaigns.at(-1).id;
      c.execute("saveForecast", { id: campaignId }, "Forecast saved", false);
      wizard = null;
      step = 0;
      c.navigate("campaign/" + campaignId + "/planning");
      return true;
    }
    step++;
    c.render();
    return true;
  }
  if (name === "application-form") {
    c.execute("apply", { ...v, id: form.dataset.id }, "Application submitted");
    c.navigate("applications");
    return true;
  }
  if (name === "assessment-form") {
    c.execute(
      "finishEligibility",
      { ...v, id: form.dataset.id },
      v.outcome === "eligible"
        ? "Eligible; confirmed roster updated"
        : "Assessment outcome recorded"
    );
    return true;
  }
  if (name === "video-form") {
    c.execute(
      form.dataset.mode,
      { ...v, id: form.dataset.id },
      "Video submitted; awaiting metadata resolution and verification"
    );
    return true;
  }
  if (name === "reject-form") {
    c.execute(
      "rejectVideo",
      { ...v, id: form.dataset.id },
      "Submission rejected"
    );
    return true;
  }
  if (name === "commerce-form") {
    let file = form.elements.csv.files[0],
      text = await file.text(),
      lines = text.trim().split(/\r?\n/);
    if (lines[0].replace(/^\uFEFF/, "").trim() !== "video_id,orders,gmv")
      throw Error("Expected CSV header: video_id,orders,gmv");
    let rows = lines
      .slice(1)
      .filter(Boolean)
      .map((line) => {
        let values = line.split(",");
        if (values.length !== 3)
          throw Error("Each CSV row needs exactly three values");
        return {
          video_id: values[0].trim(),
          orders: values[1].trim(),
          gmv: values[2].trim(),
        };
      });
    c.execute(
      "importCommerce",
      { id: form.dataset.id, rows },
      "Manual evidence imported"
    );
    return true;
  }
  return false;
}
export function change(c, name, value) {
  if (name === "appFilter") {
    appFilter = value;
    c.render();
    return true;
  }
  return false;
}
