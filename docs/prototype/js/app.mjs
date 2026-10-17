import { KEY, seed, roles, load, save, command } from "./state.mjs";
import { esc, b, icon, field, select, submit, notice } from "./ui.mjs";
import * as discovery from "./discovery.mjs";
import * as campaigns from "./campaigns.mjs";
import * as suites from "./suites.mjs";
import * as overview from "./overview.mjs";
import { readSession, signIn, signOut } from "./session.mjs";
let role = document.body.dataset.role,
  selected =
    new URLSearchParams(location.search).get("role") ||
    localStorage.getItem("atlas-nexus-demo-last-role") ||
    "agency";
if (!roles[selected]) selected = "agency";
let lastFocus = null,
  toastTimer = null,
  currentError = null;
const app = document.getElementById("app"),
  modalRoot = document.getElementById("modal-root");
let s;
try {
  s = load();
} catch (e) {
  s = seed();
  currentError = e.message;
}
const modules = [discovery, campaigns, suites, overview];
const c = {
  get s() {
    if (role === "brand") {
      let campaigns = s.campaigns.filter(
        (x) => x.brand.trim().toLowerCase() === "lumina"
      );
      let ids = new Set(campaigns.map((x) => x.id));
      return {
        ...s,
        campaigns,
        videos: s.videos.filter((v) => ids.has(v.campaignId)),
        applications: s.applications.filter((a) => ids.has(a.campaignId)),
        commerce: s.commerce.filter((x) => ids.has(x.campaignId)),
      };
    }
    return s;
  },
  role,
  navigate,
  render,
  modal,
  close,
  toast,
  execute,
  confirm,
  download,
};
const menus = {
  admin: [
    ["Platform", "home", "Platform overview", "home"],
    ["Platform", "organizations", "Organizations", "tool"],
    ["Platform", "networks", "Partner networks", "tool"],
    ["Platform", "users", "Users & access", "users"],
    ["Operations", "discovery", "Creator Discovery", "search"],
    ["Operations", "campaigns", "Campaign oversight", "campaign"],
    ["Operations", "applications", "Applications", "file"],
    ["Operations", "suites", "Creator Suites", "tool"],
    ["Ecosystem", "channels", "Channels", "chart"],
    ["Ecosystem", "contracts", "Contracts", "file"],
    ["Settings", "tools", "Creator Suites management", "settings"],
    ["Settings", "quota", "YouTube API monitoring", "chart"],
    ["Settings", "settings", "Platform settings", "settings"],
  ],
  agency: [
    ["Workspace", "home", "Agency overview", "home"],
    ["YouTube Brand Campaign", "discovery", "Creator Discovery", "search"],
    ["YouTube Brand Campaign", "campaigns", "Campaigns", "campaign"],
    ["YouTube Brand Campaign", "applications", "Applications", "file"],
    ["Reporting", "suites", "Creator Suites", "tool"],
    ["Ecosystem", "channels", "Channels", "chart"],
    ["Ecosystem", "contracts", "Contracts", "file"],
  ],
  brand: [
    ["Workspace", "home", "Brand overview", "home"],
    ["Campaign decisions", "campaigns", "Campaign portfolio", "campaign"],
    ["Campaign decisions", "discovery", "Creator research", "search"],
  ],
  creator: [
    ["Workspace", "home", "Creator overview", "home"],
    ["Collaborations", "campaigns", "Campaign opportunities", "search"],
    ["Collaborations", "applications", "My applications", "file"],
    ["Collaborations", "accepted", "My campaigns", "campaign"],
    ["My tools", "suites", "Creator Suites", "tool"],
    ["My tools", "channels", "My channel", "chart"],
    ["My tools", "contracts", "My contracts", "file"],
  ],
};
function getPath() {
  return location.hash.slice(1) || "home";
}
function checkSession() {
  if (["login", "share"].includes(role)) return true;
  let session = readSession();
  if (
    !session ||
    session.role !== role ||
    s.users.find((u) => u.id === role)?.status === "Suspended"
  ) {
    location.replace("index.html?role=" + role);
    return false;
  }
  return true;
}
function login() {
  let r = roles[selected];
  app.innerHTML = `<main class="login"><section class="login-story"><a href="marketing.html" aria-label="Atlas Nexus marketing reference"><img class="logo" src="images/atlas-nexus-logo.png" alt="Atlas Nexus"></a><div><h1>One campaign.<br>Every perspective.</h1><p>Discover the people, plan the partnership and follow the evidence — together in Atlas Nexus.</p></div><small>Interactive product prototype · fictional data · no production access</small></section><section class="login-panel"><span class="demo-label">Atlas Nexus interactive prototype</span><h2 style="margin:20px 0 8px">Choose your perspective</h2><p class="muted">Enter a demo account to explore a connected campaign journey. Changes carry across all four workspaces.</p><div class="role-grid" role="group" aria-label="Demo perspectives">${Object.entries(
    roles
  )
    .map(
      ([id, r]) =>
        `<button class="role-option ${
          id === selected ? "active" : ""
        }" aria-pressed="${
          id === selected
        }" data-action="chooseRole" data-args="${esc(
          JSON.stringify({ role: id })
        )}"><strong>${r.label}</strong><small>${
          id === "brand" ? "Proposed stakeholder experience" : r.scope
        }</small></button>`
    )
    .join("")}</div><form id="demo-login">${select(
    "Demo account",
    "account",
    [[selected, r.name + " · " + r.email]],
    selected
  )}${field(
    "Demo email",
    "email",
    r.email,
    "email",
    "required readonly"
  )}${field(
    "Demo password",
    "password",
    "atlas-demo",
    "password",
    "required readonly"
  )}${
    selected === "brand"
      ? notice(
          "Brand access is a proposed prototype experience. The current application has no separate Brand account role."
        )
      : notice(
          "Simulated sign-in only. These are local demo credentials; no password or identity service is contacted."
        )
  }${submit(
    "Enter " + r.label + " workspace"
  )}</form><div class="panel" style="margin-top:20px"><div class="pad"><h3 style="margin-top:0">Demo walkthrough · ~10 minutes</h3><p class="muted small">Agency: Discovery → Create & launch → Applications → Running → Monitoring. Then Creator: apply → Agency approves → eligibility → roster → posted video.</p></div></div><div class="actions" style="margin-top:22px"><a class="btn quiet" href="marketing.html">Original homepage</a>${b(
    "Reset Demo Data",
    "reset",
    {},
    "quiet"
  )}</div><p class="muted small" style="margin-top:25px">Start with Agency → create and launch a campaign → switch to Creator to apply. See README.md for the full scenario.</p></section></main>`;
}
function shell(content) {
  let r = roles[role],
    path = getPath(),
    root = path.split("/")[0],
    group = "";
  let nav = menus[role]
    .map(([g, p, title, i]) => {
      let label = g !== group ? `<div class="nav-group">${g}</div>` : "";
      group = g;
      let active =
        p === root ||
        (root === "campaign" && p === "campaigns") ||
        (root === "new" && p === "campaigns") ||
        (root === "compare" && p === "discovery");
      return (
        label +
        `<a class="nav ${active ? "active" : ""}" ${
          active ? 'aria-current="page"' : ""
        } href="#${p}">${icon(i)}<span>${title}</span></a>`
      );
    })
    .join("");
  app.innerHTML = `<button class="mobile-shade" data-action="menuClose" aria-label="Close navigation"></button><aside class="sidebar"><a href="#home"><img class="logo" src="images/atlas-nexus-logo.png" alt="Atlas Nexus home"></a><div class="scope"><strong>${
    r.label
  } workspace</strong><small>${esc(
    r.scope
  )}</small></div><nav aria-label="Workspace navigation">${nav}</nav><div class="sidebar-foot"><a href="#account" class="account"><span class="initial">${r.name
    .split(" ")
    .map((x) => x[0])
    .join("")}</span><span>${
    r.name
  }<small class="muted" style="display:block">${r.label}${
    role === "brand" ? " · proposed" : ""
  }</small></span></a><div class="actions">${b(
    "Switch account",
    "switch",
    {},
    "quiet"
  )}${b("Log out", "logout", {}, "quiet")}</div>${b(
    "Reset Demo Data",
    "reset",
    {},
    "quiet"
  )}</div></aside><div class="shell"><header class="topbar"><div>${b(
    icon("menu") + " Menu",
    "menu",
    {},
    "menu-btn"
  )}<div class="scope-text">${esc(s.settings.name)}<small>${esc(
    r.scope
  )}</small></div></div><div><span class="demo-label">Prototype · shared local data</span>${b(
    "Switch perspective",
    "switch"
  )}</div></header><main class="main" id="main">${content}<footer class="footer"><span>Atlas Nexus · Interactive prototype · fictional data</span><a href="README.md">Demo guide & capability gaps</a></footer></main></div>`;
}
function render() {
  if (!checkSession()) return;
  if (currentError) {
    app.innerHTML = `<main class="share-page"><h1>Restore demo data</h1>${notice(
      esc(currentError),
      true
    )}${b("Reset Demo Data", "reset", {}, "primary")}</main>`;
    return;
  }
  if (role === "login") {
    login();
    return;
  }
  if (role === "share") {
    app.innerHTML = suites.sharePage(c);
    return;
  }
  let path = getPath(),
    root = path.split("/")[0];
  let allowed = new Set(menus[role].map((x) => x[1]).concat(["account"]));
  if (["admin", "agency", "brand"].includes(role)) allowed.add("campaign");
  if (role === "creator") allowed.add("campaign");
  if (["admin", "agency"].includes(role)) allowed.add("new");
  if (role !== "creator") allowed.add("compare");
  let content;
  if (!allowed.has(root))
    content =
      "<h1>Page unavailable for this role</h1><p>Choose an available workspace from the sidebar.</p>";
  else if (["discovery", "compare"].includes(root))
    content = discovery.page(c, root);
  else if (
    ["campaigns", "campaign", "new", "applications", "accepted"].includes(root)
  )
    content = campaigns.page(c, path);
  else if (root === "suites") content = suites.page(c, path);
  else content = overview.page(c, root);
  shell(content);
}
function navigate(path) {
  close();
  document.body.classList.remove("mobile-open");
  if (getPath() === path) render();
  else location.hash = path;
}
function toast(message) {
  let el = document.getElementById("toast-root");
  clearTimeout(toastTimer);
  el.className = "toast";
  el.textContent = message;
  toastTimer = setTimeout(() => {
    el.className = "";
    el.textContent = "";
  }, 5000);
}
function modal(title, body) {
  lastFocus = document.activeElement;
  modalRoot.innerHTML = `<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="modal-head"><h2 id="dialog-title">${esc(
    title
  )}</h2>${b("Close", "close")}</div>${body}</section></div>`;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() =>
    modalRoot
      .querySelector("input:not([readonly]),select,textarea,button")
      ?.focus()
  );
}
function close() {
  modalRoot.innerHTML = "";
  document.body.style.overflow = "";
  if (lastFocus?.isConnected) lastFocus.focus();
  lastFocus = null;
}
function confirm(title, text, cmd, args, after = "") {
  modal(
    title,
    `<p>${esc(text)}</p><div class="actions">${b("Cancel", "close")}${b(
      "Confirm",
      "confirm",
      { cmd, args, after },
      "primary"
    )}</div>`
  );
}
function execute(type, args, message = "Demo updated", rerender = true) {
  if (role === "share") throw Error("Shared reports are read-only");
  let updated = structuredClone(load());
  command(updated, role, type, args);
  save(updated);
  s = updated;
  if (rerender) {
    close();
    render();
  }
  if (s.settings.notifications) toast(message);
}
function download(name, text, mime = "text/plain") {
  let blob = new Blob([text], { type: mime }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Downloaded " + name);
}
function showError(e, form) {
  let target =
    form || modalRoot.querySelector(".modal") || document.querySelector("main");
  if (!target) {
    toast(e.message);
    return;
  }
  target.querySelector(".error")?.remove();
  let node = document.createElement("div");
  node.className = "error";
  node.role = "alert";
  node.textContent = e.message;
  target.prepend(node);
  node.scrollIntoView({ block: "nearest" });
}
async function action(a, p) {
  if (a === "close") {
    close();
    return;
  }
  if (a === "menu") {
    document.body.classList.toggle("mobile-open");
    return;
  }
  if (a === "menuClose") {
    document.body.classList.remove("mobile-open");
    return;
  }
  if (a === "chooseRole") {
    selected = p.role;
    login();
    return;
  }
  if (a === "switch") {
    localStorage.setItem(
      "atlas-nexus-demo-last-role",
      role in roles ? role : selected
    );
    close();
    location.href = "index.html";
    return;
  }
  if (a === "logout") {
    signOut();
    location.href = "index.html";
    return;
  }
  if (a === "reset") {
    modal(
      "Reset Demo Data?",
      `<p>Restore all seeded campaigns, applications, videos, reports and access settings for every perspective. Your demo sign-in is retained.</p><div class="actions">${b(
        "Cancel",
        "close"
      )}${b("Reset all demo data", "resetConfirmed", {}, "danger")}</div>`
    );
    return;
  }
  if (a === "resetConfirmed") {
    save(seed());
    s = load();
    currentError = null;
    close();
    if (role === "login" || role === "share") render();
    else navigate("home");
    toast("Demo data reset for all perspectives");
    return;
  }
  if (a === "confirm") {
    execute(p.cmd, p.args);
    if (p.after) navigate(p.after);
    return;
  }
  if (a === "resolveVideo") {
    execute(a, p, "Demo metadata resolved; ready for agency verification");
    return;
  }
  for (let module of modules) if (module.action?.(c, a, p)) return;
  throw Error("This action is unavailable");
}
document.addEventListener("click", async (e) => {
  let button = e.target.closest("[data-action]");
  if (button) {
    try {
      await action(
        button.dataset.action,
        JSON.parse(button.dataset.args || "{}")
      );
    } catch (error) {
      showError(error);
    }
    return;
  }
  let anchor = e.target.closest('a[href^="#"]');
  if (anchor) {
    close();
    document.body.classList.remove("mobile-open");
  }
  if (e.target.classList.contains("overlay")) close();
});
document.addEventListener("submit", async (e) => {
  e.preventDefault();
  let form = e.target;
  if (!form.reportValidity()) return;
  let values = Object.fromEntries(new FormData(form));
  try {
    if (form.id === "demo-login") {
      s = load();
      if (s.users.find((u) => u.id === selected)?.status === "Suspended")
        throw Error(
          "This demo account is suspended. Ask Super Admin to activate it."
        );
      signIn(selected);
      localStorage.setItem("atlas-nexus-demo-last-role", selected);
      if (!localStorage.getItem(KEY)) save(s);
      location.href = roles[selected].file;
      return;
    }
    for (let module of modules)
      if (await module.form?.(c, form.id, values, form)) return;
    throw Error("Form is unavailable");
  } catch (error) {
    showError(error, form);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.change)
    campaigns.change(c, e.target.dataset.change, e.target.value);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    close();
    document.body.classList.remove("mobile-open");
  }
  let dialog = modalRoot.querySelector(".modal");
  if (dialog && e.key === "Tab") {
    let nodes = [
        ...dialog.querySelectorAll("a[href],button,input,select,textarea"),
      ].filter((x) => !x.disabled),
      first = nodes[0],
      last = nodes.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  let tab = e.target.closest("[role=tab]");
  if (tab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
    e.preventDefault();
    let tabs = [...tab.parentElement.querySelectorAll("[role=tab]")],
      index = tabs.indexOf(tab),
      next =
        e.key === "Home"
          ? 0
          : e.key === "End"
          ? tabs.length - 1
          : (index + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
            tabs.length;
    let href = tabs[next].getAttribute("href");
    location.hash = href;
    requestAnimationFrame(() =>
      document.querySelector(`[href="${href}"]`)?.focus()
    );
  }
});
window.addEventListener("hashchange", () => {
  close();
  try {
    render();
  } catch (e) {
    showError(e);
  }
  window.scrollTo(0, 0);
});
window.addEventListener("storage", (e) => {
  if (e.key === KEY) {
    try {
      s = load();
      close();
      render();
      toast("Shared demo data updated in another tab");
    } catch (error) {
      currentError = error.message;
      render();
    }
  }
});
render();
