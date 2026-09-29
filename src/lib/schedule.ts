import { birthdayConfig } from "../config/birthday";
import { itinerary, type ItineraryEvent } from "../data/itinerary";
import { localDate } from "./clock";

export type StopPhase = "locked" | "upcoming" | "now" | "done";

export interface ScheduledStop extends ItineraryEvent {
  start: number;
  unlockAt: number;
  end: number;
}

const unlockMs = birthdayConfig.itinerary.unlockMinutesBefore * 60_000;

export const schedule: ScheduledStop[] = [...itinerary]
  .sort((a, b) => a.time.localeCompare(b.time))
  .map((ev, i, all) => {
    const start = localDate(birthdayConfig.birthdayDate, ev.time).getTime();
    const next = all[i + 1];
    const end = next
      ? localDate(birthdayConfig.birthdayDate, next.time).getTime()
      : Math.max(localDate(birthdayConfig.birthdayDate, birthdayConfig.itinerary.dayEndsAt).getTime(), start + 60 * 60_000);
    return { ...ev, start, unlockAt: start - unlockMs, end };
  });

export function isRevealed(stop: ScheduledStop, now: number) {
  return stop.alwaysVisible || now >= stop.unlockAt;
}

export function phaseOf(stop: ScheduledStop, now: number): StopPhase {
  if (now >= stop.end) return "done";
  if (now >= stop.start) return "now";
  return isRevealed(stop, now) ? "upcoming" : "locked";
}

/** 0 → 1 progress through the day, measured along the timeline's stops. */
export function dayProgress(now: number) {
  const first = schedule[0];
  const last = schedule[schedule.length - 1];
  if (!first || !last) return 0;
  if (now <= first.start) return 0;
  if (now >= last.end) return 1;
  // Piecewise so each gap between stops is equal length on screen.
  const seg = 1 / Math.max(1, schedule.length - 1);
  for (let i = 0; i < schedule.length - 1; i++) {
    const a = schedule[i];
    const b = schedule[i + 1];
    if (now >= a.start && now < b.start) return i * seg + ((now - a.start) / (b.start - a.start)) * seg;
  }
  return 1;
}

export function nextLocked(now: number) {
  return schedule.find((s) => !isRevealed(s, now));
}

/** "2h 05m", "4m 12s", "38s" … */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${pad(m)}m`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${s}s`;
}

/** "08:15" → "8:15 AM" */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return { clock: `${hour}:${String(m).padStart(2, "0")}`, suffix };
}

export function formatClock(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
