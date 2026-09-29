import { formatCountdown } from "../lib/schedule";

/** Ticking "1h 05m" style countdown. Parent passes `now` from useNow(). */
export default function Countdown({ target, now, className = "" }: { target: number; now: number; className?: string }) {
  const ms = target - now;
  return (
    <span role="timer" aria-live="off" className={`tabular-nums ${className}`}>
      {formatCountdown(ms)}
    </span>
  );
}
