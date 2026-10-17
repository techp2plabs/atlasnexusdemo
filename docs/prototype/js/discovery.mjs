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
  table,
  identity,
  field,
  select,
  infoTip,
} from "./ui.mjs";
let filters = { q: "", niche: "all", min: "0", minFit: "0", sort: "fit", short: false },
  comparison = [];
const fitBadge = (x) =>
  `<span class="badge ${x.fit >= 85 ? "green" : x.fit >= 75 ? "amber" : ""}">Fit ${x.fit ?? "—"}</span>`;
export function page(c, path) {
  let s = c.s;
  if (path === "compare") return compare(c);
  return (
    heading(
      filters.short ? "Creator shortlist" : "Creator Discovery",
      "Rank, shortlist and compare creators — fit, commerce and safety evidence for campaign review.",
      link(`Compare (${comparison.length}/3)`, "compare") +
        b(filters.short ? "Browse all" : "View shortlist", "shortView") +
        (c.role !== "brand" ? link("Plan a campaign", "new", "primary") : "")
    ) +
    notice(
      "Fictional creator fixtures. Fit Score is a demo composite (0–100), GMV/video models commerce evidence, and safety is a demo label. Audience demographics and verified AI suitability are unavailable."
    ) +
    `<form class="filters" id="discovery-filter"><input aria-label="Search creators" name="q" placeholder="Search name, handle or niche" value="${esc(
      filters.q
    )}"><select name="niche" aria-label="Filter niche">${[
      "all",
      "Lifestyle",
      "Technology",
      "Food",
      "Travel",
      "Fitness",
    ]
      .map(
        (n) =>
          `<option ${filters.niche === n ? "selected" : ""} value="${n}">${
            n === "all" ? "All niches" : n
          }</option>`
      )
      .join("")}</select><select name="min" aria-label="Minimum subscribers">${[
      ["0", "Any subscribers"],
      ["100000", "100K+ subscribers"],
      ["250000", "250K+ subscribers"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${
            v === filters.min ? "selected" : ""
          }>${l}</option>`
      )
      .join("")}</select><select name="minFit" aria-label="Minimum fit score">${[
      ["0", "Any fit"],
      ["75", "Fit 75+"],
      ["85", "Fit 85+"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${
            v === filters.minFit ? "selected" : ""
          }>${l}</option>`
      )
      .join("")}</select><select name="sort" aria-label="Sort creators">${[
      ["fit", "Fit ↓"],
      ["gmvVideo", "GMV/video ↓"],
      ["subs", "Subscribers ↓"],
      ["avgViews", "Average views ↓"],
      ["rate", "Rate ↑"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${
            v === filters.sort ? "selected" : ""
          }>${l}</option>`
      )
      .join("")}</select><button class="btn primary">Apply filters</button>${b(
      "Clear",
      "clearDiscovery"
    )}</form><div class="grid">${
      s.creators
        .filter(
          (x) =>
            (!filters.short || s.shortlist.includes(x.id)) &&
            (filters.niche === "all" || x.niche === filters.niche) &&
            x.subs >= +filters.min &&
            (x.fit ?? 0) >= +filters.minFit &&
            `${x.name} ${x.handle} ${x.niche}`
              .toLowerCase()
              .includes(filters.q.toLowerCase())
        )
        .sort((a, d) =>
          filters.sort === "rate"
            ? a.rate - d.rate
            : (d[filters.sort] ?? 0) - (a[filters.sort] ?? 0)
        )
        .map(
          (x) =>
            `<article class="card">${identity(
              x
            )}<div class="actions" style="margin-top:12px">${fitBadge(x)}${badge(
              x.safety || "Review"
            )}</div><p style="margin-top:16px">${esc(x.description)}</p>${badge(
              x.niche
            )}<div class="mini-metrics"><div><strong>${x.fit ?? "—"}</strong><small>Fit Score · demo${infoTip(
              "fit"
            )}</small></div><div><strong>${x.gmvVideo ? money(x.gmvVideo) : "—"}</strong><small>GMV/video · model${infoTip(
              "gmv"
            )}</small></div><div><strong>${count(
              x.avgViews
            )}</strong><small>Avg. views · estimate</small></div></div><small class="muted">Long-form rate · ${money(
              x.rate
            )} · creator-provided fixture</small><div class="actions">${b(
              "Profile",
              "creatorProfile",
              { id: x.id }
            )}${b(
              s.shortlist.includes(x.id) ? "Shortlisted ✓" : "Shortlist",
              "shortlist",
              { id: x.id }
            )}${b(
              comparison.includes(x.id) ? "Remove comparison" : "Compare",
              "compareToggle",
              { id: x.id }
            )}</div></article>`
        )
        .join("") ||
      empty(
        "No creators match",
        "Clear filters or add creators to your shortlist.",
        b("Clear filters", "clearDiscovery")
      )
    }</div>`
  );
}
function compare(c) {
  let creators = c.s.creators.filter((x) => comparison.includes(x.id));
  return (
    heading(
      "Compare creators",
      "Select two or three creators from Discovery.",
      link("Back to Discovery", "discovery")
    ) +
    (creators.length < 2
      ? panel(
          "Comparison",
          empty(
            "Choose at least two creators",
            "Use Compare on each Discovery card.",
            link("Browse creators", "discovery")
          )
        )
      : panel(
          "Side-by-side evidence",
          table(
            ["Metric", ...creators.map((x) => esc(x.name))],
            [
              ["Channel", ...creators.map(identity)],
              [
                "Subscribers · source fixture",
                ...creators.map((x) => count(x.subs)),
              ],
              [
                "Average views · calculated estimate",
                ...creators.map((x) => count(x.avgViews)),
              ],
              [
                "Engagement · calculated sample",
                ...creators.map((x) => x.engagement + "%"),
              ],
              [
                "Long-form rate · creator fixture",
                ...creators.map((x) => money(x.rate)),
              ],
              [
                "Fit Score · demo composite",
                ...creators.map((x) => `${x.fit ?? "—"} / 100`),
              ],
              [
                "GMV/video · commerce model",
                ...creators.map((x) =>
                  x.gmvVideo ? money(x.gmvVideo) : "—"
                ),
              ],
              [
                "Brand safety · demo label",
                ...creators.map((x) => esc(x.safety || "Review")),
              ],
              ["Audience demographics", ...creators.map(() => "Unavailable")],
              [
                "Shortlist",
                ...creators.map((x) =>
                  b(
                    c.s.shortlist.includes(x.id)
                      ? "Shortlisted ✓"
                      : "Shortlist",
                    "shortlist",
                    { id: x.id }
                  )
                ),
              ],
            ],
            "comparison"
          )
        ))
  );
}
export function action(c, a, p) {
  if (a === "creatorProfile") {
    let x = c.s.creators.find((x) => x.id === p.id);
    c.modal(
      x.name,
      `${identity(x)}<p style="margin-top:20px">${esc(
        x.description
      )}</p>${notice(
        esc(x.source) + " · all values are fictional"
      )}<div class="actions" style="margin:4px 0 12px">${fitBadge(x)}${badge(
        x.safety || "Review"
      )}${badge(x.niche)}</div><div class="mini-metrics"><div><strong>${
        x.fit ?? "—"
      }</strong><small>Fit Score · demo${infoTip("fit")}</small></div><div><strong>${
        x.gmvVideo ? money(x.gmvVideo) : "—"
      }</strong><small>GMV/video · model${infoTip("gmv")}</small></div><div><strong>${count(
        x.avgViews
      )}</strong><small>Average views · estimate</small></div></div><h3>Audience × SKU match</h3>${table(
        ["SKU", "Match · demo"],
        (c.s.brandSkus || ["Chocolate", "Matcha", "Original"]).map((sku) => [
          esc(sku),
          x.skuFit?.[sku] != null
            ? `<span class="sku-heat" data-score="${x.skuFit[sku]}">${x.skuFit[sku]}</span>`
            : "—",
        ])
      )}<p class="muted small" style="margin-top:12px">Style fingerprint: ${esc(
        x.style || "—"
      )} · Safety: ${esc(
        x.safety || "Review"
      )}. Scores are fictional planning aids, not verified decisions.</p><h3>YouTube rate card</h3>${table(
        ["Package", "Creator-provided rate"],
        [
          ["Dedicated long-form", money(x.rate)],
          ["Shorts integration", money(x.shortRate)],
        ]
      )}<p class="muted small" style="margin-top:16px">No private audience data is connected. Fit and SKU scores are fictional demo composites for planning; no verified AI suitability is generated.</p><div class="actions">${
        c.role === "creator"
          ? ""
          : b(
              c.s.shortlist.includes(x.id)
                ? "Remove from shortlist"
                : "Add to shortlist",
              "shortlist",
              { id: x.id },
              "primary"
            )
      }${
        c.role === "creator"
          ? ""
          : b(
              comparison.includes(x.id)
                ? "Remove comparison"
                : "Add to comparison",
              "compareToggle",
              { id: x.id }
            )
      }</div>`
    );
    return true;
  }
  if (a === "shortlist") {
    c.execute("shortlist", p, "Shortlist updated");
    return true;
  }
  if (a === "compareToggle") {
    if (comparison.includes(p.id))
      comparison = comparison.filter((x) => x !== p.id);
    else if (comparison.length < 3) comparison.push(p.id);
    else throw Error("Compare up to three creators; remove one first");
    c.close();
    c.render();
    c.toast(`${comparison.length} creators selected for comparison`);
    return true;
  }
  if (a === "shortView") {
    filters.short = !filters.short;
    c.render();
    return true;
  }
  if (a === "clearDiscovery") {
    filters = { q: "", niche: "all", min: "0", minFit: "0", sort: "fit", short: false };
    c.render();
    return true;
  }
  return false;
}
export function form(c, name, v) {
  if (name !== "discovery-filter") return false;
  filters = { ...filters, ...v };
  c.render();
  return true;
}
