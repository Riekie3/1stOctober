import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { birthdayConfig } from "../config/birthday";
import { useNow } from "../lib/clock";
import { isRevealed, phaseOf, schedule } from "../lib/schedule";
import EventCard from "./EventCard";
import { Spark } from "./Ornaments";

const SEEN_KEY = "adm:seen-reveals";
const RESET_EVENT = "adm:seen-reset";

function loadSeen(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<number>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* private mode — reveals just replay next visit */
  }
}

/** Used by the developer panel's "Reset". */
export function clearSeenReveals() {
  try {
    localStorage.removeItem(SEEN_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(RESET_EVENT));
}

export default function EventTimeline() {
  const now = useNow();
  const [seen, setSeen] = useState<Set<number>>(loadSeen);
  const [toast, setToast] = useState(0);
  const toastTimer = useRef<number | undefined>(undefined);
  const announced = useRef<Set<number>>(new Set());

  useEffect(() => {
    const onReset = () => {
      setSeen(new Set());
      announced.current.clear();
    };
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, []);

  // Stops that are revealed but she hasn't watched open yet.
  const fresh = schedule.filter((s) => !s.alwaysVisible && isRevealed(s, now) && !seen.has(s.id));
  const freshKey = fresh.map((s) => s.id).join(",");

  useEffect(() => {
    if (!freshKey) return;
    const ids = freshKey.split(",").map(Number);
    if (ids.every((id) => announced.current.has(id))) return;
    ids.forEach((id) => announced.current.add(id));
    setToast(Date.now());
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(0), 5200);
  }, [freshKey]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Hidden stops that got re-locked (clock moved back in test mode) can celebrate again.
  useEffect(() => {
    const relocked = [...seen].filter((id) => {
      const s = schedule.find((x) => x.id === id);
      return s && !isRevealed(s, now);
    });
    if (relocked.length) {
      const next = new Set(seen);
      relocked.forEach((id) => {
        next.delete(id);
        announced.current.delete(id);
      });
      setSeen(next);
      saveSeen(next);
    }
  }, [now, seen]);

  const markSeen = useCallback((id: number) => {
    setSeen((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveSeen(next);
      return next;
    });
  }, []);

  const nextUp = schedule.find((s) => now < s.start && isRevealed(s, now));

  return (
    <>
      <ol className="relative mx-auto w-full max-w-3xl" aria-label="Birthday itinerary">
        {schedule.map((stop, i) => {
          const next = schedule[i + 1];
          const fill = next ? Math.min(1, Math.max(0, (now - stop.start) / (next.start - stop.start))) : 0;
          return (
            <EventCard
              key={stop.id}
              stop={stop}
              phase={phaseOf(stop, now)}
              now={now}
              isNext={nextUp?.id === stop.id}
              celebrate={fresh.some((f) => f.id === stop.id)}
              onCelebrated={() => markSeen(stop.id)}
              railFill={fill}
              isLast={!next}
            />
          );
        })}
      </ol>

      {createPortal(
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[4.25rem] z-50 flex justify-center px-4 sm:top-6">
          <AnimatePresence>
            {toast !== 0 && (
              <motion.div
                key={toast}
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="flex items-center gap-3 rounded-full border border-gold/30 bg-ink/95 py-2.5 pl-3 pr-5 text-cream shadow-lift backdrop-blur"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/25 text-gold-soft">
                  <Spark size={11} />
                </span>
                <span className="font-display text-[1.05rem] italic">{birthdayConfig.itinerary.revealToast}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </>
  );
}
