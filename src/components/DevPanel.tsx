import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { clock, useNow } from "../lib/clock";
import { nextLocked, schedule } from "../lib/schedule";
import { sealOpensAt } from "../lib/sealed";
import { clearSeenReveals } from "./EventTimeline";

/**
 * Developer-only clock controls. Only rendered when the site is opened with
 * ?testTime=HH:MM or ?dev — she will never see this.
 */
export default function DevPanel() {
  const now = useNow();
  const [open, setOpen] = useState(true);
  if (!clock.isTestMode) return null;

  const next = nextLocked(now);
  const last = schedule[schedule.length - 1];
  const stamp = new Date(now).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open developer clock"
        className="fixed bottom-4 left-4 z-50 grid h-11 w-11 place-items-center rounded-full bg-ink text-cream shadow-lift"
      >
        <FlaskConical size={18} strokeWidth={1.6} />
      </button>
    );

  const btn = "rounded-md border border-white/15 px-2.5 py-1.5 text-[11px] font-medium hover:bg-white/10 transition";

  return (
    <div
      role="region"
      aria-label="Developer test controls"
      className="fixed bottom-4 left-4 z-50 w-[min(19rem,calc(100vw-2rem))] rounded-xl bg-ink/95 p-3 font-sans text-cream shadow-lift backdrop-blur"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-soft">Test mode</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Minimise developer clock" className="opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
      <p className="mt-1 font-mono text-sm tabular-nums">{stamp}</p>
      <p className="mt-0.5 text-[11px] opacity-60">
        {next ? `Next unlock: #${next.id} at ${new Date(next.unlockAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Everything is unlocked"}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <button
          type="button"
          className={btn}
          onClick={() => {
            clearSeenReveals();
            clock.reset();
          }}
        >
          Reset
        </button>
        <button type="button" className={btn} disabled={!next} onClick={() => next && clock.set(next.unlockAt - 3000)}>
          Jump to next event
        </button>
        <button type="button" className={btn} onClick={() => last && clock.set(Math.max(last.unlockAt, clock.now()) + 1000)}>
          Unlock all
        </button>
        <button type="button" className={btn} onClick={() => clock.set(clock.now() + 10 * 60_000)}>
          +10 min
        </button>
        <button type="button" className={btn} onClick={() => clock.set(sealOpensAt - 5000)}>
          Cards open
        </button>
        <button type="button" className={`${btn} opacity-60`} onClick={() => clock.exit()}>
          Exit
        </button>
      </div>
    </div>
  );
}
