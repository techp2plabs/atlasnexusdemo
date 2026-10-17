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
  select,
  submit,
  identity,
  flowStrip,
} from "./ui.mjs";
import { monitoring, toolNames, roles } from "./state.mjs";
export function page(c, path) {
  if (path === "home") return dashboard(c);
  if (path === "account") return account(c);
  if (path === "channels") return channels(c);
  if (path === "contracts") return contracts(c);
  if (c.role !== "admin")
    return empty(
      "Administration is restricted",
      "Use the navigation for your demo role."
    );
  if (path === "organizations" || path === "networks")
    return organizations(c, path);
  if (path === "users") return users(c);
  if (path === "tools") return tools(c);
  if (path === "quota") return quota(c);
  if (path === "settings") return settings(c);
  return empty("Page not found", "Choose a workspace from the sidebar.");
}
function dashboard(c) {
  let s = c.s,
    role = c.role,
    tracked = s.videos.filter((v) => v.status === "tracked"),
    pending = s.applications.filter((a) => a.status === "pending_brand"),
    accepted = s.campaigns.filter((x) =>
      x.roster.some((r) => r.creatorId === "c1" && r.confirmed)
    );
  let intro = {
    admin: [
      "Platform overview",
      "Keep the network connected.",
      "Review organizations, access, Creator Suite availability and platform operations.",
      "Manage organizations",
      "organizations",
    ],
    agency: [
      "Agency overview",
      "From creator selection to verified delivery.",
      "Prioritize application decisions, confirm eligible creators and keep campaign delivery moving.",
      "Create a campaign",
      "new",
    ],
    brand: [
      "Brand overview",
      "See how your investment is working.",
      "Review campaign objectives, the creator mix and evidence from verified content.",
      "Review campaigns",
      "campaigns",
    ],
    creator: [
      "Creator overview",
      "Your next collaboration starts here.",
      "Find relevant opportunities, follow decisions and deliver your next campaign story.",
      "Explore opportunities",
      "campaigns",
    ],
  }[role];
  let rows =
    role === "admin"
      ? [
          ["Organizations", s.organizations.length, "Platform scope"],
          [
            "Partner networks",
            s.organizations.reduce((n, x) => n + x.networks.length, 0),
            "Demo network inventory",
          ],
          ["Accounts", s.users.length, "Demo accounts and invitations"],
          [
            "Enabled tools",
            Object.values(s.tools).filter((x) => x.enabled).length,
            "Creator Suites access",
          ],
        ]
      : role === "creator"
      ? [
          [
            "Open opportunities",
            s.campaigns.filter((x) => x.status === "open").length,
            "Authenticated campaign browsing",
          ],
          [
            "My applications",
            s.applications.filter((x) => x.creatorId === "c1").length,
            "Your submissions only",
          ],
          [
            "Confirmed campaigns",
            accepted.length,
            "Eligibility or direct roster",
          ],
          [
            "Tracked videos",
            tracked.filter((v) => v.creatorId === "c1").length,
            "Verified source fixtures",
          ],
        ]
      : [
          ["Campaigns", s.campaigns.length, "Lumina demo portfolio"],
          [
            role === "brand" ? "Planned investment" : "Awaiting review",
            role === "brand"
              ? money(
                  s.campaigns.reduce(
                    (n, x) => n + (x.baseline?.investment || 0),
                    0
                  )
                )
              : pending.length,
            role === "brand"
              ? "Locked launch baselines"
              : "Application decisions",
          ],
          ["Tracked videos", tracked.length, "Pending and rejected excluded"],
          [
            "Tracked views",
            count(tracked.reduce((n, v) => n + v.metrics.views, 0)),
            "Fictional lifetime counters",
          ],
        ];
  let hero = `<div class="hero"><h2>${intro[1]}</h2><p>${intro[2]}</p>${link(
    intro[3],
    intro[4]
  )}</div>`;
  let content = "";
  if (role === "admin") {
    content =
      `<div class="two-col">${panel(
        "Platform operations",
        `<div class="pad">${[
          [
            "Member & role administration",
            "Manage users and invitations",
            "users",
          ],
          [
            "Tool access & limits",
            "Enable Creator Suites and adjust demo quotas",
            "tools",
          ],
          [
            "YouTube API operations",
            "Inspect a simulated quota snapshot",
            "quota",
          ],
        ]
          .map(
            ([t, d, p]) =>
              `<div class="list-row"><div><strong>${t}</strong><p class="muted small">${d}</p></div>${link(
                "Review",
                p
              )}</div>`
          )
          .join("")}</div>`
      )}${panel(
        "Organization hierarchy",
        `<div class="pad">${s.organizations
          .map(
            (o) =>
              `<div class="list-row"><div><strong>${esc(
                o.name
              )}</strong><p class="muted small">${
                o.networks.length
              } partner networks · ${esc(o.status)}</p></div>${badge(
                "Organization"
              )}</div>`
          )
          .join("")}${link("Open directory", "organizations")}</div>`
      )}</div>` +
      panel(
        "Preserved product reference",
        `<div class="pad"><p class="muted">The original admin dashboard, organization tabs, searchable channel table and detail drawers remain available as the dated source snapshot.</p><a class="btn" href="platform-snapshot.html">Open original admin demo</a></div>`
      );
  } else if (role === "creator") {
    content =
      `<div class="two-col">${panel(
        "Your delivery desk",
        accepted.length
          ? `<div class="pad">${accepted
              .map(
                (x) =>
                  `<div class="list-row"><div><strong>${esc(
                    x.name
                  )}</strong><p class="muted small">${
                    x.roster.find((r) => r.creatorId === "c1").code
                      ? "Atlas code issued · ready for submission"
                      : "Waiting for agency code issuance"
                  }</p></div>${link("Deliver", "campaign/" + x.id)}</div>`
              )
              .join("")}</div>`
          : empty(
              "No accepted campaigns",
              "Submit an application to an open opportunity.",
              link("Explore", "campaigns")
            )
      )}${panel(
        "Application transparency",
        `<div class="pad"><p>Agency approval is followed by a separate eligibility assessment. Confirmed roster membership unlocks campaign codes and submissions.</p>${link(
          "Track my applications",
          "applications"
        )}</div>`
      )}</div>` +
      panel(
        "Your reporting tools",
        `<div class="pad"><p class="muted">Generate a brand deal report, review your channel by month, or build a public channel profiling set.</p>${link(
          "Open Creator Suites",
          "suites",
          "primary"
        )}</div>`
      );
  } else {
    content = `<div class="two-col">${panel(
      role === "brand"
        ? "Campaign decisions & evidence"
        : "Campaign delivery desk",
      `<div class="pad">${s.campaigns
        .map(
          (x) =>
            `<div class="list-row"><div><strong>${esc(
              x.name
            )}</strong><p class="muted small">${
              x.roster.length
            } confirmed creators · ${
              monitoring(s, x.id).videos.length
            } tracked videos</p></div>${link(
              role === "brand" ? "Review" : "Open",
              "campaign/" + x.id
            )}</div>`
        )
        .join("")}</div>`
    )}${panel(
      role === "brand" ? "Investment context" : "Needs attention",
      `<div class="pad">${
        role === "brand"
          ? "<p>Budgets are planning allocations. Locked forecasts are estimates. Reported performance includes only tracked video fixtures; commerce evidence requires a manual import.</p>" +
            link("Creator suitability", "discovery")
          : `<div class="list-row"><span>Submitted applications</span><strong>${
              pending.length
            }</strong></div><div class="list-row"><span>Approved, awaiting eligibility</span><strong>${
              s.applications.filter((a) => a.status === "approved").length
            }</strong></div><div class="list-row"><span>Pending verification</span><strong>${
              s.videos.filter((v) => v.status === "pending_verification").length
            }</strong></div>${link(
              "Review applications",
              "applications",
              "primary"
            )}`
      }</div>`
    )}</div>`;
  }
  return (
    heading(intro[0], roles[role].scope) +
    (role === "brand"
      ? notice(
          "Brand is a proposed prototype persona. The current platform uses platform / organization owner and admin roles for campaign management."
        )
      : "") +
    (role === "agency"
      ? flowStrip(
          [
            ["Discovery", "Rank & shortlist"],
            ["Create", "Forecast & launch"],
            ["Approve", "Review applications"],
            ["Verify", "Link & track videos"],
            ["Monitor", "Forecast vs actual"],
          ],
          -1
        ) +
        panel(
          "Demo walkthrough · ~10 minutes",
          `<div class="pad"><div class="list-row"><div><strong>1 · Discovery</strong><p class="muted small">Compare fit, GMV and safety; shortlist two or three.</p></div>${link(
            "Open",
            "discovery"
          )}</div><div class="list-row"><div><strong>2 · Create & launch</strong><p class="muted small">Basics, investment mix, forecast, launch.</p></div>${link(
            "Plan",
            "new"
          )}</div><div class="list-row"><div><strong>3 · Applications</strong><p class="muted small">Approve, then run the simulated eligibility.</p></div>${link(
            "Review",
            "applications"
          )}</div><div class="list-row"><div><strong>4 · Running & Monitoring</strong><p class="muted small">Issue codes, link posted videos, compare forecast vs actual with CCE.</p></div>${link(
            "Campaigns",
            "campaigns"
          )}</div></div>`
        )
      : "") +
    hero +
    stats(rows) +
    content +
    (role !== "brand"
      ? panel(
          "Recent demo activity",
          `<div class="pad timeline">${s.activity
            .filter(
              (e) =>
                role !== "creator" ||
                accepted.some((x) => x.id === e.campaignId) ||
                s.applications.some(
                  (a) => a.creatorId === "c1" && a.campaignId === e.campaignId
                )
            )
            .slice(0, 6)
            .map(
              (e) =>
                `<div>${esc(e.text)}<small>${new Date(
                  e.at
                ).toLocaleString()}</small></div>`
            )
            .join("")}</div>`
        )
      : "")
  );
}
function organizations(c, path) {
  return (
    heading(
      path === "networks" ? "Partner networks" : "Organizations",
      "Platform → Organization → Partner network → Channel",
      path === "organizations"
        ? b("Add organization", "orgDialog", {}, "primary")
        : ""
    ) +
    panel(
      "Organization directory",
      table(
        ["Organization", "Status", "Partner networks", "Scope"],
        c.s.organizations.map((o) => [
          esc(o.name),
          badge(o.status),
          o.networks.map(esc).join("<br>") || "No partner networks",
          "Demo hierarchy",
        ])
      )
    ) +
    notice(
      "Fictional organization records. The dated original organization and channel explorer is preserved in the original admin demo."
    )
  );
}
function users(c) {
  return (
    heading(
      "Users & access",
      "Manage demo identities and inspect proposed permissions.",
      b("Invite demo user", "userDialog", {}, "primary")
    ) +
    panel(
      "Accounts",
      table(
        ["User", "Role", "Status", "Action"],
        c.s.users.map((u) => [
          `<strong>${esc(u.name)}</strong><small>${esc(u.email)}</small>`,
          esc(roles[u.role]?.label || u.role) +
            (u.role === "brand" ? "<small>Proposed access only</small>" : ""),
          badge(u.status),
          u.id === "admin"
            ? badge("Current administrator")
            : b(u.status === "Active" ? "Suspend" : "Activate", "toggleUser", {
                id: u.id,
              }),
        ])
      )
    ) +
    panel(
      "Access model",
      table(
        ["Perspective", "Assumed scope", "Permissions"],
        [
          [
            "Super Admin",
            "Platform",
            "Organization, user and tool administration; cross-organization campaign access",
          ],
          [
            "Agency",
            "Orbit Creative organization",
            "Discovery, campaign planning, review, codes, verification, commerce evidence",
          ],
          [
            "Brand · proposed",
            "Lumina campaign portfolio",
            "Read-only briefs, investment and results; shared prototype shortlist",
          ],
          [
            "Creator",
            "Maya Makes account",
            "Own applications, deliverables, accessible channel and enabled tools",
          ],
        ]
      )
    ) +
    notice(
      "Invitations are saved only in demo state. No email is sent, and adding a user does not add another sign-in identity."
    )
  );
}
function tools(c) {
  return (
    heading(
      "Creator Suites management",
      "Demo tool access, input limits and refresh allowances."
    ) +
    `<div class="grid">${Object.entries(toolNames)
      .map(([id, name]) => {
        let t = c.s.tools[id];
        return `<section class="card"><h3>${name}</h3><form id="tool-config-${id}" data-tool="${id}"><label class="check"><input name="enabled" type="checkbox" ${
          t.enabled ? "checked" : ""
        }>Enabled for demo non-admin roles</label>${field(
          id === "profile" ? "Channel input limit" : "Video URL limit",
          "limit",
          t.limit,
          "number",
          'required min="1" max="100"'
        )}${field(
          "Daily refresh limit",
          "daily",
          t.daily,
          "number",
          'required min="1" max="100"'
        )}${submit("Save access & limits")}</form></section>`;
      })
      .join("")}</div>` +
    notice(
      "Production supports independent organization and role configuration. This demo uses one shared enable switch per tool. Platform admins are exempt from daily refresh limits; Channel Report is explicitly enabled here despite its inactive production seed default."
    )
  );
}
function quota(c) {
  return (
    heading(
      "YouTube API monitoring",
      "Simulated operational snapshot · no API calls are made."
    ) +
    stats([
      ["Quota used", "7,400 / 10,000", "Fictional daily units"],
      ["Analytics sync", "6 hours", "Documented scheduler interval"],
      ["Pending jobs", "2", "Mock operational snapshot"],
      ["Failures", "1", "Mock retry needed"],
    ]) +
    panel(
      "Quota by source",
      `<div class="pad">${[
        ["Brand Deal Reports", 3700],
        ["Channel reports", 2100],
        ["Discovery lookup", 1100],
        ["Other", 500],
      ]
        .map(
          ([label, n]) =>
            `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${
              (n / 7400) * 100
            }%"></div></div><span>${n} units</span></div>`
        )
        .join("")}</div>`
    ) +
    notice(
      "Analytics reads in production use database snapshots. Video polling and stale eligibility cleanup have scheduler enablement caveats. Demo quota numbers do not change when local actions run."
    )
  );
}
function settings(c) {
  return (
    heading("Platform settings", "Local demo configuration.") +
    `<section class="panel pad wizard"><form id="platform-settings">${field(
      "Workspace display name",
      "name",
      c.s.settings.name,
      "text",
      'required maxlength="80"'
    )}<label class="check"><input name="notifications" type="checkbox" ${
      c.s.settings.notifications ? "checked" : ""
    }>Show action feedback</label>${submit(
      "Save demo settings"
    )}</form></section>` +
    panel(
      "Demo controls",
      `<div class="pad"><p>Restore seeded campaigns, creators, reports, tool access and activity across every demo role.</p>${b(
        "Reset Demo Data",
        "reset",
        {},
        "danger"
      )}</div>`
    )
  );
}
function channels(c) {
  let list =
    c.role === "creator"
      ? c.s.creators.filter((x) => x.id === "c1")
      : c.s.creators;
  return (
    heading(
      c.role === "creator" ? "My channel" : "Channels",
      "Demo channel directory · no live YouTube connection."
    ) +
    panel(
      "Accessible channels",
      table(
        ["Channel", "Subscribers", "Metric coverage", "Action"],
        list.map((x) => [
          identity(x),
          count(x.subs),
          "Public source fixtures; private analytics unavailable",
          b("View channel", "channelDetail", { id: x.id }),
        ])
      )
    ) +
    notice(
      "OAuth authorization is not simulated as a successful live connection. The prototype uses no API keys."
    )
  );
}
function contracts(c) {
  return (
    heading(
      c.role === "creator" ? "My contracts" : "Contracts",
      "Read-only demo agreement context."
    ) +
    panel(
      "Contract register",
      table(
        ["Agreement", "Parties", "Scope", "Status"],
        [
          [
            "Maya Makes · creator agreement",
            "Orbit Creative / Maya Makes",
            "Creator channel · demo revenue split agreement",
            badge("Active"),
          ],
        ]
      )
    ) +
    notice(
      "Production supports scoped revenue-share contracts and cascading split previews. Campaign deliverable packages are separate. This prototype does not execute legal agreements or payments."
    )
  );
}
function account(c) {
  let r = roles[c.role];
  return (
    heading("Your account", "Simulated authentication and role scope.") +
    panel(
      r.name,
      `<div class="pad">${table(
        ["Account field", "Demo value"],
        [
          ["Email", esc(r.email)],
          ["Perspective", r.label],
          ["Scope", esc(r.scope)],
          ["Authentication", "Local demo session only"],
        ]
      )}<div class="actions" style="margin-top:20px">${b(
        "Switch demo account",
        "switch"
      )}${b("Log out", "logout")}</div></div>`
    )
  );
}
export function action(c, a, p) {
  if (a === "orgDialog") {
    c.modal(
      "Add demo organization",
      `<form id="org-create">${field(
        "Organization name",
        "name",
        "",
        "text",
        "required"
      )}${submit("Add organization")}</form>`
    );
    return true;
  }
  if (a === "userDialog") {
    c.modal(
      "Invite demo user",
      `<form id="user-create">${field(
        "Full name",
        "name",
        "",
        "text",
        "required"
      )}${field("Email", "email", "", "email", "required")}${select(
        "Demo role",
        "role",
        Object.entries(roles).map(([id, x]) => [
          id,
          x.label + (id === "brand" ? " · proposed" : ""),
        ]),
        "creator"
      )}${notice(
        "This creates a local invitation record only. No email is sent."
      )}${submit("Save demo invitation")}</form>`
    );
    return true;
  }
  if (a === "toggleUser") {
    c.execute(a, p, "Demo user status updated");
    return true;
  }
  if (a === "channelDetail") {
    let x = c.s.creators.find((x) => x.id === p.id);
    c.modal(
      x.name,
      `${identity(x)}<p style="margin-top:20px">${esc(
        x.description
      )}</p>${notice(
        "Public source metric fixtures. No OAuth connection or private audience demographics."
      )}<div class="list-row"><span>Subscribers</span><strong>${count(
        x.subs
      )}</strong></div><div class="list-row"><span>Average views · estimate</span><strong>${count(
        x.avgViews
      )}</strong></div>${link("Open reporting tools", "suites", "primary")}`
    );
    return true;
  }
  return false;
}
export function form(c, name, v, form) {
  if (name === "org-create") {
    c.execute("addOrganization", v, "Demo organization added");
    return true;
  }
  if (name === "user-create") {
    c.execute("addUser", v, "Local invitation saved");
    return true;
  }
  if (name.startsWith("tool-config-")) {
    c.execute(
      "toolConfig",
      {
        tool: form.dataset.tool,
        enabled: !!v.enabled,
        limit: +v.limit,
        daily: +v.daily,
      },
      "Tool access and limits saved"
    );
    return true;
  }
  if (name === "platform-settings") {
    c.execute(
      "settings",
      { name: v.name, notifications: !!v.notifications },
      "Demo settings saved"
    );
    return true;
  }
  return false;
}
