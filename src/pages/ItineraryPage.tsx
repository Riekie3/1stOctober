import { motion } from "framer-motion";
import { birthdayConfig } from "../config/birthday";
import AccentTitle from "../components/AccentTitle";
import EventTimeline from "../components/EventTimeline";
import Countdown from "../components/Countdown";
import PageTransition from "../components/PageTransition";
import { Rule, Spark } from "../components/Ornaments";
import { useNow } from "../lib/clock";
import { dayProgress, formatClock, isRevealed, nextLocked, schedule } from "../lib/schedule";

const silk = [0.22, 1, 0.36, 1] as const;

export default function ItineraryPage() {
  const now = useNow();
  const { title, subtitle } = birthdayConfig.itinerary;
  const next = nextLocked(now);
  const revealed = schedule.filter((s) => isRevealed(s, now)).length;
  const date = new Date(`${birthdayConfig.birthdayDate}T00:00`);
  const dateLabel = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <PageTransition kind="slide" label="The Day Ahead — itinerary">
      <div className="mx-auto w-full max-w-5xl px-4 pb-32 pt-24 sm:px-8 sm:pt-28">
        {/* Passport cover */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: silk }}
          className="paper relative mx-auto max-w-3xl overflow-hidden rounded-[1.6rem] border border-gold/25 shadow-paper"
        >
          <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.2rem] border border-gold/20" />
          <div className="relative px-5 pb-6 pt-8 text-center sm:px-12 sm:pb-8 sm:pt-10">
            <p className="eyebrow">Birthday passport · Nº 0110</p>
            <h1 className="display mt-4 text-[3rem] sm:text-[4.5rem]">
              <AccentTitle text={title} accentClass="text-gold-deep" />
            </h1>
            <Rule className="mt-4" width="5rem" />
            <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">{subtitle}</p>

            <DayArc now={now} />

            <dl className="mx-auto mt-2 grid max-w-lg grid-cols-3 gap-2 border-t border-gold/15 pt-5 text-left">
              <div>
                <dt className="eyebrow !text-[0.58rem] !tracking-[0.24em]">Holder</dt>
                <dd className="display mt-1 truncate text-lg italic sm:text-xl">{birthdayConfig.girlfriendName}</dd>
              </div>
              <div>
                <dt className="eyebrow !text-[0.58rem] !tracking-[0.24em]">Valid on</dt>
                <dd className="display mt-1 text-lg sm:text-xl">{dateLabel}</dd>
              </div>
              <div>
                <dt className="eyebrow !text-[0.58rem] !tracking-[0.24em]">Stops open</dt>
                <dd className="display mt-1 text-lg tabular-nums sm:text-xl">
                  {revealed} <span className="text-taupe">/ {schedule.length}</span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative flex items-center justify-center gap-2 border-t border-dashed border-gold/25 bg-ivory/60 px-4 py-3 text-center text-[0.8rem] text-ink-soft">
            <Spark size={9} className="text-gold" />
            {next ? (
              <span>
                Next surprise opens in{" "}
                <Countdown target={next.unlockAt} now={now} className="font-display text-[1.1rem] font-medium italic text-gold-deep" />
                <span className="hidden sm:inline"> · at {formatClock(next.unlockAt)}</span>
              </span>
            ) : (
              <span className="font-display text-[1.05rem] italic">Every surprise is open. Enjoy every minute.</span>
            )}
          </div>
        </motion.header>

        <h2 className="sr-only">Stops</h2>
        <div className="mt-12 sm:mt-16">
          <EventTimeline />
        </div>
      </div>
    </PageTransition>
  );
}

/** A sun travelling across the day, from departure to the last stop. */
function DayArc({ now }: { now: number }) {
  const p = dayProgress(now);
  const n = schedule.length;
  const W = 420;
  const H = 120;
  const rx = 190;
  const ry = 92;
  const cx = W / 2;
  const cy = 112;
  const at = (t: number) => {
    const a = Math.PI - t * Math.PI;
    return { x: cx + Math.cos(a) * rx, y: cy - Math.sin(a) * ry };
  };
  const sun = at(p);
  const before = p === 0;
  const after = p >= 1;
  const arcD = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`;

  return (
    <div className="mx-auto mt-6 max-w-md" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H + 8}`} className="w-full overflow-visible">
        <path d={arcD} fill="none" stroke="var(--color-champagne)" strokeWidth="1" strokeDasharray="2 5" />
        <motion.path
          d={arcD}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: p }}
          transition={{ duration: 1.8, ease: silk }}
        />
        {schedule.map((s, i) => {
          const pt = at(n > 1 ? i / (n - 1) : 0);
          const open = isRevealed(s, now);
          return <circle key={s.id} cx={pt.x} cy={pt.y} r={open ? 3.4 : 2.6} fill={open ? "var(--color-gold)" : "var(--color-ivory)"} stroke="var(--color-gold)" strokeWidth="1" />;
        })}
        <line x1={cx - rx - 14} y1={cy} x2={cx + rx + 14} y2={cy} stroke="var(--color-champagne)" strokeWidth="1" />
        <motion.g initial={false} animate={{ x: sun.x, y: sun.y }} transition={{ duration: 1.8, ease: silk }}>
          <circle r="16" fill="rgba(232,199,140,0.25)" />
          {after ? (
            <path d="M3 -7 A 8 8 0 1 0 3 7 A 6 6 0 1 1 3 -7 Z" fill="var(--color-gold-deep)" />
          ) : (
            <circle r="7" fill={before ? "var(--color-champagne)" : "var(--color-gold)"} />
          )}
        </motion.g>
      </svg>
      <div className="-mt-1 flex justify-between px-1 text-[0.62rem] uppercase tracking-[0.24em] text-taupe">
        <span>Morning</span>
        <span>Night</span>
      </div>
    </div>
  );
}
