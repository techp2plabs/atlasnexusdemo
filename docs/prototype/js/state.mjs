// All numbers and identities below are fictional fixtures, never fetched analytics.
export const KEY = "atlas-nexus-demo-v1";
export const roles = {
  admin: {
    label: "Super Admin",
    name: "Aditya Pratama",
    email: "admin@atlas.demo",
    file: "app.html",
    scope: "Platform administration",
  },
  agency: {
    label: "Agency",
    name: "Nadia Putri",
    email: "nadia@agency.demo",
    file: "app-agency.html",
    scope: "Orbit Creative · Organization admin",
  },
  brand: {
    label: "Brand",
    name: "Rani Wijaya",
    email: "rani@lumina.demo",
    file: "app-brand.html",
    scope: "Lumina · Proposed stakeholder access",
  },
  creator: {
    label: "Creator",
    name: "Maya Rahman",
    email: "maya@creator.demo",
    file: "app-creator.html",
    scope: "Maya Makes · Creator",
  },
};
export const toolNames = {
  deal: "YouTube Brand Deal Reports",
  channel: "YouTube Channel Report",
  profile: "YouTube Channel Profiling",
};
export function seed() {
  return {
    version: 1,
    shortlist: [],
    // Demo composites: Fit Score is a fictional planning aid (0–100), not a
    // verified AI decision. GMV/video models Merchant-style commerce evidence.
    // SKU scores model audience–product match for the YA'Bar-style scenario.
    brandSkus: ["Chocolate", "Matcha", "Original"],
    creators: [
      {
        id: "c1",
        name: "Maya Makes",
        handle: "@mayamakes",
        niche: "Lifestyle",
        subs: 184000,
        avgViews: 62000,
        engagement: 4.8,
        rate: 4000000,
        shortRate: 1800000,
        color: "#7250ce",
        description:
          "Thoughtful routines, practical product stories and everyday creativity.",
        source: "Public YouTube fixture",
        audience: null,
        fit: 88,
        gmvVideo: 3200000,
        safety: "Brand Safe",
        style: "Warm routine storytelling · honest product moments",
        skuFit: { Chocolate: 92, Matcha: 84, Original: 90 },
      },
      {
        id: "c2",
        name: "Ruang Teknologi",
        handle: "@ruangteknologi",
        niche: "Technology",
        subs: 426000,
        avgViews: 118000,
        engagement: 3.6,
        rate: 6000000,
        shortRate: 2500000,
        color: "#327c83",
        description: "Accessible reviews and hands-on technology explainers.",
        source: "Imported channel fixture",
        audience: null,
        fit: 74,
        gmvVideo: 2100000,
        safety: "Brand Safe",
        style: "Explainer-led · spec comparisons",
        skuFit: { Chocolate: 68, Matcha: 62, Original: 70 },
      },
      {
        id: "c3",
        name: "Dapur Nara",
        handle: "@dapurnara",
        niche: "Food",
        subs: 298000,
        avgViews: 87000,
        engagement: 5.2,
        rate: 5000000,
        shortRate: 2000000,
        color: "#ae7845",
        description:
          "Home cooking, kitchen experiments and ingredient stories.",
        source: "Public YouTube fixture",
        audience: null,
        fit: 94,
        gmvVideo: 4600000,
        safety: "Brand Safe",
        style: "Kitchen-first · ingredient stories",
        skuFit: { Chocolate: 96, Matcha: 89, Original: 93 },
      },
      {
        id: "c4",
        name: "Jalan Bersama",
        handle: "@jalanbersama",
        niche: "Travel",
        subs: 95000,
        avgViews: 34000,
        engagement: 4.1,
        rate: 2800000,
        shortRate: 1200000,
        color: "#52755b",
        description: "Local destinations and considered travel guides.",
        source: "Public YouTube fixture",
        audience: null,
        fit: 69,
        gmvVideo: 1400000,
        safety: "Review",
        style: "Destination guides · packing routines",
        skuFit: { Chocolate: 71, Matcha: 64, Original: 73 },
      },
      {
        id: "c5",
        name: "Studio Kecil",
        handle: "@studiokecil",
        niche: "Lifestyle",
        subs: 67000,
        avgViews: 21000,
        engagement: 3.9,
        rate: 2200000,
        shortRate: 1000000,
        color: "#a15c86",
        description: "Design, small spaces and useful objects.",
        source: "Imported channel fixture",
        audience: null,
        fit: 81,
        gmvVideo: 1800000,
        safety: "Brand Safe",
        style: "Minimal desk setups · quiet reviews",
        skuFit: { Chocolate: 83, Matcha: 78, Original: 80 },
      },
      {
        id: "c6",
        name: "Gerak Sehat",
        handle: "@geraksehat",
        niche: "Fitness",
        subs: 152000,
        avgViews: 48000,
        engagement: 4.6,
        rate: 3500000,
        shortRate: 1500000,
        color: "#597eb0",
        description: "Movement routines for busy people.",
        source: "Public YouTube fixture",
        audience: null,
        fit: 85,
        gmvVideo: 2900000,
        safety: "Brand Safe",
        style: "Morning routines · snack-fuelled training",
        skuFit: { Chocolate: 87, Matcha: 91, Original: 82 },
      },
    ],
    campaigns: [
      {
        id: "cmp-seed",
        name: "Lumina · Everyday essentials",
        brand: "Lumina",
        objective: "Product awareness",
        description:
          "Help people discover a practical daily skincare routine through honest creator stories.",
        product: "Daily essentials kit",
        requirements:
          "One dedicated long-form video. Include #ad and a clear sponsorship disclosure. Show the product in use; avoid medical claims.",
        start: "2026-10-15",
        end: "2026-11-30",
        close: "2026-11-15",
        budget: 25000000,
        slots: 4,
        minSubscribers: 10000,
        status: "open",
        roster: [
          {
            creatorId: "c1",
            rate: 4000000,
            quantity: 1,
            confirmed: true,
            code: null,
          },
        ],
        forecast: { investment: 4000000, views: 62000, signature: "seed" },
        baseline: { investment: 4000000, views: 62000 },
        code: "ATLAS-LUMINA",
        overrun: false,
        mix: "hybrid",
        targetROI: 2.0,
        skus: ["Chocolate", "Matcha", "Original"],
      },
    ],
    applications: [],
    videos: [],
    reports: [],
    commerce: [],
    activity: [
      {
        id: "initial",
        at: "2026-10-15T08:00:00Z",
        campaignId: "cmp-seed",
        text: "Demo campaign opened. Maya is on the seeded confirmed roster.",
      },
    ],
    tools: Object.fromEntries(
      Object.keys(toolNames).map((x) => [
        x,
        { enabled: true, limit: 10, daily: 1 },
      ])
    ),
    organizations: [
      {
        id: "org1",
        name: "Orbit Creative",
        status: "Active",
        networks: ["Orbit Studio", "Independent Creators"],
      },
      {
        id: "org2",
        name: "Northstar Media",
        status: "Active",
        networks: ["Northstar Network"],
      },
    ],
    users: Object.entries(roles).map(([id, r]) => ({
      id,
      name: r.name,
      email: r.email,
      role: id,
      status: "Active",
    })),
    settings: { name: "Atlas Nexus demo", notifications: true },
  };
}
const fail = (m) => {
  throw new Error(m);
};
const need = (condition, m) => condition || fail(m);
const num = (n, m) => {
  need(Number.isFinite(+n) && +n > 0, m);
  return +n;
};
const id = (prefix) =>
  prefix +
  "-" +
  (globalThis.crypto?.randomUUID?.() ||
    Date.now().toString(36) + Math.random().toString(36).slice(2));
const signature = (c) =>
  JSON.stringify([
    c.budget,
    c.roster.map((r) => [r.creatorId, r.rate, r.quantity]),
  ]);
export const investment = (c) =>
  c.roster.reduce((n, r) => n + r.rate * r.quantity, 0);
// Estimated commerce for planning. Uses fictional GMV/video fixtures ×
// planned quantities — a demo model, never a guaranteed outcome.
export function forecastEstimate(c, creators = []) {
  const byId = new Map(creators.map((x) => [x.id, x]));
  const gmv = c.roster.reduce(
    (n, r) => n + (byId.get(r.creatorId)?.gmvVideo || 0) * r.quantity,
    0
  );
  const views = c.roster.reduce(
    (n, r) => n + (byId.get(r.creatorId)?.avgViews || 0) * r.quantity,
    0
  );
  const inv = investment(c);
  return {
    investment: inv,
    views,
    gmv,
    roi: inv ? +(gmv / inv).toFixed(2) : 0,
    // CCE in this prototype covers the organic (creator) funnel only:
    // GMV ÷ creator investment. Paid ads are not modelled here.
    cce: inv ? +(gmv / inv).toFixed(2) : 0,
  };
}
// Manual commerce evidence totals per campaign (reversible CSV imports).
export function commerceTotals(s, campaignId) {
  const imports = s.commerce.filter((e) => e.campaignId === campaignId);
  return {
    imports,
    orders: imports.reduce(
      (n, i) => n + i.rows.reduce((n, r) => n + +r.orders, 0),
      0
    ),
    gmv: imports.reduce(
      (n, i) => n + i.rows.reduce((n, r) => n + +r.gmv, 0),
      0
    ),
  };
}
// Funnel split for Monitoring tabs. Organic reflects imported commerce GMV;
// paid attribution is not connected in this prototype and stays explicit.
export function funnelSplit(totals) {
  return { organic: totals.gmv, paid: 0, combined: totals.gmv };
}
export function readiness(c) {
  let errors = [];
  if (
    !c.name?.trim() ||
    !c.brand?.trim() ||
    !c.objective?.trim() ||
    !c.product?.trim() ||
    !c.requirements?.trim()
  )
    errors.push(
      "Complete campaign identity, objective, product and requirements"
    );
  if (!c.start || !c.end || c.end < c.start)
    errors.push("Set a valid campaign period");
  if (!(c.budget > 0)) errors.push("Set a positive budget");
  if (
    !c.roster.length ||
    c.roster.some(
      (r) => !(r.rate > 0 && Number.isInteger(r.quantity) && r.quantity > 0)
    )
  )
    errors.push("Add creators with priced deliverable packages");
  if (!c.forecast || c.forecast.signature !== signature(c))
    errors.push("Save a current forecast");
  if (investment(c) > c.budget && !c.overrun)
    errors.push("Acknowledge budget overrun");
  if (
    !c.close ||
    c.close < c.start ||
    c.close > c.end ||
    !(c.slots >= c.roster.length)
  )
    errors.push(
      "Set an application close date within the campaign and enough slots"
    );
  return errors;
}
export function monitoring(s, campaignId) {
  let videos = s.videos.filter(
    (v) => v.campaignId === campaignId && v.status === "tracked"
  );
  return {
    videos,
    views: videos.reduce((n, v) => n + (v.metrics?.views || 0), 0),
    likes: videos.reduce((n, v) => n + (v.metrics?.likes || 0), 0),
    comments: videos.reduce((n, v) => n + (v.metrics?.comments || 0), 0),
  };
}
export function videoId(url) {
  try {
    let u = new URL(url),
      host = u.hostname.replace(/^www\./, "");
    let v =
      host === "youtu.be"
        ? u.pathname.slice(1).split("/")[0]
        : ["youtube.com", "m.youtube.com"].includes(host)
        ? u.pathname === "/watch"
          ? u.searchParams.get("v")
          : u.pathname.match(/^\/(shorts|embed)\/([^/]+)/)?.[2]
        : null;
    need(
      /^[A-Za-z0-9_-]{11}$/.test(v || ""),
      "Enter a valid YouTube watch, Shorts or youtu.be URL (11-character video ID)"
    );
    return v;
  } catch {
    fail("Enter a valid YouTube video URL (11-character video ID)");
  }
}
export function command(s, role, type, p = {}) {
  need(roles[role], "Choose a demo account");
  need(
    s.users.find((u) => u.id === role)?.status !== "Suspended",
    "This demo account is suspended"
  );
  const agency = () =>
    need(
      ["admin", "agency"].includes(role),
      "This action requires an agency or platform administrator"
    );
  const admin = () =>
    need(role === "admin", "This action requires Super Admin");
  const creator = () =>
    need(role === "creator", "This action requires the Creator account");
  const campaign = (cid = p.id) => {
    let c = s.campaigns.find((c) => c.id === cid);
    need(c, "Campaign not found");
    return c;
  };
  const application = () => {
    let a = s.applications.find((a) => a.id === p.id);
    need(a, "Application not found");
    return a;
  };
  const live = (c) =>
    need(
      ["open", "active"].includes(c.status),
      "Campaign is not open or active"
    );
  const event = (text, cid = null) =>
    s.activity.unshift({
      id: id("event"),
      at: new Date().toISOString(),
      text,
      campaignId: cid,
    });
  const roster = (c) => {
    creator();
    live(c);
    let r = c.roster.find((r) => r.creatorId === "c1" && r.confirmed);
    need(r, "Eligibility and confirmed roster membership are required");
    need(r.code, "Ask the agency to issue your Atlas campaign code");
    return r;
  };
  const video = () => {
    let v = s.videos.find((v) => v.id === p.id);
    need(v, "Submission not found");
    if (role === "creator")
      need(v.creatorId === "c1", "This submission belongs to another creator");
    return v;
  };
  const validateURL = (url, exclude, campaignId) => {
    let vid = videoId(url);
    need(
      !s.videos.some(
        (v) =>
          v.videoId === vid && v.id !== exclude && v.campaignId === campaignId
      ),
      "This video has already been submitted"
    );
    return vid;
  };
  const report = () => {
    let r = s.reports.find((r) => r.id === p.id);
    need(r, "Report not found");
    need(
      r.owner === role || role === "admin",
      "This report belongs to another account"
    );
    need(s.tools[r.tool].enabled || role === "admin", "This tool is disabled");
    return r;
  };
  switch (type) {
    case "shortlist":
      need(
        ["admin", "agency", "brand"].includes(role),
        "Discovery is unavailable to this role"
      );
      need(
        s.creators.some((c) => c.id === p.id),
        "Creator not found"
      );
      s.shortlist = s.shortlist.includes(p.id)
        ? s.shortlist.filter((x) => x !== p.id)
        : [...s.shortlist, p.id];
      break;
    case "createCampaign": {
      agency();
      let c = {
        ...structuredClone(p),
        id: id("cmp"),
        status: "draft",
        roster: (p.roster || []).map((r) => ({
          ...r,
          confirmed: true,
          code: null,
        })),
        forecast: null,
        baseline: null,
        overrun: !!p.overrun,
      };
      need(
        c.name?.trim() && c.brand?.trim(),
        "Campaign name and brand are required"
      );
      s.campaigns.push(c);
      event("Draft created: " + c.name, c.id);
      break;
    }
    case "updateCampaign": {
      agency();
      let c = campaign();
      need(c.status === "draft", "Launched planning is locked");
      let fields = [
        "name",
        "brand",
        "objective",
        "description",
        "product",
        "requirements",
        "start",
        "end",
        "close",
        "budget",
        "slots",
        "minSubscribers",
        "overrun",
        "mix",
        "targetROI",
        "skus",
      ];
      for (let key of fields) if (p[key] !== undefined) c[key] = p[key];
      if (p.roster)
        c.roster = p.roster.map((r) => ({ ...r, confirmed: true, code: null }));
      event("Campaign planning updated", c.id);
      break;
    }
    case "saveForecast": {
      agency();
      let c = campaign();
      need(c.status === "draft", "Baseline is locked after launch");
      c.forecast = {
        investment: investment(c),
        views: c.roster.reduce(
          (n, r) =>
            n +
            (s.creators.find((x) => x.id === r.creatorId)?.avgViews || 0) *
              r.quantity,
          0
        ),
        signature: signature(c),
      };
      event("Estimated forecast saved", c.id);
      break;
    }
    case "launch": {
      agency();
      let c = campaign();
      need(c.status === "draft", "Campaign already launched");
      let errors = readiness(c);
      need(!errors.length, errors.join(". "));
      c.status = "open";
      c.baseline = structuredClone(c.forecast);
      c.code = "ATLAS-" + c.id.slice(-6).toUpperCase();
      event("Campaign launched; forecast baseline locked", c.id);
      break;
    }
    case "lifecycle": {
      agency();
      let c = campaign();
      const next = {
        open: ["active", "paused", "cancelled", "completed"],
        active: ["paused", "completed", "cancelled"],
        paused: ["active", "cancelled"],
        completed: ["archived"],
        cancelled: ["archived"],
      };
      need(
        next[c.status]?.includes(p.status),
        "That lifecycle transition is unavailable"
      );
      if (p.status === "cancelled") {
        need(p.reason?.trim(), "Enter a cancellation reason");
        c.cancellationReason = p.reason.trim();
        c.roster.forEach((r) => {
          r.confirmed = false;
          r.code = null;
        });
      }
      c.status = p.status;
      event("Campaign " + p.status + (p.reason ? ": " + p.reason : ""), c.id);
      break;
    }
    case "deleteDraft": {
      agency();
      let c = campaign();
      need(c.status === "draft", "Only drafts can be discarded");
      s.campaigns = s.campaigns.filter((x) => x.id !== c.id);
      break;
    }
    case "apply": {
      creator();
      let c = campaign();
      need(c.status === "open", "Applications are closed");
      need(
        c.close >= new Date().toISOString().slice(0, 10),
        "Application deadline has passed"
      );
      need(c.roster.length < c.slots, "No remaining creator slots");
      need(
        !c.roster.some((r) => r.creatorId === "c1"),
        "You are already on this campaign roster"
      );
      need(
        !s.applications.some(
          (a) =>
            a.campaignId === c.id &&
            a.creatorId === "c1" &&
            !["rejected", "withdrawn", "not_eligible"].includes(a.status)
        ),
        "You already have a live application"
      );
      num(p.rate, "Enter a positive proposed rate");
      need(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.contact || ""),
        "Enter a valid contact email"
      );
      s.applications.push({
        id: id("app"),
        campaignId: c.id,
        creatorId: "c1",
        rate: +p.rate,
        contact: p.contact,
        message: p.message || "",
        // Optional creator-portal fields (management demo parity). Older
        // fixtures and tests omit them; they never gate validation.
        channelUrl: (p.channelUrl || "").trim(),
        compensation: p.compensation === "sample_only" ? "sample_only" : "rate_card",
        status: "pending_brand",
        eligibility: null,
      });
      event("Maya Makes submitted an application", c.id);
      break;
    }
    case "review": {
      agency();
      let a = application();
      live(campaign(a.campaignId));
      need(
        a.status === "pending_brand",
        "Application has already been reviewed"
      );
      need(
        ["approved", "rejected"].includes(p.decision),
        "Choose approve or reject"
      );
      a.status = p.decision;
      event(
        "Application " +
          p.decision +
          "; " +
          (p.decision === "approved"
            ? "eligibility required"
            : "decision recorded"),
        a.campaignId
      );
      break;
    }
    case "withdraw": {
      creator();
      let a = application();
      need(
        a.creatorId === "c1" && a.status === "pending_brand",
        "Only submitted applications can be withdrawn"
      );
      a.status = "withdrawn";
      event("Application withdrawn", a.campaignId);
      break;
    }
    case "startEligibility": {
      need(role !== "brand", "Brand access is read-only");
      let a = application();
      live(campaign(a.campaignId));
      need(
        ["approved", "needs_review"].includes(a.status),
        "Approval is required before assessment"
      );
      a.status = "under_analysis";
      a.eligibility = { status: "processing" };
      event("Simulated eligibility assessment started", a.campaignId);
      break;
    }
    case "finishEligibility": {
      need(role !== "brand", "Brand access is read-only");
      let a = application(),
        c = campaign(a.campaignId);
      live(c);
      need(a.status === "under_analysis", "Start the assessment first");
      need(
        ["eligible", "not_eligible", "needs_review", "failed"].includes(
          p.outcome
        ),
        "Choose an assessment outcome"
      );
      if (p.outcome === "eligible")
        need(
          c.roster.length < c.slots,
          "No remaining roster slots; choose review required"
        );
      a.status = p.outcome === "failed" ? "approved" : p.outcome;
      a.eligibility = {
        status: p.outcome === "failed" ? "failed" : "completed",
        outcome: p.outcome,
        note: "Demo outcome selected by the presenter; no AI or YouTube check was performed.",
      };
      if (
        p.outcome === "eligible" &&
        !c.roster.some((r) => r.creatorId === a.creatorId)
      )
        c.roster.push({
          creatorId: a.creatorId,
          rate: a.rate,
          quantity: 1,
          confirmed: true,
          code: null,
        });
      event(
        "Eligibility: " +
          p.outcome +
          (p.outcome === "eligible" ? "; confirmed roster updated" : ""),
        c.id
      );
      break;
    }
    case "issueCode": {
      agency();
      let c = campaign();
      live(c);
      let r = c.roster.find((r) => r.creatorId === p.creatorId && r.confirmed);
      need(r, "Confirmed roster entry required");
      r.code = c.code + "-" + r.creatorId.toUpperCase();
      event("Atlas code issued for " + p.creatorId, c.id);
      break;
    }
    case "reserve": {
      let c = campaign();
      roster(c);
      s.videos.push({
        id: id("vid"),
        campaignId: c.id,
        creatorId: "c1",
        status: "pending_upload",
        metadata: "pending",
        url: null,
        videoId: null,
        metrics: null,
      });
      event("Pre-upload intent reserved", c.id);
      break;
    }
    case "submitVideo": {
      let c = campaign();
      roster(c);
      let vid = validateURL(p.url, undefined, c.id);
      s.videos.push({
        id: id("vid"),
        campaignId: c.id,
        creatorId: "c1",
        url: p.url,
        videoId: vid,
        status: "pending_verification",
        metadata: "pending",
        metrics: null,
      });
      event("Posted video submitted for verification", c.id);
      break;
    }
    case "attachVideo": {
      creator();
      let v = video();
      roster(campaign(v.campaignId));
      need(v.status === "pending_upload", "This intent already has a video");
      let vid = validateURL(p.url, v.id, v.campaignId);
      Object.assign(v, {
        url: p.url,
        videoId: vid,
        status: "pending_verification",
        metadata: "pending",
      });
      event("Video attached to reservation", v.campaignId);
      break;
    }
    case "resolveVideo": {
      agency();
      let v = video();
      live(campaign(v.campaignId));
      need(
        v.status === "pending_verification",
        "Only pending videos can resolve metadata"
      );
      v.metadata = p.fail ? "failed" : "resolved";
      v.title = "Everyday essentials · creator story";
      event("Mock video metadata " + v.metadata, v.campaignId);
      break;
    }
    case "verifyVideo":
    case "rejectVideo": {
      agency();
      let v = video();
      live(campaign(v.campaignId));
      need(
        v.status === "pending_verification",
        "Only pending videos can be reviewed"
      );
      if (type === "verifyVideo") {
        need(v.metadata === "resolved", "Resolve metadata before verification");
        v.status = "tracked";
        v.metrics = { views: 42000, likes: 1900, comments: 146 };
      } else {
        v.status = "rejected";
        v.reason = p.reason || "Requirements need correction";
      }
      event("Video " + v.status, v.campaignId);
      break;
    }
    case "importCommerce": {
      agency();
      let c = campaign();
      need(
        monitoring(s, c.id).videos.length,
        "Track a verified video before adding commerce evidence"
      );
      need(p.rows?.length, "CSV has no rows");
      for (let row of p.rows) {
        need(
          monitoring(s, c.id).videos.some((v) => v.videoId === row.video_id),
          "Every CSV video_id must belong to a tracked campaign video"
        );
        need(
          Number.isFinite(+row.orders) &&
            +row.orders >= 0 &&
            Number.isInteger(+row.orders) &&
            Number.isFinite(+row.gmv) &&
            +row.gmv >= 0,
          "Orders must be whole numbers and GMV must be nonnegative"
        );
      }
      s.commerce.push({
        id: id("import"),
        campaignId: c.id,
        rows: p.rows,
        source: "Manual CSV import",
        at: new Date().toISOString(),
      });
      event("Manual commerce evidence imported", c.id);
      break;
    }
    case "revertCommerce": {
      agency();
      let row = s.commerce.find((x) => x.id === p.id);
      need(row, "Import not found");
      s.commerce = s.commerce.filter((x) => x.id !== p.id);
      event("Commerce import reverted", row.campaignId);
      break;
    }
    case "monitorInsight": {
      agency();
      let c = campaign();
      need(monitoring(s, c.id).videos.length, "Tracked videos are required");
      c.insights = c.insights || [];
      c.insights.push({
        at: new Date().toISOString(),
        text: "Simulated AI analysis: observed views are based only on tracked demo videos. Compare delivery with the locked baseline. Imported commerce evidence has no verified causal attribution.",
      });
      event("Simulated monitoring insight generated", c.id);
      break;
    }
    case "createReport": {
      need(role !== "brand", "Brand uses read-only campaign reports");
      let cfg = s.tools[p.tool];
      need(cfg?.enabled, "This tool is disabled by an administrator");
      need(p.name?.trim(), "Enter a report name");
      need(p.channelIds?.length, "Select at least one channel");
      need(
        p.channelIds.every((id) => s.creators.some((x) => x.id === id)),
        "Choose available channel fixtures"
      );
      if (role === "creator")
        need(
          p.channelIds.every((x) => x === "c1") || p.tool === "profile",
          "Choose your accessible channel"
        );
      if (p.tool === "deal") {
        need(
          p.brand?.trim() && p.start && p.end && p.end >= p.start,
          "Brand and a valid period are required"
        );
        need(p.urls?.length, "Add at least one YouTube video URL");
        p.urls = [...new Map(p.urls.map((u) => [videoId(u), u])).values()];
        need(p.urls.length <= cfg.limit, "Video limit exceeded");
      }
      if (p.tool === "channel") {
        need(
          /^\d{4}-(0[1-9]|1[0-2])$/.test(p.month || ""),
          "Select a reporting month"
        );
        need(
          p.channelIds.length * 3 <= cfg.limit,
          "Resolved demo video count exceeds the configured tool limit (3 per channel)"
        );
      }
      if (p.tool === "profile")
        need(p.channelIds.length <= cfg.limit, "Channel limit exceeded");
      s.reports.push({
        ...structuredClone(p),
        id: id("report"),
        owner: role,
        status: "processing",
        insights: [],
        shared: false,
        refreshes: [],
        createdAt: new Date().toISOString(),
      });
      event("Creator Suite generation started");
      break;
    }
    case "completeReport": {
      let r = report();
      need(r.status === "processing", "Report is not processing");
      r.status = p.fail ? "failed" : "completed";
      break;
    }
    case "retryReport": {
      let r = report();
      need(r.status === "failed", "Only failed reports can retry");
      r.status = "processing";
      break;
    }
    case "refreshReport": {
      let r = report();
      need(r.status === "completed", "Complete the report first");
      let today = new Date().toISOString().slice(0, 10);
      need(
        role === "admin" ||
          r.refreshes.filter((x) => x.startsWith(today)).length <
            s.tools[r.tool].daily,
        "Daily refresh limit reached; try tomorrow"
      );
      need(
        !r.refreshes.length ||
          Date.now() - Date.parse(r.refreshes.at(-1)) >= 30000,
        "Wait 30 seconds between refreshes"
      );
      r.refreshes.push(new Date().toISOString());
      r.status = "processing";
      break;
    }
    case "refreshProfileChannel": {
      let r = report();
      need(
        r.tool === "profile" &&
          r.status === "completed" &&
          r.channelIds.includes(p.creatorId),
        "Choose a completed profiling channel"
      );
      r.channelRefreshes = r.channelRefreshes || {};
      let history = r.channelRefreshes[p.creatorId] || [],
        today = new Date().toISOString().slice(0, 10);
      need(
        role === "admin" ||
          history.filter((x) => x.startsWith(today)).length <
            s.tools.profile.daily,
        "Daily channel refresh limit reached"
      );
      need(
        !history.length || Date.now() - Date.parse(history.at(-1)) >= 30000,
        "Wait 30 seconds between channel refreshes"
      );
      r.channelRefreshes[p.creatorId] = [...history, new Date().toISOString()];
      break;
    }
    case "removeProfileChannel": {
      let r = report();
      need(
        r.tool === "profile" && r.status === "completed",
        "Complete the profiling set first"
      );
      need(
        r.channelIds.includes(p.creatorId) && r.channelIds.length > 1,
        "Keep at least one channel in the profiling set"
      );
      r.channelIds = r.channelIds.filter((x) => x !== p.creatorId);
      break;
    }
    case "reportInsight": {
      let r = report();
      need(
        r.status === "completed" && r.tool !== "profile",
        "AI insight is available for completed reports"
      );
      r.insights.push({
        at: new Date().toISOString(),
        text: "Simulated AI insight: compare creator content using the same metric coverage. These are lifetime public counters, not period-scoped views or verified audience demographics.",
      });
      break;
    }
    case "shareReport": {
      let r = report();
      need(r.status === "completed", "Only completed reports can be shared");
      r.shared = !r.shared;
      r.shareCode = r.shared ? id("code").slice(-8).toUpperCase() : null;
      break;
    }
    case "archiveReport": {
      let r = report();
      r.archived = !r.archived;
      break;
    }
    case "toolConfig": {
      admin();
      need(s.tools[p.tool], "Tool not found");
      let cfg = s.tools[p.tool];
      if (p.enabled !== undefined) cfg.enabled = !!p.enabled;
      if (p.limit !== undefined) {
        num(p.limit, "Limit must be positive");
        cfg.limit = +p.limit;
      }
      if (p.daily !== undefined) {
        num(p.daily, "Daily limit must be positive");
        cfg.daily = +p.daily;
      }
      break;
    }
    case "addOrganization": {
      admin();
      need(p.name?.trim(), "Enter an organization name");
      s.organizations.push({
        id: id("org"),
        name: p.name,
        status: "Active",
        networks: [],
      });
      break;
    }
    case "addUser": {
      admin();
      need(
        p.name?.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || "") &&
          roles[p.role],
        "Enter a name, valid email and role"
      );
      need(!s.users.some((u) => u.email === p.email), "Email already exists");
      s.users.push({ ...p, id: id("user"), status: "Invited" });
      break;
    }
    case "toggleUser": {
      admin();
      let u = s.users.find((u) => u.id === p.id);
      need(u && u.id !== "admin", "The active admin cannot be disabled");
      u.status = u.status === "Active" ? "Suspended" : "Active";
      break;
    }
    case "settings":
      admin();
      need(p.name?.trim(), "Workspace name is required");
      s.settings = { name: p.name, notifications: !!p.notifications };
      break;
    default:
      fail("Unknown demo action: " + type);
  }
  return s;
}
export function load(storage = globalThis.localStorage) {
  let raw = storage.getItem(KEY);
  if (!raw) return seed();
  try {
    let s = JSON.parse(raw);
    need(
      s.version === 1 &&
        Array.isArray(s.campaigns) &&
        Array.isArray(s.creators),
      "Unsupported demo data"
    );
    return s;
  } catch {
    fail(
      "Saved demo data is unreadable. Use Reset Demo Data to restore the demo."
    );
  }
}
export function save(s, storage = globalThis.localStorage) {
  storage.setItem(KEY, JSON.stringify(s));
}
