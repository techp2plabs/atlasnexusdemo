export const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
export const money = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
export const count = (n) =>
  n == null
    ? "Unavailable"
    : new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n);
export const b = (label, action, args = {}, cls = "") =>
  `<button type="button" class="btn ${cls}" data-action="${action}" data-args="${esc(
    JSON.stringify(args)
  )}">${label}</button>`;
export const link = (label, path, cls = "") =>
  `<a class="btn ${cls}" href="#${path}">${label}</a>`;
export const badge = (status) => {
  let labels = {
    pending_brand: "Submitted · under review",
    under_analysis: "Eligibility processing",
    not_eligible: "Ineligible",
    needs_review: "Review required",
    pending_upload: "Reserved · awaiting upload",
    pending_verification: "Pending verification",
    eligible: "Eligible · roster confirmed",
  };
  let color = ["eligible", "tracked", "completed", "Active", "open"].includes(
    status
  )
    ? "green"
    : ["rejected", "not_eligible", "failed", "Suspended"].includes(status)
    ? "red"
    : [
        "approved",
        "pending_brand",
        "needs_review",
        "paused",
        "processing",
        "under_analysis",
      ].includes(status)
    ? "amber"
    : "";
  return `<span class="badge ${color}">${esc(labels[status] || status)}</span>`;
};
export const heading = (title, sub, actions = "") =>
  `<div class="heading"><div><h1>${esc(title)}</h1><p>${esc(
    sub
  )}</p></div><div class="actions">${actions}</div></div>`;
export const notice = (text, amber = false) =>
  `<div class="notice ${amber ? "amber" : ""}">${text}</div>`;
export const empty = (title, text, cta = "") =>
  `<div class="empty"><h3>${esc(title)}</h3><p>${esc(text)}</p>${cta}</div>`;
export const panel = (title, body, sub = "", actions = "") =>
  `<section class="panel"><div class="panel-head"><div><h2>${esc(title)}</h2>${
    sub ? `<p>${esc(sub)}</p>` : ""
  }</div><div class="actions">${actions}</div></div>${body}</section>`;
export const stats = (items) =>
  `<div class="stats">${items
    .map(
      ([label, value, hint]) =>
        `<div class="stat"><span>${esc(label)}</span><strong>${esc(
          value
        )}</strong><small>${esc(hint || "Demo data")}</small></div>`
    )
    .join("")}</div>`;
export const table = (headers, rows, cls = "") =>
  `<div class="table-wrap"><table class="${cls}"><thead><tr>${headers
    .map((x) => `<th scope="col">${x}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((x) => `<td>${x}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
export const field = (label, name, value = "", type = "text", attrs = "") =>
  `<label class="field">${esc(
    label
  )}<input name="${name}" type="${type}" value="${esc(
    value
  )}" ${attrs}></label>`;
export const area = (label, name, value = "", attrs = "") =>
  `<label class="field wide">${esc(
    label
  )}<textarea name="${name}" ${attrs}>${esc(value)}</textarea></label>`;
export const select = (label, name, options, value = "", attrs = "") =>
  `<label class="field">${esc(label)}<select name="${name}" ${attrs}>${options
    .map(
      ([id, title]) =>
        `<option value="${esc(id)}" ${id === value ? "selected" : ""}>${esc(
          title
        )}</option>`
    )
    .join("")}</select></label>`;
export const submit = (label = "Save changes") =>
  `<button class="btn primary" type="submit">${label}</button>`;
// Formula explainer, mirroring the management demo ⓘ pattern. Static text
// only — no live API source is implied.
const tips = {
  gmv: ["Net GMV", "Orders × value from imported commerce evidence (IDR).", "Manual CSV import per tracked video"],
  cce: ["CCE", "Commerce Conversion Efficiency = Net GMV ÷ creator investment.", "Tracked fixtures + manual commerce evidence"],
  roi: ["Est. ROI", "Estimated GMV ÷ planned creator investment.", "Demo forecast model, not a promise"],
  fit: ["Fit Score", "Demo composite 0–100 for brand / SKU / audience match.", "Fictional planning aid, not a verified decision"],
  sku: ["SKU match", "Audience–product fit per SKU, 0–100.", "Fictional demo heat"],
};
export const infoTip = (key) => {
  let t = tips[key];
  if (!t) return "";
  return ` <span class="info-tip" tabindex="0" aria-label="${esc(
    t[0] + ": " + t[1]
  )}">ⓘ<span class="info-tip__panel" role="tooltip"><strong>${esc(
    t[0]
  )}</strong><span>${esc(t[1])}</span><span class="info-tip__source">Source: ${esc(
    t[2]
  )}</span></span></span>`;
};
export const flowStrip = (steps, active = -1) =>
  `<div class="flow-strip" aria-label="End-to-end flow">${steps
    .map(
      ([t, d], i) =>
        `<div class="flow-step ${i === active ? "flow-step--active" : ""}"><span class="flow-step__n">${
          i + 1
        }</span><div><div class="flow-step__t">${esc(t)}</div><div class="flow-step__d">${esc(
          d
        )}</div></div></div>${i < steps.length - 1 ? '<div class="flow-arrow" aria-hidden="true">→</div>' : ""}`
    )
    .join("")}</div>`;
export const funnelTabs = (active = "combined") =>
  `<div class="funnel-tabs" role="tablist" aria-label="Attribution funnel">${[
    ["combined", "Combined"],
    ["organic", "Organic only"],
    ["paid", "Paid ads only"],
  ]
    .map(
      ([id, label]) =>
        `<button type="button" role="tab" aria-selected="${id === active}" class="funnel-tab ${
          id === active ? "is-on" : ""
        }" data-action="funnelTab" data-args="${esc(
          JSON.stringify({ tab: id })
        )}">${label}</button>`
    )
    .join("")}</div>`;
export const avatar = (c) =>
  `<span class="avatar" style="background:${c.color}">${esc(
    c.name
      .split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
  )}</span>`;
export const identity = (c) =>
  `<div class="creator-head">${avatar(c)}<div><strong>${esc(
    c.name
  )}</strong><small class="muted" style="display:block">${esc(
    c.handle
  )}</small></div></div>`;
export const icon = (name) => {
  let paths = {
    home: "M3 10 12 3l9 7v11H3Z M9 21v-8h6v8",
    campaign: "M4 5h16v15H4Z M8 3v4 M16 3v4 M4 11h16",
    users:
      "M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M16 11h6",
    search: "M21 21l-5-5 M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0",
    chart: "M4 3v18h17 M8 16v-5 M13 16V7 M18 16V4",
    tool: "m12 3 9 5v9l-9 5-9-5V8Z M3 8l9 5 9-5 M12 13v9",
    settings: "M4 6h16 M4 12h16 M4 18h16 M9 3v6 M15 9v6 M8 15v6",
    menu: "M3 6h18 M3 12h18 M3 18h18",
    file: "M5 3h10l4 4v14H5Z M9 11h6 M9 15h6",
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${
    paths[name] || paths.file
  }"/></svg>`;
};
