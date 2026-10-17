import test from "node:test";
import assert from "node:assert/strict";
import { seed, command, readiness, monitoring } from "../js/state.mjs";
const run = (s, role, type, p = {}) => command(s, role, type, p);
const draft = () => ({
  name: "October launch",
  brand: "Lumina",
  objective: "Awareness",
  description: "Show everyday use",
  product: "Travel kit",
  requirements: "One dedicated YouTube video with disclosure",
  start: "2026-10-15",
  end: "2026-11-30",
  close: "2026-11-15",
  budget: 30000000,
  slots: 3,
  minSubscribers: 10000,
  roster: [{ creatorId: "c2", rate: 6000000, quantity: 1 }],
});
function open() {
  let s = seed();
  run(s, "agency", "createCampaign", draft());
  let c = s.campaigns.at(-1);
  run(s, "agency", "saveForecast", { id: c.id });
  run(s, "agency", "launch", { id: c.id });
  return [s, c];
}
test("launch requires current forecast and valid allocation", () => {
  let s = seed();
  run(s, "agency", "createCampaign", draft());
  let c = s.campaigns.at(-1);
  assert(readiness(c).some((x) => x.includes("forecast")));
  assert.throws(() => run(s, "agency", "launch", { id: c.id }));
  run(s, "agency", "saveForecast", { id: c.id });
  assert.deepEqual(readiness(c), []);
  run(s, "agency", "launch", { id: c.id });
  assert.equal(c.status, "open");
  assert(c.baseline);
  assert.throws(() =>
    run(s, "agency", "updateCampaign", { id: c.id, ...draft() })
  );
});
test("approval never creates roster; eligible assessment does atomically", () => {
  let [s, c] = open();
  run(s, "creator", "apply", {
    id: c.id,
    rate: 4000000,
    message: "A practical tutorial",
    contact: "maya@example.test",
  });
  let a = s.applications.at(-1);
  assert.equal(a.status, "pending_brand");
  assert.throws(() =>
    run(s, "creator", "apply", { id: c.id, rate: 1, contact: "x@y.test" })
  );
  run(s, "agency", "review", { id: a.id, decision: "approved" });
  assert(!c.roster.some((x) => x.creatorId === "c1"));
  run(s, "agency", "startEligibility", { id: a.id });
  assert.equal(a.status, "under_analysis");
  run(s, "agency", "finishEligibility", { id: a.id, outcome: "eligible" });
  assert(c.roster.some((x) => x.creatorId === "c1"));
  assert.equal(a.status, "eligible");
});
test("review-required, ineligible and failed assessments never confirm a roster", () => {
  for (const outcome of ["needs_review", "not_eligible", "failed"]) {
    let [s, c] = open();
    run(s, "creator", "apply", {
      id: c.id,
      rate: 4000000,
      contact: "x@y.test",
    });
    let a = s.applications.at(-1);
    run(s, "agency", "review", { id: a.id, decision: "approved" });
    run(s, "creator", "startEligibility", { id: a.id });
    run(s, "creator", "finishEligibility", { id: a.id, outcome });
    assert(!c.roster.some((x) => x.creatorId === "c1"));
    assert.equal(a.status, outcome === "failed" ? "approved" : outcome);
  }
});
test("reservation needs issuance; pending and rejected videos excluded from totals", () => {
  let s = seed(),
    c = s.campaigns[0];
  assert.throws(() => run(s, "creator", "reserve", { id: c.id }));
  run(s, "agency", "issueCode", { id: c.id, creatorId: "c1" });
  run(s, "creator", "reserve", { id: c.id });
  let v = s.videos.at(-1);
  assert.equal(v.status, "pending_upload");
  assert.throws(() =>
    run(s, "creator", "attachVideo", {
      id: v.id,
      url: "https://evil.test/watch?v=abcdefghijk",
    })
  );
  run(s, "creator", "attachVideo", {
    id: v.id,
    url: "https://www.youtube.com/watch?v=abcdefghijk",
  });
  assert.equal(monitoring(s, c.id).views, 0);
  assert.throws(() => run(s, "agency", "verifyVideo", { id: v.id }));
  run(s, "agency", "resolveVideo", { id: v.id });
  run(s, "agency", "verifyVideo", { id: v.id });
  assert.equal(monitoring(s, c.id).views, 42000);
  assert.throws(() =>
    run(s, "creator", "submitVideo", {
      id: c.id,
      url: "https://youtu.be/abcdefghijk",
    })
  );
});
test("Brand and Creator cannot mutate agency operations", () => {
  for (const role of ["brand", "creator"])
    assert.throws(() => run(seed(), role, "createCampaign", draft()));
  assert.throws(() =>
    run(seed(), "agency", "toolConfig", { tool: "channel", enabled: false })
  );
});
test("capacity and closed campaigns reject applications and confirmations", () => {
  let [s, c] = open();
  c.slots = 1;
  assert.throws(() =>
    run(s, "creator", "apply", { id: c.id, rate: 5, contact: "x@y.test" })
  );
  c.slots = 3;
  c.status = "completed";
  assert.throws(() =>
    run(s, "creator", "apply", { id: c.id, rate: 5, contact: "x@y.test" })
  );
});
test("reports honor access, input limits and ownership", () => {
  let s = seed();
  assert.throws(() =>
    run(s, "creator", "createReport", { tool: "deal", name: "Empty", urls: [] })
  );
  run(s, "creator", "createReport", {
    tool: "deal",
    name: "Lumina launch",
    brand: "Lumina",
    start: "2026-10-01",
    end: "2026-10-31",
    channelIds: ["c1"],
    urls: ["https://youtu.be/abcdefghijk"],
  });
  let r = s.reports.at(-1);
  assert.equal(r.status, "processing");
  run(s, "creator", "completeReport", { id: r.id });
  assert.equal(r.status, "completed");
  run(s, "admin", "toolConfig", { tool: "deal", enabled: false });
  assert.throws(() =>
    run(s, "creator", "createReport", { tool: "deal", name: "Another" })
  );
});

test("stored state reloads across accounts and rejects corrupt data", async () => {
  let { load, save, KEY } = await import("../js/state.mjs");
  let values = new Map(),
    storage = {
      getItem: (k) => values.get(k) || null,
      setItem: (k, v) => values.set(k, v),
    };
  let s = seed();
  run(s, "agency", "createCampaign", draft());
  save(s, storage);
  assert.equal(load(storage).campaigns.length, 2);
  values.set(KEY, "broken");
  assert.throws(() => load(storage), /unreadable/);
  save(seed(), storage);
  assert.equal(load(storage).campaigns.length, 1);
});
test("stale forecasts block launch after editing packages", () => {
  let s = seed();
  run(s, "agency", "createCampaign", draft());
  let c = s.campaigns.at(-1);
  run(s, "agency", "saveForecast", { id: c.id });
  run(s, "agency", "updateCampaign", { id: c.id, budget: 31000000 });
  assert.throws(() => run(s, "agency", "launch", { id: c.id }), /forecast/);
});
test("commerce rejects untracked video evidence and can be reverted", () => {
  let s = seed(),
    c = s.campaigns[0];
  assert.throws(() =>
    run(s, "agency", "importCommerce", {
      id: c.id,
      rows: [{ video_id: "abcdefghijk", orders: 1, gmv: 5 }],
    })
  );
  run(s, "agency", "issueCode", { id: c.id, creatorId: "c1" });
  run(s, "creator", "submitVideo", {
    id: c.id,
    url: "https://youtu.be/abcdefghijk",
  });
  let v = s.videos.at(-1);
  run(s, "agency", "resolveVideo", { id: v.id });
  run(s, "agency", "verifyVideo", { id: v.id });
  run(s, "agency", "importCommerce", {
    id: c.id,
    rows: [{ video_id: v.videoId, orders: 1, gmv: 50000 }],
  });
  assert.equal(s.commerce.length, 1);
  run(s, "agency", "revertCommerce", { id: s.commerce[0].id });
  assert.equal(s.commerce.length, 0);
});
test("failed reports retry; deduplicated URLs, refresh quota and share revocation persist", () => {
  let s = seed();
  run(s, "creator", "createReport", {
    tool: "deal",
    name: "Test",
    brand: "Lumina",
    start: "2026-10-01",
    end: "2026-10-31",
    channelIds: ["c1"],
    urls: [
      "https://youtu.be/abcdefghijk",
      "https://www.youtube.com/watch?v=abcdefghijk",
    ],
  });
  let r = s.reports.at(-1);
  assert.equal(r.urls.length, 1);
  run(s, "creator", "completeReport", { id: r.id, fail: true });
  run(s, "creator", "retryReport", { id: r.id });
  run(s, "creator", "completeReport", { id: r.id });
  run(s, "creator", "shareReport", { id: r.id });
  assert.equal(r.shareCode.length, 8);
  run(s, "creator", "shareReport", { id: r.id });
  assert.equal(r.shareCode, null);
  run(s, "creator", "refreshReport", { id: r.id });
  run(s, "creator", "completeReport", { id: r.id });
  assert.throws(
    () => run(s, "creator", "refreshReport", { id: r.id }),
    /limit/
  );
});
test("profiling refresh is per channel and removal preserves a nonempty research set", () => {
  let s = seed();
  run(s, "creator", "createReport", {
    tool: "profile",
    name: "Research",
    channelIds: ["c1", "c5"],
  });
  let r = s.reports.at(-1);
  run(s, "creator", "completeReport", { id: r.id });
  run(s, "creator", "refreshProfileChannel", { id: r.id, creatorId: "c5" });
  assert.throws(
    () =>
      run(s, "creator", "refreshProfileChannel", { id: r.id, creatorId: "c5" }),
    /limit|seconds/
  );
  run(s, "creator", "removeProfileChannel", { id: r.id, creatorId: "c5" });
  assert.deepEqual(r.channelIds, ["c1"]);
  assert.throws(() =>
    run(s, "creator", "removeProfileChannel", { id: r.id, creatorId: "c1" })
  );
});

test("demo sign-ins are tab-local while campaign data is shared", async () => {
  const { signIn, readSession, signOut } = await import("../js/session.mjs");
  const memory = () => {
    let m = new Map();
    return {
      getItem: (k) => m.get(k) || null,
      setItem: (k, v) => m.set(k, v),
      removeItem: (k) => m.delete(k),
    };
  };
  let a = memory(),
    b = memory();
  signIn("agency", a);
  signIn("creator", b);
  assert.equal(readSession(a).role, "agency");
  assert.equal(readSession(b).role, "creator");
  signOut(a);
  assert.equal(readSession(a), null);
  assert.equal(readSession(b).role, "creator");
});

test("suspended demo identities cannot perform mutations", () => {
  let s = seed();
  run(s, "admin", "toggleUser", { id: "creator" });
  assert.throws(
    () =>
      run(s, "creator", "createReport", {
        tool: "profile",
        name: "Research",
        channelIds: ["c1"],
      }),
    /suspended/i
  );
});
test("video duplicate checks are campaign-scoped", () => {
  let [s, c] = open();
  run(s, "creator", "apply", { id: c.id, rate: 4000000, contact: "x@y.test" });
  let a = s.applications.at(-1);
  run(s, "agency", "review", { id: a.id, decision: "approved" });
  run(s, "agency", "startEligibility", { id: a.id });
  run(s, "agency", "finishEligibility", { id: a.id, outcome: "eligible" });
  for (let cp of [s.campaigns[0], c]) {
    run(s, "agency", "issueCode", { id: cp.id, creatorId: "c1" });
    run(s, "creator", "submitVideo", {
      id: cp.id,
      url: "https://youtu.be/abcdefghijk",
    });
  }
  assert.equal(s.videos.length, 2);
  assert.throws(() =>
    run(s, "creator", "submitVideo", {
      id: c.id,
      url: "https://youtu.be/abcdefghijk",
    })
  );
});
test("withdrawn applicants can reach an Apply again action", async () => {
  let [s, c] = open();
  run(s, "creator", "apply", { id: c.id, rate: 4000000, contact: "x@y.test" });
  let a = s.applications.at(-1);
  run(s, "creator", "withdraw", { id: a.id });
  const { page } = await import("../js/campaigns.mjs");
  let html = page({ s, role: "creator" }, "campaign/" + c.id);
  assert.match(html, /Apply again/);
});

test("cancelling a campaign requires a reason and withdraws roster participation", () => {
  let s = seed(),
    c = s.campaigns[0];
  assert.throws(
    () => run(s, "agency", "lifecycle", { id: c.id, status: "cancelled" }),
    /reason/i
  );
  run(s, "agency", "lifecycle", {
    id: c.id,
    status: "cancelled",
    reason: "Brand brief withdrawn",
  });
  assert.equal(c.status, "cancelled");
  assert(c.roster.every((r) => !r.confirmed && !r.code));
});
