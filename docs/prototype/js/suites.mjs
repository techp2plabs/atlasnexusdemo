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
} from "./ui.mjs";
import { toolNames } from "./state.mjs";
let reportQuery = "",
  archive = false,
  unlocked = null;
const own = (c, r) => r.owner === c.role || c.role === "admin";
const channels = (c, r) =>
  c.s.creators.filter((x) => r.channelIds.includes(x.id));
export function page(c, path) {
  let [_, tool, id, tab] = path.split("/");
  if (!tool) return catalog(c);
  if (!toolNames[tool])
    return empty(
      "Tool not found",
      "Choose a Creator Suite.",
      link("Creator Suites", "suites")
    );
  if (!c.s.tools[tool].enabled && c.role !== "admin")
    return empty(
      "Tool access disabled",
      "Ask the platform administrator to enable this tool.",
      link("Creator Suites", "suites")
    );
  if (id === "new") return setup(c, tool);
  if (id) {
    let r = c.s.reports.find((r) => r.id === id && own(c, r));
    return r
      ? result(c, r, tab || "overview")
      : empty(
          "Report not found",
          "This report may belong to a different demo account.",
          link("My reports", "suites/" + tool)
        );
  }
  let list = c.s.reports.filter(
    (r) =>
      r.tool === tool &&
      own(c, r) &&
      !!r.archived === archive &&
      r.name.toLowerCase().includes(reportQuery.toLowerCase())
  );
  return (
    heading(
      toolNames[tool],
      "Create, review and share channel evidence.",
      link("All tools", "suites") +
        link(
          "Create " + (tool === "profile" ? "profiling set" : "report"),
          "suites/" + tool + "/new",
          "primary"
        )
    ) +
    notice(
      tool === "channel"
        ? "Channel Report is independently enabled. Selection uses a month; displayed public video counters remain lifetime totals. Demo access is enabled for all three tools."
        : "Fictional fixtures only. Tool limits and role access are configured by Super Admin."
    ) +
    `<form class="filters" id="report-search"><input name="q" aria-label="Search reports" placeholder="Search reports" value="${esc(
      reportQuery
    )}"><button class="btn">Search</button>${b(
      archive ? "Show active" : "Show archived",
      "reportArchiveView"
    )}</form>` +
    panel(
      archive ? "Archived reports" : "Saved reports",
      list.length
        ? table(
            ["Report", "Channels / period", "Status", "Action"],
            list.map((r) => [
              `<strong>${esc(r.name)}</strong><small>${new Date(
                r.createdAt
              ).toLocaleString()}</small>`,
              `${r.channelIds.length} channels<small>${esc(
                r.month || r.start || "Profiling set"
              )}</small>`,
              badge(r.status),
              link("Open", "suites/" + tool + "/" + r.id),
            ])
          )
        : empty(
            "No reports here",
            "Create a report to explore the complete generation workflow.",
            link("Create report", "suites/" + tool + "/new", "primary")
          )
    )
  );
}
function catalog(c) {
  return (
    heading(
      "Creator Suites",
      "Turn channel evidence into useful reports and research profiles."
    ) +
    `<div class="grid">${Object.entries(toolNames)
      .map(([id, name]) => {
        let cfg = c.s.tools[id];
        return `<article class="card"><span class="initial">${
          id === "deal" ? "BD" : id === "channel" ? "CR" : "CP"
        }</span><h3>${name}</h3><p>${
          {
            deal: "Bring sponsored-video URLs into one performance report for a brand.",
            channel: "Choose your accessible channel and a reporting month.",
            profile: "Build a research set of public channel profiles.",
          }[id]
        }</p>${badge(
          cfg.enabled ? "Enabled" : "Disabled"
        )}<div class="list-row"><span class="muted small">Input limit</span><strong>${
          cfg.limit
        } ${
          id === "profile" ? "channels" : "videos"
        }</strong></div><div class="list-row"><span class="muted small">Refresh allowance</span><strong>${
          cfg.daily
        } / day</strong></div><div class="actions">${
          cfg.enabled || c.role === "admin"
            ? link("Open tool", "suites/" + id, "primary")
            : badge("Ask administrator")
        }</div></article>`;
      })
      .join("")}</div>` +
    notice(
      "Every tool includes configuration, a simulated generation state, saved results and error/retry. Exports are local CSV; sharing is a same-browser demo of production code-gated access. No cloud exports, AI calls or YouTube synchronization run."
    )
  );
}
function setup(c, tool) {
  let available =
    c.role === "creator" && tool !== "profile"
      ? c.s.creators.filter((x) => x.id === "c1")
      : c.s.creators;
  return (
    heading(
      "Create " + (tool === "profile" ? "profiling set" : "report"),
      toolNames[tool],
      link("Back to reports", "suites/" + tool)
    ) +
    `<section class="panel pad wizard"><form id="suite-create" data-tool="${tool}"><div class="form-grid">${field(
      tool === "profile" ? "Profiling set name" : "Report name",
      "name",
      "",
      "text",
      'required maxlength="120"'
    )}${
      tool === "deal"
        ? field("Brand name", "brand", "Lumina", "text", "required")
        : ""
    }${
      tool === "channel"
        ? field("Reporting month", "month", "2026-10", "month", "required")
        : ""
    }${
      tool === "deal"
        ? field("Period start", "start", "2026-10-01", "date", "required") +
          field("Period end", "end", "2026-10-31", "date", "required")
        : ""
    }</div><h3>${
      tool === "profile"
        ? "Import public channel fixtures"
        : "Accessible channels"
    }</h3>${available
      .map(
        (x) =>
          `<label class="check"><input type="checkbox" name="channel_${x.id}" ${
            x.id === "c1" ? "checked" : ""
          }>${esc(x.name)} · ${esc(x.handle)}</label>`
      )
      .join("")}${
      tool === "deal"
        ? area(
            "YouTube video URLs · one per line",
            "urls",
            "",
            'required placeholder="https://www.youtube.com/watch?v=abcdefghijk"'
          )
        : ""
    }${
      tool === "profile"
        ? area(
            "Research description",
            "description",
            "Review channel positioning and content focus."
          )
        : ""
    }${notice(
      tool === "profile"
        ? "This offline demo imports selected fictional public channel fixtures. Production accepts channel imports. Audience demographics and AI suitability scores are unavailable."
        : tool === "channel"
        ? "Production resolves channel videos using Content Owner analytics, then OAuth, then an upload-date fallback. This demo uses fixed lifetime counter fixtures."
        : "Repeated video IDs are deduplicated. Limit: " +
          c.s.tools[tool].limit +
          " video URLs. Example: https://youtu.be/abcdefghijk"
    )}<label class="check"><input name="simulateFail" type="checkbox">Simulate a generation failure to explore retry</label><div class="wizard-footer">${link(
      "Cancel",
      "suites/" + tool
    )}${submit(
      "Generate " + (tool === "profile" ? "profile" : "report")
    )}</div></form></section>`
  );
}
function result(c, r, tab, publicView = false) {
  let titles =
    r.tool === "profile"
      ? ["overview", "channels", "setup"]
      : ["overview", "videos", "channels", "insight", "setup"];
  if (publicView) titles = titles.filter((x) => !["setup"].includes(x));
  if (!titles.includes(tab)) tab = "overview";
  let cs = channels(c, r),
    views =
      r.tool === "deal"
        ? r.urls.length * 42000
        : cs.reduce((n, x) => n + x.avgViews * 3, 0);
  let header = heading(
    r.name,
    toolNames[r.tool],
    publicView
      ? badge("Read-only demo share")
      : link("All reports", "suites/" + r.tool)
  );
  if (r.status === "processing")
    return (
      header +
      panel(
        "Generating report",
        `<div class="empty"><span class="spinner" aria-label="Generation in progress"></span><h3>Preparing demo evidence</h3><p>Simulating generation; no external services are contacted.</p>${b(
          "Complete demo generation",
          "completeSuite",
          { id: r.id }
        )}</div>`
      )
    );
  if (r.status === "failed")
    return (
      header +
      panel(
        "Generation failed",
        empty(
          "Demo generation failed",
          "Your inputs are preserved. Retry to complete the workflow.",
          b("Retry generation", "retrySuite", { id: r.id }, "primary")
        )
      )
    );
  let body = "";
  if (tab === "overview")
    body =
      (r.tool === "profile"
        ? stats([
            ["Channels", cs.length, "Selected research fixtures"],
            [
              "Subscribers",
              count(cs.reduce((n, x) => n + x.subs, 0)),
              "Public source metric fixtures",
            ],
            [
              "Average views",
              count(cs.reduce((n, x) => n + x.avgViews, 0) / cs.length),
              "Calculated sample mean",
            ],
            [
              "Audience demographics",
              "Unavailable",
              "No private analytics connection",
            ],
          ])
        : stats([
            ["Views", count(views), "Lifetime counter fixtures"],
            [
              "Likes",
              count(Math.round(views * 0.041)),
              "Lifetime counter fixtures",
            ],
            [
              "Comments",
              count(Math.round(views * 0.003)),
              "Lifetime counter fixtures",
            ],
            [
              "Videos",
              r.tool === "deal" ? r.urls.length : cs.length * 3,
              "Selected video fixtures",
            ],
          ])) +
      panel(
        r.tool === "profile" ? "Channel positioning" : "Performance overview",
        `<div class="pad">${cs
          .map(
            (x) =>
              `<div class="list-row"><div>${identity(
                x
              )}<p class="muted small" style="margin-top:10px">${esc(
                x.description
              )}</p></div><span>${esc(x.niche)}</span></div>`
          )
          .join("")}<p class="muted small" style="margin-top:16px">${
          r.tool === "profile"
            ? "Positioning is a fictional creator-provided description. No AI suitability scoring or private audience inference."
            : "Counts are public lifetime metric fixtures. Reporting period governs selection; these figures are not period-only performance. GMV and order attribution are unavailable."
        }</p></div>`
      );
  if (tab === "channels")
    body = panel(
      "Channel evidence",
      table(
        [
          "Channel",
          "Subscribers · fixture",
          "Average views · estimate",
          "Engagement · sample",
          ...(r.tool === "profile" && !publicView ? ["Actions"] : []),
        ],
        cs.map((x) => [
          identity(x),
          count(x.subs),
          count(x.avgViews),
          x.engagement + "%",
          ...(r.tool === "profile" && !publicView
            ? [
                `<div class="actions">${b("Refresh channel", "profileRefresh", {
                  id: r.id,
                  creatorId: x.id,
                })}${b("Remove channel", "profileRemove", {
                  id: r.id,
                  creatorId: x.id,
                })}</div>`,
              ]
            : []),
        ])
      )
    );
  if (tab === "videos") {
    let rows =
      r.tool === "deal"
        ? r.urls.map((url, i) => [
            esc(url),
            esc(cs[0].name),
            count(42000),
            count(1722),
            count(126),
          ])
        : cs.flatMap((x) =>
            [1, 2, 3].map((i) => [
              esc(x.name + " · Sample video " + i),
              esc(x.name),
              count(x.avgViews),
              count(Math.round(x.avgViews * 0.041)),
              count(Math.round(x.avgViews * 0.003)),
            ])
          );
    body = panel(
      "Video performance",
      table(["Video", "Channel", "Views", "Likes", "Comments"], rows),
      "All counts are fictional lifetime counters"
    );
  }
  if (tab === "insight")
    body = panel(
      "On-demand report insights",
      `<div class="pad">${notice(
        "AI insight demonstration only. Each explicit generation appends a history entry; no model is contacted."
      )}${
        r.insights
          .map(
            (i) =>
              `<div class="list-row"><div><strong>Simulated executive insight</strong><p>${esc(
                i.text
              )}</p><small>${new Date(
                i.at
              ).toLocaleString()}</small></div></div>`
          )
          .join("") || '<p class="muted">No insights generated yet.</p>'
      }${
        publicView
          ? ""
          : b(
              "Generate demo executive insight",
              "suiteInsight",
              { id: r.id },
              "primary"
            )
      }</div>`
    );
  if (tab === "setup")
    body = panel(
      "Saved inputs",
      `<div class="pad">${table(
        ["Input", "Value"],
        [
          ["Name", esc(r.name)],
          [
            "Period",
            esc(
              r.tool === "profile"
                ? "Public channel research"
                : r.month || r.start + " — " + r.end
            ),
          ],
          ["Channels", cs.map((x) => esc(x.name)).join(", ")],
          ["Brand / description", esc(r.brand || r.description || "—")],
          [
            "Metric coverage",
            "Lifetime public counter fixtures; no private audience information",
          ],
        ]
      )}</div>`
    );
  return (
    header +
    notice(
      "Demo result · all channel identities and performance values are fictional. No authenticated production data is used in this workspace."
    ) +
    `<div class="tabs" role="tablist" aria-label="Report sections">${titles
      .map(
        (t) =>
          `<a class="tab" role="tab" aria-selected="${t === tab}" href="${
            publicView ? "#" : `#suites/${r.tool}/${r.id}/`
          }${t}">${t[0].toUpperCase() + t.slice(1)}</a>`
      )
      .join("")}</div>` +
    body +
    (publicView
      ? ""
      : panel(
          "Report actions",
          `<div class="pad"><div class="actions">${b(
            "Download demo CSV",
            "exportSuite",
            { id: r.id }
          )}${b(
            r.shared ? "Disable demo share" : "Create demo share",
            "shareSuite",
            { id: r.id }
          )}${
            r.tool === "profile"
              ? ""
              : b("Refresh demo data", "refreshSuite", { id: r.id })
          }${b(
            r.archived ? "Restore report" : "Archive report",
            "archiveSuite",
            { id: r.id }
          )}</div>${
            r.shared
              ? `<div class="notice" style="margin-top:18px">Local demo access code: <code>${esc(
                  r.shareCode
                )}</code><p style="margin:8px 0 0"><a class="btn" href="share.html?id=${
                  r.id
                }" target="_blank" rel="noopener">Open code-gated demo share</a></p><p class="small muted" style="margin-top:10px">Same browser and origin only. Production stores salted hashes and uses expiring tokens; this fixture is not secure authentication.</p></div>`
              : ""
          }</div>`
        ))
  );
}
export function sharePage(c) {
  let id = new URLSearchParams(location.search).get("id"),
    r = c.s.reports.find((r) => r.id === id && r.shared && !r.archived);
  if (!r)
    return `<div class="share-page">${heading(
      "Share unavailable",
      "The local demo share is missing, disabled or archived."
    )}<a class="btn" href="index.html">Demo sign in</a></div>`;
  return `<div class="share-page">${
    unlocked === r.shareCode
      ? result(c, r, location.hash.slice(1) || "overview", true)
      : panel(
          "Open shared report",
          `<div class="pad"><p>${esc(r.name)}</p>${notice(
            "Local prototype share · enter the demo access code from the report owner. No real authentication is provided."
          )}<form id="share-unlock" data-id="${r.id}">${field(
            "Demo access code",
            "code",
            "",
            "text",
            'required minlength="8" maxlength="8" autocomplete="off"'
          )}${submit("View shared report")}</form></div>`
        )
  }</div>`;
}
export function action(c, a, p) {
  if (a === "profileRefresh") {
    c.execute(
      "refreshProfileChannel",
      p,
      "Channel fixture refreshed; daily usage recorded"
    );
    return true;
  }
  if (a === "profileRemove") {
    c.confirm(
      "Remove this channel?",
      "The research set will retain its remaining channels.",
      "removeProfileChannel",
      p
    );
    return true;
  }
  if (a === "reportArchiveView") {
    archive = !archive;
    c.render();
    return true;
  }
  if (a === "completeSuite") {
    let r = c.s.reports.find((x) => x.id === p.id);
    c.execute(
      "completeReport",
      { id: r.id, fail: r.simulateFail },
      r.simulateFail
        ? "Demo generation failed; retry is available"
        : "Demo report generated"
    );
    return true;
  }
  if (a === "retrySuite") {
    c.execute("retryReport", p, "Retry started", false);
    c.execute("completeReport", p, "Demo report generated");
    return true;
  }
  if (a === "suiteInsight") {
    c.execute("reportInsight", p, "Simulated insight appended to history");
    return true;
  }
  if (a === "shareSuite") {
    c.execute("shareReport", p, "Demo sharing updated");
    return true;
  }
  if (a === "archiveSuite") {
    c.execute("archiveReport", p, "Archive state updated");
    return true;
  }
  if (a === "refreshSuite") {
    c.execute("refreshReport", p, "Refreshing demo report", false);
    c.execute("completeReport", p, "Demo refresh completed");
    return true;
  }
  if (a === "exportSuite") {
    let r = c.s.reports.find((x) => x.id === p.id);
    let rows = channels(c, r).map((x) =>
      [x.name, x.subs, x.avgViews, x.engagement, "Fictional fixture"].join(",")
    );
    c.download(
      r.tool + "-report.csv",
      "channel,subscribers,average_views_estimate,engagement_sample,provenance\n" +
        rows.join("\n"),
      "text/csv"
    );
    return true;
  }
  return false;
}
export function form(c, name, v, form) {
  if (name === "report-search") {
    reportQuery = v.q;
    c.render();
    return true;
  }
  if (name === "suite-create") {
    let tool = form.dataset.tool,
      channelIds = c.s.creators
        .filter((x) => v["channel_" + x.id])
        .map((x) => x.id);
    c.execute(
      "createReport",
      {
        tool,
        name: v.name,
        brand: v.brand,
        start: v.start,
        end: v.end,
        month: v.month,
        description: v.description,
        channelIds,
        urls: (v.urls || "")
          .split(/\n/)
          .map((x) => x.trim())
          .filter(Boolean),
        simulateFail: !!v.simulateFail,
      },
      "Demo generation started",
      false
    );
    c.navigate("suites/" + tool + "/" + c.s.reports.at(-1).id);
    return true;
  }
  if (name === "share-unlock") {
    let r = c.s.reports.find(
      (x) => x.id === form.dataset.id && x.shared && !x.archived
    );
    if (!r || v.code.trim().toUpperCase() !== r.shareCode)
      throw Error("The demo code is incorrect or sharing has been disabled");
    unlocked = r.shareCode;
    c.render();
    return true;
  }
  return false;
}
