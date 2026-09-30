/**
 * Tiny GitHub REST client for the admin page. Everything happens in the
 * browser with a fine-grained personal access token that only has access to
 * this one repository.
 */

export const REPO = { owner: "Riekie3", name: "1stOctober", branch: "main" } as const;

const API = "https://api.github.com";
const TOKEN_KEY = "adm:gh-token";

export class GitHubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/* ─── Token ─────────────────────────────────────────────── */

export function savedToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string, remember: boolean) {
  try {
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    /* storage blocked — token lives only in memory for this visit */
  }
}

export function forgetToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/* ─── Requests ──────────────────────────────────────────── */

async function gh<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body.message ?? msg;
    } catch {
      /* not json */
    }
    throw new GitHubError(res.status, msg);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

const repoPath = `/repos/${REPO.owner}/${REPO.name}`;

/** Confirms the token works and can write to the repository. */
export async function checkAccess(token: string) {
  const repo = await gh<{ full_name: string; permissions?: { push?: boolean } }>(token, repoPath);
  if (!repo.permissions?.push) {
    throw new GitHubError(403, "This key can read the repository but can't save changes. Give it “Contents: Read and write”.");
  }
  return repo.full_name;
}

export async function headCommit(token: string): Promise<string> {
  const ref = await gh<{ object: { sha: string } }>(token, `${repoPath}/git/ref/heads/${REPO.branch}`);
  return ref.object.sha;
}

function decodeBase64Utf8(b64: string) {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Reads a text file at a given commit. */
export async function readFile(token: string, path: string, ref: string): Promise<string> {
  const file = await gh<{ content: string; encoding: string }>(token, `${repoPath}/contents/${path}?ref=${ref}`);
  return decodeBase64Utf8(file.content);
}

/** Files changed between two commits. */
export async function changedFiles(token: string, base: string, head: string): Promise<string[]> {
  const cmp = await gh<{ files?: { filename: string }[] }>(token, `${repoPath}/compare/${base}...${head}`);
  return (cmp.files ?? []).map((f) => f.filename);
}

/* ─── Publishing: one commit with every change ──────────── */

export type Change =
  | { path: string; kind: "text"; text: string }
  | { path: string; kind: "binary"; blob: Blob }
  | { path: string; kind: "delete" };

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) s += String.fromCharCode(...buf.subarray(i, i + chunk));
  return btoa(s);
}

function textToBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function commitChanges(
  token: string,
  parent: string,
  changes: Change[],
  message: string,
  onProgress?: (text: string) => void,
): Promise<string> {
  const parentCommit = await gh<{ tree: { sha: string } }>(token, `${repoPath}/git/commits/${parent}`);

  const tree: { path: string; mode: "100644"; type: "blob"; sha: string | null }[] = [];
  let n = 0;
  for (const c of changes) {
    n++;
    if (c.kind === "delete") {
      tree.push({ path: c.path, mode: "100644", type: "blob", sha: null });
      continue;
    }
    onProgress?.(`Uploading ${n} of ${changes.length} — ${c.path.split("/").pop()}`);
    const content = c.kind === "text" ? textToBase64(c.text) : await blobToBase64(c.blob);
    const blob = await gh<{ sha: string }>(token, `${repoPath}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content, encoding: "base64" }),
    });
    tree.push({ path: c.path, mode: "100644", type: "blob", sha: blob.sha });
  }

  onProgress?.("Saving…");
  const newTree = await gh<{ sha: string }>(token, `${repoPath}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree }),
  });
  const commit = await gh<{ sha: string }>(token, `${repoPath}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [parent] }),
  });
  // Fast-forward only: fails (422) if someone else published in the meantime.
  await gh(token, `${repoPath}/git/refs/heads/${REPO.branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
}

/* ─── Deploy progress ───────────────────────────────────── */

interface Run {
  name: string;
  status: string;
  conclusion: string | null;
  head_sha: string;
  head_branch: string;
  created_at: string;
  html_url: string;
}

export type DeployState =
  | { stage: "building"; url?: string }
  | { stage: "publishing"; url?: string }
  | { stage: "live" }
  | { stage: "failed"; url?: string }
  | { stage: "unknown" };

/** Follows the build workflow for a commit, then the Pages deployment after it. */
export async function deployState(token: string, sha: string, since: string): Promise<DeployState> {
  try {
    const runs = await gh<{ workflow_runs: Run[] }>(token, `${repoPath}/actions/runs?per_page=10`);
    const build = runs.workflow_runs.find((r) => r.head_sha === sha);
    if (!build) return { stage: "building" };
    if (build.status !== "completed") return { stage: "building", url: build.html_url };
    if (build.conclusion !== "success") return { stage: "failed", url: build.html_url };
    const pages = runs.workflow_runs.find((r) => r.head_branch === "gh-pages" && r.created_at >= since);
    if (!pages || pages.status !== "completed") return { stage: "publishing", url: pages?.html_url };
    return pages.conclusion === "success" ? { stage: "live" } : { stage: "failed", url: pages.html_url };
  } catch (e) {
    if (e instanceof GitHubError && (e.status === 403 || e.status === 404)) return { stage: "unknown" };
    throw e;
  }
}
