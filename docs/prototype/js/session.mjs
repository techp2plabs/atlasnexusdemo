import { roles } from "./state.mjs";
export const SESSION = "atlas-nexus-demo-session";
export function readSession(storage = globalThis.sessionStorage) {
  try {
    let value = JSON.parse(storage.getItem(SESSION));
    return roles[value?.role] ? value : null;
  } catch {
    return null;
  }
}
export function signIn(role, storage = globalThis.sessionStorage) {
  if (!roles[role]) throw Error("Choose a demo role");
  storage.setItem(SESSION, JSON.stringify({ role, at: Date.now() }));
}
export function signOut(storage = globalThis.sessionStorage) {
  storage.removeItem(SESSION);
}
