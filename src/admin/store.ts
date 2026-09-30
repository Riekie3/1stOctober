import { useSyncExternalStore } from "react";
import { PREVIEW_DRAFT_KEY } from "../content";
import { CONTENT_FILES, type ContentBundle } from "../content/types";
import { assetUrl } from "../lib/assets";
import * as gh from "./github";
import { idb } from "./idb";
import { validate } from "./validate";

/**
 * Admin state: the published content (from GitHub), your draft, files waiting
 * to be uploaded, and publishing progress. Drafts autosave in this browser.
 */

type Part = keyof ContentBundle;
const PARTS = Object.keys(CONTENT_FILES) as Part[];
const DRAFT_KEY = "adm:draft";

export interface Pending {
  /** site path, e.g. /assets/photos/upl-xyz.jpg */
  path: string;
  url: string;
  size: number;
  uploaded: boolean;
}

export interface PublishState {
  phase: "idle" | "working" | "conflict" | "tracking" | "done" | "error";
  message?: string;
  conflictFiles?: string[];
  sha?: string;
  since?: string;
  deploy?: gh.DeployState;
}

interface State {
  auth: "signed-out" | "checking" | "signed-in";
  authError?: string;
  repo?: string;
  loading: boolean;
  loadError?: string;
  baseSha?: string;
  base?: ContentBundle;
  draft?: ContentBundle;
  restored: boolean;
  pending: Record<string, Pending>;
  publish: PublishState;
}

let state: State = { auth: "signed-out", loading: false, restored: false, pending: {}, publish: { phase: "idle" } };
let token: string | null = null;
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export function useAdmin() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

const clone = <T>(v: T): T => structuredClone(v);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const pretty = (v: unknown) => JSON.stringify(v, null, 2) + "\n";

/* ─── Sign-in & loading ─────────────────────────────────── */

export async function signIn(newToken: string, remember: boolean) {
  set({ auth: "checking", authError: undefined });
  try {
    const repo = await gh.checkAccess(newToken.trim());
    token = newToken.trim();
    gh.saveToken(token, remember);
    set({ auth: "signed-in", repo });
    await load();
  } catch (e) {
    set({ auth: "signed-out", authError: explain(e) });
  }
}

export async function resume() {
  const saved = gh.savedToken();
  if (!saved) return;
  set({ auth: "checking" });
  try {
    const repo = await gh.checkAccess(saved);
    token = saved;
    set({ auth: "signed-in", repo });
    await load();
  } catch (e) {
    gh.forgetToken();
    set({ auth: "signed-out", authError: explain(e) });
  }
}

export function signOut() {
  gh.forgetToken();
  token = null;
  set({ auth: "signed-out", base: undefined, draft: undefined, baseSha: undefined });
}

export async function load() {
  if (!token) return;
  set({ loading: true, loadError: undefined });
  try {
    const sha = await gh.headCommit(token);
    const entries = await Promise.all(PARTS.map(async (p) => [p, JSON.parse(await gh.readFile(token!, CONTENT_FILES[p], sha))] as const));
    const base = Object.fromEntries(entries) as unknown as ContentBundle;

    // Bring back an unfinished draft (and its files) from an earlier visit.
    let draft = clone(base);
    let restored = false;
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null") as { draft: ContentBundle } | null;
      if (saved?.draft && !same(saved.draft, base)) {
        draft = saved.draft;
        restored = true;
      }
    } catch {
      /* ignore */
    }
    const blobs = await idb.all();
    const pending: Record<string, Pending> = {};
    for (const [path, blob] of Object.entries(blobs)) pending[path] = { path, url: URL.createObjectURL(blob), size: blob.size, uploaded: false };

    set({ loading: false, base, draft, baseSha: sha, restored, pending });
  } catch (e) {
    set({ loading: false, loadError: explain(e) });
  }
}

/* ─── Editing ───────────────────────────────────────────── */

let saveTimer: number | undefined;
function autosave() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      if (state.draft && state.base && !same(state.draft, state.base)) localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft: state.draft }));
      else localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* storage full / blocked */
    }
  }, 400);
}

/** Change the draft: `edit(d => { d.site.girlfriendName = "…" })` */
export function edit(recipe: (d: ContentBundle) => void) {
  if (!state.draft) return;
  const next = clone(state.draft);
  recipe(next);
  set({ draft: next, publish: state.publish.phase === "done" ? { phase: "idle" } : state.publish });
  autosave();
}

export function discardChanges() {
  if (!state.base) return;
  Object.values(state.pending).forEach((p) => !p.uploaded && URL.revokeObjectURL(p.url));
  idb.clear();
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
  const pending = Object.fromEntries(Object.entries(state.pending).filter(([, p]) => p.uploaded));
  set({ draft: clone(state.base), restored: false, pending });
}

export function dirtyParts(s: State = state): Part[] {
  if (!s.base || !s.draft) return [];
  return PARTS.filter((p) => !same(s.base![p], s.draft![p]));
}

/* ─── Media waiting to be uploaded ──────────────────────── */

export async function addPending(path: string, blob: Blob) {
  const old = state.pending[path];
  if (old && !old.uploaded) URL.revokeObjectURL(old.url);
  await idb.put(path, blob);
  set({ pending: { ...state.pending, [path]: { path, url: URL.createObjectURL(blob), size: blob.size, uploaded: false } } });
}

/** URL to show a media file in the admin (a pending upload, or the live file). */
export function mediaUrl(path: string | undefined) {
  if (!path) return undefined;
  return state.pending[path]?.url ?? assetUrl(path);
}

function referencedMedia(c: ContentBundle) {
  const out = new Set<string>();
  c.memories.forEach((m) => [m.src, m.poster, m.live].forEach((p) => p && out.add(p)));
  return out;
}

/* ─── Preview ───────────────────────────────────────────── */

export function openPreview(page: string, testTime?: string) {
  if (!state.draft) return;
  // New photos/videos are picked up from this browser's storage by the preview tab itself.
  try {
    localStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify(state.draft));
  } catch {
    /* ignore */
  }
  const q = new URLSearchParams({ preview: "1" });
  if (testTime) q.set("testTime", testTime);
  window.open(`${import.meta.env.BASE_URL}${page.replace(/^\//, "")}?${q}`, "_blank");
}

/* ─── Publishing ────────────────────────────────────────── */

export async function publish(overwrite = false) {
  if (!token || !state.draft || !state.base || !state.baseSha) return;
  const problems = validate(state.draft);
  if (problems.length) {
    set({ publish: { phase: "error", message: `Fix ${problems.length} problem${problems.length > 1 ? "s" : ""} first (listed above).` } });
    return;
  }
  const parts = dirtyParts();
  set({ publish: { phase: "working", message: "Checking for other changes…" } });

  try {
    const head = await gh.headCommit(token);
    if (head !== state.baseSha && !overwrite) {
      const changed = await gh.changedFiles(token, state.baseSha, head);
      const clash = changed.filter((f) => parts.some((p) => CONTENT_FILES[p] === f));
      if (clash.length) {
        set({ publish: { phase: "conflict", conflictFiles: clash, message: "Someone else published changes to the same parts since you opened the admin page." } });
        return;
      }
    }

    const changes: gh.Change[] = parts.map((p) => ({ path: CONTENT_FILES[p], kind: "text", text: pretty(state.draft![p]) }));

    const nowUsed = referencedMedia(state.draft);
    const wasUsed = referencedMedia(state.base);
    for (const path of nowUsed) {
      const p = state.pending[path];
      if (p && !p.uploaded) {
        const blob = (await idb.all())[path];
        if (blob) changes.push({ path: `public${path}`, kind: "binary", blob });
      }
    }
    for (const path of wasUsed) {
      if (!nowUsed.has(path) && /^\/assets\/(photos|videos)\//.test(path)) changes.push({ path: `public${path}`, kind: "delete" });
    }

    if (changes.length === 0) {
      set({ publish: { phase: "idle", message: "Nothing to publish." } });
      return;
    }

    const since = new Date(Date.now() - 5000).toISOString();
    const sha = await gh.commitChanges(token, head, changes, summary(parts, changes), (message) => set({ publish: { phase: "working", message } }));

    // Published: this is the new baseline.
    const pending = { ...state.pending };
    for (const path of Object.keys(pending)) {
      if (nowUsed.has(path)) pending[path] = { ...pending[path], uploaded: true };
      else {
        URL.revokeObjectURL(pending[path].url);
        delete pending[path];
      }
    }
    await idb.clear();
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    set({ base: clone(state.draft), baseSha: sha, pending, restored: false, publish: { phase: "tracking", sha, since, deploy: { stage: "building" } } });
    track(sha, since);
  } catch (e) {
    const conflict = e instanceof gh.GitHubError && e.status === 422;
    set({
      publish: conflict
        ? { phase: "conflict", message: "The site changed while publishing. Try again — nothing was lost." }
        : { phase: "error", message: explain(e) },
    });
  }
}

async function track(sha: string, since: string) {
  const started = Date.now();
  while (token && state.publish.sha === sha && Date.now() - started < 10 * 60_000) {
    await new Promise((r) => setTimeout(r, 6000));
    try {
      const deploy = await gh.deployState(token, sha, since);
      if (state.publish.sha !== sha) return;
      if (deploy.stage === "live") return set({ publish: { phase: "done", sha, deploy, message: "Live on the site." } });
      if (deploy.stage === "failed") return set({ publish: { phase: "error", sha, deploy, message: "The site couldn't be rebuilt. The previous version is still live." } });
      if (deploy.stage === "unknown") return set({ publish: { phase: "done", sha, deploy, message: "Saved. The site updates in about 2 minutes." } });
      set({ publish: { ...state.publish, deploy } });
    } catch {
      /* network hiccup — keep waiting */
    }
  }
}

function summary(parts: Part[], changes: gh.Change[]) {
  const names: Record<Part, string> = { site: "general text", itinerary: "itinerary", letter: "letter", loveNotes: "love notes", memories: "memories" };
  const files = changes.filter((c) => c.kind === "binary").length;
  const bits = parts.map((p) => names[p]);
  if (files) bits.push(`${files} new file${files > 1 ? "s" : ""}`);
  return `Admin: update ${bits.join(", ") || "content"}`;
}

function explain(e: unknown): string {
  if (e instanceof gh.GitHubError) {
    if (e.status === 401) return "That key isn't valid (or it has expired). Create a new one and paste it here.";
    if (e.status === 403) return e.message.includes("save changes") ? e.message : "This key doesn't have permission for that. Check its repository access and permissions.";
    if (e.status === 404) return "The repository wasn't found with this key. Make sure the key has access to Riekie3/1stOctober.";
    return `GitHub said: ${e.message}`;
  }
  if (e instanceof TypeError) return "Couldn't reach GitHub. Check your internet connection.";
  return e instanceof Error ? e.message : String(e);
}
