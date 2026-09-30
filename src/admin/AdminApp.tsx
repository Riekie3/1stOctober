import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookHeart,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Eye,
  Heart,
  Images,
  KeyRound,
  Loader2,
  LogOut,
  Rocket,
  RotateCcw,
  Settings2,
  X,
} from "lucide-react";
import { ACTIONS_URL, REPO } from "./github";
import { validate, type Problem } from "./validate";
import { dirtyParts, discardChanges, load, openPreview, publish, resume, signIn, signOut, useAdmin } from "./store";
import General from "./sections/General";
import Itinerary from "./sections/Itinerary";
import Letter from "./sections/Letter";
import LoveNotes from "./sections/LoveNotes";
import Memories from "./sections/Memories";

type Tab = Problem["section"];

const TABS: { id: Tab; label: string; icon: typeof Heart; part: string[] }[] = [
  { id: "general", label: "General", icon: Settings2, part: ["site"] },
  { id: "itinerary", label: "Itinerary", icon: CalendarClock, part: ["itinerary"] },
  { id: "letter", label: "Letter", icon: BookHeart, part: ["letter"] },
  { id: "love", label: "Love notes", icon: Heart, part: ["loveNotes"] },
  { id: "memories", label: "Memories", icon: Images, part: ["memories"] },
];

const SITE_URL = `https://${REPO.owner.toLowerCase()}.github.io/${REPO.name}/`;

export default function AdminApp() {
  const a = useAdmin();
  const [tab, setTab] = useState<Tab>("general");

  useEffect(() => {
    document.title = "Admin · A Day Made for You";
    resume();
  }, []);

  // Warn before leaving with unpublished changes.
  const dirty = dirtyParts(a).length > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (a.auth !== "signed-in") return <SignIn checking={a.auth === "checking"} error={a.authError} />;

  if (a.loading || !a.draft)
    return (
      <Shell>
        <div className="grid min-h-dvh place-items-center">
          {a.loadError ? (
            <div className="max-w-md text-center">
              <p className="text-ink">{a.loadError}</p>
              <button type="button" onClick={load} className="mt-4 rounded-full bg-ink px-5 py-2 text-sm text-cream">
                Try again
              </button>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-taupe">
              <Loader2 className="animate-spin" size={18} /> Loading the site's content…
            </p>
          )}
        </div>
      </Shell>
    );

  const problems = validate(a.draft);
  const changed = dirtyParts(a);
  const newFiles = Object.values(a.pending).filter((p) => !p.uploaded).length;
  const Section = { general: General, itinerary: Itinerary, letter: Letter, love: LoveNotes, memories: Memories }[tab];

  return (
    <Shell>
      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-gold/15 bg-cream/70 px-4 py-6 md:flex">
          <p className="px-2 font-display text-[1.35rem] leading-tight text-ink">
            A Day Made <em className="text-gold-deep">for You</em>
          </p>
          <p className="px-2 text-[0.7rem] uppercase tracking-[0.2em] text-taupe">Admin</p>
          <nav className="mt-8 space-y-1" aria-label="Sections">
            {TABS.map((t) => {
              const has = changed.some((p) => t.part.includes(p));
              const bad = problems.some((p) => p.section === t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[0.9rem] transition ${tab === t.id ? "bg-ink text-cream" : "text-ink-soft hover:bg-ivory"}`}
                >
                  <t.icon size={17} strokeWidth={1.7} />
                  <span className="flex-1">{t.label}</span>
                  {bad ? <AlertTriangle size={14} className="text-rose" /> : has ? <span className="h-2 w-2 rounded-full bg-gold" title="Unpublished changes" /> : null}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto space-y-2 px-2 text-[0.76rem] text-taupe">
            <a href={SITE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
              <ExternalLink size={13} /> Open the live site
            </a>
            <p className="truncate" title={a.repo}>
              {a.repo}
            </p>
            <button type="button" onClick={() => (!dirty || confirm("Sign out? Your unpublished changes stay saved in this browser.")) && signOut()} className="flex items-center gap-1.5 hover:text-ink">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-20 border-b border-gold/15 bg-ivory/90 backdrop-blur">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-5 py-3">
              <select className="rounded-lg border border-gold/25 bg-white px-2 py-1.5 text-sm md:hidden" value={tab} onChange={(e) => setTab(e.target.value as Tab)}>
                {TABS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="flex-1 text-[0.82rem] text-ink-soft">
                {changed.length || newFiles ? (
                  <>
                    <span className="font-semibold text-gold-deep">Unpublished changes</span>
                    {newFiles > 0 && ` · ${newFiles} new file${newFiles > 1 ? "s" : ""}`}
                  </>
                ) : (
                  <span className="text-taupe">Everything is published.</span>
                )}
              </p>
              <PreviewMenu />
              {(changed.length > 0 || newFiles > 0) && (
                <button
                  type="button"
                  onClick={() => confirm("Throw away all unpublished changes?") && discardChanges()}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.8rem] text-taupe transition hover:bg-cream hover:text-ink"
                >
                  <RotateCcw size={14} /> Discard
                </button>
              )}
              <button
                type="button"
                disabled={a.publish.phase === "working" || (changed.length === 0 && newFiles === 0)}
                onClick={() => publish()}
                className="flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-[0.84rem] font-medium text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {a.publish.phase === "working" ? <Loader2 size={15} className="animate-spin" /> : <Rocket size={15} />} Publish
              </button>
            </div>
            <PublishBar />
          </header>

          <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
            {a.restored && (
              <Notice tone="info">You have unpublished changes from an earlier visit — they've been brought back. Publish them, or press Discard to start fresh.</Notice>
            )}
            {problems.length > 0 && (
              <Notice tone="warn">
                <p className="font-semibold">Fix these before publishing:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {problems.map((p, i) => (
                    <li key={i}>
                      <button type="button" className="text-left underline decoration-dotted underline-offset-2" onClick={() => setTab(p.section)}>
                        {TABS.find((t) => t.id === p.section)?.label}: {p.message}
                      </button>
                    </li>
                  ))}
                </ul>
              </Notice>
            )}
            <Section d={a.draft} />
            <p className="pb-10 pt-4 text-center text-[0.74rem] text-taupe">Changes are saved in this browser as you type. Nothing reaches the live site until you press Publish.</p>
          </main>
        </div>
      </div>
    </Shell>
  );
}

/* ─── Pieces ────────────────────────────────────────────── */

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ivory font-sans text-ink">{children}</div>;
}

function Notice({ tone, children }: { tone: "info" | "warn"; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border p-4 text-[0.85rem] ${tone === "warn" ? "border-rose/35 bg-blush/40 text-ink" : "border-gold/30 bg-champagne/25 text-ink-soft"}`}>
      {children}
    </div>
  );
}

function PreviewMenu() {
  const [open, setOpen] = useState(false);
  const pages: [string, string, string?][] = [
    ["Welcome", ""],
    ["Menu", "menu"],
    ["Menu at sunset", "menu", "18:45"],
    ["Menu at night", "menu", "20:30"],
    ["Itinerary (morning)", "itinerary", "09:45"],
    ["Itinerary (evening)", "itinerary", "20:30"],
    ["Letter", "wish", "19:31"],
    ["Memories", "memories", "19:31"],
    ["Why I love you", "love", "19:31"],
  ];
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-1.5 rounded-full border border-gold/35 px-4 py-2 text-[0.82rem] text-ink transition hover:bg-cream">
        <Eye size={15} /> Preview
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-gold/20 bg-white p-2 shadow-lift" onMouseLeave={() => setOpen(false)}>
          <p className="px-2 pb-1.5 pt-1 text-[0.72rem] text-taupe">Opens a new tab with your unpublished changes. Keep this admin tab open.</p>
          {pages.map(([label, page, time]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                openPreview(page, time);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[0.86rem] hover:bg-ivory"
            >
              {label}
              {time && <span className="text-[0.7rem] tabular-nums text-taupe">as if {time}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PublishBar() {
  const { publish: p } = useAdmin();
  if (p.phase === "idle" && !p.message) return null;

  if (p.phase === "conflict")
    return (
      <Bar tone="warn">
        <span className="flex-1">
          {p.message}
          {p.conflictFiles?.length ? ` (${p.conflictFiles.map((f) => f.split("/").pop()).join(", ")})` : ""} Publishing now replaces those parts with your version.
        </span>
        <button type="button" onClick={() => publish(true)} className="rounded-full bg-ink px-4 py-1.5 text-cream">
          Publish my version
        </button>
        <button type="button" onClick={() => location.reload()} className="rounded-full px-3 py-1.5 underline">
          Reload latest
        </button>
      </Bar>
    );

  if (p.phase === "tracking") return <DeploySteps stage={p.deploy?.stage ?? "building"} savedAt={p.savedAt} url={p.deploy && "url" in p.deploy ? p.deploy.url : undefined} />;

  return (
    <Bar tone={p.phase === "error" ? "warn" : p.phase === "done" ? "ok" : "info"}>
      {p.phase === "working" ? <Loader2 size={15} className="animate-spin" /> : p.phase === "done" ? <CheckCircle2 size={15} /> : p.phase === "error" ? <AlertTriangle size={15} /> : null}
      <span className="flex-1">{p.message}</span>
      {p.phase === "done" && p.deploy?.stage === "unknown" && (
        <a href={ACTIONS_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1 underline">
          Check on GitHub <ExternalLink size={13} />
        </a>
      )}
      {p.phase === "done" && (
        <a href={SITE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1 underline">
          View site <ExternalLink size={13} />
        </a>
      )}
      {p.deploy && "url" in p.deploy && p.deploy.url && (
        <a href={p.deploy.url} target="_blank" rel="noreferrer" className="underline">
          Details
        </a>
      )}
    </Bar>
  );
}

/** Saved → Building → Online, with a clear "safe to reload" once saved. */
function DeploySteps({ stage, savedAt, url }: { stage: string; savedAt?: number; url?: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, []);
  const secs = savedAt ? Math.max(0, Math.round((Date.now() - savedAt) / 1000)) : 0;
  const elapsed = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const steps = [
    { label: "Saved to GitHub", state: "done" },
    { label: "Building the site", state: stage === "building" ? "active" : "done" },
    { label: "Putting it online", state: stage === "publishing" ? "active" : stage === "building" ? "waiting" : "done" },
  ];
  return (
    <Bar tone="info">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {steps.map((s, i) => (
          <span key={s.label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-taupe">→</span>}
            {s.state === "done" ? (
              <CheckCircle2 size={15} className="text-[#3f7a32]" />
            ) : s.state === "active" ? (
              <Loader2 size={15} className="animate-spin text-gold-deep" />
            ) : (
              <span className="inline-block h-3 w-3 rounded-full border border-taupe/50" />
            )}
            <span className={s.state === "waiting" ? "text-taupe" : s.state === "active" ? "font-semibold text-ink" : "text-ink"}>{s.label}</span>
          </span>
        ))}
        <span className="tabular-nums text-taupe">· {elapsed}</span>
      </span>
      <span className="flex-1 text-right text-[0.78rem] text-[#3f7a32]">✓ Your changes are safe — you can reload or close this page. The site updates by itself (usually 1–2 min).</span>
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="underline">
          Details
        </a>
      )}
    </Bar>
  );
}

function Bar({ tone, children }: { tone: "info" | "warn" | "ok"; children: React.ReactNode }) {
  const c = tone === "warn" ? "bg-blush/70 text-ink" : tone === "ok" ? "bg-[#e3eedc] text-[#2f4a27]" : "bg-champagne/40 text-ink-soft";
  return (
    <div className={c}>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-5 py-2 text-[0.82rem]">{children}</div>
    </div>
  );
}

/* ─── Sign-in ───────────────────────────────────────────── */

function SignIn({ checking, error }: { checking: boolean; error?: string }) {
  const [key, setKey] = useState("");
  const [remember, setRemember] = useState(true);
  return (
    <Shell>
      <div className="mx-auto max-w-xl px-5 py-12">
        <p className="font-display text-[2.2rem] leading-tight">
          Admin <em className="text-gold-deep">sign-in</em>
        </p>
        <p className="mt-2 text-[0.9rem] text-ink-soft">
          Changes are saved straight to the <strong>{REPO.owner}/{REPO.name}</strong> repository on GitHub, so this page needs a GitHub key that can write to it.
        </p>

        <form
          className="mt-6 rounded-2xl border border-gold/20 bg-cream p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (key.trim()) signIn(key, remember);
          }}
        >
          <label htmlFor="gh-key" className="mb-1.5 block text-[0.8rem] font-semibold text-ink-soft">
            GitHub key
          </label>
          <div className="flex gap-2">
            <input
              id="gh-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="github_pat_…"
              className="min-w-0 flex-1 rounded-lg border border-gold/25 bg-white px-3 py-2 font-mono text-[0.85rem] outline-none focus:border-gold"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <button type="submit" disabled={checking || !key.trim()} className="flex items-center gap-2 rounded-lg bg-ink px-4 text-[0.85rem] text-cream disabled:opacity-40">
              {checking ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />} Sign in
            </button>
          </div>
          <label className="mt-3 flex items-center gap-2 text-[0.8rem] text-ink-soft">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--color-gold)]" />
            Remember on this laptop
          </label>
          {error && (
            <p className="mt-3 flex gap-2 rounded-lg bg-blush/50 p-3 text-[0.82rem] text-ink">
              <X size={15} className="mt-0.5 shrink-0 text-rose" /> {error}
            </p>
          )}
        </form>

        <div className="mt-8 rounded-2xl border border-gold/15 bg-white/60 p-5 text-[0.86rem] text-ink-soft">
          <p className="font-semibold text-ink">How to get your key (one time, ~3 minutes)</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5">
            <li>
              Open{" "}
              <a className="text-gold-deep underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                github.com → New fine-grained token
              </a>{" "}
              (signed in as {REPO.owner}).
            </li>
            <li>Name it “Birthday admin”, and pick an expiration (e.g. 90 days).</li>
            <li>
              Under <strong>Repository access</strong>, choose <em>Only select repositories</em> → <strong>{REPO.name}</strong>.
            </li>
            <li>
              Under <strong>Permissions → Repository permissions</strong>, set <strong>Contents: Read and write</strong> and <strong>Actions: Read-only</strong> (lets this page show when the site is live).
            </li>
            <li>Click <strong>Generate token</strong>, copy it, and paste it above.</li>
          </ol>
          <p className="mt-3 text-[0.78rem] text-taupe">
            The key stays in this browser only. It can't touch anything except this one repository. To revoke it any time, delete it on the same GitHub page.
          </p>
        </div>
      </div>
    </Shell>
  );
}
